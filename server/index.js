import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import authRoute from "./routes/authRoutes.js"
import categoryRoute from "./routes/categoryRoutes.js"
import productRoute from "./routes/productRoutes.js"
import couponRoute from "./routes/couponRoutes.js"
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
  origin: "http://localhost:5173",
  credentials: true 
}));

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoute)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)
app.use("/api/coupon", couponRoute)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
