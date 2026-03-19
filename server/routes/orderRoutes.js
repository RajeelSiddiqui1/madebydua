import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { checkout, getUserOrders, updateOrderStatus, getAllOrders, deletePaymentReceipt } from "../controller/orderController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/checkout", upload("payments").single('paymentReceipt'), checkout);
router.get("/", getUserOrders);
router.get("/all", isAdmin, getAllOrders);
router.put("/status/:orderId", isAdmin, updateOrderStatus);
router.delete("/receipt/:orderId", isAdmin, deletePaymentReceipt);

export default router;
