import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reviewText: { type: String, required: true },
    rating: { type: Number, default: 5 },
    image: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
