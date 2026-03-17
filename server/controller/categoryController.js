// controllers/categoryController.js
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

// ➕ Create
export const createCategory = async (req, res) => {
  try {
    const { name, slug, active } = req.body;

    const category = await Category.create({ name, slug, active });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get All + product count
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

// ✏️ Update
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete
export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};