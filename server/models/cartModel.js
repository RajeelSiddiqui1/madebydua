import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    guestId: { type: String, required: false },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default models.Cart || model("Cart", cartSchema);