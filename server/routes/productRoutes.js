import express from "express"
import { createProduct, deleteProduct, getFeaturedProducts, getProducts, updateProduct } from "../controller/productController.js"
import upload from "../middleware/uploadMiddleware.js"


const router = express.Router()

router.get('/',getProducts)
router.get('/featured',getFeaturedProducts)
router.post('/',upload.single('image'),createProduct)
router.put('/:id',upload.single('image'),updateProduct)
router.delete('/:id',deleteProduct)

export default router