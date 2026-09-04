import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { auth } from "@clerk/nextjs/server";
import Item from "@/models/Item";
import Collection from "@/models/Collection";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // authorization
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

    // Business logic
    const { occasion } = await req.json();
    const collections = await Collection.find({
      userId,
    }); // we find all the collections with userId, since we only want to query the logged in user.
    const collectionIds = collections.map((c) => c._id);
    const collectionMap = new Map(
      collections.map((c) => [c._id.toString(), c.name]),
    );

    const items = await Item.find({
      collectionId: {
        $in: collectionIds,
      },
    });

    const wardrobe = items.map((item) => ({
      name: item.name,
      imageUrl: item.imageUrl,
      articleType: item.articleType || collectionMap.get(item.collectionId.toString()) || "clothing",
    }));

    const mlResponse = await fetch("http://127.0.0.1:8000/recommend-outfit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        occasion,
        wardrobe,
      }),
    });

    if (!mlResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "ML recommendation failed",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(await mlResponse.json());
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to recommend outfit",
      },
      {
        status: 500,
      },
    );
  }
}