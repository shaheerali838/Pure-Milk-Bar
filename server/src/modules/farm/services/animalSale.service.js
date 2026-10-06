import mongoose from 'mongoose';
import Animal from '../../../models/Animal.model.js';
import AnimalSale from '../../../models/AnimalSale.model.js';
import AppError from '../../../utils/AppError.js';

class AnimalSaleService {
  async recordSale(data, userId = null) {
    const {
      animalId,
      salePrice,
      buyerName,
      buyerPhone,
      buyerAddress,
      saleDate,
      paymentMethod,
      hasCalfIncluded,
      notes,
    } = data;

    // Find the target animal
    let animal = null;
    if (mongoose.Types.ObjectId.isValid(animalId)) {
      animal = await Animal.findById(animalId);
    }
    if (!animal) {
      animal = await Animal.findOne({
        $or: [{ tagNumber: animalId }, { tag: animalId }],
      });
    }

    if (!animal) {
      throw new AppError('Animal not found for sale', 404, 'ANIMAL_NOT_FOUND');
    }

    const parsedSaleDate = saleDate ? new Date(saleDate) : new Date();
    const parsedPrice = Number(salePrice) || 0;

    // Create the AnimalSale record
    const saleRecord = await AnimalSale.create({
      animalId: animal._id,
      animalTag: animal.tagNumber || animal.tag,
      animalName: animal.name || '',
      species: animal.species || animal.breed || 'Cow',
      breed: animal.breed || 'Sahiwal',
      purchasePrice: animal.purchasePrice || 0,
      salePrice: parsedPrice,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone ? buyerPhone.trim() : '',
      buyerAddress: buyerAddress ? buyerAddress.trim() : '',
      saleDate: parsedSaleDate,
      paymentMethod: paymentMethod || 'Cash',
      hasCalfIncluded: Boolean(hasCalfIncluded),
      notes: notes ? notes.trim() : '',
      recordedBy: userId,
    });

    // Update the Animal document to reflect sold status
    animal.isSold = true;
    animal.isActive = false;
    animal.status = 'Sold';
    animal.lactationStatus = 'Sold';
    animal.saleDate = parsedSaleDate;
    animal.salePrice = parsedPrice;
    animal.saleNotes = notes || '';
    await animal.save();

    return {
      sale: saleRecord,
      animal,
    };
  }

  async getAllSales(query = {}) {
    const { search, limit = 100, page = 1 } = query;
    const filter = {};

    if (search) {
      filter.$or = [
        { animalTag: { $regex: search, $options: 'i' } },
        { buyerName: { $regex: search, $options: 'i' } },
        { buyerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 100);
    const skip = (pageNum - 1) * limitNum;

    const [sales, total] = await Promise.all([
      AnimalSale.find(filter)
        .populate('animalId')
        .sort({ saleDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AnimalSale.countDocuments(filter),
    ]);

    return { sales, total, page: pageNum, limit: limitNum };
  }

  async getSaleById(id) {
    const sale = await AnimalSale.findById(id).populate('animalId').lean();
    if (!sale) {
      throw new AppError('Sale record not found', 404, 'SALE_NOT_FOUND');
    }
    return sale;
  }

  async deleteSale(id) {
    const sale = await AnimalSale.findById(id);
    if (!sale) {
      throw new AppError('Sale record not found', 404, 'SALE_NOT_FOUND');
    }

    // Restore animal to active herd
    await Animal.findByIdAndUpdate(sale.animalId, {
      $set: {
        isSold: false,
        isActive: true,
        status: 'Milking',
        lactationStatus: 'Milking',
      },
      $unset: {
        saleDate: 1,
        salePrice: 1,
        saleNotes: 1,
      },
    });

    await AnimalSale.findByIdAndDelete(id);
    return { message: 'Sale record deleted and animal restored to herd' };
  }
}

export default new AnimalSaleService();
