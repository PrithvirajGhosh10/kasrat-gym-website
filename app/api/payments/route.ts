
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";
import Payment from "@/models/Payment";
import type { PaymentMethod } from "@/models/Payment";

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
      body.memberId.trim() === "" ||
      body.amount === undefined ||
      body.amount === null ||
      !body.paymentDate ||
      !body.paymentMethod ||
      typeof body.feeMonth !== "string"
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const memberId = body.memberId.trim();
    const amount = Number(body.amount);
    const feeMonth = body.feeMonth.trim();

    const paymentDate =
      typeof body.paymentDate === "string"
        ? new Date(body.paymentDate)
        : new Date("");

    const note =
      typeof body.note === "string" ? body.note.trim() : "";

    // Validate member ID
    if (!/^[0-9a-fA-F]{24}$/.test(memberId)) {
      return NextResponse.json(
        { message: "Invalid member ID." },
        { status: 400 }
      );
    }

    // Validate amount
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid payment amount." },
        { status: 400 }
      );
    }

    // Validate billing month (YYYY-MM)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(feeMonth)) {
      return NextResponse.json(
        { message: "Please select a valid billing month." },
        { status: 400 }
      );
    }

    // Validate payment date
    if (Number.isNaN(paymentDate.getTime())) {
      return NextResponse.json(
        { message: "Please enter a valid payment date." },
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

    if (
      typeof body.paymentMethod !== "string" ||
      !validMethods.includes(body.paymentMethod as PaymentMethod)
    ) {
      return NextResponse.json(
        { message: "Invalid payment method." },
        { status: 400 }
      );
    }

    const paymentMethod = body.paymentMethod as PaymentMethod;

    // Find active member
    const member = await Member.findOne({
      _id: memberId,
      isActive: true,
    });

    if (!member) {
      return NextResponse.json(
        { message: "Active member not found." },
        { status: 404 }
      );
    }

    // Get member joining month
    const joiningMonth = member.membershipStartDate
      .toISOString()
      .slice(0, 7);

    // Prevent payment before joining month
    if (feeMonth < joiningMonth) {
      return NextResponse.json(
        { message: "Cannot record payment before the joining month." },
        { status: 400 }
      );
    }

    // Require exact full monthly fee
    if (amount !== member.monthlyFee) {
      return NextResponse.json(
        {
          message: `Full monthly fee of ₹${member.monthlyFee} is required. Partial payments are not allowed.`,
        },
        { status: 400 }
      );
    }

    // Check duplicate payment for this month
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

    // Create payment
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
    console.error("Payment registration error:", error);

    return NextResponse.json(
      { message: "Unable to record payment." },
      { status: 500 }
    );
  }
}
