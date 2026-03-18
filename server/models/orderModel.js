import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: { type: String, required: true },

    coupons: [
      {
        coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        discount: { type: Number, default: 0 },
      },
    ],

    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Order || model("Order", orderSchema);