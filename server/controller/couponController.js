// controllers/couponController.js
import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";

// ➕ Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get All Coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("products", "name price");
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const applyCoupon = async (req, res) => {
  try {
    const { code, products } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.active) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    // expiry check
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    // 👉 ek hi baar products fetch karo
    const productIds = products.map(p => p.productId);

    const dbProducts = await Product.find({
      _id: { $in: productIds }
    });

    let totalAmount = 0;
    let totalQuantity = 0;
    let applicableAmount = 0;

    for (let item of products) {
      const product = dbProducts.find(
        p => p._id.toString() === item.productId
      );

      if (!product) continue;

      const itemTotal = product.price * item.quantity;

      totalAmount += itemTotal;
      totalQuantity += item.quantity;

      // ✅ check coupon applicable products
      if (
        coupon.products.some(
          p => p.toString() === item.productId
        )
      ) {
        applicableAmount += itemTotal;
      }
    }

    // min quantity check
    if (totalQuantity < coupon.minQuantity) {
      return res.status(400).json({
        message: `Minimum ${coupon.minQuantity} items required`,
      });
    }

    // discount
    const discount =
      (applicableAmount * coupon.discountPercent) / 100;

    const finalAmount = totalAmount - discount;

    res.json({
      totalAmount,
      discount,
      finalAmount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};