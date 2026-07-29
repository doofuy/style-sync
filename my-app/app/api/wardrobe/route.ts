import Collection from "@/models/Collection";
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connectDB();
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

    const collections = await Collection.aggregate([
      {
        $match: {
          userId,
        },
      },

      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "collectionId",
          as: "items",
        },
      },

      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                id: "$$item._id",
                name: "$$item.name",
                imageUrl: "$$item.imageUrl",
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      collections,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch the fooking Wardrobe BITCH",
      },
      {
        status: 500,
      },
    );
  }
}
