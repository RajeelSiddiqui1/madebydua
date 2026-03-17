import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { checkout, getUserOrders, updateOrderStatus, getAllOrders } from "../controller/orderController.js";

const router = express.Router();

router.use(protect);
router.post("/checkout", checkout);
router.get("/", getUserOrders);
router.get("/all", isAdmin, getAllOrders);
router.put("/status/:orderId", isAdmin, updateOrderStatus);

export default router;