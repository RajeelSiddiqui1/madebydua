import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";

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
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // remove old image if new uploaded
    if (req.file && product.image) {
      const oldImagePath = path.join(
        process.cwd(),
        "uploads/product",
        product.image
      );
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);

      product.image = req.file.filename;
    }

    // update other fields
    Object.assign(product, req.body);

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

