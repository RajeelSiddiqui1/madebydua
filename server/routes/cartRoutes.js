import express from "express";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { addToCart, updateCartItem, removeCartItem, getUserCart } from "../controller/cartController.js";

const router = express.Router();

router.use(optionalAuth); // Allow guests
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeCartItem);
router.get("/", getUserCart);

export default router;