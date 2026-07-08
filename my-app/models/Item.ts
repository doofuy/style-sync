import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItem extends Document {
  collectionId: mongoose.Types.ObjectId;
  name: string;
  imageUrl: string;
  order: number;
}

const ItemSchema = new Schema<IItem>(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Item: Model<IItem> =
  mongoose.models.Item ||
  mongoose.model<IItem>("Item", ItemSchema);

export default Item;