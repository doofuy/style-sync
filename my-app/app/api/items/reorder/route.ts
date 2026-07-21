import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";

export async function PATCH(req: NextRequest) {
  try {
    // it is considered to connect to the database after we validate resource, since it avoids touching the database if the request is obviously invalid. Still to make the structure consistent we do it at the beginning, also if we connect to the dB once we do not have to do it again
    await connectDB();

    const { items } = await req.json();
    // validating the resource we get from the call/front end
    if (
      !Array.isArray(items) ||
      items.some((item) => !item.id || typeof item.order !== "number")
    ) {
      return NextResponse.json(
        { message: "Invalid items data" },
        { status: 400 },
      );
    }

    const operations = items.map((item) => {
      return {
        updateOne: {
          filter: {
            _id: item.id,
          },
          update: {
            order: item.order,
          },
        },
      };
    });

    await Item.bulkWrite(operations);

    return NextResponse.json(
      { message: "Items rerodered successfully, 💋" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Failed to reorder Items" },
      { status: 500 },
    );
  }
}
