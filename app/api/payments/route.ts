
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";
import Payment from "@/models/Payment";
import type { PaymentMethod } from "@/models/Payment";

// Calculate the fee effective for the selected billing month.
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

// GET: View payment history
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    if (session.role !== "owner" && session.role !== "staff") {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    await connectDB();

    const admin = await Admin.findOne({
      _id: session.id,
      role: session.role,
      isActive: true,
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Your account is not active." },
        { status: 403 }
      );
    }

    const payments = await Payment.find()
      .populate("member", "name phone")
      .populate("recordedBy", "name role")
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Payment history error:", error);

    return NextResponse.json(
      { message: "Unable to fetch payment history." },
      { status: 500 }
    );
  }
}

// POST: Record a new full monthly payment
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    if (session.role !== "owner" && session.role !== "staff") {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    await connectDB();

    const admin = await Admin.findOne({
      _id: session.id,
      role: session.role,
      isActive: true,
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Your account is not active." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      typeof body.memberId !== "string" ||
      !body.memberId.trim() ||
      typeof body.feeMonth !== "string" ||
      typeof body.paymentDate !== "string" ||
      typeof body.paymentMethod !== "string"
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const memberId = body.memberId.trim();
    const feeMonth = body.feeMonth.trim();

    // Validate member ID
    if (!/^[0-9a-fA-F]{24}$/.test(memberId)) {
      return NextResponse.json(
        { message: "Invalid member ID." },
        { status: 400 }
      );
    }

    // Validate billing month
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(feeMonth)) {
      return NextResponse.json(
        { message: "Please select a valid billing month." },
        { status: 400 }
      );
    }

    // Validate payment date
    const paymentDate = new Date(body.paymentDate);

    if (
      Number.isNaN(paymentDate.getTime()) ||
      paymentDate > new Date()
    ) {
      return NextResponse.json(
        {
          message:
            "Please enter a valid payment date that is not in the future.",
        },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods: PaymentMethod[] = [
      "cash",
      "upi",
      "card",
      "bank_transfer",
    ];

    if (!validMethods.includes(body.paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method." },
        { status: 400 }
      );
    }

    const paymentMethod = body.paymentMethod as PaymentMethod;

    // Validate optional note
    const note =
      typeof body.note === "string" ? body.note.trim() : "";

    if (note.length > 500) {
      return NextResponse.json(
        { message: "Payment note cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    // Find an active, approved member.
    // Older records without approvalStatus remain supported.
    const member = await Member.findOne({
      _id: memberId,
      isActive: true,
      $or: [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
      ],
    }).select(
      "membershipStartDate monthlyFee monthlyFeeHistory"
    );

    if (!member) {
      return NextResponse.json(
        { message: "Active approved member not found." },
        { status: 404 }
      );
    }

    // Get member joining month in Indian Standard Time.
    const joiningMonth = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
    }).format(new Date(member.membershipStartDate));

    // Prevent payment before joining month.
    if (feeMonth < joiningMonth) {
      return NextResponse.json(
        { message: "Cannot record payment before the joining month." },
        { status: 400 }
      );
    }

    // Calculate amount using the fee history stored in the database.
    const amount = getFeeForMonth(
      feeMonth,
      Number(member.monthlyFee),
      member.monthlyFeeHistory
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Member has an invalid monthly fee." },
        { status: 400 }
      );
    }

    // Check for an existing payment.
    const existingPayment = await Payment.findOne({
      member: member._id,
      feeMonth,
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          message: `Payment for ${feeMonth} has already been recorded.`,
        },
        { status: 409 }
      );
    }

    // Create payment using the database-calculated historical amount.
    const payment = await Payment.create({
      member: member._id,
      amount,
      feeMonth,
      paymentDate,
      paymentMethod,
      ...(note ? { note } : {}),
      recordedBy: admin._id,
    });

    return NextResponse.json(
      {
        message: "Full monthly payment recorded successfully.",
        payment: {
          id: payment._id.toString(),
          memberId,
          amount,
          feeMonth,
          paymentDate,
          paymentMethod,
          note,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate payment requests at database level.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            "Payment for this member and month has already been recorded.",
        },
        { status: 409 }
      );
    }

    console.error("Payment registration error:", error);

    return NextResponse.json(
      { message: "Unable to record payment." },
      { status: 500 }
    );
  }
}
