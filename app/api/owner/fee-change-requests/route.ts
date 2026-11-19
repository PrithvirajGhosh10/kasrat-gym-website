
import { connection, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";

import Admin from "@/models/Admin";
import FeeChangeRequest from "@/models/FeeChangeRequest";

export async function GET() {
  try {
    await connection();

    const session = await getSession();

    if (!session || session.role !== "owner") {
      return NextResponse.json(
        { message: "Access denied. Owner login required." },
        { status: 401 }
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
        { message: "Your owner account is not active." },
        { status: 403 }
      );
    }

    const requests = await FeeChangeRequest.find({
      status: "pending",
    })
      .populate({
        path: "member",
        select: "name phone email slNo monthlyFee",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formattedRequests = requests.map((item) => {
      const member = item.member as unknown as {
        _id: { toString(): string };
        name: string;
        phone: string;
        email?: string;
        slNo?: number;
        monthlyFee: number;
      } | null;

      return {
        _id: item._id.toString(),
        member: member
          ? {
              _id: member._id.toString(),
              name: member.name,
              phone: member.phone,
              email: member.email || "",
              slNo: member.slNo ?? null,
              monthlyFee: member.monthlyFee,
            }
          : null,
        currentFee: item.currentFee,
        requestedFee: item.requestedFee,
        reason: item.reason || "",
        status: item.status,
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json({
      requests: formattedRequests,
    });
  } catch (error) {
    console.error("Owner fee-change requests error:", error);

    return NextResponse.json(
      { message: "Unable to load fee-change requests." },
      { status: 500 }
    );
  }
}
