import cloudinary from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Upload API is running!",
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          message: "No image provided",
        },
        {
          status: 400,
        },
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "stylesync",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    const imageUrl = (result as any).secure_url;

    return NextResponse.json(
      {
        success: true,
        imageUrl,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Image upload failed",
      },
      {
        status: 500,
      },
    );
  }
}