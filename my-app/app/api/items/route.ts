import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function POST(req: NextRequest) {
  try {
    // connect to the database
    await connectDB();

    // get data from frontend
    const { name, imageUrl, collectionId } = await req.json();

    // validate the input from frontend
    if (!name || !collectionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // business logic
    const count = await Item.countDocuments({
      collectionId,
    });

    const item = await Item.create({
      name,
      imageUrl,
      collectionId,
      order: count,
    });

    // success response
    return NextResponse.json(
      {
        success: true,
        item,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create item",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const collectionId = searchParams.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Collection ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const items = await Item.find({
      collectionId,
    }).sort({
      order: 1,
    });

    return NextResponse.json(
      {
        success: true,
        items,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch items",
      },
      {
        status: 500,
      }
    );
  }
}