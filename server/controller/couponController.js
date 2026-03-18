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

// 🔄 Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
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

// ✅ Validate coupon for a specific product (for checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code, productId, quantity } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.active) {
      return res.status(400).json({ message: "Invalid coupon" });
    }

    // expiry check
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    // quantity check
    if (coupon.quantity !== null && coupon.usedCount >= coupon.quantity) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // check if coupon applies to this product
    const appliesToAll = !coupon.products || coupon.products.length === 0;
    const appliesToProduct = coupon.products.some(
      p => p.toString() === productId
    );

    if (!appliesToAll && !appliesToProduct) {
      return res.status(400).json({ message: "Coupon not applicable for this product" });
    }

    // get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // calculate discount for this product
    const itemTotal = product.price * quantity;
    const discount = (itemTotal * coupon.discountPercent) / 100;

    res.json({
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      },
      productId,
      quantity,
      originalPrice: itemTotal,
      discount,
      finalPrice: itemTotal - discount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 💰 Use coupon after successful checkout
export const useCoupon = async (couponId) => {
  try {
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }
  } catch (err) {
    console.error("Error updating coupon usage:", err);
  }
};

// 📥 Apply multiple coupons (for cart calculation)
export const applyCoupons = async (req, res) => {
  try {
    const { coupons } = req.body; // Array of { code, productId, quantity }

    if (!coupons || !Array.isArray(coupons)) {
      return res.status(400).json({ message: "Invalid coupons data" });
    }

    let totalAmount = 0;
    let totalDiscount = 0;
    const couponResults = [];

    // First, calculate total without coupons
    const productIds = coupons.map(c => c.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    for (const couponData of coupons) {
      const { code, productId, quantity } = couponData;

      const coupon = await Coupon.findOne({ code: code.toUpperCase() });

      if (!coupon || !coupon.active) {
        return res.status(400).json({ message: `Invalid coupon: ${code}` });
      }

      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        return res.status(400).json({ message: `Coupon expired: ${code}` });
      }

      if (coupon.quantity !== null && coupon.usedCount >= coupon.quantity) {
        return res.status(400).json({ message: `Coupon limit reached: ${code}` });
      }

      const appliesToAll = !coupon.products || coupon.products.length === 0;
      const appliesToProduct = coupon.products.some(
        p => p.toString() === productId
      );

      if (!appliesToAll && !appliesToProduct) {
        return res.status(400).json({ message: `Coupon not applicable for product: ${code}` });
      }

      const product = dbProducts.find(p => p._id.toString() === productId);
      if (!product) continue;

      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      const discount = (itemTotal * coupon.discountPercent) / 100;
      totalDiscount += discount;

      couponResults.push({
        couponId: coupon._id,
        code: coupon.code,
        productId,
        quantity,
        originalPrice: itemTotal,
        discount,
        finalPrice: itemTotal - discount,
      });
    }

    const finalAmount = totalAmount - totalDiscount;

    res.json({
      totalAmount,
      discount: totalDiscount,
      finalAmount,
      coupons: couponResults,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Legacy function kept for backward compatibility
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

    // quantity check
    if (coupon.quantity !== null && coupon.usedCount >= coupon.quantity) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
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
      const appliesToAll = !coupon.products || coupon.products.length === 0;
      const appliesToProduct = coupon.products.some(
        p => p.toString() === item.productId
      );

      if (appliesToAll || appliesToProduct) {
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
