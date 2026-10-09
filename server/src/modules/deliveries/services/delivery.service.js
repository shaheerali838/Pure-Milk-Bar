import mongoose from 'mongoose';
import DeliveryRun from '../../../models/DeliveryRun.model.js';
import VehicleFuelLog from '../../../models/VehicleFuelLog.model.js';
import User from '../../../models/User.model.js';
import Product from '../../../models/Product.model.js';
import Customer from '../../../models/Customer.model.js';

class DeliveryService {
  generateRunCode() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DR-${today}-${randomSuffix}`;
  }

  // ====================================================
  // Inventory Stock Deduction and Restoration Helpers
  // ====================================================

  /**
   * Smart product resolver matching delivery items to authoritative inventory Product records.
   */
  resolveProductForDeliveryItem(item, allProducts) {
    if (!item) return null;

    // 1. Direct ID match
    if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
      const prod = allProducts.find((p) => String(p._id) === String(item.productId));
      if (prod) return prod;
    }

    // 2. Direct SKU match
    if (item.sku) {
      const prod = allProducts.find(
        (p) => String(p.sku || '').toUpperCase() === String(item.sku).toUpperCase()
      );
      if (prod) return prod;
    }

    const rawName = String(item.name || '').trim();
    const cleanName = rawName.replace(/\s*\((Farm|Supplier)\s*Share\)/i, '').trim();

    // 3. Exact name match (case-insensitive)
    const exactMatch = allProducts.find(
      (p) => String(p.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (exactMatch) return exactMatch;

    const nameLower = cleanName.toLowerCase();

    // 4. Cow milk variant match
    if (nameLower.includes('cow') || nameLower.includes('gai')) {
      const cowProd = allProducts.find((p) => /cow/i.test(p.name) || /cow/i.test(p.sku));
      if (cowProd) return cowProd;
    }

    // 5. Buffalo milk variant match
    if (nameLower.includes('buffalo') || nameLower.includes('bhains')) {
      const buffProd = allProducts.find((p) => /buffalo/i.test(p.name) || /buffalo/i.test(p.sku));
      if (buffProd) return buffProd;
    }

    // 6. Dahi / Yogurt variant match
    if (nameLower.includes('dahi') || nameLower.includes('yogurt') || nameLower.includes('curd')) {
      const dahiProd = allProducts.find(
        (p) => /dahi|yogurt|curd/i.test(p.name) || /dahi|yogurt|curd/i.test(p.category)
      );
      if (dahiProd) return dahiProd;
    }

    // 7. General "Fresh Milk" or "Milk" without cow/buffalo specified
    if (nameLower === 'fresh milk' || nameLower === 'milk' || nameLower.includes('milk')) {
      const buffProd = allProducts.find((p) => /buffalo/i.test(p.name));
      if (buffProd) return buffProd;
      const generalMilkProd = allProducts.find(
        (p) => /milk/i.test(p.category) || /milk/i.test(p.name)
      );
      if (generalMilkProd) return generalMilkProd;
    }

    return null;
  }

  /**
   * Deducts inventory stock exactly once when a delivery is completed.
   */
  async deductDeliveryStock(delivery) {
    if (!delivery) return { skipped: true, reason: 'No delivery provided' };

    // Idempotency: Skip if stock already deducted for this delivery run
    if (delivery.isStockDeducted) {
      return { skipped: true, reason: 'Stock already deducted for this delivery' };
    }

    // Check if order was placed via POS counter (which already deducted inventory upon order creation)
    if (delivery.source === 'POS_ONE_TIME' || delivery.linkedOrderId) {
      await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
        $set: {
          isStockDeducted: true,
          stockDeductedAt: new Date(),
        },
      });
      return { skipped: true, reason: 'POS order already deducted stock at counter' };
    }

    let itemsToDeduct = [];
    if (Array.isArray(delivery.items) && delivery.items.length > 0) {
      itemsToDeduct = delivery.items.filter((it) => (Number(it.quantity) || 0) > 0);
    }

    // Fallback if delivery.items was empty: derive items from customer standing order or itemDescription
    if (itemsToDeduct.length === 0) {
      if (delivery.customerId) {
        try {
          const customer = await Customer.findById(delivery.customerId);
          if (customer) {
            const isMorning = String(delivery.shift || '').toUpperCase() === 'MORNING';
            const agreementItems = isMorning
              ? (customer.morningItems || customer.standingOrder?.morningItems || [])
              : (customer.eveningItems || customer.standingOrder?.eveningItems || []);

            if (Array.isArray(agreementItems) && agreementItems.length > 0) {
              itemsToDeduct = agreementItems
                .map((it) => ({
                  name: it.name || 'Product',
                  quantity: Number(it.qty || it.quantity) || 0,
                  unit: it.unit || 'L',
                }))
                .filter((it) => it.quantity > 0);
            }
          }
        } catch (_) {}
      }

      // Final fallback from qtyLiters / itemDescription
      if (itemsToDeduct.length === 0) {
        const totalQty = Number(delivery.qtyLiters) || 0;
        const desc = String(delivery.itemDescription || '').toLowerCase();
        if (totalQty > 0 || desc) {
          if (desc.includes('cow')) {
            itemsToDeduct.push({ name: 'Fresh Milk Cow', quantity: totalQty || 1, unit: 'L' });
          } else if (desc.includes('dahi') || desc.includes('yogurt')) {
            itemsToDeduct.push({ name: 'Dahi', quantity: totalQty || 1, unit: 'KG' });
          } else {
            itemsToDeduct.push({ name: 'Buffalo Milk', quantity: totalQty || 1, unit: 'L' });
          }
        }
      }
    }

    if (itemsToDeduct.length === 0) {
      await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
        $set: {
          isStockDeducted: true,
          stockDeductedAt: new Date(),
        },
      });
      return { success: true, deducted: [] };
    }

    const allProducts = await Product.find({});
    const deductionRecords = [];

    for (const item of itemsToDeduct) {
      const qty = Number(item.quantity) || 0;
      if (qty <= 0) continue;

      const matchedProd = this.resolveProductForDeliveryItem(item, allProducts);
      if (matchedProd) {
        const prevStock = Number(matchedProd.currentStock || 0);
        const newStock = Math.max(0, Number((prevStock - qty).toFixed(2)));

        await Product.findByIdAndUpdate(matchedProd._id, {
          $set: { currentStock: newStock },
        });

        // Update in-memory reference for multiple items matching same product
        matchedProd.currentStock = newStock;

        deductionRecords.push({
          productId: matchedProd._id,
          sku: matchedProd.sku,
          productName: matchedProd.name,
          quantity: qty,
          unit: item.unit || matchedProd.unit,
          previousStock: prevStock,
          newStock: newStock,
          deductedAt: new Date(),
        });
      }
    }

    await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
      $set: {
        isStockDeducted: true,
        stockDeductedAt: new Date(),
        stockDeductionDetails: deductionRecords,
      },
    });

    return { success: true, deducted: deductionRecords };
  }

  /**
   * Restores inventory stock if a delivered run is reverted to PENDING/SKIPPED/FAILED or deleted.
   */
  async restoreDeliveryStock(delivery) {
    if (!delivery || !delivery.isStockDeducted) {
      return { skipped: true, reason: 'Stock was not deducted' };
    }

    // If originated from POS, POS manages its own refunds/voids
    if (delivery.source === 'POS_ONE_TIME' || delivery.linkedOrderId) {
      await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
        $set: {
          isStockDeducted: false,
          stockDeductedAt: null,
        },
      });
      return { skipped: true };
    }

    const details = Array.isArray(delivery.stockDeductionDetails) ? delivery.stockDeductionDetails : [];

    if (details.length > 0) {
      for (const rec of details) {
        const qty = Number(rec.quantity) || 0;
        if (qty > 0 && rec.productId) {
          const prod = await Product.findById(rec.productId);
          if (prod) {
            const restoredStock = Number(((prod.currentStock || 0) + qty).toFixed(2));
            await Product.findByIdAndUpdate(prod._id, {
              $set: { currentStock: restoredStock },
            });
          }
        }
      }
    } else if (Array.isArray(delivery.items) && delivery.items.length > 0) {
      const allProducts = await Product.find({});
      for (const item of delivery.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;
        const matchedProd = this.resolveProductForDeliveryItem(item, allProducts);
        if (matchedProd) {
          const restoredStock = Number(((matchedProd.currentStock || 0) + qty).toFixed(2));
          await Product.findByIdAndUpdate(matchedProd._id, {
            $set: { currentStock: restoredStock },
          });
          matchedProd.currentStock = restoredStock;
        }
      }
    }

    await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
      $set: {
        isStockDeducted: false,
        stockDeductedAt: null,
        stockDeductionDetails: [],
      },
    });

    return { success: true };
  }

  async createDeliveryRun(payload) {
    const { fuelLog, ...deliveryData } = payload;

    if (!deliveryData.runCode) {
      deliveryData.runCode = this.generateRunCode();
    }

    // Populate riderNameSnapshot if riderId provided but snapshot is missing
    if (deliveryData.riderId && !deliveryData.riderNameSnapshot) {
      const rider = await User.findById(deliveryData.riderId).select('name');
      if (rider) {
        deliveryData.riderNameSnapshot = rider.name;
      }
    }

    // Pre-order Inventory Stock Validation
    if (Array.isArray(deliveryData.items) && deliveryData.items.length > 0) {
      const allProducts = await Product.find({});
      for (const item of deliveryData.items) {
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;
        const matchedProd = this.resolveProductForDeliveryItem(item, allProducts);
        if (matchedProd) {
          const availStock = Number(matchedProd.currentStock || 0);
          if (availStock <= 0 || qty > availStock) {
            const err = new Error(
              `Insufficient stock for "${matchedProd.name}". Available: ${availStock} ${matchedProd.unit || 'L'}, Requested: ${qty}`
            );
            err.statusCode = 400;
            err.code = 'INSUFFICIENT_STOCK';
            throw err;
          }
        }
      }
    }

    // Transaction for atomic delivery run + fuel log creation
    if (fuelLog) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const [createdRun] = await DeliveryRun.create([deliveryData], { session });

        const fuelLogData = {
          ...fuelLog,
          riderId: deliveryData.riderId || fuelLog.riderId,
          date: deliveryData.date || new Date(),
          shift: deliveryData.shift,
          linkedDeliveryRunId: createdRun._id,
        };

        const [createdFuelLog] = await VehicleFuelLog.create([fuelLogData], { session });

        await session.commitTransaction();
        session.endSession();

        if (createdRun.status === 'DELIVERED') {
          await this.deductDeliveryStock(createdRun);
        }

        return {
          deliveryRun: createdRun,
          fuelLog: createdFuelLog,
        };
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
      }
    }

    // Normal Delivery Run creation
    const deliveryRun = await DeliveryRun.create(deliveryData);
    if (deliveryRun.status === 'DELIVERED') {
      await this.deductDeliveryStock(deliveryRun);
    }
    return { deliveryRun };
  }

  async getDeliveryRuns(query = {}) {
    const {
      date,
      startDate,
      endDate,
      shift,
      route,
      status,
      riderId,
      customerId,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.date.$lte = e;
      }
    } else if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (shift) filter.shift = shift;
    if (route) filter.route = new RegExp(route, 'i');
    if (status) filter.status = status;
    if (riderId) filter.riderId = riderId;
    if (customerId) filter.customerId = customerId;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [deliveryRuns, total] = await Promise.all([
      DeliveryRun.find(filter)
        .populate('riderId', 'name phone role')
        .populate('customerId', 'name phone deliveryRoute khataBalance')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      DeliveryRun.countDocuments(filter),
    ]);

    return {
      deliveryRuns,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDeliveryRunById(id) {
    const deliveryRun = await DeliveryRun.findById(id)
      .populate('riderId', 'name phone role')
      .populate('customerId', 'name phone deliveryRoute khataBalance');

    if (!deliveryRun) {
      const error = new Error(`Delivery Run with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return deliveryRun;
  }

  async updateDeliveryRun(id, updateData) {
    if (!updateData || Object.keys(updateData).length === 0) {
      const error = new Error('No fields provided to update');
      error.statusCode = 400;
      throw error;
    }

    const existingRun = await DeliveryRun.findById(id);
    if (!existingRun) {
      const error = new Error(`Delivery Run with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const prevStatus = existingRun.status;
    const newStatus = updateData.status || prevStatus;

    // Check if updating riderId to keep riderNameSnapshot in sync
    if (updateData.riderId && !updateData.riderNameSnapshot) {
      const rider = await User.findById(updateData.riderId).select('name');
      if (rider) {
        updateData.riderNameSnapshot = rider.name;
      }
    }

    const updatedRun = await DeliveryRun.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('riderId', 'name phone role')
      .populate('customerId', 'name phone deliveryRoute');

    // Handle stock deduction / restoration on status transitions
    if (newStatus === 'DELIVERED' && (!existingRun.isStockDeducted || prevStatus !== 'DELIVERED')) {
      await this.deductDeliveryStock(updatedRun);
    } else if (prevStatus === 'DELIVERED' && newStatus !== 'DELIVERED') {
      await this.restoreDeliveryStock(existingRun);
    }

    return updatedRun;
  }

  async deleteDeliveryRun(id) {
    const existingRun = await DeliveryRun.findById(id);
    if (!existingRun) {
      const error = new Error(`Delivery Run with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    // Restore deducted stock if deleting an already delivered run
    if (existingRun.status === 'DELIVERED' && existingRun.isStockDeducted) {
      await this.restoreDeliveryStock(existingRun);
    }

    const deletedRun = await DeliveryRun.findByIdAndDelete(id);
    return deletedRun;
  }

  async assignRider(id, riderId, riderNameSnapshot) {
    let nameSnapshot = riderNameSnapshot;
    if (!nameSnapshot && riderId) {
      const rider = await User.findById(riderId).select('name');
      if (rider) {
        nameSnapshot = rider.name;
      }
    }

    const updatedRun = await DeliveryRun.findByIdAndUpdate(
      id,
      {
        riderId,
        riderNameSnapshot: nameSnapshot || null,
      },
      { new: true, runValidators: true }
    )
      .populate('riderId', 'name phone role')
      .populate('customerId', 'name phone');

    if (!updatedRun) {
      const error = new Error(`Delivery Run with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return updatedRun;
  }

  async updateDeliveryStatus(id, statusData) {
    const existingRun = await DeliveryRun.findById(id);
    if (!existingRun) {
      const error = new Error(`Delivery Run with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    const prevStatus = existingRun.status;
    const {
      status,
      deliveredAt,
      bottlesReturned,
      codAmountToCollect,
      amountPaid,
      amountDue,
      cashCollected,
      onlineCollected,
      paymentMode,
      paymentStatus,
      notes,
    } = statusData;

    const newStatus = status || prevStatus;
    const updateFields = { status: newStatus };

    if (newStatus === 'DELIVERED') {
      updateFields.deliveredAt = deliveredAt || new Date();
    } else if (deliveredAt !== undefined) {
      updateFields.deliveredAt = deliveredAt;
    }

    if (bottlesReturned !== undefined) {
      updateFields.bottlesReturned = bottlesReturned;
    }

    if (codAmountToCollect !== undefined) {
      updateFields.codAmountToCollect = codAmountToCollect;
    }

    if (amountPaid !== undefined) {
      updateFields.amountPaid = amountPaid;
    }

    if (amountDue !== undefined) {
      updateFields.amountDue = amountDue;
    }

    if (cashCollected !== undefined) {
      updateFields.cashCollected = cashCollected;
    }

    if (onlineCollected !== undefined) {
      updateFields.onlineCollected = onlineCollected;
    }

    if (paymentMode !== undefined) {
      updateFields.paymentMode = paymentMode;
    }

    if (paymentStatus !== undefined) {
      updateFields.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    const updatedRun = await DeliveryRun.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate('riderId', 'name phone role')
      .populate('customerId', 'name phone');

    // Handle stock deduction / restoration on status transitions
    if (newStatus === 'DELIVERED' && (!existingRun.isStockDeducted || prevStatus !== 'DELIVERED')) {
      await this.deductDeliveryStock(updatedRun);
    } else if (prevStatus === 'DELIVERED' && newStatus !== 'DELIVERED') {
      await this.restoreDeliveryStock(existingRun);
    }

    return updatedRun;
  }

  // ====================================================
  // Vehicle Fuel Log Service Methods
  // ====================================================

  async createVehicleFuelLog(payload) {
    const fuelLog = await VehicleFuelLog.create(payload);
    return fuelLog;
  }

  async getVehicleFuelLogs(query = {}) {
    const { riderId, date, shift, vehiclePlate, linkedDeliveryRunId, page = 1, limit = 50 } = query;

    const filter = {};

    if (riderId) filter.riderId = riderId;
    if (shift) filter.shift = shift;
    if (vehiclePlate) filter.vehiclePlate = new RegExp(vehiclePlate, 'i');
    if (linkedDeliveryRunId) filter.linkedDeliveryRunId = linkedDeliveryRunId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [fuelLogs, total] = await Promise.all([
      VehicleFuelLog.find(filter)
        .populate('riderId', 'name phone role')
        .populate('linkedDeliveryRunId', 'runCode route status')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      VehicleFuelLog.countDocuments(filter),
    ]);

    return {
      fuelLogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVehicleFuelLogById(id) {
    const fuelLog = await VehicleFuelLog.findById(id)
      .populate('riderId', 'name phone role')
      .populate('linkedDeliveryRunId', 'runCode route status');

    if (!fuelLog) {
      const error = new Error(`Vehicle Fuel Log with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return fuelLog;
  }

  async updateVehicleFuelLog(id, updateData) {
    if (!updateData || Object.keys(updateData).length === 0) {
      const error = new Error('No fields provided to update');
      error.statusCode = 400;
      throw error;
    }

    const updatedFuelLog = await VehicleFuelLog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('riderId', 'name phone role');

    if (!updatedFuelLog) {
      const error = new Error(`Vehicle Fuel Log with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return updatedFuelLog;
  }

  async deleteVehicleFuelLog(id) {
    const deletedFuelLog = await VehicleFuelLog.findByIdAndDelete(id);

    if (!deletedFuelLog) {
      const error = new Error(`Vehicle Fuel Log with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return deletedFuelLog;
  }

  async getRiderRunSheetSummary({ riderId, date, shift }) {
    const filter = {};

    if (riderId) filter.riderId = riderId;
    if (shift) filter.shift = shift;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const runs = await DeliveryRun.find(filter)
      .populate('customerId', 'name phone address deliveryRoute khataBalance')
      .sort({ createdAt: 1 });

    const totalRuns = runs.length;
    let totalLiters = 0;
    let totalCodToCollect = 0;
    let totalBottlesReturned = 0;
    let pendingCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    runs.forEach((r) => {
      totalLiters += r.qtyLiters || 0;
      totalCodToCollect += r.codAmountToCollect || 0;
      totalBottlesReturned += r.bottlesReturned || 0;

      if (r.status === 'DELIVERED') deliveredCount++;
      else if (r.status === 'FAILED') failedCount++;
      else if (r.status === 'SKIPPED') skippedCount++;
      else pendingCount++;
    });

    return {
      riderId,
      date: date || new Date().toISOString().slice(0, 10),
      shift: shift || 'ALL',
      summary: {
        totalRuns,
        deliveredCount,
        pendingCount,
        failedCount,
        skippedCount,
        totalLiters,
        totalCodToCollect,
        totalBottlesReturned,
      },
      runs,
    };
  }
}

export default new DeliveryService();
