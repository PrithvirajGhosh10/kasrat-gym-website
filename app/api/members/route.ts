
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

export async function POST(request: NextRequest) {
  try {
    // Check login session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    // Only Owner and Staff can register members
    if (session.role !== "owner" && session.role !== "staff") {
      return NextResponse.json(
        { message: "Access denied." },
        { status: 403 }
      );
    }

    await connectDB();

    // Verify that the admin account is active
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

    const monthlyFee = Number(body.monthlyFee ?? 400);

    // Validate required fields
    if (
      !name ||
      !phone ||
      !body.membershipStartDate ||
      !password ||
      body.monthlyFee === undefined
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Validate phone number
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

    // Validate join date
    if (Number.isNaN(membershipStartDate.getTime())) {
      return NextResponse.json(
        { message: "Please enter a valid joining date." },
        { status: 400 }
      );
    }

    // Validate monthly fee
    if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) {
      return NextResponse.json(
        { message: "Please enter a valid monthly fee." },
        { status: 400 }
      );
    }

    // Check whether phone number already exists
    const existingMember = await Member.findOne({ phone });

    if (existingMember) {
      return NextResponse.json(
        { message: "A member with this phone number already exists." },
        { status: 409 }
      );
    }

    // Hash the member password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create member
    const member = await Member.create({
      name,
      phone,
      ...(email ? { email } : {}),
      passwordHash,
      membershipStartDate,
      monthlyFee,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Member registered successfully.",
        member: {
          id: member._id.toString(),
          name: member.name,
          phone: member.phone,
          email: member.email,
          membershipStartDate: member.membershipStartDate,
          monthlyFee: member.monthlyFee,
          isActive: member.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Member registration error:", error);

    return NextResponse.json(
      { message: "Unable to register member." },
      { status: 500 }
    );
  }
}
