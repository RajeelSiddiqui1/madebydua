import Product from "../models/productModel.js";

// ➕ Add or update rating
export const rateProduct = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can rate products" });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if user has already rated
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment || existingRating.comment;
    } else {
      // Add new rating
      product.ratings.push({
        user: req.user._id,
        rating,
        comment: comment || "",
      });
    }

    await product.save();
    res.json({ message: "Product rated successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔥 Get all ratings of a product
export const getProductRatings = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "ratings.user",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      ratings: product.ratings,
      averageRating:
        product.ratings.reduce((acc, r) => acc + r.rating, 0) /
        (product.ratings.length || 1),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};