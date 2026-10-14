import 'dotenv/config';
import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let isListeningEvents = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error(
        "Neither MONGODB_URI nor MONGO_URI is defined in environment variables.",
      );
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    if (mongoose.connection.readyState === 2 && cached.promise) {
      return await cached.promise;
    }

    if (!isListeningEvents) {
      isListeningEvents = true;
      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB connection lost. Clearing cache to allow auto-reconnect...');
        cached.conn = null;
        cached.promise = null;
      });
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB error:', err.message);
        cached.conn = null;
        cached.promise = null;
      });
    }

    cached.promise = mongoose
      .connect(mongoUri, { serverSelectionTimeoutMS: 10000, family: 4 })
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

            // Auto-migrate legacy collections ('Dahi processingbatches' and 'processingbatches') into 'dahiprocessingbatches'
            const legacyNames = ['Dahi processingbatches', 'processingbatches'];
            for (const legacyName of legacyNames) {
              const legacyColls = await db.listCollections({ name: legacyName }).toArray();
              if (legacyColls.length > 0) {
                const legacyDocs = await db.collection(legacyName).find({}).toArray();
                if (legacyDocs.length > 0) {
                  for (const doc of legacyDocs) {
                    await db.collection('dahiprocessingbatches').replaceOne({ _id: doc._id }, doc, { upsert: true });
                  }
                  console.log(`Migrated ${legacyDocs.length} docs from '${legacyName}' to 'dahiprocessingbatches'.`);
                }
                await db.collection(legacyName).drop();
                console.log(`Successfully dropped legacy collection '${legacyName}'.`);
              }
            }

            // Auto-provision standard catalog products if products collection is empty
            const prodCount = await db.collection('products').countDocuments();
            if (prodCount === 0) {
              const defaultProducts = [
                {
                  sku: 'PRD-BUFF-001',
                  name: 'Fresh Buffalo Milk',
                  category: 'Milk',
                  unit: 'LITER',
                  price: 220,
                  costPrice: 160,
                  currentStock: 0,
                  minimumAlertStock: 10,
                  isAvailableForPos: true,
                  isAvailableForDelivery: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  sku: 'PRD-COW-001',
                  name: 'Fresh Cow Milk',
                  category: 'Milk',
                  unit: 'LITER',
                  price: 200,
                  costPrice: 150,
                  currentStock: 0,
                  minimumAlertStock: 10,
                  isAvailableForPos: true,
                  isAvailableForDelivery: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                {
                  sku: 'PRD-DAHI-001',
                  name: 'Fresh Farm Dahi',
                  category: 'Dahi',
                  unit: 'KG',
                  price: 320,
                  costPrice: 220,
                  currentStock: 0,
                  minimumAlertStock: 5,
                  isAvailableForPos: true,
                  isAvailableForDelivery: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ];
              await db.collection('products').insertMany(defaultProducts);
              console.log('[Catalog Seed] Provisioned standard default products: Fresh Buffalo Milk, Fresh Cow Milk, Fresh Farm Dahi.');
            }
          }
        } catch (migError) {
          console.error(`Auto collection migration note: ${migError.message}`);
        }
        return mongooseInstance;
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};


export default connectDB;
