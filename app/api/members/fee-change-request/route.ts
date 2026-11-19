
import { connection, NextResponse } from "next/server";

import { getMemberSession } from "@/lib/member-auth";
import { connectDB } from "@/lib/mongodb";

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

// GET: Retrieve the member's latest fee-change request.
export async function GET() {
  try {
    await connection();

    const session = await getMemberSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    await connectDB();

    const member = await Member.findOne({
      _id: session.id,
      isActive: true,
      approvalStatus: "approved",
    }).select("_id");

    if (!member) {
      return NextResponse.json(
        { message: "Active approved member account not found." },
        { status: 403 }
      );
    }

    const feeRequest = await FeeChangeRequest.findOne({
      member: member._id,
    })
      .sort({ createdAt: -1 })
      .select(
        "currentFee requestedFee reason status effectiveFrom reviewNote reviewedAt createdAt"
      )
      .lean();

    return NextResponse.json({
      request: feeRequest || null,
    });
  } catch (error) {
    console.error("Get member fee-change request error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve fee-change request." },
      { status: 500 }
    );
  }
}

// POST: Submit a new fee-change request.
export async function POST(request: Request) {
  try {
    await connection();

    const session = await getMemberSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in to continue." },
        { status: 401 }
      );
    }

    await connectDB();

    const member = await Member.findOne({
      _id: session.id,
      isActive: true,
      approvalStatus: "approved",
    });

    if (!member) {
      return NextResponse.json(
        { message: "Active approved member account not found." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const requestedFee = Number(body.requestedFee);

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    // Validate requested fee.
    if (
      !Number.isFinite(requestedFee) ||
      !Number.isInteger(requestedFee) ||
      requestedFee < 1 ||
      requestedFee > 1000000
    ) {
      return NextResponse.json(
        { message: "Enter a valid monthly fee." },
        { status: 400 }
      );
    }

    // Validate reason.
    if (reason.length > 500) {
      return NextResponse.json(
        { message: "Reason cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    // Calculate the member's currently applicable fee.
    const currentIndiaMonth = getIndiaFeeMonth();

    const currentApplicableFee = getFeeForMonth(
      currentIndiaMonth,
      member.monthlyFee,
      member.monthlyFeeHistory
    );

    // Do not allow a request for the already applicable fee.
    if (requestedFee === currentApplicableFee) {
      return NextResponse.json(
        {
          message:
            "The requested fee is already your current applicable fee.",
        },
        { status: 400 }
      );
    }

    // Prevent multiple pending requests.
    const existingRequest = await FeeChangeRequest.findOne({
      member: member._id,
      status: "pending",
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          message:
            "You already have a pending fee-change request. Wait for the owner's decision.",
        },
        { status: 409 }
      );
    }

    // Save the currently applicable fee for owner verification.
    await FeeChangeRequest.create({
      member: member._id,
      currentFee: currentApplicableFee,
      requestedFee,
      reason,
      status: "pending",
    });

    return NextResponse.json(
      {
        message:
          "Your fee-change request has been submitted successfully. It is waiting for owner approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "You already have a pending fee-change request." },
        { status: 409 }
      );
    }

    console.error("Member fee-change request error:", error);

    return NextResponse.json(
      { message: "Unable to submit your fee-change request." },
      { status: 500 }
    );
  }
}
