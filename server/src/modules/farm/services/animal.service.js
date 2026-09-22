import Animal from '../../../models/Animal.model.js';
import AppError from '../../../utils/AppError.js';

class AnimalService {
  async createAnimal(data) {
    let tagNumber = data.tagNumber || data.tag || `TAG-${Date.now().toString().slice(-4)}`;
    const isBuffalo = String(data.species || data.type || '').toLowerCase().includes('buffalo');
    const type = isBuffalo ? 'BUFFALO' : (String(data.type || 'COW').toUpperCase());

    // Check for duplicate tag number
    let existingAnimal = await Animal.findOne({ tagNumber });
    if (existingAnimal) {
      tagNumber = `${tagNumber}-${Date.now().toString().slice(-3)}`;
    }

    const payload = {
      ...data,
      tagNumber,
      type,
      species: data.species || (isBuffalo ? 'Buffalo (Nili Ravi)' : 'Cow (Sahiwal)'),
      breed: data.breed || (isBuffalo ? 'Nili Ravi' : 'Sahiwal'),
      lactationStatus: data.lactationStatus || data.lactationStage || 'Milking',
      lactationStage: data.lactationStage || 'EARLY',
      healthStatus: data.healthStatus || 'HEALTHY',
    };

    const animal = await Animal.create(payload);
    return animal;
  }

  async getAllAnimals(query = {}) {
    const { page, limit, type, healthStatus, lactationStage, isActive, search } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 100);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};

    if (type) filter.type = type;
    if (healthStatus) filter.healthStatus = healthStatus;
    if (lactationStage) filter.lactationStage = lactationStage;
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    // Text search on tagNumber or name
    if (search) {
      filter.$or = [
        { tagNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [animals, total] = await Promise.all([
      Animal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Animal.countDocuments(filter),
    ]);

    return { animals, total, page: pageNum, limit: limitNum };
  }

  async getAnimalById(id) {
    const animal = await Animal.findById(id).lean();

    if (!animal) {
      throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
    }

    return animal;
  }

  async updateAnimal(id, data) {
    // If tagNumber is being changed, check for duplicates
    if (data.tagNumber) {
      const existingAnimal = await Animal.findOne({
        tagNumber: data.tagNumber,
        _id: { $ne: id },
      });
      if (existingAnimal) {
        throw new AppError(
          `Animal with tag number '${data.tagNumber}' already exists`,
          409,
          'DUPLICATE_TAG_NUMBER'
        );
      }
    }

    const animal = await Animal.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!animal) {
      throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
    }

    return animal;
  }

  async deleteAnimal(id) {
    const animal = await Animal.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!animal) {
      throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
    }

    return animal;
  }

  async getAnimalStats() {
    const [stats] = await Animal.aggregate([
      {
        $facet: {
          totalActive: [
            { $match: { isActive: true } },
            { $count: 'count' },
          ],
          totalInactive: [
            { $match: { isActive: false } },
            { $count: 'count' },
          ],
          byType: [
            { $match: { isActive: true } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
          ],
          byHealthStatus: [
            { $match: { isActive: true } },
            { $group: { _id: '$healthStatus', count: { $sum: 1 } } },
          ],
          byLactationStage: [
            { $match: { isActive: true } },
            { $group: { _id: '$lactationStage', count: { $sum: 1 } } },
          ],
          avgYield: [
            { $match: { isActive: true } },
            { $group: { _id: null, avgDailyYield: { $avg: '$dailyAvgYield' } } },
          ],
        },
      },
    ]);

    return {
      totalActive: stats.totalActive[0]?.count || 0,
      totalInactive: stats.totalInactive[0]?.count || 0,
      byType: stats.byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byHealthStatus: stats.byHealthStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byLactationStage: stats.byLactationStage.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgDailyYield: Number((stats.avgYield[0]?.avgDailyYield || 0).toFixed(2)),
    };
  }
}

export default new AnimalService();
