import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "Neither MONGODB_URI nor MONGO_URI is defined in environment variables.",
      );
    }

    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const mongooseOptions = {
        maxPoolSize: 25, // Maintain up to 25 socket connections
        minPoolSize: 5,  // Keep at least 5 connections open to eliminate cold handshake latency
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 5000,
        family: 4, // Force IPv4 to prevent Windows IPv6 DNS lookup delays
      };

      cached.promise = mongoose.connect(mongoUri, mongooseOptions).then((mongooseInstance) => {
        console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`MongoDB connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
