import 'dotenv/config';
import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
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

    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    if (!cached.promise || mongoose.connection.readyState === 0) {
      cached.promise = mongoose
        .connect(mongoUri, { serverSelectionTimeoutMS: 15000, family: 4 })
        .then(async (mongooseInstance) => {
          console.log(`MongoDB connected: ${mongooseInstance.connection.host}`);
          try {
            const db = mongooseInstance.connection.db;
            if (db) {
              const ordersCollections = await db.listCollections({ name: 'orders' }).toArray();
              if (ordersCollections.length > 0) {
                const posCollections = await db.listCollections({ name: 'pos' }).toArray();
                if (posCollections.length === 0) {
                  await db.collection('orders').rename('pos');
                  console.log("Successfully renamed collection 'orders' to 'pos'.");
                } else {
                  const docs = await db.collection('orders').find({}).toArray();
                  if (docs.length > 0) {
                    for (const doc of docs) {
                      await db.collection('pos').replaceOne({ _id: doc._id }, doc, { upsert: true });
                    }
                    await db.collection('orders').drop();
                    console.log(`Migrated ${docs.length} docs from 'orders' to 'pos' and dropped 'orders'.`);
                  }
                }
              }
            }
          } catch (migError) {
            console.error(`Auto collection migration note: ${migError.message}`);
          }
          return mongooseInstance;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn("Please check your internet connection or MongoDB Atlas IP Whitelist (allow 0.0.0.0/0 or your current IP).");
    throw error;
  }
};

export default connectDB;
