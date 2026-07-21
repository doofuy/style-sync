import { auth } from "@clerk/nextjs/server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name } = await req.json();
    const { userId } = await auth();

    if (!name ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const count = await Collection.countDocuments({ userId });

    const collection = await Collection.create({
      name,
      userId,
      order: count,
    });

    return NextResponse.json(
      {
        success: true,
        collection,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create collection",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // const userId = searchParams.get("userId");
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 },
      );
    }

    const collections = await Collection.find({ userId }).sort({
      order: 1,
    });

    return NextResponse.json(
      {
        success: true,
        collections,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch collections",
      },
      { status: 500 },
    );
  }
}
