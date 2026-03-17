import express from "express"
import { registerUser, loginUser, logoutUser, getAllUsers } from "../controller/authController.js"
import { protect, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/users', protect, isAdmin, getAllUsers)

export default router;
