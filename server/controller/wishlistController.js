import Product from "../models/productModel.js";

// ➕ Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    // Ensure only users can add
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can add to wishlist" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Add user to wishlist array if not already present
    if (!product.wishList.includes(req.user._id)) {
      product.wishList.push(req.user._id);
      await product.save();
    }

    res.json({ message: "Product added to wishlist", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➖ Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can remove from wishlist" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove user from wishlist array
    product.wishList = product.wishList.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
    await product.save();

    res.json({ message: "Product removed from wishlist", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Get all wishlist items of logged-in user
export const getUserWishlist = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users have a wishlist" });
    }

    const products = await Product.find({ wishList: req.user._id })
      .populate("category", "name slug");

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};