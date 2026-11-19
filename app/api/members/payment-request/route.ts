
import { NextRequest, NextResponse } from "next/server";

import { getMemberSession } from "@/lib/member-auth";
import { connectDB } from "@/lib/mongodb";

import Member from "@/models/Member";
import Payment from "@/models/Payment";
import PaymentRequest from "@/models/PaymentRequest";

// Get the current billing month using Indian Standard Time.
function getIndiaFeeMonth(): string {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

// Get the monthly fee applicable to a particular billing month.
function getFeeForMonth(
  feeMonth: string,
  monthlyFee: number,
  monthlyFeeHistory?: {
    amount: number;
    effectiveFrom: string;
    updatedAt?: Date;
  }[]
): number {
  const applicableHistory = (monthlyFeeHistory || [])
    .filter(
      (item) =>
        item.effectiveFrom &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(item.effectiveFrom) &&
        item.effectiveFrom <= feeMonth &&
        Number.isFinite(item.amount) &&
        item.amount > 0
    )
    .sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );

  if (applicableHistory.length === 0) {
    return monthlyFee;
  }

  return applicableHistory[applicableHistory.length - 1].amount;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify member login.
    const session = await getMemberSession();

    if (!session?.id) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Find active and approved member.
    const member = await Member.findOne({
      _id: session.id,
      isActive: true,
      approvalStatus: "approved",
    }).select(
      "membershipStartDate monthlyFee monthlyFeeHistory"
    );

    if (!member) {
      return NextResponse.json(
        {
          message:
            "Your member account is not active or approved.",
        },
        { status: 403 }
      );
    }

    // 3. Read and validate request body.
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: "Invalid payment request data." },
        { status: 400 }
      );
    }

    const paymentData = body as Record<string, unknown>;

    const feeMonth =
      typeof paymentData.feeMonth === "string"
        ? paymentData.feeMonth.trim()
        : "";

    const paymentMethod =
      typeof paymentData.paymentMethod === "string"
        ? paymentData.paymentMethod.trim()
        : "";

    const transactionId =
      typeof paymentData.transactionId === "string"
        ? paymentData.transactionId.trim()
        : "";

    // Accept both frontend and backend screenshot field names.
    const proofImageUrl =
      typeof paymentData.proofUrl === "string"
        ? paymentData.proofUrl.trim()
        : typeof paymentData.proofImageUrl === "string"
          ? paymentData.proofImageUrl.trim()
          : "";

    // 4. Validate billing month.
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(feeMonth)) {
      return NextResponse.json(
        { message: "Please select a valid billing month." },
        { status: 400 }
      );
    }

    const currentFeeMonth = getIndiaFeeMonth();

    if (feeMonth > currentFeeMonth) {
      return NextResponse.json(
        {
          message:
            "You cannot request payment for a future month.",
        },
        { status: 400 }
      );
    }

    // 5. Validate membership joining date.
    const joiningDate = new Date(member.membershipStartDate);

    if (Number.isNaN(joiningDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid membership joining date." },
        { status: 400 }
      );
    }

    const joiningParts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
    }).formatToParts(joiningDate);

    const joiningYear = joiningParts.find(
      (part) => part.type === "year"
    )?.value;

    const joiningMonth = joiningParts.find(
      (part) => part.type === "month"
    )?.value;

    const joiningFeeMonth = `${joiningYear}-${joiningMonth}`;

    if (feeMonth < joiningFeeMonth) {
      return NextResponse.json(
        {
          message:
            "You cannot pay for a month before joining.",
        },
        { status: 400 }
      );
    }

    // 6. Validate payment method.
    if (
      paymentMethod !== "cash" &&
      paymentMethod !== "online"
    ) {
      return NextResponse.json(
        { message: "Invalid payment method." },
        { status: 400 }
      );
    }

    // 7. Validate online payment details.
    if (paymentMethod === "online") {
      if (!transactionId || !proofImageUrl) {
        return NextResponse.json(
          {
            message:
              "Transaction ID and payment screenshot are required.",
          },
          { status: 400 }
        );
      }

      if (transactionId.length > 150) {
        return NextResponse.json(
          { message: "Transaction ID is too long." },
          { status: 400 }
        );
      }

      try {
        const proofUrl = new URL(proofImageUrl);

        if (
          proofUrl.protocol !== "https:" ||
          proofUrl.hostname !== "res.cloudinary.com" ||
          !proofUrl.pathname.startsWith(
            "/q1alw8bx/image/upload/"
          )
        ) {
          return NextResponse.json(
            {
              message: "Invalid payment screenshot URL.",
            },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          {
            message: "Invalid payment screenshot URL.",
          },
          { status: 400 }
        );
      }
    }

    // 8. Check whether this month is already paid.
    const existingPayment = await Payment.findOne({
      member: member._id,
      feeMonth,
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This month's payment is already completed.",
        },
        { status: 409 }
      );
    }

    // 9. Check whether a pending request already exists.
    const existingRequest = await PaymentRequest.findOne({
      member: member._id,
      feeMonth,
      status: "pending",
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: true,
          alreadyPending: true,
          message:
            "Your payment request for this month is already pending owner verification.",
          paymentRequest: {
            id: existingRequest._id.toString(),
            amount: existingRequest.amount,
            feeMonth: existingRequest.feeMonth,
            paymentMethod: existingRequest.paymentMethod,
            status: existingRequest.status,
          },
        },
        { status: 200 }
      );
    }

    // 10. Calculate the fee for the selected billing month.
    const applicableMonthlyFee = getFeeForMonth(
      feeMonth,
      member.monthlyFee,
      member.monthlyFeeHistory
    );

    if (
      !Number.isFinite(applicableMonthlyFee) ||
      applicableMonthlyFee <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid membership fee for this month.",
        },
        { status: 400 }
      );
    }

    // 11. Create payment request.
    const paymentRequest = await PaymentRequest.create({
      member: member._id,
      amount: applicableMonthlyFee,
      feeMonth,
      paymentMethod,
      transactionId:
        paymentMethod === "online"
          ? transactionId
          : undefined,
      proofImageUrl:
        paymentMethod === "online"
          ? proofImageUrl
          : undefined,
      status: "pending",
    });

    // 12. Return successful response.
    return NextResponse.json(
      {
        success: true,
        alreadyPending: false,
        message:
          "Payment request submitted successfully. Waiting for owner verification.",
        paymentRequest: {
          id: paymentRequest._id.toString(),
          amount: paymentRequest.amount,
          feeMonth: paymentRequest.feeMonth,
          paymentMethod: paymentRequest.paymentMethod,
          status: paymentRequest.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate requests caused by simultaneous submissions.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      try {
        const session = await getMemberSession();

        if (session?.id) {
          const pendingRequest = await PaymentRequest.findOne({
            member: session.id,
            status: "pending",
          }).sort({ createdAt: -1 });

          if (pendingRequest) {
            return NextResponse.json(
              {
                success: true,
                alreadyPending: true,
                message:
                  "Your payment request is already pending owner verification.",
                paymentRequest: {
                  id: pendingRequest._id.toString(),
                  amount: pendingRequest.amount,
                  feeMonth: pendingRequest.feeMonth,
                  paymentMethod: pendingRequest.paymentMethod,
                  status: pendingRequest.status,
                },
              },
              { status: 200 }
            );
          }
        }
      } catch (duplicateCheckError) {
        console.error(
          "Duplicate payment request check failed:",
          duplicateCheckError
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "A payment request already exists. Please refresh your dashboard.",
        },
        { status: 409 }
      );
    }

    console.error("Payment request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit payment request.",
      },
      { status: 500 }
    );
  }
}
