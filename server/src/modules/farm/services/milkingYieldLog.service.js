import mongoose from 'mongoose';
import MilkingYieldLog from '../../../models/MilkingYieldLog.model.js';
import Animal from '../../../models/Animal.model.js';
import AppError from '../../../utils/AppError.js';

class MilkingYieldLogService {
  async createMilkingYieldLog(data, operatorId) {
    // 1. Resolve animal by ID or Tag
    let animal = null;
    const rawId = data.animalId || data.id;
    if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
      animal = await Animal.findById(rawId);
    }

    const tagCandidate = (
      data.animalTag ||
      data.tag ||
      data.tagNumber ||
      (!mongoose.Types.ObjectId.isValid(rawId) ? rawId : null)
    )?.toString().trim();

    if (!animal && tagCandidate) {
      animal = await Animal.findOne({
        $or: [
          { tagNumber: new RegExp(`^${tagCandidate}$`, 'i') },
          { name: new RegExp(`^${tagCandidate}$`, 'i') },
        ],
      });

      // If animal does not exist in DB, auto-create it so milking log always succeeds
      if (!animal) {
        const isBuffalo =
          tagCandidate.toLowerCase().includes('buf') ||
          tagCandidate.toLowerCase().includes('nili');
        animal = await Animal.create({
          tagNumber: tagCandidate.toUpperCase(),
          name: tagCandidate,
          type: isBuffalo ? 'BUFFALO' : 'COW',
          species: isBuffalo ? 'Buffalo (Nili Ravi)' : 'Cow (Sahiwal)',
          breed: isBuffalo ? 'Nili Ravi' : 'Sahiwal',
          lactationStatus: 'Milking',
          lactationStage: 'EARLY',
          healthStatus: 'HEALTHY',
          expectedDailyYield: 15,
        });
      }
    }

    if (!animal) {
      throw new AppError('Animal not found or tag missing', 404, 'ANIMAL_NOT_FOUND');
    }

    // 2. Resolve operatorId safely (must be valid ObjectId or Admin user)
    let resolvedOperatorId = null;
    const rawOp = operatorId || data.operatorId;
    if (rawOp && mongoose.Types.ObjectId.isValid(rawOp)) {
      resolvedOperatorId = new mongoose.Types.ObjectId(rawOp);
    } else {
      const admin = await mongoose.model('User').findOne();
      resolvedOperatorId = admin?._id || null;
    }

    // 3. Normalize Date, Shift, and Yield
    const logDate = data.date ? new Date(data.date) : new Date();
    const startOfDay = new Date(logDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const shift = (data.shift || 'MORNING').toUpperCase();
    const yieldAmount = Number(data.yieldLiters ?? data.yield ?? data.quantityLiters ?? 0) || 0;

    // 4. Create or update the milking log (upsert based on animal, date, and shift)
    const milkingLog = await MilkingYieldLog.findOneAndUpdate(
      {
        animalId: animal._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        shift: shift,
      },
      {
        $set: {
          date: logDate,
          yieldLiters: yieldAmount,
          operatorId: resolvedOperatorId,
          ...(data.notes ? { notes: data.notes } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Update/append intake record in intakeHistory while preserving animal's purchase benchmark yields
    const dateStr = data.date
      ? (typeof data.date === 'string' && data.date.includes('T') ? data.date.split('T')[0] : String(data.date).slice(0, 10))
      : logDate.toISOString().split('T')[0];

    const normShiftName = shift === 'EVENING' ? 'Evening' : 'Morning';

    // Check if an entry already exists in animal's intakeHistory for this date & shift
    const existingHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
    const existingIndex = existingHistory.findIndex((h) => {
      const hDate = h.date ? (typeof h.date === 'string' && h.date.includes('T') ? h.date.split('T')[0] : String(h.date).slice(0, 10)) : '';
      const hShift = (h.shift || 'Morning').toLowerCase();
      return hDate === dateStr && hShift === normShiftName.toLowerCase();
    });

    const newIntake = {
      date: dateStr,
      shift: normShiftName,
      quantityLiters: yieldAmount,
      yieldLiters: yieldAmount,
      morning: normShiftName === 'Morning' ? yieldAmount : (existingIndex >= 0 ? (existingHistory[existingIndex].morning || 0) : 0),
      evening: normShiftName === 'Evening' ? yieldAmount : (existingIndex >= 0 ? (existingHistory[existingIndex].evening || 0) : 0),
      fat: Number(data.fat) || null,
      snf: Number(data.snf) || null,
      notes: data.notes || null,
      operator: data.operator || data.milker || null,
      operatorId: resolvedOperatorId,
      createdAt: new Date(),
    };

    if (existingIndex >= 0) {
      await Animal.updateOne(
        { _id: animal._id },
        {
          $set: {
            [`intakeHistory.${existingIndex}`]: { ...existingHistory[existingIndex], ...newIntake },
          },
        }
      );
    } else {
      await Animal.findByIdAndUpdate(animal._id, {
        $push: { intakeHistory: newIntake },
      });
    }

    // 6. Recalculate the animal's daily average yield (last 30 days)
    await this._recalculateAnimalAvgYield(animal._id);

    // Return populated log
    const populated = await MilkingYieldLog.findById(milkingLog._id)
      .populate('animalId', 'tagNumber name type species breed')
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
    let log = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      log = await MilkingYieldLog.findByIdAndDelete(id).lean();
    }

    // Pull from Animal intakeHistory by ID
    await Animal.updateMany(
      {
        $or: [
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ 'intakeHistory._id': id }] : []),
          { 'intakeHistory.id': id },
        ],
      },
      {
        $pull: {
          intakeHistory: {
            $or: [
              ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []),
              { id: id },
            ],
          },
        },
      }
    );

    if (log && log.animalId) {
      await Animal.updateOne(
        { _id: log.animalId },
        {
          $pull: {
            intakeHistory: {
              $or: [
                { _id: log._id },
                { date: log.date ? (typeof log.date === 'string' ? log.date : log.date.toISOString().split('T')[0]) : undefined, shift: log.shift },
              ],
            },
          },
        }
      );
      await this._recalculateAnimalAvgYield(log.animalId);
    }

    return log || { deleted: true };
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
