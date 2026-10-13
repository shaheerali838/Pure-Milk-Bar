import Product from '../models/Product.model.js';
import MilkingYieldLog from '../models/MilkingYieldLog.model.js';
import MilkProcurement from '../models/MilkProcurement.model.js';
import Animal from '../models/Animal.model.js';
import Supplier from '../models/Supplier.model.js';
import Order from '../models/Order.model.js';
import DeliveryRun from '../models/DeliveryRun.model.js';
import ProcessingBatch from '../models/ProcessingBatch.model.js';
import { getPktDayRange } from './dateUtils.js';

export const isBuffaloVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return (
    s.includes('buffalo') ||
    s.includes('bufflo') ||
    s.includes('buff') ||
    s.includes('bhains') ||
    s.includes('bhais')
  );
};

export const isCowVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return s.includes('cow') || s.includes('gai') || s.includes('gae');
};

export const isDahiVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return s.includes('dahi') || s.includes('yogurt') || s.includes('curd');
};

export const isMilkVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return (
    !isDahiVariant(name, category) &&
    (s.includes('milk') || s.includes('doodh') || isBuffaloVariant(name, category) || isCowVariant(name, category))
  );
};

/**
 * Robust product matching between item (with name/sku/productId) and Product catalog
 */
export async function matchProductForServerItem(item, allProductsCache = null) {
  if (!item) return null;

  if (item.productId) {
    if (allProductsCache) {
      const found = allProductsCache.find((p) => String(p._id) === String(item.productId));
      if (found) return found;
    } else {
      const prod = await Product.findById(item.productId);
      if (prod) return prod;
    }
  }

  if (item.sku) {
    if (allProductsCache) {
      const found = allProductsCache.find((p) => String(p.sku || '').toUpperCase() === String(item.sku).toUpperCase());
      if (found) return found;
    } else {
      const prod = await Product.findOne({ sku: String(item.sku).toUpperCase() });
      if (prod) return prod;
    }
  }

  const rawName = String(item.name || '').trim();
  const cleanName = rawName.replace(/\s*\((Farm|Supplier)\s*Share\)/i, '').trim();

  const exactRegex = new RegExp(`^${cleanName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
  if (allProductsCache) {
    const found = allProductsCache.find((p) => exactRegex.test(p.name));
    if (found) return found;
  } else {
    const prod = await Product.findOne({ name: exactRegex });
    if (prod) return prod;
  }

  if (isBuffaloVariant(cleanName, item.category)) {
    if (allProductsCache) {
      const found = allProductsCache.find((p) => isBuffaloVariant(p.name, p.category) || isBuffaloVariant(p.sku));
      if (found) return found;
    } else {
      const prod = await Product.findOne({
        $or: [
          { name: /buff(alo|lo)?|bhains/i },
          { sku: /buff/i },
        ],
      });
      if (prod) return prod;
    }
    return {
      _id: item.productId || 'virtual-buff-milk',
      sku: 'PRD-BUFF-001',
      name: item.name || 'Fresh Buffalo Milk',
      category: 'Milk',
      unit: item.unit || 'LITER',
      price: item.unitPrice || item.price || 220,
      currentStock: 0,
    };
  }

  if (isCowVariant(cleanName, item.category)) {
    if (allProductsCache) {
      const found = allProductsCache.find((p) => isCowVariant(p.name, p.category) || isCowVariant(p.sku));
      if (found) return found;
    } else {
      const prod = await Product.findOne({
        $or: [
          { name: /cow|gai/i },
          { sku: /cow/i },
        ],
      });
      if (prod) return prod;
    }
    return {
      _id: item.productId || 'virtual-cow-milk',
      sku: 'PRD-COW-001',
      name: item.name || 'Fresh Cow Milk',
      category: 'Milk',
      unit: item.unit || 'LITER',
      price: item.unitPrice || item.price || 200,
      currentStock: 0,
    };
  }

  if (isDahiVariant(cleanName, item.category)) {
    if (allProductsCache) {
      const found = allProductsCache.find((p) => isDahiVariant(p.name, p.category) || isDahiVariant(p.sku));
      if (found) return found;
    } else {
      const prod = await Product.findOne({
        $or: [
          { name: /dahi|yogurt|curd/i },
          { category: /dahi|yogurt|curd/i },
        ],
      });
      if (prod) return prod;
    }
    return {
      _id: item.productId || 'virtual-dahi',
      sku: 'PRD-DAHI-001',
      name: item.name || 'Fresh Farm Dahi',
      category: 'Dahi',
      unit: item.unit || 'KG',
      price: item.unitPrice || item.price || 320,
      currentStock: 0,
    };
  }

  if (cleanName.toLowerCase().includes('milk') || cleanName.toLowerCase().includes('doodh')) {
    if (allProductsCache) {
      const found = allProductsCache.find((p) => isMilkVariant(p.name, p.category));
      if (found) return found;
    } else {
      const prod = await Product.findOne({
        $or: [
          { category: /milk/i },
          { name: /milk/i },
        ],
      });
      if (prod) return prod;
    }
  }

  return null;
}

/**
 * Calculates live on-hand physical stock for any product in the backend.
 * For raw milk and dahi, it blends catalog baseline inventory with live milking yields
 * and supplier intake logs bounded by active business date causality.
 */
export async function getLiveAvailableStock(prod) {
  if (!prod) return 0;
  const catalogStock = Math.max(0, Number(prod.currentStock || 0));
  const name = String(prod.name || '').toLowerCase();
  const cat = String(prod.category || '').toLowerCase();

  const isBuff = isBuffaloVariant(name, cat);
  const isCow = isCowVariant(name, cat);
  const isDahi = isDahiVariant(name, cat);
  const isMilk = isMilkVariant(name, cat);

  // If not liquid dairy or dahi, strictly rely on catalog stock
  if (!isMilk && !isDahi) {
    return catalogStock;
  }

  try {
    const { startOfDay, endOfDay } = getPktDayRange();

    // 1. In-house Farm yield from MilkingYieldLog for active day
    let farmYieldQuery = {
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      ],
    };
    if (isBuff || isCow) {
      const targetType = isCow ? 'COW' : 'BUFFALO';
      const animals = await Animal.find({
        $or: [
          { type: targetType },
          { type: new RegExp(`^${targetType}$`, 'i') },
          { species: new RegExp(targetType, 'i') },
          { breed: new RegExp(targetType, 'i') },
          { tagNumber: new RegExp(`^${targetType}`, 'i') },
        ],
      }).select('_id');
      const animalIds = animals.map((a) => a._id);
      if (animalIds.length > 0) {
        farmYieldQuery.animalId = { $in: animalIds };
      }
    }
    const yieldLogs = await MilkingYieldLog.find(farmYieldQuery).select('yieldLiters');
    let totalYield = yieldLogs.reduce((sum, y) => sum + (Number(y.yieldLiters) || 0), 0);

    // If today has no logs recorded yet, fall back to all-time recorded logs
    let isAllTimeYield = false;
    if (totalYield === 0) {
      const allYieldQuery = { ...farmYieldQuery };
      delete allYieldQuery.$or;
      const allYieldLogs = await MilkingYieldLog.find(allYieldQuery).select('yieldLiters');
      totalYield = allYieldLogs.reduce((sum, y) => sum + (Number(y.yieldLiters) || 0), 0);
      if (totalYield > 0) isAllTimeYield = true;
    }

    // 2. Supplier Procurement Inflow
    let supplierQuery = {
      status: { $ne: 'REJECTED' },
      ...(isAllTimeYield ? {} : {
        $or: [
          { date: { $gte: startOfDay, $lte: endOfDay } },
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      }),
    };
    if (isBuff || isCow) {
      const supType = isCow ? 'COW' : 'BUFFALO';
      const suppliers = await Supplier.find({
        $or: [
          { milkType: supType },
          { milkType: new RegExp(`^${supType}$`, 'i') },
          { milkType: 'MIXED' },
          { milkType: /mixed/i },
        ],
      }).select('_id');
      const supIds = suppliers.map((s) => s._id);
      if (supIds.length > 0) {
        supplierQuery.supplierId = { $in: supIds };
      }
    }
    const procurements = await MilkProcurement.find(supplierQuery).select('quantityLiters');
    const totalProcured = procurements.reduce((sum, p) => sum + (Number(p.quantityLiters) || 0), 0);

    // 3. Past Sales & Deliveries Deductions
    const orderDateQuery = isAllTimeYield ? {} : {
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      ],
    };
    const allOrders = await Order.find(orderDateQuery).select('items');
    let totalSold = 0;
    allOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const iName = String(item.name || '').toLowerCase();
        const iCat = String(item.category || '').toLowerCase();
        if (isBuff && isBuffaloVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        } else if (isCow && isCowVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        } else if (isDahi && isDahiVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        } else if (!isBuff && !isCow && !isDahi && isMilkVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        }
      });
    });

    const deliveryDateQuery = {
      status: { $ne: 'CANCELLED' },
      $or: [{ linkedOrderId: null }, { linkedOrderId: { $exists: false } }],
      source: { $ne: 'POS_ONE_TIME' },
      ...(isAllTimeYield ? {} : {
        $and: [
          {
            $or: [
              { date: { $gte: startOfDay, $lte: endOfDay } },
              { createdAt: { $gte: startOfDay, $lte: endOfDay } },
            ],
          },
        ],
      }),
    };
    const allDeliveries = await DeliveryRun.find(deliveryDateQuery).select('items');
    allDeliveries.forEach((d) => {
      (d.items || []).forEach((item) => {
        const iName = String(item.name || '').toLowerCase();
        const iCat = String(item.category || '').toLowerCase();
        if (isBuff && isBuffaloVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        } else if (isCow && isCowVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        } else if (isDahi && isDahiVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        } else if (!isBuff && !isCow && !isDahi && isMilkVariant(iName, iCat)) {
          totalSold += Number(item.quantity || 0);
        }
      });
    });

    // 4. Processing Batches (converted from milk to Dahi)
    // For Dahi stock: Accumulate all finished batches across history
    // For Raw milk stock: Only deduct batches created in the active period (or safe clamped historical)
    const batchDateQuery = isDahi || isAllTimeYield ? {} : {
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      ],
    };
    const batches = await ProcessingBatch.find(batchDateQuery).select('milkType milkUsedLiters outputQuantity stage status');
    let totalDahiProduced = 0;
    let convertedDeduction = 0;

    batches.forEach((b) => {
      const milkUsed = Number(b.milkUsedLiters || 0);
      const bMilkType = String(b.milkType || '').toLowerCase();
      const isBatchCow = bMilkType.includes('cow');
      const isBatchBuff = bMilkType.includes('buffalo') || bMilkType.includes('buff');

      if (b.stage === 'pos' || b.status === 'COMPLETED') {
        totalDahiProduced += Number(b.outputQuantity || 0);
      }

      if (isBuff) {
        if (isBatchBuff) convertedDeduction += milkUsed;
        else if (!isBatchCow) convertedDeduction += milkUsed * 0.5; // mixed
      } else if (isCow) {
        if (isBatchCow) convertedDeduction += milkUsed;
        else if (!isBatchBuff) convertedDeduction += milkUsed * 0.5; // mixed
      } else {
        convertedDeduction += milkUsed;
      }
    });

    if (isDahi) {
      // Dahi is durable: all-time production minus all-time sales
      const allDahiOrders = await Order.find({}).select('items');
      let allDahiSold = 0;
      allDahiOrders.forEach((o) => {
        (o.items || []).forEach((item) => {
          if (isDahiVariant(item.name, item.category)) allDahiSold += Number(item.quantity || 0);
        });
      });
      const allDahiDeliveries = await DeliveryRun.find({ status: { $ne: 'CANCELLED' } }).select('items');
      allDahiDeliveries.forEach((d) => {
        (d.items || []).forEach((item) => {
          if (isDahiVariant(item.name, item.category)) allDahiSold += Number(item.quantity || 0);
        });
      });
      const netDahiStock = Math.max(0, Number(((totalDahiProduced + catalogStock) - allDahiSold).toFixed(2)));
      return Math.max(catalogStock, netDahiStock);
    }

    // Never allow converted deduction from past prunings to exceed available yield
    if (isAllTimeYield) {
      convertedDeduction = Math.min(convertedDeduction, totalYield);
    }

    const netMilkStock = Math.max(
      0,
      Number(((totalYield + totalProcured + catalogStock) - (totalSold + convertedDeduction)).toFixed(2))
    );

    return Math.max(catalogStock, netMilkStock);
  } catch (err) {
    console.warn('Backend getLiveAvailableStock fallback:', err.message);
    return catalogStock;
  }
}
