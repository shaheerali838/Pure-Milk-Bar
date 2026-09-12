import mongoose from 'mongoose';
import MilkProcurement from '../../../models/MilkProcurement.model.js';
import Supplier from '../../../models/Supplier.model.js';
import AppError from '../../../utils/AppError.js';

class ProcurementService {
  /**
   * Record a new milk procurement entry.
   * Also updates the supplier's payable balance.
   * @param {object} data - Validated procurement data
   * @returns {Promise<object>} Created procurement document (populated)
   */
  async createProcurement(data) {
    // Verify supplier exists and is active
    const supplier = await Supplier.findById(data.supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
    }
    if (!supplier.isActive) {
      throw new AppError(
        'Cannot record procurement for an inactive supplier',
        400,
        'SUPPLIER_INACTIVE'
      );
    }

    // Check for duplicate batch number
    const existingBatch = await MilkProcurement.findOne({ batchNumber: data.batchNumber });
    if (existingBatch) {
      throw new AppError(
        `Procurement with batch number '${data.batchNumber}' already exists`,
        409,
        'DUPLICATE_BATCH_NUMBER'
      );
    }

    // Use a session for atomic write: create record + update supplier balance
    const session = await mongoose.startSession();
    let procurement;

    try {
      await session.withTransaction(async () => {
        [procurement] = await MilkProcurement.create([data], { session });

        // Increment supplier's payable balance
        await Supplier.findByIdAndUpdate(
          data.supplierId,
          { $inc: { currentPayableBalance: data.balanceAddedToKhata } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return procurement.populate('supplierId', 'code name phone');
  }

  /**
   * Get all procurement records with filtering and pagination.
   * @param {object} query - Validated query parameters
   * @returns {Promise<{procurements: Array, total: number, page: number, limit: number}>}
   */
  async getAllProcurements(query) {
    const { page, limit, supplierId, shift, status, dateFrom, dateTo } = query;

    const filter = {};

    if (supplierId) filter.supplierId = supplierId;
    if (shift) filter.shift = shift;
    if (status) filter.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [procurements, total] = await Promise.all([
      MilkProcurement.find(filter)
        .populate('supplierId', 'code name phone villageOrLocation')
        .populate('dockInspectorId', 'name role')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MilkProcurement.countDocuments(filter),
    ]);

    return { procurements, total, page, limit };
  }

  /**
   * Get a single procurement record by ID.
   * @param {string} id - MilkProcurement ObjectId
   * @returns {Promise<object>} Procurement document (populated)
   */
  async getProcurementById(id) {
    const procurement = await MilkProcurement.findById(id)
      .populate('supplierId', 'code name phone villageOrLocation milkType')
      .populate('dockInspectorId', 'name role')
      .lean();

    if (!procurement) {
      throw new AppError('Procurement record not found', 404, 'PROCUREMENT_NOT_FOUND');
    }

    return procurement;
  }

  /**
   * Update a procurement record (status or amountPaid).
   * If status changes to REJECTED, reverses the balance on the supplier's khata.
   * @param {string} id - MilkProcurement ObjectId
   * @param {object} data - Validated update data
   * @returns {Promise<object>} Updated procurement document
   */
  async updateProcurement(id, data) {
    const existing = await MilkProcurement.findById(id);
    if (!existing) {
      throw new AppError('Procurement record not found', 404, 'PROCUREMENT_NOT_FOUND');
    }

    // If rejecting an ACCEPTED record, reverse the balance
    const isRejecting =
      data.status === 'REJECTED' && existing.status === 'ACCEPTED';

    const session = await mongoose.startSession();
    let updated;

    try {
      await session.withTransaction(async () => {
        updated = await MilkProcurement.findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
          session,
        });

        if (isRejecting) {
          await Supplier.findByIdAndUpdate(
            existing.supplierId,
            { $inc: { currentPayableBalance: -existing.balanceAddedToKhata } },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }

    return updated.populate('supplierId', 'code name phone');
  }

  /**
   * Get daily procurement summary for a given date.
   * @param {string} date - ISO date string (YYYY-MM-DD)
   * @returns {Promise<object>} Daily summary object
   */
  async getDailySummary(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [result] = await MilkProcurement.aggregate([
      {
        $match: {
          date: { $gte: dayStart, $lte: dayEnd },
          status: 'ACCEPTED',
        },
      },
      {
        $facet: {
          byShift: [
            {
              $group: {
                _id: '$shift',
                totalLiters: { $sum: '$quantityLiters' },
                totalAmount: { $sum: '$totalAmount' },
                avgFat: { $avg: '$fatPercentage' },
                count: { $sum: 1 },
              },
            },
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalLiters: { $sum: '$quantityLiters' },
                totalAmount: { $sum: '$totalAmount' },
                avgFat: { $avg: '$fatPercentage' },
                avgSnf: { $avg: '$snfCalculated' },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    return {
      date,
      byShift: result?.byShift || [],
      totals: result?.totals[0] || {
        totalLiters: 0,
        totalAmount: 0,
        avgFat: 0,
        avgSnf: 0,
        count: 0,
      },
    };
  }
}

export default new ProcurementService();
