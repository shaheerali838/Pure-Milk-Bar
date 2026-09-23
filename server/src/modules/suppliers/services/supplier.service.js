import Supplier from '../../../models/Supplier.model.js';
import AppError from '../../../utils/AppError.js';

class SupplierService {
  async createSupplier(data) {
    const count = await Supplier.countDocuments();
    const code = data.code || `SUP-${count + 1001}`;
    const villageOrLocation = data.villageOrLocation || data.area || data.address || 'Central Location';
    const baseRatePerLiter = parseFloat(data.baseRatePerLiter || data.baseRate || data.ratePerLiter || 220);
    const milkType = ['COW', 'BUFFALO', 'MIXED'].includes(String(data.milkType).toUpperCase())
      ? String(data.milkType).toUpperCase()
      : 'BUFFALO';

    const normalizedData = {
      ...data,
      code,
      villageOrLocation,
      baseRatePerLiter,
      milkType,
    };

    // Check for duplicate code
    const existingCode = await Supplier.findOne({ code: normalizedData.code });
    if (existingCode) {
      normalizedData.code = `SUP-${Date.now().toString().slice(-6)}`;
    }

    // Check for duplicate phone
    const existingPhone = await Supplier.findOne({ phone: normalizedData.phone });
    if (existingPhone) {
      throw new AppError(
        `Supplier with phone '${normalizedData.phone}' already exists`,
        409,
        'DUPLICATE_SUPPLIER_PHONE'
      );
    }

    const supplier = await Supplier.create(normalizedData);
    return supplier;
  }

  async getAllSuppliers(query = {}) {
    const { page, limit, milkType, isActive, search } = query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 100);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (milkType) filter.milkType = milkType;
    if (typeof isActive === 'boolean') filter.isActive = isActive;

    // Text search on code, name, or villageOrLocation
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { villageOrLocation: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Supplier.countDocuments(filter),
    ]);

    return { suppliers, total, page: pageNum, limit: limitNum };
  }

  async getSupplierById(id) {
    const supplier = await Supplier.findById(id).lean();

    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
    }

    return supplier;
  }

  async updateSupplier(id, data) {
    // If phone is changing, check for duplicate
    if (data.phone) {
      const existingPhone = await Supplier.findOne({
        phone: data.phone,
        _id: { $ne: id },
      });
      if (existingPhone) {
        throw new AppError(
          `Supplier with phone '${data.phone}' already exists`,
          409,
          'DUPLICATE_SUPPLIER_PHONE'
        );
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
    }

    return supplier;
  }

  async deleteSupplier(id) {
    const supplier = await Supplier.findByIdAndDelete(id).lean();

    if (!supplier) {
      throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
    }

    return supplier;
  }

  async getSupplierStats() {
    const [stats] = await Supplier.aggregate([
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
          byMilkType: [
            { $match: { isActive: true } },
            { $group: { _id: '$milkType', count: { $sum: 1 } } },
          ],
          avgBaseRate: [
            { $match: { isActive: true } },
            { $group: { _id: null, avgRate: { $avg: '$baseRatePerLiter' } } },
          ],
          totalPayable: [
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$currentPayableBalance' } } },
          ],
        },
      },
    ]);

    return {
      totalActive: stats.totalActive[0]?.count || 0,
      totalInactive: stats.totalInactive[0]?.count || 0,
      byMilkType: stats.byMilkType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgBaseRatePerLiter: Number((stats.avgBaseRate[0]?.avgRate || 0).toFixed(2)),
      totalPayableBalance: Number((stats.totalPayable[0]?.total || 0).toFixed(2)),
    };
  }
}

export default new SupplierService();
