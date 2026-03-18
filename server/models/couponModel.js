// models/couponModel.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    discountPercent: {
      type: Number,
      required: true,
    },

    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    minQuantity: {
      type: Number,
      default: 1,
    },

    expiryDate: {
      type: Date,
    },

    active: {
      type: Boolean,
      default: true,
    },

    quantity: {
      type: Number,
      default: null, // null means unlimited
    },

    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default models.Coupon || model("Coupon", couponSchema);