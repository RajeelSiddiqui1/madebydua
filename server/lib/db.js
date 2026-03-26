import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI_LOCAL;

const dbConnect = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB connected successfully`);
    console.log(`   URI: ${MONGODB_URI}`);
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`);
  }
};

export default dbConnect;
