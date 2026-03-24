import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL;

const dbConnect = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB connected successfully`);
    console.log(`   URI: ${MONGODB_URI}`);
  } catch (error) {
    console.log(`❌ MongoDB connection failed: ${error.message}`);
    // Don't exit - let the server continue and handle DB errors gracefully
  }
};

export default dbConnect;
