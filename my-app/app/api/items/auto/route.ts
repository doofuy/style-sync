import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

// authorization
import { auth } from "@clerk/nextjs/server";
import Collection from "@/models/Collection";
import Item from "@/models/Item";

export async function POST(req: NextRequest) {
  try {
    // connect to the database
    await connectDB();

    // ---authorization
    const { userId } = await auth();
    console.log(userId);
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
    const { name, imageUrl } = await req.json();

    // validate input from frontend
    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "imageUrl is required",
        },
        {
          status: 400,
        },
      );
    }

    // ---authorization

    // business logic
    // ML response
    const mlServerUrl = process.env.ML_SERVER_URL
      ? `${process.env.ML_SERVER_URL}/classify`
      : "http://127.0.0.1:8000/classify";

    let mlResponse;
    try {
      mlResponse = await fetch(mlServerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
        }),
      });
    } catch (err) {
      console.error("ML Server Connection Error:", err);
      return NextResponse.json(
        {
          success: false,
          message: "ML classification server is unreachable. Please ensure the Python ML server is running.",
        },
        {
          status: 503,
        },
      );
    }

    // check if the ML request succeeded
    if (!mlResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to classify image. ML server returned an error.",
        },
        {
          status: 500,
        },
      );
    }

        const mlData = await mlResponse.json();
        const articleType = mlData.articleType;
        // console.log(articleType);

        let collection = await Collection.findOne({
        userId,
        name: articleType
        });

        if(!collection){
            collection = await Collection.create({
                userId, 
                name: articleType,
            });
        }

        const itemName = name?.trim() || articleType || "Clothing Item";
        const order = await Item.countDocuments({
          collectionId: collection._id,
        });
        
        await Item.create({
            name: itemName,
            imageUrl,
            collectionId: collection._id,
            articleType,
            order
        });

    // success response
    return NextResponse.json(
      {
        success: true,
        articleType,
        collection: collection.name
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
