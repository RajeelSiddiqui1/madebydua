import express from "express";
import { protect, isAdmin, optionalAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from "../controller/testimonialController.js";

const router = express.Router();

router.route("/")
  .get(optionalAuth, getTestimonials)
  .post(protect, isAdmin, upload("testimonial", 1).single("image"), createTestimonial);

router.route("/:id")
  .put(protect, isAdmin, upload("testimonial", 1).single("image"), updateTestimonial)
  .delete(protect, isAdmin, deleteTestimonial);

export default router;
