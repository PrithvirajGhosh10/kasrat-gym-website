
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request: NextRequest) {
  try {
    // Check login session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    // Only owners can create staff accounts
    if (session.role !== "owner") {
      return NextResponse.json(
        { message: "Access denied. Owner only." },
        { status: 403 }
      );
    }

    await connectDB();

    // Verify that the owner account is active
    const owner = await Admin.findOne({
      _id: session.id,
      role: "owner",
      isActive: true,
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner account is not active." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Check whether email already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 12);

    const staff = await Admin.create({
      name,
      email,
      passwordHash,
      role: "staff",
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Staff account created successfully.",
        staff: {
          id: staff._id.toString(),
          name: staff.name,
          email: staff.email,
          role: staff.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create staff error:", error);

    return NextResponse.json(
      { message: "Unable to create staff account." },
      { status: 500 }
    );
  }
}
