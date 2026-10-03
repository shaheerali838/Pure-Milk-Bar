import Animal from "../../../models/Animal.model.js";
import AppError from "../../../utils/AppError.js";
import { uploadToCloudinary } from "../../../config/cloudinary.js";

class AnimalService {
  async createAnimal(data) {
    let tagNumber =
      data.tagNumber || data.tag || `TAG-${Date.now().toString().slice(-4)}`;
    const isBuffalo = String(data.species || data.type || "")
      .toLowerCase()
      .includes("buffalo");
    const type = isBuffalo
      ? "BUFFALO"
      : String(data.type || "COW").toUpperCase();

    // Check for duplicate tag number
    let existingAnimal = await Animal.findOne({ tagNumber });
    if (existingAnimal) {
      tagNumber = `${tagNumber}-${Date.now().toString().slice(-3)}`;
    }

    // Process image through Cloudinary if provided
    let imageUrl = data.image || null;
    if (
      imageUrl &&
      typeof imageUrl === "string" &&
      imageUrl.startsWith("data:image")
    ) {
      imageUrl = await uploadToCloudinary(imageUrl, "puremilkbar/livestock");
    }

    const payload = {
      ...data,
      tagNumber,
      type,
      species:
        data.species || (isBuffalo ? "Buffalo (Nili Ravi)" : "Cow (Sahiwal)"),
      breed: data.breed || (isBuffalo ? "Nili Ravi" : "Sahiwal"),
      lactationStatus: data.lactationStatus || data.lactationStage || "Milking",
      lactationStage: data.lactationStage || "EARLY",
      healthStatus: data.healthStatus || "HEALTHY",
      image: imageUrl,
    };

    const animal = await Animal.create(payload);
    return animal;
  }

  async getAllAnimals(query = {}) {
    const {
      page,
      limit,
      type,
      healthStatus,
      lactationStage,
      isActive,
      search,
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 100);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};

    if (type) filter.type = type;
    if (healthStatus) filter.healthStatus = healthStatus;
    if (lactationStage) filter.lactationStage = lactationStage;
    if (typeof isActive === "boolean") filter.isActive = isActive;

    // Text search on tagNumber or name
    if (search) {
      filter.$or = [
        { tagNumber: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const [animals, total] = await Promise.all([
      Animal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Animal.countDocuments(filter),
    ]);

    return { animals, total, page: pageNum, limit: limitNum };
  }

  async getAnimalById(id) {
    const animal = await Animal.findById(id).lean();

    if (!animal) {
      throw new AppError("Animal not found", 404, "ANIMAL_NOT_FOUND");
    }

    return animal;
  }

  async updateAnimal(id, data) {
    if (data.tagNumber) {
      const existingAnimal = await Animal.findOne({
        tagNumber: data.tagNumber,
        _id: { $ne: id },
      });
      if (existingAnimal) {
        throw new AppError(
          `Animal with tag number '${data.tagNumber}' already exists`,
          409,
          "DUPLICATE_TAG_NUMBER",
        );
      }
    }

    const updatePayload = { ...data };
    if (
      updatePayload.image &&
      typeof updatePayload.image === "string" &&
      updatePayload.image.startsWith("data:image")
    ) {
      updatePayload.image = await uploadToCloudinary(
        updatePayload.image,
        "puremilkbar/livestock",
      );
    }

    // Preserve intakeHistory: if newIntake is passed, use $push instead of overwriting array
    const mongoUpdate = {};
    if (updatePayload.newIntake) {
      mongoUpdate.$push = { intakeHistory: updatePayload.newIntake };
      delete updatePayload.newIntake;
    }
    // Prevent accidental wipe of intakeHistory if empty array was submitted
    if (Array.isArray(updatePayload.intakeHistory) && updatePayload.intakeHistory.length === 0) {
      delete updatePayload.intakeHistory;
    }

    mongoUpdate.$set = updatePayload;

    const animal = await Animal.findByIdAndUpdate(id, mongoUpdate, {
      new: true,
      runValidators: true,
    }).lean();

    if (!animal) {
      throw new AppError("Animal not found", 404, "ANIMAL_NOT_FOUND");
    }

    return animal;
  }

  async addIntakeRecord(id, intakeData) {
    const animal = await Animal.findById(id);
    if (!animal) {
      throw new AppError("Animal not found", 404, "ANIMAL_NOT_FOUND");
    }

    const shift = (intakeData.shift || "MORNING").toUpperCase();
    const qty = Number(intakeData.quantityLiters ?? intakeData.yieldLiters ?? intakeData.yield ?? 0) || 0;
    const dateStr = intakeData.date
      ? (typeof intakeData.date === 'string' && intakeData.date.includes('T') ? intakeData.date.split('T')[0] : String(intakeData.date).slice(0, 10))
      : new Date().toISOString().split("T")[0];

    const newIntake = {
      date: dateStr,
      shift: shift === "EVENING" ? "Evening" : "Morning",
      quantityLiters: qty,
      yieldLiters: qty,
      fat: Number(intakeData.fat) || null,
      snf: Number(intakeData.snf) || null,
      notes: intakeData.notes || null,
      operator: intakeData.operator || intakeData.milker || null,
      createdAt: new Date(),
    };

    const updateFields = {};
    if (shift === "MORNING") updateFields.morningYield = qty;
    if (shift === "EVENING") updateFields.eveningYield = qty;

    const updated = await Animal.findByIdAndUpdate(
      id,
      {
        $set: updateFields,
        $push: { intakeHistory: newIntake },
      },
      { new: true }
    ).lean();

    return { animal: updated, newIntake };
  }

  async deleteAnimal(id) {
    const animal = await Animal.findByIdAndDelete(id).lean();

    if (!animal) {
      throw new AppError("Animal not found", 404, "ANIMAL_NOT_FOUND");
    }

    return animal;
  }

  async getAnimalStats() {
    const [stats] = await Animal.aggregate([
      {
        $facet: {
          totalActive: [{ $match: { isActive: true } }, { $count: "count" }],
          totalInactive: [{ $match: { isActive: false } }, { $count: "count" }],
          byType: [
            { $match: { isActive: true } },
            { $group: { _id: "$type", count: { $sum: 1 } } },
          ],
          byHealthStatus: [
            { $match: { isActive: true } },
            { $group: { _id: "$healthStatus", count: { $sum: 1 } } },
          ],
          byLactationStage: [
            { $match: { isActive: true } },
            { $group: { _id: "$lactationStage", count: { $sum: 1 } } },
          ],
          avgYield: [
            { $match: { isActive: true } },
            {
              $group: { _id: null, avgDailyYield: { $avg: "$dailyAvgYield" } },
            },
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
