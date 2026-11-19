
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import Admin from "@/models/Admin";
import Payment from "@/models/Payment";
import PaymentRequest from "@/models/PaymentRequest";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 1. Verify owner session
    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Only the owner can review payment requests." },
        { status: 403 }
      );
    }

    await connectDB();

    // 2. Verify active owner
    const owner = await Admin.findOne({
      _id: session.id,
      role: "owner",
      isActive: true,
    }).select("_id");

    if (!owner) {
      return NextResponse.json(
        { message: "Owner account not found or inactive." },
        { status: 403 }
      );
    }

    // 3. Validate request ID
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid payment request ID." },
        { status: 400 }
      );
    }

    // 4. Read review details
    const body = await request.json();

    const action = body.action;

    const reviewNote =
      typeof body.reviewNote === "string"
        ? body.reviewNote.trim()
        : "";

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Action must be approve or reject." },
        { status: 400 }
      );
    }

    if (action === "reject" && !reviewNote) {
      return NextResponse.json(
        { message: "Please provide a reason for rejection." },
        { status: 400 }
      );
    }

    await mongoose.connection.transaction(async (dbSession) => {
      // 5. Find pending request
      const paymentRequest = await PaymentRequest.findOne({
        _id: id,
        status: "pending",
      }).session(dbSession);

      if (!paymentRequest) {
        throw new Error("PAYMENT_REQUEST_NOT_PENDING");
      }

      if (action === "approve") {
        // 6. Create completed payment
        // Online member payments are recorded as UPI
        const paymentMethod =
          paymentRequest.paymentMethod === "online"
            ? "upi"
            : "cash";

        await Payment.create(
          [
            {
              member: paymentRequest.member,
              amount: paymentRequest.amount,
              feeMonth: paymentRequest.feeMonth,
              paymentDate: new Date(),
              paymentMethod,
              note:
                paymentRequest.paymentMethod === "online"
                  ? `Online payment. Transaction ID: ${paymentRequest.transactionId || "Not provided"}`
                  : "Cash payment verified by owner.",
              recordedBy: owner._id,
            },
          ],
          { session: dbSession }
        );

        // 7. Mark request as approved
        paymentRequest.status = "approved";
        paymentRequest.reviewedBy = owner._id;
        paymentRequest.reviewedAt = new Date();
        paymentRequest.reviewNote = reviewNote;

      } else {
        // 8. Mark request as rejected
        paymentRequest.status = "rejected";
        paymentRequest.reviewedBy = owner._id;
        paymentRequest.reviewedAt = new Date();
        paymentRequest.reviewNote = reviewNote;
      }

      await paymentRequest.save({ session: dbSession });
    });

    return NextResponse.json({
      message:
        action === "approve"
          ? "Payment request approved. Payment recorded successfully."
          : "Payment request rejected successfully.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PAYMENT_REQUEST_NOT_PENDING"
    ) {
      return NextResponse.json(
        {
          message:
            "Payment request not found or has already been reviewed.",
        },
        { status: 409 }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            "A payment for this billing month has already been recorded.",
        },
        { status: 409 }
      );
    }

    console.error("Payment review error:", error);

    return NextResponse.json(
      { message: "Unable to review payment request." },
      { status: 500 }
    );
  }
}
