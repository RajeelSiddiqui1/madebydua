import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";

// 📥 Get Single Product by ID (with ratings and wishlist)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate({
        path: "ratings",
        populate: { path: "user", select: "firstName lastName" },
      })
      .populate("wishList", "firstName lastName");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Create Product with image
export const createProduct = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.image = req.file.filename;
    }

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Product (override image if new)
// ✏️ Update Product with optional image override
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Override image if new uploaded
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(process.cwd(), "uploads/product", product.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = req.file.filename;
    }

    // Update other fields manually to avoid overwriting image
    const { name, shortDesc, longDesc, price, comparePrice, category, isFeatured, active } = req.body;
    if (name) product.name = name;
    if (shortDesc) product.shortDesc = shortDesc;
    if (longDesc) product.longDesc = longDesc;
    if (price) product.price = price;
    if (comparePrice) product.comparePrice = comparePrice;
    if (category) product.category = category;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (active !== undefined) product.active = active;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Product + image
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // remove image
    if (product.image) {
      const imagePath = path.join(process.cwd(), "uploads/product", product.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// 📥 Get All Products (normal)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug");

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ⭐ Get Featured Products
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate("category", "name slug");

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

