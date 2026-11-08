
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || (session.role !== "owner" && session.role !== "staff")) {
      return NextResponse.json(
        { message: "Access denied. Please log in." },
        { status: 401 }
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

    const members = await Member.find({ isActive: true })
      .select("name phone monthlyFee")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Member options error:", error);

    return NextResponse.json(
      { message: "Unable to load members." },
      { status: 500 }
    );
  }
}
