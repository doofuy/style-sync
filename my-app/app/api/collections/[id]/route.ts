import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import Item from "@/models/Item";

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

    const { id } = await params;

    // Delete all items belonging to this collection
    await Item.deleteMany({
      collectionId: id,
    });

    // Delete the collection
    const deletedCollection =
      await Collection.findByIdAndDelete(id);

    if (!deletedCollection) {
      return NextResponse.json(
        {
          success: false,
          message: "Collection not found",
        },
        {
          status: 404,
        }
      );
    }

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