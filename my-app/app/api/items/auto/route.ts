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

    // get data from frontend, NOTE the request is coming from the frontend so we get the imageUrl. The frontend uploads the image to Cloudinary first, gets back the URL, and then sends that URL to this API.
    const { name, imageUrl } = await req.json();

    // validate the input from frontend
    if (!name || !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    // ---authorization

    // business logic
        // ML response

        const mlResponse = await fetch("http://127.0.0.1:8000/classify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            imageUrl,
        }),
        });

        // check if the ML request succeeded
        if (!mlResponse.ok) {
        return NextResponse.json(
            {
            success: false,
            message: "Failed to classify image",
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

        const order = await Item.countDocuments({
            collectionId: collection._id,
        })
        
        await Item.create({
            name,
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
