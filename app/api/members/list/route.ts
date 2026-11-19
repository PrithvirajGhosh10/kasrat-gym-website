
import { NextRequest, NextResponse, connection } from "next/server";
import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";

// Verify that the logged-in user is an active owner.
async function verifyOwner() {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    return null;
  }

  await connectDB();

  const owner = await Admin.findOne({
    _id: session.id,
    role: "owner",
    isActive: true,
  });

  return owner ? session : null;
}

// Get the billing month using Indian Standard Time.
function getIndiaFeeMonth(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

// Generate the next unique SL number.
async function getNextSlNo(): Promise<number> {
  const highestMembers = await Member.aggregate<{ slNo: number }>([
    {
      $match: {
        slNo: { $exists: true, $ne: null },
      },
    },
    { $sort: { slNo: -1 } },
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        slNo: 1,
      },
    },
  ]);

  const highestSlNo = highestMembers[0]?.slNo ?? 0;

  const counters = Member.db.collection<{
    _id: string;
    seq: number;
  }>("counters");

  await counters.updateOne(
    { _id: "member_sl_no" },
    { $max: { seq: highestSlNo } },
    { upsert: true }
  );

  const result = await counters.findOneAndUpdate(
    { _id: "member_sl_no" },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      includeResultMetadata: false,
    }
  );

  const counter = result as {
    _id: string;
    seq: number;
  } | null;

  const slNo = counter?.seq;

  if (
    typeof slNo !== "number" ||
    !Number.isInteger(slNo) ||
    slNo < 1
  ) {
    throw new Error("Unable to generate member serial number.");
  }

  return slNo;
}

