/**
 * DEV ONLY DEMO SEED SCRIPT
 * ---------------------------------------------------------------------------
 * Seeds a comprehensive 1-day testing dataset for Pure Milk Bar Daily Closing
 * Includes:
 * - Farm Yield logs (Milking morning + evening)
 * - Supplier Milk procurement
 * - POS Orders (Cash, Online, Khata, Split)
 * - Doorstep Delivery Run (COD)
 * - Processing Batch (Dahi batch consuming raw milk & producing Dahi kg)
 * - Operating Expenses (Salaries, Feed, Fuel, Store Misc)
 * - Wastage / Spoilage entry
 * - Customer Khata recovery payment
 * 
 * Usage:
 *   node src/seeds/dailyClosing.demo.seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Animal from '../models/Animal.model.js';
import MilkingYieldLog from '../models/MilkingYieldLog.model.js';
import Supplier from '../models/Supplier.model.js';
import MilkProcurement from '../models/MilkProcurement.model.js';
import Customer from '../models/Customer.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import DeliveryRun from '../models/DeliveryRun.model.js';
import ProcessingBatch from '../models/ProcessingBatch.model.js';
import Expense from '../models/Expense.model.js';
import KhataEntry from '../models/KhataEntry.model.js';
import WastageLog from '../models/WastageLog.model.js';
import DailyClosing from '../models/DailyClosing.model.js';
import { getPktDayRange, getPktTodayString } from '../utils/dateUtils.js';

export const seedDemoDayData = async (targetDateStr = null) => {
  const dateStr = targetDateStr || getPktTodayString();
  const { startOfDay } = getPktDayRange(dateStr);
  const sampleTime = new Date(startOfDay.getTime() + 10 * 3600 * 1000); // 10:00 AM PKT

  console.log(`\n🌱 Seeding Daily Closing demo data for PKT Date: ${dateStr}...`);

  // 1. Ensure Admin User
  let admin = await User.findOne({ role: 'ADMIN' });
  if (!admin) {
    admin = await User.create({
      username: 'admin',
      name: 'System Administrator',
      phone: '03001234567',
      role: 'ADMIN',
      shift: 'ROTATING',
    });
  }

  // 2. Ensure Catalog Products (Milk, Dahi, Lassi)
  let rawMilk = await Product.findOne({ sku: 'PRD-MILK-001' });
  if (!rawMilk) {
    rawMilk = await Product.create({
      sku: 'PRD-MILK-001',
      name: 'Fresh Buffalo Milk',
      category: 'Milk',
      unit: 'LITER',
      price: 220,
      costPrice: 160,
      currentStock: 200,
    });
  }

  let dahiProduct = await Product.findOne({ sku: 'PRD-DAHI-001' });
  if (!dahiProduct) {
    dahiProduct = await Product.create({
      sku: 'PRD-DAHI-001',
      name: 'Fresh Farm Dahi',
      category: 'Dahi',
      unit: 'KG',
      price: 320,
      costPrice: 220,
      currentStock: 50,
    });
  }

  let lassiProduct = await Product.findOne({ sku: 'PRD-LASSI-001' });
  if (!lassiProduct) {
    lassiProduct = await Product.create({
      sku: 'PRD-LASSI-001',
      name: 'Sweet Chilled Lassi',
      category: 'Lassi',
      unit: 'PIECE',
      price: 150,
      costPrice: 90,
      currentStock: 30,
    });
  }

  // 3. Ensure a Sample Customer & Supplier
  let customer = await Customer.findOne({ phone: '03119876543' });
  if (!customer) {
    customer = await Customer.create({
      code: 'CUST-DEMO-01',
      name: 'Tariq Mehmood',
      phone: '03119876543',
      address: 'House 14, Street 5, Model Town',
      currentBalance: 5000,
      creditLimit: 25000,
      status: 'ACTIVE',
    });
  }

  let supplier = await Supplier.findOne({ phone: '03221122334' });
  if (!supplier) {
    supplier = await Supplier.create({
      code: 'SUP-DEMO-01',
      name: 'Chaudhry Dairy Supplier',
      phone: '03221122334',
      villageOrLocation: 'Chak 45, Okara',
      milkType: 'BUFFALO',
      baseRatePerLiter: 150,
      standardFat: 6.0,
      currentPayableBalance: 4000,
      isActive: true,
    });
  }

  let animal = await Animal.findOne({});
  if (!animal) {
    animal = await Animal.create({
      tagNumber: 'TAG-101',
      name: 'Nili-Ravi Buffalo 01',
      species: 'BUFFALO',
      status: 'MILKING',
    });
  }

  // Clean old sample logs for this demo day to ensure repeatable tests
  await MilkingYieldLog.deleteMany({ date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 86400000) } });
  await MilkProcurement.deleteMany({ date: { $gte: startOfDay, $lte: new Date(startOfDay.getTime() + 86400000) } });
  await Order.deleteMany({ receiptNumber: { $regex: /^DEMO-/ } });
  await DeliveryRun.deleteMany({ runCode: { $regex: /^RUN-DEMO-/ } });
  await ProcessingBatch.deleteMany({ batchNumber: { $regex: /^DAH-DEMO-/ } });
  await Expense.deleteMany({ voucherNumber: { $regex: /^EXP-DEMO-/ } });
  await WastageLog.deleteMany({ note: 'Demo Wastage Sample' });
  await KhataEntry.deleteMany({ voucherNumber: { $regex: /^KV-DEMO-/ } });

  // 4. Farm Milking Yield (80 Liters Morning + 40 Liters Evening = 120 L)
  await MilkingYieldLog.create([
    {
      animalId: animal._id,
      date: sampleTime,
      shift: 'MORNING',
      yieldLiters: 80,
      operatorId: admin._id,
      notes: 'Demo Morning Milking',
    },
    {
      animalId: animal._id,
      date: new Date(sampleTime.getTime() + 6 * 3600 * 1000),
      shift: 'EVENING',
      yieldLiters: 40,
      operatorId: admin._id,
      notes: 'Demo Evening Milking',
    },
  ]);
  console.log('  ✓ Seeded Farm Yield: 120 Liters');

  // 5. Supplier Milk Procurement (60 Liters @ Rs.150/L = Rs. 9,000, Paid Rs. 5,000 cash)
  await MilkProcurement.create({
    supplierId: supplier._id,
    batchNumber: `PROC-DEMO-${Date.now().toString().slice(-4)}`,
    date: sampleTime,
    shift: 'MORNING',
    quantityLiters: 60,
    fatPercentage: 6.2,
    lactometerReading: 28,
    snfCalculated: 8.5,
    ratePerLiter: 150,
    totalAmount: 9000,
    amountPaid: 5000,
    balanceAddedToKhata: 4000,
    dockInspectorId: admin._id,
    status: 'ACCEPTED',
  });
  console.log('  ✓ Seeded Supplier Procurement: 60 Liters (Paid Rs. 5,000 cash)');

  // 6. POS Counter Sales (4 different payment orders)
  // Order 1: CASH - 10L Milk (Rs. 2,200)
  await Order.create({
    receiptNumber: `DEMO-REC-01-${Date.now().toString().slice(-3)}`,
    date: sampleTime,
    cashierId: admin._id,
    fulfillmentType: 'COUNTER',
    paymentMethod: 'CASH',
    items: [
      {
        productId: rawMilk._id,
        name: rawMilk.name,
        unit: 'LITER',
        quantity: 10,
        unitPrice: 220,
        subtotal: 2200,
      },
    ],
    subtotal: 2200,
    grandTotal: 2200,
    amountReceived: 2500,
    changeGiven: 300,
  });

  // Order 2: ONLINE (JazzCash) - 2 kg Dahi (Rs. 640) + 5L Milk (Rs. 1,100) = Rs. 1,740
  await Order.create({
    receiptNumber: `DEMO-REC-02-${Date.now().toString().slice(-3)}`,
    date: sampleTime,
    cashierId: admin._id,
    fulfillmentType: 'COUNTER',
    paymentMethod: 'ONLINE',
    items: [
      {
        productId: dahiProduct._id,
        name: dahiProduct.name,
        unit: 'KG',
        quantity: 2,
        unitPrice: 320,
        subtotal: 640,
      },
      {
        productId: rawMilk._id,
        name: rawMilk.name,
        unit: 'LITER',
        quantity: 5,
        unitPrice: 220,
        subtotal: 1100,
      },
    ],
    subtotal: 1740,
    grandTotal: 1740,
    amountReceived: 1740,
    changeGiven: 0,
    onlineTransferMeta: { provider: 'JazzCash', transactionId: 'JC-887711' },
  });

  // Order 3: SPLIT Payment - 10L Milk (Rs. 2,200) -> Rs. 1,000 Cash + Rs. 1,200 Online
  await Order.create({
    receiptNumber: `DEMO-REC-03-${Date.now().toString().slice(-3)}`,
    date: sampleTime,
    cashierId: admin._id,
    fulfillmentType: 'COUNTER',
    paymentMethod: 'SPLIT',
    splitPaymentMeta: {
      cashAmount: 1000,
      onlineAmount: 1200,
      khataAmount: 0,
    },
    items: [
      {
        productId: rawMilk._id,
        name: rawMilk.name,
        unit: 'LITER',
        quantity: 10,
        unitPrice: 220,
        subtotal: 2200,
      },
    ],
    subtotal: 2200,
    grandTotal: 2200,
    amountReceived: 2200,
    changeGiven: 0,
  });

  // Order 4: KHATA Credit Sale - 10L Milk (Rs. 2,200)
  await Order.create({
    receiptNumber: `DEMO-REC-04-${Date.now().toString().slice(-3)}`,
    date: sampleTime,
    cashierId: admin._id,
    customerId: customer._id,
    customerNameSnapshot: customer.name,
    fulfillmentType: 'COUNTER',
    paymentMethod: 'KHATA',
    items: [
      {
        productId: rawMilk._id,
        name: rawMilk.name,
        unit: 'LITER',
        quantity: 10,
        unitPrice: 220,
        subtotal: 2200,
      },
    ],
    subtotal: 2200,
    grandTotal: 2200,
    amountReceived: 0,
    changeGiven: 0,
  });
  console.log('  ✓ Seeded Counter Orders: 35 Liters Milk total (Cash: Rs. 3,200, Online: Rs. 2,940, Khata: Rs. 2,200)');

  // 7. Doorstep Delivery Run (15 Liters Milk, COD Cash Rs. 3,300)
  await DeliveryRun.create({
    runCode: `RUN-DEMO-${Date.now().toString().slice(-4)}`,
    date: sampleTime,
    shift: 'MORNING',
    route: 'Model Town Block B',
    riderId: admin._id,
    riderNameSnapshot: 'Aslam Rider',
    customerId: customer._id,
    customerName: customer.name,
    itemDescription: '15L Raw Milk Doorstep',
    qtyLiters: 15,
    paymentMode: 'COD',
    codAmountToCollect: 3300,
    amountPaid: 3300,
    paymentStatus: 'PAID',
    status: 'DELIVERED',
  });
  console.log('  ✓ Seeded Doorstep Delivery Run: 15 Liters Milk (COD Cash Rs. 3,300)');

  // 8. Processing Batch: 20 Liters Milk used -> Produced 18 kg Fresh Farm Dahi
  await ProcessingBatch.create({
    batchNumber: `DAH-DEMO-${Date.now().toString().slice(-4)}`,
    product: 'Fresh Farm Dahi',
    milkUsedLiters: 20,
    outputQuantity: 18,
    outputUnit: 'kg',
    output: '18 kg',
    fatPercentage: 5.5,
    date: sampleTime,
    status: 'Completed',
    stage: 'pos',
    source: 'Farm Fresh Batch',
    posRate: 'Rs. 320 / kg',
    costEstimate: 3200,
    operatorId: admin._id,
  });
  console.log('  ✓ Seeded Processing Batch: 20 Liters Raw Milk used -> 18 kg Dahi produced');

  // 9. Spoilage / Wastage Log: 2 Liters Raw Milk Spilled
  await WastageLog.create({
    date: sampleTime,
    type: 'MILK',
    productId: rawMilk._id,
    productName: rawMilk.name,
    quantity: 2,
    unit: 'LITER',
    reason: 'SPILLAGE',
    note: 'Demo Wastage Sample',
    recordedBy: admin._id,
  });
  console.log('  ✓ Seeded Wastage: 2 Liters Spillage');

  // 10. Khata Recovery (Customer pays Rs. 4,000 cash against previous debt)
  await KhataEntry.create({
    customerId: customer._id,
    date: sampleTime,
    voucherNumber: `KV-DEMO-${Date.now().toString().slice(-4)}`,
    transactionType: 'CREDIT',
    description: 'Cash payment received against monthly milk bill',
    debitAmount: 0,
    creditAmount: 4000,
    runningBalance: 1000,
    paymentMethod: 'CASH',
    cashierId: admin._id,
  });
  console.log('  ✓ Seeded Khata Recovery: Rs. 4,000 Cash');

  // 11. Daily Operating Expenses (Total: Rs. 3,500)
  await Expense.create([
    {
      voucherNumber: `EXP-DEMO-01-${Date.now().toString().slice(-3)}`,
      date: sampleTime,
      category: 'SALARIES',
      title: 'Daily milking helper wage',
      amountRupees: 1500,
      paymentMethod: 'CASH',
      loggedByUserId: admin._id,
    },
    {
      voucherNumber: `EXP-DEMO-02-${Date.now().toString().slice(-3)}`,
      date: sampleTime,
      category: 'FEED',
      title: 'Fresh green fodder delivery',
      amountRupees: 1200,
      paymentMethod: 'CASH',
      loggedByUserId: admin._id,
    },
    {
      voucherNumber: `EXP-DEMO-03-${Date.now().toString().slice(-3)}`,
      date: sampleTime,
      category: 'TRANSPORT',
      title: 'Delivery motorcycle petrol',
      amountRupees: 500,
      paymentMethod: 'CASH',
      loggedByUserId: admin._id,
    },
    {
      voucherNumber: `EXP-DEMO-04-${Date.now().toString().slice(-3)}`,
      date: sampleTime,
      category: 'MISC',
      title: 'Plastic carry bags & tea',
      amountRupees: 300,
      paymentMethod: 'CASH',
      loggedByUserId: admin._id,
    },
  ]);
  console.log('  ✓ Seeded Expenses: Rs. 3,500 total (Wages: 1500, Feed: 1200, Fuel: 500, Misc: 300)');

  console.log('\n================================================================');
  console.log('📊 HAND-CALCULATED BENCHMARK VERIFICATION:');
  console.log('================================================================');
  console.log('1. MILK MASS BALANCE (Liters):');
  console.log('   Opening Stock:        0.0 L');
  console.log('   Farm Production:    120.0 L');
  console.log('   Supplier Inflow:     60.0 L');
  console.log('   Total Available:    180.0 L');
  console.log('   - Counter POS Sales: 35.0 L (Order 1: 10L, Order 2: 5L, Order 3: 10L, Order 4: 10L)');
  console.log('   - Doorstep Delivery: 15.0 L (Run 1: 15L)');
  console.log('   - Processing Used:   20.0 L (Dahi Batch: 20L)');
  console.log('   - Wastage / Spillage: 2.0 L (Spillage: 2L)');
  console.log('   Total Outflow:       72.0 L');
  console.log('   EXPECTED CLOSING:   108.0 L (180.0 - 72.0 = 108.0 L)');
  console.log('----------------------------------------------------------------');
  console.log('2. MONEY FLOW & COLLECTIONS (PKR):');
  console.log('   Counter Cash:       Rs. 3,200 (Order 1: 2200 + Order 3 split cash: 1000)');
  console.log('   Counter Digital:    Rs. 2,940 (Order 2: 1740 + Order 3 split online: 1200)');
  console.log('   Delivery COD Cash:  Rs. 3,300 (Run 1 COD: 3300)');
  console.log('   Khata Recovered:    Rs. 4,000 (Cash recovery: 4000)');
  console.log('   TOTAL COLLECTED:    Rs. 13,440');
  console.log('   Credit Given:       Rs. 2,200 (Order 4 Khata: 2200)');
  console.log('----------------------------------------------------------------');
  console.log('3. DRAWER CASH RECONCILIATION (PKR):');
  console.log('   Opening Cash:       Rs. 0');
  console.log('   Cash Inflows:       Rs. 10,500 (Counter 3200 + COD 3300 + Khata 4000)');
  console.log('   Cash Outflows:      Rs. 8,500 (Expenses 3500 + Supplier Paid 5000)');
  console.log('   EXPECTED IN DRAWER: Rs. 2,000 (10500 - 8500 = Rs. 2,000)');
  console.log('================================================================\n');
};

// Allow standalone execution via `node src/seeds/dailyClosing.demo.seed.js`
if (process.argv[1] && process.argv[1].includes('dailyClosing.demo.seed.js')) {
  connectDB()
    .then(async () => {
      await seedDemoDayData();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Demo seed error:', err);
      process.exit(1);
    });
}
