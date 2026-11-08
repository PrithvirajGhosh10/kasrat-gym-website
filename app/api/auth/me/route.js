
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import Admin from "@/models/Admin";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    await connectDB();

    const admin = await Admin.findById(session.id).select(
      "name email role isActive"
    );

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { message: "Account is inactive or unavailable." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);

    return NextResponse.json(
      { message: "Unable to verify session." },
      { status: 500 }
    );
  }
}
