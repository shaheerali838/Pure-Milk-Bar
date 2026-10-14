import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.model.js';

export const defaultCatalogProducts = [
  {
    sku: 'PRD-BUFF-001',
    name: 'Buffalo Milk',
    category: 'Milk',
    unit: 'LITER',
    price: 220,
    costPrice: 160,
    currentStock: 0,
    minimumAlertStock: 10,
    isAvailableForPos: true,
    isAvailableForDelivery: true,
  },
  {
    sku: 'PRD-COW-001',
    name: 'Cow Milk',
    category: 'Milk',
    unit: 'LITER',
    price: 200,
    costPrice: 140,
    currentStock: 0,
    minimumAlertStock: 10,
    isAvailableForPos: true,
    isAvailableForDelivery: true,
  },
  {
    sku: 'PRD-DAHI-001',
    name: 'Fresh Dahi',
    category: 'Dahi',
    unit: 'KG',
    price: 320,
    costPrice: 220,
    currentStock: 0,
    minimumAlertStock: 5,
    isAvailableForPos: true,
    isAvailableForDelivery: true,
  },
  {
    sku: 'PRD-SDAHI-001',
    name: 'Sweet Dahi',
    category: 'Dahi',
    unit: 'KG',
    price: 360,
    costPrice: 240,
    currentStock: 0,
    minimumAlertStock: 5,
    isAvailableForPos: true,
    isAvailableForDelivery: true,
  },
  {
    sku: 'PRD-LASSI-001',
    name: 'Sweet Chilled Lassi',
    category: 'Lassi',
    unit: 'PIECE',
    price: 150,
    costPrice: 90,
    currentStock: 0,
    minimumAlertStock: 5,
    isAvailableForPos: true,
    isAvailableForDelivery: true,
  },
];

export const seedProducts = async (force = false) => {
  try {
    for (const prod of defaultCatalogProducts) {
      const exists = await Product.findOne({
        $or: [{ sku: prod.sku }, { name: prod.name }],
      });

      if (!exists) {
        await Product.create(prod);
        console.log(`[Product Seed] Created product: ${prod.name} (${prod.sku})`);
      } else if (force) {
        await Product.findByIdAndUpdate(exists._id, prod);
        console.log(`[Product Seed] Updated product: ${prod.name} (${prod.sku})`);
      }
    }

    console.log('[Product Seed] Product catalog seeded successfully.');
    return true;
  } catch (error) {
    console.error('[Product Seed Error]:', error.message);
    throw error;
  }
};

// Allow standalone execution via `node src/seeds/product.seed.js [--force]`
if (process.argv[1] && process.argv[1].includes('product.seed.js')) {
  const isForce = process.argv.includes('--force');
  connectDB().then(async () => {
    await seedProducts(isForce);
    await mongoose.disconnect();
    process.exit(0);
  });
}
