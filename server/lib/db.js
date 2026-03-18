import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI=process.env.MONGODB_URI

const dbConnect = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log(`mongodb connect successfully ${MONGODB_URI}`)
    } catch (error) {
        console.log(`mongodb not connect successfully ${error}`)
    }
}

export default dbConnect