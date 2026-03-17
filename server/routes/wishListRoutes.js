import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} from "../controller/wishlistController.js";

const router = express.Router();

// All routes are protected and only for users
router.post("/add/:id", protect, addToWishlist);
router.delete("/remove/:id", protect, removeFromWishlist);
router.get("/", protect, getUserWishlist);

export default router;