// GET: Fetch all members and assign missing SL numbers.
export async function GET() {
  try {
    await connection();

    const ownerSession = await verifyOwner();

    if (!ownerSession) {
      return NextResponse.json(
        { message: "Only an active owner can view all members." },
        { status: 403 }
      );
    }

    const membersWithoutSlNo = await Member.find({
      $or: [
        { slNo: { $exists: false } },
        { slNo: null },
      ],
    })
      .select("_id")
      .sort({ createdAt: 1 })
      .lean();

    for (const member of membersWithoutSlNo) {
      const slNo = await getNextSlNo();

      await Member.updateOne(
        {
          _id: member._id,
          $or: [
            { slNo: { $exists: false } },
            { slNo: null },
          ],
        },
        { $set: { slNo } }
      );
    }

    const members = await Member.find()
      .select(
        "name phone email slNo membershipStartDate monthlyFee monthlyFeeHistory isActive approvalStatus createdAt"
      )
      .sort({ slNo: 1 })
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

// PATCH: Update SL number, monthly fee, or membership status.
export async function PATCH(request: NextRequest) {
  try {
    await connection();

    const ownerSession = await verifyOwner();

    if (!ownerSession) {
      return NextResponse.json(
        { message: "Only an active owner can manage members." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const memberId =
      typeof body.memberId === "string" ? body.memberId : "";

    if (!Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { message: "Please provide a valid member ID." },
        { status: 400 }
      );
    }

    const member = await Member.findById(memberId);

    if (!member) {
      return NextResponse.json(
        { message: "Member not found." },
        { status: 404 }
      );
    }

    // Deactivate or reactivate a member.
    if (
      body.action === "deactivate" ||
      body.action === "reactivate"
    ) {
      const isActive = body.action === "reactivate";

      member.isActive = isActive;
      await member.save();

      return NextResponse.json({
        message: isActive
          ? "Member reactivated successfully."
          : "Member deactivated successfully.",
        member: {
          id: member._id.toString(),
          name: member.name,
          isActive: member.isActive,
        },
      });
    }

    // Owner updates the monthly membership fee.
    if (
      Object.prototype.hasOwnProperty.call(body, "monthlyFee")
    ) {
      const monthlyFee =
        typeof body.monthlyFee === "number"
          ? body.monthlyFee
          : typeof body.monthlyFee === "string" &&
              body.monthlyFee.trim() !== ""
            ? Number(body.monthlyFee)
            : NaN;

      if (
        !Number.isInteger(monthlyFee) ||
        monthlyFee < 1 ||
        monthlyFee > 1000000
      ) {
        return NextResponse.json(
          {
            message:
              "Monthly fee must be a whole number between ₹1 and ₹10,00,000.",
          },
          { status: 400 }
        );
      }

      const currentFeeMonth = getIndiaFeeMonth();
      const joiningFeeMonth = getIndiaFeeMonth(
        member.membershipStartDate
      );

      const previousFee = member.monthlyFee;

      const feeHistory = (
        member.monthlyFeeHistory ?? []
      ).map((entry) => ({
        amount: entry.amount,
        effectiveFrom: entry.effectiveFrom,
        updatedAt: entry.updatedAt,
      }));

      // Preserve the original fee from the joining month.
      // This is important when history contains only future
      // scheduled fee changes.
      const hasBaselineFee = feeHistory.some(
        (entry) => entry.effectiveFrom <= joiningFeeMonth
      );

      if (!hasBaselineFee) {
        feeHistory.push({
          amount: previousFee,
          effectiveFrom: joiningFeeMonth,
          updatedAt: member.createdAt ?? new Date(),
        });
      }

      // Apply the owner's new fee from the current billing month.
      const currentMonthIndex = feeHistory.findIndex(
        (entry) => entry.effectiveFrom === currentFeeMonth
      );

      const updatedAt = new Date();

      if (currentMonthIndex >= 0) {
        feeHistory[currentMonthIndex] = {
          amount: monthlyFee,
          effectiveFrom: currentFeeMonth,
          updatedAt,
        };
      } else {
        feeHistory.push({
          amount: monthlyFee,
          effectiveFrom: currentFeeMonth,
          updatedAt,
        });
      }

      // Keep fee history in chronological order.
      feeHistory.sort((a, b) =>
        a.effectiveFrom.localeCompare(b.effectiveFrom)
      );

      member.monthlyFee = monthlyFee;
      member.monthlyFeeHistory = feeHistory;

      await member.save();

      return NextResponse.json({
        message: "Member monthly fee updated successfully.",
        member: {
          id: member._id.toString(),
          name: member.name,
          monthlyFee: member.monthlyFee,
          monthlyFeeHistory: member.monthlyFeeHistory,
        },
      });
    }

    // Update member SL number.
    if (
      !Object.prototype.hasOwnProperty.call(body, "slNo")
    ) {
      return NextResponse.json(
        {
          message:
            "Please provide an SL number, monthly fee, or valid action.",
        },
        { status: 400 }
      );
    }

    const slNo =
      typeof body.slNo === "number"
        ? body.slNo
        : typeof body.slNo === "string" &&
            body.slNo.trim() !== ""
          ? Number(body.slNo)
          : NaN;

    if (!Number.isInteger(slNo) || slNo < 1) {
      return NextResponse.json(
        { message: "Please provide a valid SL number." },
        { status: 400 }
      );
    }

    // Prevent duplicate SL numbers.
    const existingMember = await Member.findOne({
      slNo,
      _id: { $ne: member._id },
    });

    if (existingMember) {
      return NextResponse.json(
        {
          message:
            "This SL number is already assigned to another member.",
        },
        { status: 409 }
      );
    }

    member.slNo = slNo;
    await member.save();

    // Keep the SL number counter synchronized.
    const counters = Member.db.collection<{
      _id: string;
      seq: number;
    }>("counters");

    await counters.updateOne(
      { _id: "member_sl_no" },
      { $max: { seq: slNo } },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Member SL number updated successfully.",
      member: {
        id: member._id.toString(),
        name: member.name,
        slNo: member.slNo,
      },
    });
  } catch (error) {
    console.error("Member management error:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "This SL number is already assigned." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to manage member." },
      { status: 500 }
    );
  }
}
