
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    if (session.role !== "owner") {
      return NextResponse.json(
        { message: "Only the owner can view all members." },
        { status: 403 }
      );
    }

    await connectDB();

    const owner = await Admin.findOne({
      _id: session.id,
      role: "owner",
      isActive: true,
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner account is not active." },
        { status: 403 }
      );
    }

    const members = await Member.find()
      .select(
        "name phone email membershipStartDate monthlyFee isActive createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Member list error:", error);

    return NextResponse.json(
      { message: "Unable to fetch members." },
      { status: 500 }
    );
  }
}
