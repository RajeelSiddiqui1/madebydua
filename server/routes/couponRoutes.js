import express from "express"
import { applyCoupon, createCoupon, deleteCoupon, getCoupons, validateCoupon, applyCoupons, updateCoupon } from "../controller/couponController.js"

const router = express.Router()

router.get('/',getCoupons)
router.post('/',createCoupon)
router.put('/:id',updateCoupon)
router.post('/apply',applyCoupon)
router.post('/validate',validateCoupon)
router.post('/apply-multiple',applyCoupons)
router.delete('/:id',deleteCoupon)

export default router
