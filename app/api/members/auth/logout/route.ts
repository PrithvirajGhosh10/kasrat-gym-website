
import { NextResponse } from "next/server";
import { deleteMemberSession } from "@/lib/member-auth";

export async function POST() {
  try {
    await deleteMemberSession();

    return NextResponse.json({
      message: "Member logged out successfully.",
    });
  } catch (error) {
    console.error("Member logout error:", error);

    return NextResponse.json(
      { message: "Unable to log out." },
      { status: 500 }
    );
  }
}
