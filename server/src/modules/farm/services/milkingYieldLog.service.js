import mongoose from 'mongoose';
import MilkingYieldLog from '../../../models/MilkingYieldLog.model.js';
import Animal from '../../../models/Animal.model.js';
import AppError from '../../../utils/AppError.js';

class MilkingYieldLogService {
  /**
   * Record a new milking yield log entry.
   * Business Rules:
   * 1. Animal must exist and be active.
   * 2. Duplicate (animalId + date + shift) is rejected by unique compound index.
   * 3. After recording, recalculate the animal's dailyAvgYield.
   
   * @param {object} data - Validated milking yield data
   * @param {string} operatorId - The authenticated user's ObjectId (from JWT)
   * @returns {Promise<object>} Created milking yield log document
   */
  async createMilkingYieldLog(data, operatorId) {
    // 1. Verify animal exists and is active
    const animal = await Animal.findById(data.animalId);
    if (!animal) {
      throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
    }
    if (!animal.isActive) {
      throw new AppError(
        `Animal '${animal.tagNumber}' is inactive and cannot be milked`,
        400,
        'ANIMAL_INACTIVE'
      );
    }

    // 2. Create the milking yield log with operator reference
    const milkingLog = await MilkingYieldLog.create({
      ...data,
      operatorId,
    });

    // 3. Recalculate the animal's daily average yield (last 30 days)
    await this._recalculateAnimalAvgYield(data.animalId);

    // Return populated log
    const populated = await MilkingYieldLog.findById(milkingLog._id)
      .populate('animalId', 'tagNumber name type')
      .populate('operatorId', 'name username')
      .lean();

    return populated;
  }

  /**
   * Get all milking yield logs with filtering and pagination.
   * @param {object} query - Validated query parameters
   * @returns {Promise<{logs: Array, total: number, page: number, limit: number}>}
   */
  async getAllMilkingYieldLogs(query) {
    const { page, limit, animalId, shift, startDate, endDate } = query;

    // Build filter object
    const filter = {};

    if (animalId) filter.animalId = animalId;
    if (shift) filter.shift = shift;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      MilkingYieldLog.find(filter)
        .populate('animalId', 'tagNumber name type')
        .populate('operatorId', 'name username')
        .sort({ date: -1, shift: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MilkingYieldLog.countDocuments(filter),
    ]);

    return { logs, total, page, limit };
  }

  /**
   * Get a single milking yield log by ID.
   * @param {string} id - MilkingYieldLog ObjectId
   * @returns {Promise<object>} Milking yield log document
   */
  async getMilkingYieldLogById(id) {
    const log = await MilkingYieldLog.findById(id)
      .populate('animalId', 'tagNumber name type breed lactationStage')
      .populate('operatorId', 'name username')
      .lean();

    if (!log) {
      throw new AppError('Milking yield log not found', 404, 'MILKING_LOG_NOT_FOUND');
    }

    return log;
  }

  /**
   * Update a milking yield log entry.
   * Only yieldLiters, fatPercentage, snfPercentage, and notes can be updated.
   * The animalId, date, shift, and operatorId are immutable after creation.
   *
   * @param {string} id - MilkingYieldLog ObjectId
   * @param {object} data - Validated update data
   * @returns {Promise<object>} Updated milking yield log document
   */
  async updateMilkingYieldLog(id, data) {
    const log = await MilkingYieldLog.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('animalId', 'tagNumber name type')
      .populate('operatorId', 'name username')
      .lean();

    if (!log) {
      throw new AppError('Milking yield log not found', 404, 'MILKING_LOG_NOT_FOUND');
    }

    // Recalculate animal's daily average yield after update
    await this._recalculateAnimalAvgYield(log.animalId._id || log.animalId);

    return log;
  }

