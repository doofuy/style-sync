import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import Item from "@/models/Item";
import { auth } from "@clerk/nextjs/server";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  req: NextRequest,
  { params }: Props
) {
  try {
    await connectDB();

    // NOTE: the frontend already has the _id. (id in from the params.)
    const { id } = await params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const collection = await Collection.findOne({
      _id: id,
      userId,
    });

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          message: "Collection not found or access denied",
        },
        {
          status: 403,
        }
      );
    }

    // Delete all items belonging to this collection
    await Item.deleteMany({
      collectionId: id,
    });

    // Delete the collection
    await collection.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: "Collection deleted successfully",
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
        message: "Failed to delete collection",
      },
      {
        status: 500,
      }
    );
  }
}