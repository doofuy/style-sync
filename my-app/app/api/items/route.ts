import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

// authorization
import { auth } from "@clerk/nextjs/server";
import Collection from "@/models/Collection";

export async function POST(req: NextRequest) {
  try {
    // connect to the database
    await connectDB();

    // ---authorization
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

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
        },
      );
    }

    // ---authorization
    const collection = await Collection.findOne({
      _id: collectionId,
      userId,
    });

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          message: "Collection not found",
        },
        {
          status: 404,
        },
      );
    }

    // business logic
    const articleType = collection.name;

    const count = await Item.countDocuments({
      collectionId,
    });

    const item = await Item.create({
      name,
      imageUrl,
      collectionId,
      articleType,
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
      },
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
      },
    );
  }
}

// not in use, using aggregation pipeline to fetch all the items
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
        },
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
      },
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
      },
    );
  }
}
