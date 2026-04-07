import express from "express";
import { protect, isAdmin, optionalAuth } from "../middleware/authMiddleware.js";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from "../controller/testimonialController.js";

const router = express.Router();

router.route("/")
  .get(optionalAuth, getTestimonials)
  .post(protect, isAdmin, createTestimonial);

router.route("/:id")
  .put(protect, isAdmin, updateTestimonial)
  .delete(protect, isAdmin, deleteTestimonial);

export default router;
