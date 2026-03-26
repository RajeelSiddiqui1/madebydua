import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";
import { sendOrderNotification, sendStatusUpdateNotification } from "../utils/email.js";
import User from "../models/userModel.js";

// ➕ Checkout / Create Order
export const checkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, coupons, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    if (!cart || cart.products.length === 0) return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = cart.products.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Calculate coupon discounts
    let discountAmount = 0;
    const usedCoupons = [];

    if (coupons && Array.isArray(coupons)) {
      for (const couponData of coupons) {
        const { code, productId } = couponData;
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (coupon && coupon.active) {
          // Check if coupon is valid for this product
          const appliesToAll = !coupon.products || coupon.products.length === 0;
          const appliesToProduct = coupon.products.some(
            p => p.toString() === productId
          );

          if (appliesToAll || appliesToProduct) {
            // Find the cart item for this product
            const cartItem = cart.products.find(
              item => item.product._id.toString() === productId
            );

            if (cartItem) {
              const itemTotal = cartItem.product.price * cartItem.quantity;
              const discount = (itemTotal * coupon.discountPercent) / 100;
              discountAmount += discount;

              usedCoupons.push({
                coupon: coupon._id,
                product: productId,
                discount: discount,
              });

              // Decrease coupon quantity
              if (coupon.quantity !== null) {
                coupon.usedCount += 1;
                await coupon.save();
              }
            }
          }
        }
      }
    }

    // Decrease product quantities
    for (const item of cart.products) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.quantity = (product.quantity || 0) - item.quantity;
        if (product.quantity < 0) product.quantity = 0;
        await product.save();
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // Handle payment receipt upload
    let paymentReceipt = "";
    if (req.file) {
      paymentReceipt = req.file.filename;
    }

    const order = await Order.create({
      user: userId,
      products: cart.products.map((p) => ({ product: p.product._id, quantity: p.quantity })),
      totalAmount: finalAmount,
      shippingAddress,
      coupons: usedCoupons,
      discountAmount: discountAmount,
      paymentMethod: paymentMethod || "cash_on_delivery",
      paymentReceipt: paymentReceipt,
      // If payment method is not cash on delivery, mark as pending payment verification
      paymentStatus: paymentMethod && paymentMethod !== "cash_on_delivery" ? "pending" : "pending",
    });

    // Send email notifications (non-blocking)
    const orderForEmail = {
      ...order.toObject(),
      products: cart.products.map(p => ({
        product: p.product,
        quantity: p.quantity
      }))
    };
    
    sendOrderNotification(orderForEmail, req.user);

    // Clear cart
    cart.products = [];
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name price image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📊 Get User Stats (total orders, delivered orders, etc.)
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all orders for this user
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    
    // Calculate stats
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      shippedOrders,
      cancelledOrders,
      totalSpent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Update Order Status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus, paymentRejectionReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (paymentRejectionReason) {
      order.paymentRejectionReason = paymentRejectionReason;
    }
    await order.save();

    // Send status update notification
    const populatedOrder = await Order.findById(orderId).populate("user", "firstName lastName email");
    if (populatedOrder && populatedOrder.user) {
      sendStatusUpdateNotification(populatedOrder, populatedOrder.user);
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.product", "name price image category")
      .populate("user", "firstName lastName email")
      .populate("coupons.coupon", "code discountPercent")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete payment receipt
export const deletePaymentReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentReceipt) {
      const receiptPath = path.join(process.cwd(), "uploads/payments", order.paymentReceipt);
      if (fs.existsSync(receiptPath)) {
        fs.unlinkSync(receiptPath);
      }
      order.paymentReceipt = "";
      order.paymentStatus = "pending";
      await order.save();
    }

    res.json({ message: "Payment receipt deleted", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
