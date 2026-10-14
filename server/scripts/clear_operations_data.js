import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing from server/.env');
  process.exit(1);
}

async function runCleanup() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully to MongoDB.');

    const db = mongoose.connection.db;

    // 1. Orders (POS Sales)
    const ordersRes = await db.collection('orders').deleteMany({});
    console.log(`✓ Deleted ${ordersRes.deletedCount} POS Orders / Sales records.`);

    // 2. Processing Batches (Dahi)
    const batchesRes = await db.collection('processingbatches').deleteMany({});
    console.log(`✓ Deleted ${batchesRes.deletedCount} Dahi Processing Batches.`);

    // 3. Farm Milking Logs
    const milkingRes = await db.collection('milkingyieldlogs').deleteMany({});
    console.log(`✓ Deleted ${milkingRes.deletedCount} Farm Milking Yield Logs.`);

    // 4. Animal embedded intake history
    const animalHistRes = await db.collection('animals').updateMany({}, { $set: { intakeHistory: [] } });
    console.log(`✓ Cleared intake history from ${animalHistRes.modifiedCount} animal documents.`);

    // 5. Supplier Intake (Milk Procurement)
    const procurementRes = await db.collection('milkprocurements').deleteMany({});
    console.log(`✓ Deleted ${procurementRes.deletedCount} Supplier Milk Procurement records.`);

    // 6. Daily Closing & Wastage logs (so old closings don't reference deleted orders)
    const closingRes = await db.collection('dailyclosings').deleteMany({});
    console.log(`✓ Deleted ${closingRes.deletedCount} Daily Closing records.`);

    const wastageRes = await db.collection('wastagelogs').deleteMany({});
    console.log(`✓ Deleted ${wastageRes.deletedCount} Wastage Logs.`);

    // Verification of preserved master collections
    const animalsCount = await db.collection('animals').countDocuments();
    const suppliersCount = await db.collection('suppliers').countDocuments();
    const productsCount = await db.collection('products').countDocuments();
    const staffCount = await db.collection('staffs').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    const customersCount = await db.collection('customers').countDocuments();

    console.log('\n--- Master Data Safely Preserved ---');
    console.log(`Animals: ${animalsCount}`);
    console.log(`Suppliers: ${suppliersCount}`);
    console.log(`Products: ${productsCount}`);
    console.log(`Staff: ${staffCount}`);
    console.log(`Users: ${usersCount}`);
    console.log(`Customers: ${customersCount}`);
    console.log('------------------------------------');

    console.log('\nOperation completed successfully!');
  } catch (err) {
    console.error('Error during database cleanup:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runCleanup();
