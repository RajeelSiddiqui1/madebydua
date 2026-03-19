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

// ➕ Create Product with multiple images
export const createProduct = async (req, res) => {
  try {
    const data = req.body;

    // Handle single image (backward compatibility)
    if (req.file) {
      data.image = req.file.filename;
    }

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      const imageFilenames = req.files.map(file => file.filename);
      data.images = imageFilenames;
      // Set first image as main image if no main image set
      if (!data.image && imageFilenames.length > 0) {
        data.image = imageFilenames[0];
      }
    }

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Product with optional image override
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Override single image if new uploaded (backward compatibility)
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(process.cwd(), "uploads/product", product.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      product.image = req.file.filename;
    }

    // Handle multiple images upload
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      
      // If there are new images, add them to existing images
      if (product.images && product.images.length > 0) {
        product.images = [...product.images, ...newImages];
      } else {
        product.images = newImages;
      }
      
      // Update main image to first image if not set
      if (!product.image && newImages.length > 0) {
        product.image = newImages[0];
      }
    }

    // Handle images array update from form data
    if (req.body.images) {
      try {
        const parsedImages = JSON.parse(req.body.images);
        if (Array.isArray(parsedImages)) {
          product.images = parsedImages;
        }
      } catch (e) {
        // If not JSON, treat as single value
      }
    }

    // Handle setting main image
    if (req.body.mainImage) {
      product.image = req.body.mainImage;
    }

    // Update other fields manually to avoid overwriting image
    const { name, shortDesc, longDesc, price, comparePrice, category, isFeatured, active, quantity } = req.body;
    if (name) product.name = name;
    if (shortDesc) product.shortDesc = shortDesc;
    if (longDesc) product.longDesc = longDesc;
    if (price) product.price = price;
    if (comparePrice) product.comparePrice = comparePrice;
    if (category) product.category = category;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (active !== undefined) product.active = active;
    if (quantity !== undefined) product.quantity = quantity;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a specific image from product
export const deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { imageName } = req.body;
    if (!imageName) return res.status(400).json({ message: "Image name required" });

    // Remove from images array
    if (product.images && product.images.includes(imageName)) {
      product.images = product.images.filter(img => img !== imageName);
      
      // If deleted image was main image, set new main image
      if (product.image === imageName) {
        product.image = product.images.length > 0 ? product.images[0] : "";
      }
      
      // Delete file from filesystem
      const imagePath = path.join(process.cwd(), "uploads/product", imageName);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      
      await product.save();
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Product + images
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Remove single image
    if (product.image) {
      const imagePath = path.join(process.cwd(), "uploads/product", product.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    // Remove multiple images
    if (product.images && product.images.length > 0) {
      product.images.forEach(imageName => {
        const imagePath = path.join(process.cwd(), "uploads/product", imageName);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      });
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
