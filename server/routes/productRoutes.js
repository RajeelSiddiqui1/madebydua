import express from "express"
import { createProduct, deleteProduct, getFeaturedProducts, getProductById, getProducts, updateProduct } from "../controller/productController.js"
import upload from "../middleware/uploadMiddleware.js"


const router = express.Router()

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:id', getProductById)
router.post('/', upload("product").single('image'), createProduct)
router.put('/:id', upload("product").single('image'), updateProduct)
router.delete('/:id', deleteProduct)

export default router