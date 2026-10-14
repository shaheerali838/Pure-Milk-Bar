import mongoose from 'mongoose';
import DeliveryRun from '../../../models/DeliveryRun.model.js';
import VehicleFuelLog from '../../../models/VehicleFuelLog.model.js';
import User from '../../../models/User.model.js';
import {
  validateDeliveryStock,
  deductDeliveryStock,
  restoreDeliveryStock,
} from './deliveryStockHelper.js';
import vehicleFuelLogService from './vehicleFuelLog.service.js';

class DeliveryService {
  generateRunCode() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `DR-${today}-${randomSuffix}`;
  }

  // Stock deduction & restoration helpers delegated to deliveryStockHelper
  async deductDeliveryStock(delivery) {
    return await deductDeliveryStock(delivery);
  }

  async restoreDeliveryStock(delivery) {
    return await restoreDeliveryStock(delivery);
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
      await validateDeliveryStock(deliveryData.items);
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

    if (existingRun.status === 'DELIVERED' && existingRun.isStockDeducted) {
      await this.restoreDeliveryStock(existingRun);
    }

    return await DeliveryRun.findByIdAndDelete(id);
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

    if (bottlesReturned !== undefined) updateFields.bottlesReturned = bottlesReturned;
    if (codAmountToCollect !== undefined) updateFields.codAmountToCollect = codAmountToCollect;
    if (amountPaid !== undefined) updateFields.amountPaid = amountPaid;
    if (amountDue !== undefined) updateFields.amountDue = amountDue;
    if (cashCollected !== undefined) updateFields.cashCollected = cashCollected;
    if (onlineCollected !== undefined) updateFields.onlineCollected = onlineCollected;
    if (paymentMode !== undefined) updateFields.paymentMode = paymentMode;
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
    if (notes !== undefined) updateFields.notes = notes;

    const updatedRun = await DeliveryRun.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate('riderId', 'name phone role')
      .populate('customerId', 'name phone');

    if (newStatus === 'DELIVERED' && (!existingRun.isStockDeducted || prevStatus !== 'DELIVERED')) {
      await this.deductDeliveryStock(updatedRun);
    } else if (prevStatus === 'DELIVERED' && newStatus !== 'DELIVERED') {
      await this.restoreDeliveryStock(existingRun);
    }

    return updatedRun;
  }

  // Delegated Fuel Log Methods
  async createVehicleFuelLog(payload) {
    return await vehicleFuelLogService.createVehicleFuelLog(payload);
  }

  async getVehicleFuelLogs(query = {}) {
    return await vehicleFuelLogService.getVehicleFuelLogs(query);
  }

  async getVehicleFuelLogById(id) {
    return await vehicleFuelLogService.getVehicleFuelLogById(id);
  }

  async updateVehicleFuelLog(id, updateData) {
    return await vehicleFuelLogService.updateVehicleFuelLog(id, updateData);
  }

  async deleteVehicleFuelLog(id) {
    return await vehicleFuelLogService.deleteVehicleFuelLog(id);
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
