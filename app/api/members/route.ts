
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

export async function POST(request: NextRequest) {
  try {
    // 1. Check login session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    // 2. Only Owner and Staff can register members
    if (session.role !== "owner" && session.role !== "staff") {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    // 3. Connect to database
    await connectDB();

    // 4. Verify active admin account
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

    // 5. Read request body
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

    const membershipStartDate = new Date(
      body.membershipStartDate
    );

    const monthlyFee = Number(body.monthlyFee);

    // 6. Validate required fields
    if (
      !name ||
      !phone ||
      !body.membershipStartDate ||
      !password ||
      body.monthlyFee === undefined ||
      body.monthlyFee === null ||
      body.monthlyFee === ""
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { message: "Name must contain 2 to 100 characters." },
        { status: 400 }
      );
    }

    // 7. Validate phone number
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    // 8. Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 9. Validate password
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // 10. Validate joining date
    if (
      Number.isNaN(membershipStartDate.getTime()) ||
      membershipStartDate > new Date()
    ) {
      return NextResponse.json(
        { message: "Please enter a valid joining date." },
        { status: 400 }
      );
    }

    // 11. Validate monthly fee
    if (
      !Number.isInteger(monthlyFee) ||
      monthlyFee < 1 ||
      monthlyFee > 1000000
    ) {
      return NextResponse.json(
        { message: "Monthly fee must be between ₹1 and ₹10,00,000." },
        { status: 400 }
      );
    }

    // 12. Check duplicate phone number
    const existingMember = await Member.findOne({ phone });

    if (existingMember) {
      return NextResponse.json(
        {
          message:
            "A member with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    // 13. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 14. Create approved member
    const member = await Member.create({
      name,
      phone,
      ...(email ? { email } : {}),
      passwordHash,
      membershipStartDate,
      monthlyFee,
      monthlyFeeHistory: [],
      isActive: true,
      approvalStatus: "approved",
    });

    // 15. Return response
    return NextResponse.json(
      {
        success: true,
        message: "Member registered successfully.",
        member: {
          id: member._id.toString(),
          name: member.name,
          phone: member.phone,
          email: member.email,
          membershipStartDate: member.membershipStartDate,
          monthlyFee: member.monthlyFee,
          isActive: member.isActive,
          approvalStatus: member.approvalStatus,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Member registration error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            "A member with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to register member." },
      { status: 500 }
    );
  }
}
