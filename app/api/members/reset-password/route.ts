
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Only the gym owner can reset member passwords." },
        { status: 403 }
      );
    }

    await connectDB();

    const owner = await Admin.findById(session.id);

    if (!owner || owner.role !== "owner" || !owner.isActive) {
      return NextResponse.json(
        { message: "Unauthorized access." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const memberId =
      typeof body.memberId === "string" ? body.memberId.trim() : "";

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    if (!memberId || !newPassword) {
      return NextResponse.json(
        { message: "Member ID and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const member = await Member.findByIdAndUpdate(
      memberId,
      { passwordHash },
      { new: true }
    );

    if (!member) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Member password reset successfully.",
    });
  } catch (error) {
    console.error("Reset member password error:", error);

    return NextResponse.json(
      { message: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
