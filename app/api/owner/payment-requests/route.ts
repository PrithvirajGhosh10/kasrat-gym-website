
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import Admin from "@/models/Admin";
import PaymentRequest from "@/models/PaymentRequest";

export async function GET() {
  try {
    // 1. Verify owner session
    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Only the owner can view payment requests." },
        { status: 403 }
      );
    }

    await connectDB();

    // 2. Verify owner account
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

    // 3. Fetch pending payment requests
    const requests = await PaymentRequest.find({
      status: "pending",
    })
      .populate("member", "name phone email")
      .sort({ createdAt: -1 })
      .lean();

    // 4. Format response to match frontend interface
    const formattedRequests = requests.map((item) => {
      const member = item.member as unknown as {
        _id: { toString(): string };
        name: string;
        phone: string;
        email?: string;
      } | null;

      return {
        _id: item._id.toString(),

        memberName: member?.name || "Unknown Member",
        phone: member?.phone || "",

        amount: item.amount,
        feeMonth: item.feeMonth,
        paymentMethod: item.paymentMethod,

        transactionId: item.transactionId || "",
        proofImageUrl: item.proofImageUrl || "",

        createdAt: item.createdAt,
      };
    });

    return NextResponse.json({
      requests: formattedRequests,
      total: formattedRequests.length,
    });
  } catch (error) {
    console.error("Owner payment requests error:", error);

    return NextResponse.json(
      { message: "Unable to load payment requests." },
      { status: 500 }
    );
  }
}
