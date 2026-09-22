import mongoose from 'mongoose';
import MilkingYieldLog from '../../../models/MilkingYieldLog.model.js';
import Animal from '../../../models/Animal.model.js';
import AppError from '../../../utils/AppError.js';

class MilkingYieldLogService {
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

  async deleteMilkingYieldLog(id) {
    const log = await MilkingYieldLog.findByIdAndDelete(id).lean();

    if (!log) {
      throw new AppError('Milking yield log not found', 404, 'MILKING_LOG_NOT_FOUND');
    }

    // Recalculate animal's daily average yield after deletion
    await this._recalculateAnimalAvgYield(log.animalId);

    return log;
  }

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
      },
    };
  }

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
