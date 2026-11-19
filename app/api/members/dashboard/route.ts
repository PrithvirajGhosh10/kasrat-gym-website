
import { connection, NextResponse } from "next/server";

import { getMemberSession } from "@/lib/member-auth";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import Payment from "@/models/Payment";
import PaymentRequest from "@/models/PaymentRequest";

// Get the current billing month using Indian Standard Time.
function getIndiaFeeMonth(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

// Get the fee applicable for a particular billing month.
function getFeeForMonth(
  feeMonth: string,
  monthlyFee: number,
  monthlyFeeHistory?: {
    amount: number;
    effectiveFrom: string;
    updatedAt?: Date;
  }[]
) {
  const applicableHistory = (monthlyFeeHistory || [])
    .filter(
      (item) =>
        item.effectiveFrom &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(item.effectiveFrom) &&
        item.effectiveFrom <= feeMonth
    )
    .sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );

  if (applicableHistory.length === 0) {
    return monthlyFee;
  }

  return applicableHistory[applicableHistory.length - 1].amount;
}

// Create the deadline at 11:59:59 PM Indian Standard Time on the 5th.
function getIndiaDueDate(year: number, monthIndex: number) {
  return new Date(
    Date.UTC(year, monthIndex, 5, 18, 29, 59, 999)
  );
}

export async function GET() {
  try {
    // Prevent prerendering before reading the member session.
    await connection();

    // 1. Check member login
    const session = await getMemberSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Find active member, including SL number and fee history.
    const member = await Member.findOne({
      _id: session.id,
      isActive: true,
    }).select(
      "name phone email slNo membershipStartDate monthlyFee monthlyFeeHistory"
    );

    if (!member) {
      return NextResponse.json(
        { message: "Member account is inactive or not found." },
        { status: 403 }
      );
    }

    // 3. Get completed payments.
    const payments = await Payment.find({
      member: member._id,
    })
      .sort({ paymentDate: -1 })
      .lean();

    // 4. Get pending and rejected payment requests.
    const paymentRequests = await PaymentRequest.find({
      member: member._id,
      status: { $in: ["pending", "rejected"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Keep the latest request for each fee month.
    const requestStatusMap = new Map<
      string,
      { status: string; reviewNote?: string }
    >();

    for (const request of paymentRequests) {
      if (
        request.feeMonth &&
        !requestStatusMap.has(request.feeMonth)
      ) {
        requestStatusMap.set(request.feeMonth, {
          status: request.status,
          reviewNote: request.reviewNote || "",
        });
      }
    }

    // 5. Get current date information in India.
    const now = new Date();
    const currentFeeMonth = getIndiaFeeMonth(now);

    const [currentYear, currentMonthNumber] =
      currentFeeMonth.split("-").map(Number);

    const currentMonth = currentMonthNumber - 1;

    // Get the joining month in India.
    const joiningFeeMonth = getIndiaFeeMonth(
      new Date(member.membershipStartDate)
    );

    const [joiningYear, joiningMonthNumber] =
      joiningFeeMonth.split("-").map(Number);

    const joiningMonth = joiningMonthNumber - 1;

    // 6. Identify completed payment months.
    const paymentMonths = new Set(
      payments
        .filter((payment) => payment.feeMonth)
        .map((payment) => payment.feeMonth)
    );

    // 7. Calculate monthly payment status using historical fees.
    const monthlyStatus = [];

    let outstandingDues = 0;

    for (let year = joiningYear; year <= currentYear; year++) {
      const firstMonth =
        year === joiningYear ? joiningMonth : 0;

      const lastMonth =
        year === currentYear ? currentMonth : 11;

      for (
        let month = firstMonth;
        month <= lastMonth;
        month++
      ) {
        const feeMonth = `${year}-${String(month + 1).padStart(2, "0")}`;

        // Use the fee that was effective during this billing month.
        const monthFee = getFeeForMonth(
          feeMonth,
          member.monthlyFee,
          member.monthlyFeeHistory
        );

        const isPaid = paymentMonths.has(feeMonth);

        const isCurrentMonth =
          feeMonth === currentFeeMonth;

        const dueDate = getIndiaDueDate(year, month);

        const requestInfo = requestStatusMap.get(feeMonth);

        let status = "Pending";

        if (isPaid) {
          status = "Paid";
        } else if (requestInfo?.status === "pending") {
          status = "Verification Pending";
        } else if (requestInfo?.status === "rejected") {
          status = "Payment Rejected";
        } else if (now > dueDate) {
          status = "Overdue";
        }

        // Only completed payments reduce outstanding dues.
        if (!isPaid) {
          outstandingDues += monthFee;
        }

        const monthName = new Date(
          Date.UTC(year, month, 1, 12, 0, 0)
        ).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        });

        monthlyStatus.push({
          feeMonth,
          monthName,
          amount: monthFee,
          status,
          isCurrentMonth,
          dueDate: dueDate.toISOString(),
          reviewNote: requestInfo?.reviewNote || "",
        });
      }
    }

    // 8. Get current month's payment information.
    const currentMonthPayment = payments.find(
      (payment) => payment.feeMonth === currentFeeMonth
    );

    const currentMonthStatus = monthlyStatus.find(
      (item) => item.feeMonth === currentFeeMonth
    );

    // 9. Get current month's request information.
    const currentMonthRequest =
      requestStatusMap.get(currentFeeMonth);

    // Current month's applicable fee.
    const currentMonthlyFee = getFeeForMonth(
      currentFeeMonth,
      member.monthlyFee,
      member.monthlyFeeHistory
    );

    // 10. Return dashboard information.
    return NextResponse.json({
      member: {
        id: member._id.toString(),
        slNo: member.slNo ?? null,
        name: member.name,
        phone: member.phone,
        email: member.email || "",
        monthlyFee: currentMonthlyFee,
        membershipStartDate: member.membershipStartDate,
      },

      currentMonth: {
        feeMonth: currentFeeMonth,
        amount: currentMonthlyFee,
        status: currentMonthStatus?.status || "Pending",
        dueDate: currentMonthStatus?.dueDate || null,
        paymentDate: currentMonthPayment?.paymentDate || null,
        reviewNote: currentMonthRequest?.reviewNote || "",
      },

      outstandingDues,

      monthlyStatus,

      paymentHistory: payments.map((payment) => ({
        id: payment._id.toString(),
        amount: payment.amount,
        feeMonth: payment.feeMonth || null,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        note: payment.note || "",
      })),
    });
  } catch (error) {
    console.error("Member dashboard error:", error);

    return NextResponse.json(
      { message: "Unable to load member dashboard." },
      { status: 500 }
    );
  }
}
