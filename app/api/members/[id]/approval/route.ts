
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ApprovalStatus = "approved" | "rejected";

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 1. Verify owner session
    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Unauthorized. Owner access required." },
        { status: 403 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Verify active owner
    const admin = await Admin.findById(session.id).select(
      "role isActive"
    );

    if (!admin || !admin.isActive || admin.role !== "owner") {
      return NextResponse.json(
        { message: "Owner account not authorized." },
        { status: 403 }
      );
    }

    // 4. Validate member ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid member ID." },
        { status: 400 }
      );
    }

    // 5. Read and validate request body
    const body = await request.json();
    const approvalStatus: unknown = body.approvalStatus;

    if (
      approvalStatus !== "approved" &&
      approvalStatus !== "rejected"
    ) {
      return NextResponse.json(
        { message: "Choose approve or reject." },
        { status: 400 }
      );
    }

    // 6. Prepare update
    const updateData: {
      approvalStatus: ApprovalStatus;
      membershipStartDate?: Date;
    } = {
      approvalStatus,
    };

    // Set membership start date when approving
    if (approvalStatus === "approved") {
      updateData.membershipStartDate = new Date();
    }

    // 7. Update only a pending registration
    const member = await Member.findOneAndUpdate(
      {
        _id: id,
        approvalStatus: "pending",
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!member) {
      return NextResponse.json(
        {
          message:
            "Pending registration not found or already reviewed.",
        },
        { status: 404 }
      );
    }

    // 8. Return response
    return NextResponse.json(
      {
        success: true,
        message:
          approvalStatus === "approved"
            ? "Member approved successfully."
            : "Member registration rejected.",
        member: {
          id: member._id.toString(),
          name: member.name,
          approvalStatus: member.approvalStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Member approval API error:", error);

    return NextResponse.json(
      { message: "Failed to update member approval." },
      { status: 500 }
    );
  }
}
