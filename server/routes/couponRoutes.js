import express from "express"
import { applyCoupon, createCoupon, deleteCoupon, getCoupons } from "../controller/couponController.js"



const router = express.Router()

router.get('/',getCoupons)
router.post('/',createCoupon)
router.post('/apply',applyCoupon)
router.delete('/:id',deleteCoupon)

export default router