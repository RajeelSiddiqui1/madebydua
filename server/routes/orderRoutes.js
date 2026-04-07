import express from "express";
import { protect, isAdmin, optionalAuth } from "../middleware/authMiddleware.js";
import { checkout, getUserOrders, updateOrderStatus, getAllOrders, deletePaymentReceipt, getUserStats } from "../controller/orderController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, upload("payments").single('paymentReceipt'), checkout);
router.get("/", protect, getUserOrders);
router.get("/stats", protect, getUserStats);
router.get("/all", protect, isAdmin, getAllOrders);
router.put("/status/:orderId", protect, isAdmin, updateOrderStatus);
router.delete("/receipt/:orderId", protect, isAdmin, deletePaymentReceipt);

export default router;
