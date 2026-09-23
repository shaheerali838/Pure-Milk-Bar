import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Animal from '../models/Animal.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Customer from '../models/Customer.model.js';
import DailyClosing from '../models/DailyClosing.model.js';
import DeliveryRun from '../models/DeliveryRun.model.js';
import Expense from '../models/Expense.model.js';
import KhataEntry from '../models/KhataEntry.model.js';
import MilkProcurement from '../models/MilkProcurement.model.js';
import MilkingYieldLog from '../models/MilkingYieldLog.model.js';
import Order from '../models/Order.model.js';
import ProcessingBatch from '../models/ProcessingBatch.model.js';
import Product from '../models/Product.model.js';
import Staff from '../models/Staff.model.js';
import Supplier from '../models/Supplier.model.js';
import User from '../models/User.model.js';
import VehicleFuelLog from '../models/VehicleFuelLog.model.js';
import { seedAdmin } from '../seeds/admin.seed.js';

const resetAllData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Clearing all collections in database...');
    await Promise.all([
      Animal.deleteMany({}),
      AuditLog.deleteMany({}),
      Customer.deleteMany({}),
      DailyClosing.deleteMany({}),
      DeliveryRun.deleteMany({}),
      Expense.deleteMany({}),
      KhataEntry.deleteMany({}),
      MilkProcurement.deleteMany({}),
      MilkingYieldLog.deleteMany({}),
      Order.deleteMany({}),
      ProcessingBatch.deleteMany({}),
      Product.deleteMany({}),
      Staff.deleteMany({}),
      Supplier.deleteMany({}),
      User.deleteMany({}),
      VehicleFuelLog.deleteMany({}),
    ]);

    console.log('All transactional and entity records purged successfully.');

    console.log('Seeding fresh Admin account...');
    const admin = await seedAdmin();
    console.log(`Admin account created: ${admin.email} (Username: ${admin.username})`);

    console.log('Database reset complete. All data is now clean and empty for fresh testing.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Database reset failed:', err);
    process.exit(1);
  }
};

resetAllData();
