
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

export async function GET() {
  try {
    // 1. Verify login session
    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Unauthorized. Owner access required." },
        { status: 403 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Verify active owner account
    const admin = await Admin.findById(session.id).select(
      "role isActive"
    );

    if (!admin || !admin.isActive || admin.role !== "owner") {
      return NextResponse.json(
        { message: "Owner account not authorized." },
        { status: 403 }
      );
    }

    // 4. Find pending registrations
    const pendingMembers = await Member.find({
      approvalStatus: "pending",
    })
      .select("name phone email membershipStartDate createdAt approvalStatus")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        members: pendingMembers.map((member) => ({
          id: member._id.toString(),
          name: member.name,
          phone: member.phone,
          email: member.email || "",
          registeredAt: member.createdAt,
          approvalStatus: member.approvalStatus,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pending members API error:", error);

    return NextResponse.json(
      { message: "Failed to load pending registrations." },
      { status: 500 }
    );
  }
}
