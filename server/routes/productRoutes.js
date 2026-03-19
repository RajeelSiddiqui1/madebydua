import express from "express"
import { createProduct, deleteProduct, deleteProductImage, getFeaturedProducts, getProductById, getProducts, updateProduct } from "../controller/productController.js"
import upload from "../middleware/uploadMiddleware.js"


const router = express.Router()

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/:id', getProductById)
router.post('/', upload("product", 10).array('images', 10), createProduct)
router.put('/:id', upload("product", 10).array('images', 10), updateProduct)
router.delete('/:id', deleteProduct)
router.delete('/:id/image', deleteProductImage)

export default router
