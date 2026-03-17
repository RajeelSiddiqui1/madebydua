

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { rateProduct, getProductRatings } from "../controller/ratingController.js";

const router = express.Router();

router.post("/:id", protect, rateProduct); // Add/update rating
router.get("/:id", protect, getProductRatings); // Get ratings

export default router;