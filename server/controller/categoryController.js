import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";

// ➕ Create Category with image
export const createCategory = async (req, res) => {
  try {
    const { name, slug, active } = req.body;
    let image = "";

    if (req.file) {
      image = req.file.filename;
    }

    const category = await Category.create({ name, slug, active, image });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get All Categories + product count
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const data = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category: cat._id,
        });

        return {
          ...cat._doc,
          productCount,
        };
      })
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Category + override image
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // override image if new uploaded
    if (req.file) {
      // delete old image
      if (category.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "uploads/category",
          category.image
        );
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      category.image = req.file.filename;
    }

    // update other fields
    Object.assign(category, req.body);
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Category + image
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // delete image
    if (category.image) {
      const imagePath = path.join(process.cwd(), "uploads/category", category.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};