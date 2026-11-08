
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import { createMemberSession } from "@/lib/member-auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!phone || !password) {
      return NextResponse.json(
        { message: "Please enter your phone number and password." },
        { status: 400 }
      );
    }

    const member = await Member.findOne({ phone })
      .select("+passwordHash");

    if (!member || !member.isActive) {
      return NextResponse.json(
        { message: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      member.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    await createMemberSession(member._id.toString());

    return NextResponse.json({
      message: "Member login successful.",
      member: {
        id: member._id.toString(),
        name: member.name,
        phone: member.phone,
      },
    });
  } catch (error) {
    console.error("Member login error:", error);

    return NextResponse.json(
      { message: "Unable to log in. Please try again." },
      { status: 500 }
    );
  }
}
