import mongoose, { Document, Model, Schema } from "mongoose";

export interface IItem extends Document {
  name: string;
  imageUrl: string;
  collectionId: mongoose.Types.ObjectId;
  order: number;
}

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
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