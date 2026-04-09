import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const dbConnect = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB connected successfully`);
    console.log(`   URI: ${MONGODB_URI}`);
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`);
  }
};

export default dbConnect;
