import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

import { auth } from "@clerk/nextjs/server";
import Collection from "@/models/Collection";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    await connectDB();

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
        },
      );
    }

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Item not found",
        },
        {
          status: 404,
        },
      );
    }

    const collection = await Collection.findOne({
      _id: item?.collectionId,
      userId,
    });

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          message: "you not authorized nigga!!!",
        },
        { status: 403 },
      );
    }

    await Item.deleteOne({
      _id: id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item deleted successfully",
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
        message: "Failed to delete item",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    await connectDB();

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
        },
      );
    }

    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "Item not found",
        },
        {
          status: 404,
        },
      );
    }

    const collection = await Collection.findOne({
      _id: item.collectionId,
      userId,
    });

    if (!collection) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    const { name, imageUrl } = await req.json();

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedItem = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      {
        success: true,
        item: updatedItem,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error updating item:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update item",
      },
      {
        status: 500,
      },
    );
  }
}
