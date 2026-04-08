import express from "express";
import { registerUser, loginUser, logoutUser, getAllUsers, forgotPassword, resendOtp, resetPassword } from "../controller/authController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/users', protect, isAdmin, getAllUsers);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);

export default router;
