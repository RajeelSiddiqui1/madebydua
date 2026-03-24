import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import authRoute from "./routes/authRoutes.js"
import categoryRoute from "./routes/categoryRoutes.js"
import productRoute from "./routes/productRoutes.js"
import couponRoute from "./routes/couponRoutes.js"
import ratingRoute from "./routes/ratingRoutes.js"
import wishListRoute from "./routes/wishListRoutes.js"
import cartRoute from "./routes/cartRoutes.js"
import orderRoute from "./routes/orderRoutes.js"
import dbConnect from "./lib/db.js"

dotenv.config()

const PORT = process.env.PORT || 5007
const app = express()

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())

await dbConnect()

app.use(cors({
  origin: ["http://localhost:5173","http://153.92.209.177:5180"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit CORS headers for additional assurance
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoute)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)
app.use("/api/coupon", couponRoute)
app.use("/api/rating", ratingRoute)
app.use("/api/wishlist", wishListRoute)
app.use("/api/cart", cartRoute)
app.use("/api/order", orderRoute)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
