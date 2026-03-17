// models/productModel.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    shortDesc: {
      type: String,
    },

    longDesc: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    comparePrice: {
      type: Number,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },
    wishList: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ], ratings: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    image: {
      type: String,
      default: "",
    }
  },
  { timestamps: true }
);

export default models.Product || model("Product", productSchema);