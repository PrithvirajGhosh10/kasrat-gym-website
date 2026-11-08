
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.OWNER_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        { success: false, message: "Owner setup is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      name,
      email,
      password,
      setupSecret: submittedSecret,
    } = body;

    // Verify setup secret
    if (
      typeof submittedSecret !== "string" ||
      submittedSecret !== setupSecret
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid setup secret." },
        { status: 403 }
      );
    }

    // Validate input
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 12
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid name, email and password of at least 12 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if Owner already exists
    const existingOwner = await Admin.findOne({ role: "owner" });

    if (existingOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "The Gym Owner account already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Owner account
    await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "owner",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gym Owner account created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Owner setup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not create the Gym Owner account.",
      },
      { status: 500 }
    );
  }
}