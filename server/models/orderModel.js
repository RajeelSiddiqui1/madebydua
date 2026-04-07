import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    guestId: { type: String, required: false },
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
    
    // Payment details
    paymentMethod: { 
      type: String, 
      enum: ["cash_on_delivery", "easy paisa", "bank_transfer"],
      default: "cash_on_delivery" 
    },
    paymentReceipt: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    paymentRejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Order || model("Order", orderSchema);
