import Supplier from '../../../models/Supplier.model.js';
import AppError from '../../../utils/AppError.js';

class SupplierService {
  async createSupplier(data) {
    // Check for duplicate code
    const existingCode = await Supplier.findOne({ code: data.code });
    if (existingCode) {
      throw new AppError(
        `Supplier with code '${data.code}' already exists`,
        409,
        'DUPLICATE_SUPPLIER_CODE'
      );
    }

    // Check for duplicate phone
    const existingPhone = await Supplier.findOne({ phone: data.phone });
    if (existingPhone) {
      throw new AppError(
        `Supplier with phone '${data.phone}' already exists`,
        409,
        'DUPLICATE_SUPPLIER_PHONE'
      );
    }

    const supplier = await Supplier.create(data);
    return supplier;
  }

  async getAllSuppliers(query) {
    const { page, limit, milkType, isActive, search } = query;

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

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(filter),
    ]);

    return { suppliers, total, page, limit };
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
    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

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
