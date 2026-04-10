import express from "express";
import { protect, isAdmin, optionalAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getUserTestimonials,
  toggleTestimonialStatus
} from "../controller/testimonialController.js";

const router = express.Router();

router.route("/")
  .get(optionalAuth, getTestimonials)
  .post(protect, upload("testimonial", 1).single("image"), (req, res) => {
    if(req.user.role === 'admin') {
      return createAdminTestimonial(req, res);
    }
    return createTestimonial(req, res);
  });

router.route("/user")
  .get(protect, getUserTestimonials);

router.route("/:id")
  .put(protect, isAdmin, upload("testimonial", 1).single("image"), updateTestimonial)
  .delete(protect, isAdmin, deleteTestimonial);

router.route("/:id/toggle")
  .put(protect, isAdmin, toggleTestimonialStatus);

export default router;
