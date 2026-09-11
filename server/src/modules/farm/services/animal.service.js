/**
 * Layer 2: Animal Service — Business Logic & Transaction Orchestration
 *
 * Encapsulates 100% of business logic for the Animal domain.
 * - Accepts plain JavaScript objects, returns clean data objects.
 * - No HTTP protocol awareness (no req/res objects).
 * - Throws descriptive operational errors using AppError.
 */
import Animal from '../../../models/Animal.model.js';
import AppError from '../../../utils/AppError.js';

class AnimalService {
  /**
   * Create a new animal in the livestock directory.
   * @param {object} data - Validated animal data
   * @returns {Promise<object>} Created animal document
   */
  async createAnimal(data) {
    // Check for duplicate tag number
    const existingAnimal = await Animal.findOne({ tagNumber: data.tagNumber });
    if (existingAnimal) {
      throw new AppError(
        `Animal with tag number '${data.tagNumber}' already exists`,
        409,
        'DUPLICATE_TAG_NUMBER'
      );
    }

    const animal = await Animal.create(data);
    return animal;
  }

  /**
   * Get all animals with filtering, search, and pagination.
   * @param {object} query - Validated query parameters
   * @returns {Promise<{animals: Array, total: number, page: number, limit: number}>}
   */
  async getAllAnimals(query) {
    const { page, limit, type, healthStatus, lactationStage, isActive, search } = query;

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

    const skip = (page - 1) * limit;

    const [animals, total] = await Promise.all([
      Animal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Animal.countDocuments(filter),
    ]);

    return { animals, total, page, limit };
  }

  /**
   * Get a single animal by ID.
   * @param {string} id - Animal ObjectId
   * @returns {Promise<object>} Animal document
   */
  async getAnimalById(id) {
    const animal = await Animal.findById(id).lean();

    if (!animal) {
      throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
    }

    return animal;
  }

  /**
   * Update an existing animal.
   * @param {string} id - Animal ObjectId
   * @param {object} data - Validated update data
   * @returns {Promise<object>} Updated animal document
   */
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

  /**
   * Soft-delete an animal (set isActive = false).
   * Animals are never physically deleted from the database.
   * @param {string} id - Animal ObjectId
   * @returns {Promise<object>} Deactivated animal document
   */
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

  /**
   * Get aggregate statistics for the livestock directory.
   * @returns {Promise<object>} Summary statistics
   */
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
