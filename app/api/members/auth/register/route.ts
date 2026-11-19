
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";

function getIndiaFeeMonth(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    // Validate required fields
    if (!name || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Validate name
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { message: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }

    // Validate phone
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check duplicate phone number
    const existingMember = await Member.findOne({ phone });

    if (existingMember) {
      return NextResponse.json(
        {
          message:
            "This phone number is already registered. Please contact the gym owner.",
        },
        { status: 409 }
      );
    }

    // Find the highest existing member SL number
    const highestMember = await Member.findOne({
      slNo: { $exists: true, $ne: null },
    })
      .sort({ slNo: -1 })
      .select("slNo")
      .lean();

    const highestSlNo = Number(highestMember?.slNo ?? 0);

    // Access MongoDB counter collection
    const counters = Member.db.collection<{
      _id: string;
      seq: number;
    }>("counters");

    // Keep counter synchronized with existing member numbers
    await counters.updateOne(
      { _id: "member_sl_no" },
      { $max: { seq: highestSlNo } },
      { upsert: true }
    );

    // Atomically generate the next SL number
    const counter = await counters.findOneAndUpdate(
      { _id: "member_sl_no" },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    const slNo = Number(counter?.seq);

    if (!Number.isInteger(slNo) || slNo < 1) {
      throw new Error("Unable to generate member serial number.");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Set initial fee history from the joining month
    const membershipStartDate = new Date();
    const joiningFeeMonth = getIndiaFeeMonth(membershipStartDate);

    // Create pending member account
    const member = await Member.create({
      name,
      phone,
      ...(email ? { email } : {}),
      passwordHash,
      membershipStartDate,
      slNo,
      monthlyFee: 400,
      monthlyFeeHistory: [
        {
          amount: 400,
          effectiveFrom: joiningFeeMonth,
          updatedAt: new Date(),
        },
      ],
      isActive: true,
      approvalStatus: "pending",
    });

    return NextResponse.json(
      {
        message:
          "Registration submitted successfully. Please wait for gym owner approval before logging in.",
        member: {
          id: member._id.toString(),
          name: member.name,
          phone: member.phone,
          slNo: member.slNo,
          approvalStatus: member.approvalStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate database entries
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            "This phone number or serial number is already registered.",
        },
        { status: 409 }
      );
    }

    console.error("Member signup error:", error);

    return NextResponse.json(
      { message: "Unable to complete registration. Please try again." },
      { status: 500 }
    );
  }
}
