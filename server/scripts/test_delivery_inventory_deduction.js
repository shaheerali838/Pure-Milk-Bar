import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Product from '../src/models/Product.model.js';
import DeliveryRun from '../src/models/DeliveryRun.model.js';
import Customer from '../src/models/Customer.model.js';
import deliveryService from '../src/modules/deliveries/services/delivery.service.js';

async function runTests() {
  console.log('=== STARTING AUTOMATED TESTS FOR INVENTORY STOCK DEDUCTION ON DELIVERIES ===');
  await connectDB();

  // 1. Fetch existing products and record initial stock
  let cowMilk = await Product.findOne({ name: /cow/i });
  let buffMilk = await Product.findOne({ name: /buffalo/i });
  let dahi = await Product.findOne({ $or: [{ name: /dahi/i }, { category: /dahi/i }] });

  console.log('Initial Products in DB:');
  console.log(`- Cow Milk (${cowMilk?.sku}): ${cowMilk?.currentStock} ${cowMilk?.unit}`);
  console.log(`- Buffalo Milk (${buffMilk?.sku}): ${buffMilk?.currentStock} ${buffMilk?.unit}`);
  console.log(`- Dahi (${dahi?.sku}): ${dahi?.currentStock} ${dahi?.unit}`);

  // Set benchmark test stocks to 100 each for deterministic test verification
  const INITIAL_COW = 50;
  const INITIAL_BUFF = 50;
  const INITIAL_DAHI = 50;

  await Product.findByIdAndUpdate(cowMilk._id, { currentStock: INITIAL_COW });
  await Product.findByIdAndUpdate(buffMilk._id, { currentStock: INITIAL_BUFF });
  await Product.findByIdAndUpdate(dahi._id, { currentStock: INITIAL_DAHI });

  console.log(`\n[Setup] Reset stocks to: Cow=${INITIAL_COW}L, Buffalo=${INITIAL_BUFF}L, Dahi=${INITIAL_DAHI}kg`);

  // --- TEST 1: Pending delivery does NOT deduct stock ---
  console.log('\n--- TEST 1: Pending delivery does NOT deduct stock ---');
  const pendingRun = await deliveryService.createDeliveryRun({
    customerName: 'Test Pending Customer',
    shift: 'MORNING',
    status: 'PENDING',
    source: 'SCHEDULED_ROUTE',
    items: [
      { name: 'Fresh Milk Cow', quantity: 5, unit: 'L', unitPrice: 200, subtotal: 1000 }
    ],
    qtyLiters: 5,
  });

  let pCow = await Product.findById(cowMilk._id);
  if (pCow.currentStock === INITIAL_COW) {
    console.log('✓ PASS: Pending delivery did not deduct stock. Cow stock is still', pCow.currentStock);
  } else {
    throw new Error(`FAIL: Pending delivery unexpectedly altered stock to ${pCow.currentStock}`);
  }

  // --- TEST 2: Complete Cow Milk delivery -> deducts 2 Liters ---
  console.log('\n--- TEST 2: Complete Cow Milk delivery -> deducts 2 Liters ---');
  const cowDelivery = await deliveryService.createDeliveryRun({
    customerName: 'Test Cow Customer',
    shift: 'MORNING',
    status: 'PENDING',
    source: 'SCHEDULED_ROUTE',
    items: [
      { name: 'Fresh Milk Cow', quantity: 2, unit: 'L', unitPrice: 200, subtotal: 400 }
    ],
    qtyLiters: 2,
  });

  await deliveryService.updateDeliveryStatus(cowDelivery.deliveryRun._id, {
    status: 'DELIVERED',
    amountPaid: 400,
    paymentMode: 'CASH',
  });

  pCow = await Product.findById(cowMilk._id);
  const pBuff = await Product.findById(buffMilk._id);
  const pDahi = await Product.findById(dahi._id);

  if (pCow.currentStock === INITIAL_COW - 2 && pBuff.currentStock === INITIAL_BUFF && pDahi.currentStock === INITIAL_DAHI) {
    console.log(`✓ PASS: Cow milk decreased from ${INITIAL_COW} to ${pCow.currentStock}. Buffalo and Dahi remained untouched (${pBuff.currentStock}, ${pDahi.currentStock})`);
  } else {
    throw new Error(`FAIL: Cow delivery stock deduction incorrect. Cow: ${pCow.currentStock}, Buff: ${pBuff.currentStock}, Dahi: ${pDahi.currentStock}`);
  }

  // --- TEST 3: Idempotency (repeating completion request does NOT deduct twice) ---
  console.log('\n--- TEST 3: Idempotency Check ---');
  await deliveryService.updateDeliveryStatus(cowDelivery.deliveryRun._id, {
    status: 'DELIVERED',
    amountPaid: 400,
    notes: 'Retried delivery confirmation',
  });

  pCow = await Product.findById(cowMilk._id);
  if (pCow.currentStock === INITIAL_COW - 2) {
    console.log('✓ PASS: Repeated delivery status update did not deduct stock again. Stock is still', pCow.currentStock);
  } else {
    throw new Error(`FAIL: Idempotency violated! Stock was deducted a second time: ${pCow.currentStock}`);
  }

  // --- TEST 4: Complete Buffalo Milk delivery -> deducts 3 Liters ---
  console.log('\n--- TEST 4: Complete Buffalo Milk delivery -> deducts 3 Liters ---');
  const buffDelivery = await deliveryService.createDeliveryRun({
    customerName: 'Test Buffalo Customer',
    shift: 'MORNING',
    status: 'PENDING',
    source: 'SCHEDULED_ROUTE',
    items: [
      { name: 'Buffalo Milk', quantity: 3, unit: 'L', unitPrice: 220, subtotal: 660 }
    ],
    qtyLiters: 3,
  });

  await deliveryService.updateDeliveryStatus(buffDelivery.deliveryRun._id, {
    status: 'DELIVERED',
    amountPaid: 660,
    paymentMode: 'CASH',
  });

  const pBuffAfter = await Product.findById(buffMilk._id);
  if (pBuffAfter.currentStock === INITIAL_BUFF - 3) {
    console.log(`✓ PASS: Buffalo milk decreased from ${INITIAL_BUFF} to ${pBuffAfter.currentStock}`);
  } else {
    throw new Error(`FAIL: Buffalo milk delivery stock deduction incorrect: ${pBuffAfter.currentStock}`);
  }

  // --- TEST 5: Complete Dahi delivery -> deducts 1.5 KG ---
  console.log('\n--- TEST 5: Complete Dahi delivery -> deducts 1.5 KG ---');
  const dahiDelivery = await deliveryService.createDeliveryRun({
    customerName: 'Test Dahi Customer',
    shift: 'MORNING',
    status: 'PENDING',
    source: 'SCHEDULED_ROUTE',
    items: [
      { name: 'Dahi', quantity: 1.5, unit: 'KG', unitPrice: 240, subtotal: 360 }
    ],
    qtyLiters: 1.5,
  });

  await deliveryService.updateDeliveryStatus(dahiDelivery.deliveryRun._id, {
    status: 'DELIVERED',
    amountPaid: 360,
    paymentMode: 'CASH',
  });

  const pDahiAfter = await Product.findById(dahi._id);
  if (pDahiAfter.currentStock === INITIAL_DAHI - 1.5) {
    console.log(`✓ PASS: Dahi stock decreased from ${INITIAL_DAHI} to ${pDahiAfter.currentStock} KG`);
  } else {
    throw new Error(`FAIL: Dahi delivery stock deduction incorrect: ${pDahiAfter.currentStock}`);
  }

  // --- TEST 6: Multi-item delivery in single run (Cow 4L + Buff 2L + Dahi 3KG) ---
  console.log('\n--- TEST 6: Multi-item delivery (Cow 4L + Buff 2L + Dahi 3KG) ---');
  const stockBeforeMultiCow = (await Product.findById(cowMilk._id)).currentStock;
  const stockBeforeMultiBuff = (await Product.findById(buffMilk._id)).currentStock;
  const stockBeforeMultiDahi = (await Product.findById(dahi._id)).currentStock;

  const multiDelivery = await deliveryService.createDeliveryRun({
    customerName: 'Test Multi Item Customer',
    shift: 'EVENING',
    status: 'PENDING',
    source: 'SCHEDULED_ROUTE',
    items: [
      { name: 'Fresh Milk Cow', quantity: 4, unit: 'L', unitPrice: 200, subtotal: 800 },
      { name: 'Buffalo Milk', quantity: 2, unit: 'L', unitPrice: 220, subtotal: 440 },
      { name: 'Dahi', quantity: 3, unit: 'KG', unitPrice: 240, subtotal: 720 },
    ],
  });

  await deliveryService.updateDeliveryStatus(multiDelivery.deliveryRun._id, {
    status: 'DELIVERED',
    amountPaid: 1960,
    paymentMode: 'CASH',
  });

  const stockAfterMultiCow = (await Product.findById(cowMilk._id)).currentStock;
  const stockAfterMultiBuff = (await Product.findById(buffMilk._id)).currentStock;
  const stockAfterMultiDahi = (await Product.findById(dahi._id)).currentStock;

  if (
    stockAfterMultiCow === Number((stockBeforeMultiCow - 4).toFixed(2)) &&
    stockAfterMultiBuff === Number((stockBeforeMultiBuff - 2).toFixed(2)) &&
    stockAfterMultiDahi === Number((stockBeforeMultiDahi - 3).toFixed(2))
  ) {
    console.log(`✓ PASS: All 3 items deducted correctly in single delivery run! Cow: ${stockBeforeMultiCow}->${stockAfterMultiCow}, Buff: ${stockBeforeMultiBuff}->${stockAfterMultiBuff}, Dahi: ${stockBeforeMultiDahi}->${stockAfterMultiDahi}`);
  } else {
    throw new Error(`FAIL: Multi-item delivery deduction failed! Cow: ${stockAfterMultiCow}, Buff: ${stockAfterMultiBuff}, Dahi: ${stockAfterMultiDahi}`);
  }

  // --- TEST 7: Reverting / Cancelling a DELIVERED delivery restores stock safely ---
  console.log('\n--- TEST 7: Reverting delivered delivery back to PENDING restores stock ---');
  await deliveryService.updateDeliveryStatus(multiDelivery.deliveryRun._id, {
    status: 'PENDING',
  });

  const stockRevertedCow = (await Product.findById(cowMilk._id)).currentStock;
  const stockRevertedBuff = (await Product.findById(buffMilk._id)).currentStock;
  const stockRevertedDahi = (await Product.findById(dahi._id)).currentStock;

  if (
    stockRevertedCow === stockBeforeMultiCow &&
    stockRevertedBuff === stockBeforeMultiBuff &&
    stockRevertedDahi === stockBeforeMultiDahi
  ) {
    console.log(`✓ PASS: Stock restored accurately on delivery status reversion! Cow: ${stockRevertedCow}, Buff: ${stockRevertedBuff}, Dahi: ${stockRevertedDahi}`);
  } else {
    throw new Error(`FAIL: Stock restoration failed! Cow: ${stockRevertedCow}, Buff: ${stockRevertedBuff}, Dahi: ${stockRevertedDahi}`);
  }

  // --- TEST 8: POS Order Delivery does NOT double deduct ---
  console.log('\n--- TEST 8: POS counter delivery order does NOT double deduct ---');
  const posDelivery = await deliveryService.createDeliveryRun({
    customerName: 'POS One-Time Customer',
    shift: 'MORNING',
    status: 'PENDING',
    source: 'POS_ONE_TIME', // Created by POS checkout which already deducted inventory
    linkedOrderId: new mongoose.Types.ObjectId(),
    items: [
      { name: 'Fresh Milk Cow', quantity: 10, unit: 'L', unitPrice: 200, subtotal: 2000 }
    ],
  });

  const cowBeforePOSDel = (await Product.findById(cowMilk._id)).currentStock;
  await deliveryService.updateDeliveryStatus(posDelivery.deliveryRun._id, {
    status: 'DELIVERED',
  });

  const cowAfterPOSDel = (await Product.findById(cowMilk._id)).currentStock;
  if (cowAfterPOSDel === cowBeforePOSDel) {
    console.log('✓ PASS: POS counter delivery avoided double deduction. Stock remained', cowAfterPOSDel);
  } else {
    throw new Error(`FAIL: POS counter delivery was double deducted: ${cowAfterPOSDel}`);
  }

  // Cleanup test deliveries
  await DeliveryRun.deleteMany({
    customerName: { $regex: /^Test /i }
  });
  await DeliveryRun.deleteOne({ _id: posDelivery.deliveryRun._id });

  // Reset demo stocks to clean initial values
  await Product.findByIdAndUpdate(cowMilk._id, { currentStock: 0 });
  await Product.findByIdAndUpdate(buffMilk._id, { currentStock: 0 });
  await Product.findByIdAndUpdate(dahi._id, { currentStock: 0 });

  console.log('\n======================================================');
  console.log('✓ ALL 8 AUTOMATED INVENTORY DEDUCTION TESTS PASSED 100%!');
  console.log('======================================================');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
