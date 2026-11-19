
import { NextRequest, NextResponse } from "next/server";

import { getMemberSession } from "@/lib/member-auth";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

interface CloudinaryUploadResult {
  secure_url: string;
}

function uploadToCloudinary(
  buffer: Buffer
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "kasrat/payment-proofs",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return an image URL."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify member session
    const session = await getMemberSession();

    if (!session?.id) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    // 2. Connect to database
    await connectDB();

    // 3. Verify member account
    const member = await Member.findOne({
      _id: session.id,
      isActive: true,
      approvalStatus: "approved",
    }).select("_id");

    if (!member) {
      return NextResponse.json(
        {
          message: "Your member account is not active or approved.",
        },
        { status: 403 }
      );
    }

    // 4. Read uploaded screenshot
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please select a payment screenshot." },
        { status: 400 }
      );
    }

    // 5. Validate file type
    if (
      !ALLOWED_TYPES.includes(
        file.type as (typeof ALLOWED_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        {
          message: "Only JPG, PNG and WEBP images are allowed.",
        },
        { status: 400 }
      );
    }

    // 6. Validate file size
    if (file.size === 0) {
      return NextResponse.json(
        { message: "The selected image is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message: "Image size must not exceed 5 MB.",
        },
        { status: 400 }
      );
    }

    // 7. Convert image to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 8. Upload screenshot to Cloudinary
    const uploadedImage = await uploadToCloudinary(buffer);

    // 9. Return imageUrl (the frontend must read this exact field)
    return NextResponse.json(
      {
        success: true,
        message: "Payment screenshot uploaded successfully.",
        imageUrl: uploadedImage.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment screenshot upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload screenshot. Please try again.",
      },
      { status: 500 }
    );
  }
}
