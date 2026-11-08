
import { NextResponse } from "next/server";

import { getMemberSession } from "@/lib/member-auth";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    // 1. Check member login
    const session = await getMemberSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Find active member
    const member = await Member.findOne({
      _id: session.id,
      isActive: true,
    }).select("name phone email membershipStartDate monthlyFee");

    if (!member) {
      return NextResponse.json(
        { message: "Member account is inactive or not found." },
        { status: 403 }
      );
    }

    // 3. Get member payment history
    const payments = await Payment.find({
      member: member._id,
    })
      .sort({ paymentDate: -1 })
      .lean();

    // 4. Get current date information
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const joiningDate = new Date(member.membershipStartDate);

    const joiningYear = joiningDate.getFullYear();
    const joiningMonth = joiningDate.getMonth();

    const monthlyFee = member.monthlyFee;

    // 5. Identify months already paid
    const paymentMonths = new Set(
      payments
        .filter((payment) => payment.feeMonth)
        .map((payment) => payment.feeMonth)
    );

    // 6. Calculate monthly payment status
    const monthlyStatus = [];

    let outstandingDues = 0;

    for (let year = joiningYear; year <= currentYear; year++) {
      const firstMonth =
        year === joiningYear ? joiningMonth : 0;

      const lastMonth =
        year === currentYear ? currentMonth : 11;

      for (let month = firstMonth; month <= lastMonth; month++) {
        const feeMonth = `${year}-${String(month + 1).padStart(2, "0")}`;

        const isPaid = paymentMonths.has(feeMonth);

        const isCurrentMonth =
          year === currentYear && month === currentMonth;

        // Payment deadline: 5th day, 11:59:59 PM
        const dueDate = new Date(year, month, 5, 23, 59, 59, 999);

        let status = "Pending";

        if (isPaid) {
          status = "Paid";
        } else if (now > dueDate) {
          status = "Overdue";
        }

        // Add unpaid monthly fees to outstanding dues
        if (!isPaid) {
          outstandingDues += monthlyFee;
        }

        monthlyStatus.push({
          feeMonth,
          monthName: new Date(year, month, 1).toLocaleDateString(
            "en-IN",
            {
              month: "long",
              year: "numeric",
            }
          ),
          amount: monthlyFee,
          status,
          isCurrentMonth,
          dueDate: dueDate.toISOString(),
        });
      }
    }

    // 7. Get current month's payment information
    const currentFeeMonth = `${currentYear}-${String(
      currentMonth + 1
    ).padStart(2, "0")}`;

    const currentMonthPayment = payments.find(
      (payment) => payment.feeMonth === currentFeeMonth
    );

    const currentMonthStatus = monthlyStatus.find(
      (item) => item.feeMonth === currentFeeMonth
    );

    // 8. Return dashboard information
    return NextResponse.json({
      member: {
        id: member._id.toString(),
        name: member.name,
        phone: member.phone,
        email: member.email || "",
        monthlyFee,
        membershipStartDate: member.membershipStartDate,
      },

      currentMonth: {
        feeMonth: currentFeeMonth,
        amount: monthlyFee,
        status: currentMonthStatus?.status || "Pending",
        dueDate: currentMonthStatus?.dueDate || null,
        paymentDate: currentMonthPayment?.paymentDate || null,
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
