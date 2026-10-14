import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';

async function cleanupTestData() {
  console.log('Connecting to database...');
  await connectDB();
  const db = mongoose.connection.db;

  const testCusts = await db.collection('customers').find({
    $or: [
      { code: { $regex: '^TEST-', $options: 'i' } },
      { name: { $regex: 'Test Customer', $options: 'i' } },
    ],
  }).toArray();

  const testCustIds = testCusts.map((c) => c._id);
  console.log(`Found ${testCustIds.length} test customers to remove.`);

  if (testCustIds.length > 0) {
    const khataRes = await db.collection('khataentries').deleteMany({
      customerId: { $in: testCustIds },
    });
    console.log(`Deleted ${khataRes.deletedCount} test khata entries.`);

    const posRes = await db.collection('pos').deleteMany({
      $or: [
        { customerId: { $in: testCustIds } },
        { customerNameSnapshot: { $regex: 'Test Customer', $options: 'i' } },
      ],
    });
    console.log(`Deleted ${posRes.deletedCount} test POS orders.`);

    const delivRes = await db.collection('deliveryruns').deleteMany({
      customerId: { $in: testCustIds },
    });
    console.log(`Deleted ${delivRes.deletedCount} test delivery runs.`);

    const custRes = await db.collection('customers').deleteMany({
      _id: { $in: testCustIds },
    });
    console.log(`Deleted ${custRes.deletedCount} test customers.`);
  }

  const remainingCusts = await db.collection('customers').find({}).toArray();
  console.log('=== REMAINING ACTUAL CUSTOMERS IN DATABASE ===');
  remainingCusts.forEach((c) => {
    console.log(`- Code: ${c.code} | Name: ${c.name} | Phone: ${c.phone} | Due Balance: Rs. ${c.currentBalance || 0}`);
  });

  const remainingStaff = await db.collection('staffs').find({}).toArray();
  console.log('=== ACTUAL STAFF MEMBERS IN DATABASE ===');
  remainingStaff.forEach((s) => {
    console.log(`- Staff Code: ${s.staffCode} | Name: ${s.name} | Role: ${s.role} | Status: ${s.status} | Mobile: ${s.mobile}`);
  });

  await mongoose.disconnect();
  console.log('Data cleanup completed successfully.');
}

cleanupTestData();
