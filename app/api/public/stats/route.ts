
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";

export async function GET() {
  try {
    await connectDB();

    const activeMembers = await Member.countDocuments({
      isActive: true,
    });

    return NextResponse.json(
      { activeMembers },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching active members:", error);

    return NextResponse.json(
      { message: "Unable to fetch member statistics." },
      { status: 500 }
    );
  }
}
