
import mongoose from "mongoose";
import { connection, NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import Admin from "@/models/Admin";
import Member from "@/models/Member";
import FeeChangeRequest from "@/models/FeeChangeRequest";

// Get the current billing month using Indian Standard Time.
function getIndiaFeeMonth(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}-${month}`;
}

// Get the next calendar billing month.
function getNextFeeMonth(feeMonth: string) {
  const [year, month] = feeMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));

  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}

// Get the fee applicable for a particular billing month.
function getFeeForMonth(
  feeMonth: string,
  monthlyFee: number,
  monthlyFeeHistory?: {
    amount: number;
    effectiveFrom: string;
    updatedAt?: Date;
  }[]
) {
  const applicableHistory = (monthlyFeeHistory || [])
    .filter(
      (item) =>
        item.effectiveFrom &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(item.effectiveFrom) &&
        item.effectiveFrom <= feeMonth
    )
    .sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );

  if (applicableHistory.length === 0) {
    return monthlyFee;
  }

  return applicableHistory[applicableHistory.length - 1].amount;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connection();

    // 1. Verify owner session.
    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Access denied. Owner login required." },
        { status: 401 }
      );
    }

    await connectDB();

    // 2. Verify active owner account.
    const owner = await Admin.findOne({
      _id: session.id,
      role: "owner",
      isActive: true,
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Your owner account is not active." },
        { status: 403 }
      );
    }

    // 3. Validate request ID.
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid fee-change request ID." },
        { status: 400 }
      );
    }

    // 4. Validate review information.
    const body = await request.json();

    const action = body.action;

    const reviewNote =
      typeof body.reviewNote === "string"
        ? body.reviewNote.trim()
        : "";

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { message: "Invalid review action." },
        { status: 400 }
      );
    }

    if (reviewNote.length > 500) {
      return NextResponse.json(
        { message: "Review note cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    if (action === "reject" && !reviewNote) {
      return NextResponse.json(
        { message: "Please provide a reason for rejection." },
        { status: 400 }
      );
    }

    // 5. Find a pending request.
    const feeRequest = await FeeChangeRequest.findOne({
      _id: id,
      status: "pending",
    });

    if (!feeRequest) {
      return NextResponse.json(
        { message: "Pending fee-change request not found." },
        { status: 404 }
      );
    }

    const now = new Date();

    // 6. Handle rejection.
    if (action === "reject") {
      feeRequest.status = "rejected";
      feeRequest.reviewedBy = owner._id;
      feeRequest.reviewedAt = now;
      feeRequest.reviewNote = reviewNote;

      await feeRequest.save();

      return NextResponse.json({
        message: "Fee-change request rejected successfully.",
      });
    }

    // 7. Find the active approved member.
    const member = await Member.findOne({
      _id: feeRequest.member,
      isActive: true,
      approvalStatus: "approved",
    });

    if (!member) {
      return NextResponse.json(
        { message: "The member is no longer active or approved." },
        { status: 409 }
      );
    }

    // 8. Check the member's currently applicable fee.
    const currentIndiaMonth = getIndiaFeeMonth(now);

    const currentApplicableFee = getFeeForMonth(
      currentIndiaMonth,
      member.monthlyFee,
      member.monthlyFeeHistory
    );

    if (currentApplicableFee !== feeRequest.currentFee) {
      return NextResponse.json(
        {
          message:
            "The member's current applicable fee has changed since this request was submitted. Review the request again before approving.",
        },
        { status: 409 }
      );
    }

    // 9. Schedule the new fee from the next billing month.
    const effectiveFrom = getNextFeeMonth(currentIndiaMonth);

    const history = (member.monthlyFeeHistory || []).map((item) => ({
      amount: item.amount,
      effectiveFrom: item.effectiveFrom,
      updatedAt: item.updatedAt || now,
    }));

    // Update an existing entry for that month, if present.
    const existingEffectiveMonth = history.find(
      (item) => item.effectiveFrom === effectiveFrom
    );

    if (existingEffectiveMonth) {
      existingEffectiveMonth.amount = feeRequest.requestedFee;
      existingEffectiveMonth.updatedAt = now;
    } else {
      history.push({
        amount: feeRequest.requestedFee,
        effectiveFrom,
        updatedAt: now,
      });
    }

    history.sort((a, b) =>
      a.effectiveFrom.localeCompare(b.effectiveFrom)
    );

    // IMPORTANT:
    // Do not change member.monthlyFee here.
    // The fee history applies the new fee from effectiveFrom.
    member.monthlyFeeHistory = history;

    await member.save();

    // 10. Mark the request as approved.
    feeRequest.status = "approved";
    feeRequest.reviewedBy = owner._id;
    feeRequest.reviewedAt = now;
    feeRequest.reviewNote = reviewNote;
    feeRequest.effectiveFrom = effectiveFrom;

    await feeRequest.save();

    return NextResponse.json({
      message: `Fee-change request approved. The new monthly fee of ₹${feeRequest.requestedFee} will apply from ${effectiveFrom}.`,
      effectiveFrom,
      monthlyFee: feeRequest.requestedFee,
    });
  } catch (error) {
    console.error("Fee-change request review error:", error);

    return NextResponse.json(
      { message: "Unable to review fee-change request." },
      { status: 500 }
    );
  }
}
