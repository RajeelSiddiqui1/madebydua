import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addToCart, updateCartItem, removeCartItem, getUserCart } from "../controller/cartController.js";

const router = express.Router();

router.use(protect); // All routes protected
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeCartItem);
router.get("/", getUserCart);

export default router;