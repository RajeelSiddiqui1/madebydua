import express from "express"
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controller/categoryController.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.get('/',getCategories)
router.post('/',upload("category").single('image'),createCategory)
router.put('/:id',upload("category").single('image'),updateCategory)
router.delete('/:id',deleteCategory)

export default router