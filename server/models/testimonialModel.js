import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reviewText: { type: String, required: true },
    rating: { type: Number, default: 5 },
    image: { type: String },
    active: { type: Boolean, default: false },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    userEmail: { type: String },
    source: { 
      type: String, 
      enum: ['admin', 'website'], 
      default: 'admin' 
    }
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