  /**
   * Delete a milking yield log entry.
   * @param {string} id - MilkingYieldLog ObjectId
   * @returns {Promise<object>} Deleted milking yield log document
   */
  async deleteMilkingYieldLog(id) {
    const log = await MilkingYieldLog.findByIdAndDelete(id).lean();

    if (!log) {
      throw new AppError('Milking yield log not found', 404, 'MILKING_LOG_NOT_FOUND');
    }

    // Recalculate animal's daily average yield after deletion
    await this._recalculateAnimalAvgYield(log.animalId);

    return log;
  }

  /**
   * Get daily yield summary for a specific date.
   * Aggregates total yield by shift, by animal type, and grand total.
   *
   * @param {string} dateStr - ISO date string (e.g., '2026-09-08')
   * @returns {Promise<object>} Daily yield summary
   */
  async getDailyYieldSummary(dateStr) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    const [summary] = await MilkingYieldLog.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $lookup: {
          from: 'animals',
          localField: 'animalId',
          foreignField: '_id',
          as: 'animal',
        },
      },
      { $unwind: '$animal' },
      {
        $facet: {
          byShift: [
            {
              $group: {
                _id: '$shift',
                totalLiters: { $sum: '$yieldLiters' },
                avgFat: { $avg: '$fatPercentage' },
                avgSnf: { $avg: '$snfPercentage' },
                entryCount: { $sum: 1 },
              },
            },
          ],
          byAnimalType: [
            {
              $group: {
                _id: '$animal.type',
                totalLiters: { $sum: '$yieldLiters' },
                entryCount: { $sum: 1 },
              },
            },
          ],
          grandTotal: [
            {
              $group: {
                _id: null,
                totalLiters: { $sum: '$yieldLiters' },
                totalEntries: { $sum: 1 },
                avgFat: { $avg: '$fatPercentage' },
                avgSnf: { $avg: '$snfPercentage' },
              },
            },
          ],
        },
      },
    ]);

    return {
      date: dateStr,
      byShift: (summary?.byShift || []).reduce((acc, item) => {
        acc[item._id] = {
          totalLiters: Number(item.totalLiters.toFixed(2)),
          avgFat: item.avgFat ? Number(item.avgFat.toFixed(2)) : null,
          avgSnf: item.avgSnf ? Number(item.avgSnf.toFixed(2)) : null,
          entryCount: item.entryCount,
        };
        return acc;
      }, {}),
      byAnimalType: (summary?.byAnimalType || []).reduce((acc, item) => {
        acc[item._id] = {
          totalLiters: Number(item.totalLiters.toFixed(2)),
          entryCount: item.entryCount,
        };
        return acc;
      }, {}),
      grandTotal: {
        totalLiters: Number((summary?.grandTotal[0]?.totalLiters || 0).toFixed(2)),
        totalEntries: summary?.grandTotal[0]?.totalEntries || 0,
        avgFat: summary?.grandTotal[0]?.avgFat
          ? Number(summary.grandTotal[0].avgFat.toFixed(2))
          : null,
        avgSnf: summary?.grandTotal[0]?.avgSnf
          ? Number(summary.grandTotal[0].avgSnf.toFixed(2))
          : null,
      },
    };
  }

  /**
   * PRIVATE: Recalculate an animal's daily average yield based on last 30 days.
   * Updates the Animal document's dailyAvgYield field.
   *
   * @param {string} animalId - Animal ObjectId
   * @private
   */
  async _recalculateAnimalAvgYield(animalId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [result] = await MilkingYieldLog.aggregate([
      {
        $match: {
          animalId: new mongoose.Types.ObjectId(animalId),
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          dailyTotal: { $sum: '$yieldLiters' },
        },
      },
      {
        $group: {
          _id: null,
          avgDailyYield: { $avg: '$dailyTotal' },
        },
      },
    ]);

    const avgYield = result ? Number(result.avgDailyYield.toFixed(2)) : 0;

    await Animal.findByIdAndUpdate(animalId, { dailyAvgYield: avgYield });
  }
}

export default new MilkingYieldLogService();
