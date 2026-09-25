import ProcessingBatch from '../../../models/ProcessingBatch.model.js';
import User from '../../../models/User.model.js';
import AppError from '../../../utils/AppError.js';

// Parse numeric value from string (e.g. "100 L" -> 100, "4.5%" -> 4.5)
const parseNumeric = (val, fallback = 0) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return val;
  const match = String(val).match(/[-+]?[0-9]*\.?[0-9]+/);
  return match ? parseFloat(match[0]) : fallback;
};

// Create a new dairy processing batch
export const createBatchService = async (batchData, userId) => {
  const {
    batchNumber,
    product = 'Dahi (Plain)',
    milkUsed,
    milkUsedLiters,
    milkUsedQuantity,
    output,
    outputQuantity,
    outputUnit = 'kg',
    fat,
    fatPercentage,
    date,
    status = 'Completed',
    stage,
    source = 'Farm & Supplier Mix',
    farmMilkUsed = 0,
    supplierMilkUsed = 0,
    posRate = 'Rs. 320 / kg',
    costEstimate = 0,
    notes = '',
  } = batchData;

  const resolvedMilkUsed = milkUsedLiters !== undefined && milkUsedLiters !== null
    ? Number(milkUsedLiters)
    : (milkUsedQuantity !== undefined && milkUsedQuantity !== null ? Number(milkUsedQuantity) : parseNumeric(milkUsed, 0));

  const resolvedOutputQty = outputQuantity !== undefined && outputQuantity !== null
    ? Number(outputQuantity)
    : parseNumeric(output, Math.round(resolvedMilkUsed * 0.9));

  const resolvedFat = fatPercentage !== undefined && fatPercentage !== null
    ? Number(fatPercentage)
    : parseNumeric(fat, 4.5);

  const resolvedStage = stage || (['completed', 'ready_for_pos', 'pos'].includes(String(status).toLowerCase()) ? 'pos' : 'incubating');

  const newBatch = await ProcessingBatch.create({
    batchNumber,
    product: product.trim(),
    milkUsedLiters: resolvedMilkUsed,
    outputQuantity: resolvedOutputQty,
    outputUnit: outputUnit || 'kg',
    output: output ? String(output).trim() : `${resolvedOutputQty} ${outputUnit || 'kg'}`,
    fatPercentage: resolvedFat,
    date: date ? new Date(date) : new Date(),
    status,
    stage: resolvedStage,
    source: source || 'Farm & Supplier Mix',
    farmMilkUsed: Number(farmMilkUsed) || 0,
    supplierMilkUsed: Number(supplierMilkUsed) || 0,
    posRate: posRate || 'Rs. 320 / kg',
    costEstimate: Number(costEstimate) || 0,
    notes: (notes || '').trim(),
    operatorId: userId || null,
  });

  // If batch is completed or ready for POS, increment matching Product stock if exists
  if (resolvedStage === 'pos' || ['completed', 'ready_for_pos'].includes(String(status).toLowerCase())) {
    try {
      const Product = (await import('../../../models/Product.model.js')).default;
      const productRegex = new RegExp(`^${product.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
      await Product.findOneAndUpdate(
        { $or: [{ name: productRegex }, { sku: productRegex }] },
        { $inc: { currentStock: resolvedOutputQty } }
      );
    } catch (_) {}
  }

  return newBatch;
};

// Get all processing batches with search, filters, pagination
export const getAllBatchesService = async (queryParams = {}) => {
  const {
    search = '',
    product,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    sortBy = 'date',
    sortOrder = 'desc',
  } = queryParams;

  const filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { product: searchRegex },
      { batchNumber: searchRegex },
      { notes: searchRegex },
    ];
  }

  if (product && product !== 'all') {
    filter.product = new RegExp(product.trim(), 'i');
  }

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOption = { [sortBy]: sortDirection };

  const [batches, total] = await Promise.all([
    ProcessingBatch.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('operatorId', 'name username')
      .lean(),
    ProcessingBatch.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  // Normalize batch records for direct frontend consumption
  const normalizedBatches = batches.map((b) => ({
    ...b,
    id: b.batchNumber || b._id.toString(),
    _id: b._id,
    stage: b.stage || (['completed', 'ready_for_pos'].includes(String(b.status).toLowerCase()) ? 'pos' : 'incubating'),
    source: b.source || 'Farm & Supplier Mix',
    farmMilkUsed: b.farmMilkUsed || 0,
    supplierMilkUsed: b.supplierMilkUsed || 0,
    posRate: b.posRate || 'Rs. 320 / kg',
    milkUsed: `${b.milkUsedLiters || 0} L`,
    milkUsedQuantity: b.milkUsedLiters || 0,
    output: b.output || `${b.outputQuantity || 0} ${b.outputUnit || 'kg'}`,
    outputQuantity: b.outputQuantity || 0,
    outputVal: b.outputQuantity || 0,
    milkUsedVal: b.milkUsedLiters || 0,
    fat: `${b.fatPercentage || 0}%`,
    date: b.date ? new Date(b.date).toISOString().split('T')[0] : '',
  }));

  return {
    batches: normalizedBatches,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

// Get single processing batch by ID
export const getBatchByIdService = async (batchId) => {
  const batch = await ProcessingBatch.findById(batchId)
    .populate('operatorId', 'name username')
    .lean();

  if (!batch) {
    throw new AppError('Processing batch not found.', 404, 'BATCH_NOT_FOUND');
  }

  return {
    ...batch,
    id: batch.batchNumber || batch._id.toString(),
    stage: batch.stage || (['completed', 'ready_for_pos'].includes(String(batch.status).toLowerCase()) ? 'pos' : 'incubating'),
    source: batch.source || 'Farm & Supplier Mix',
    farmMilkUsed: batch.farmMilkUsed || 0,
    supplierMilkUsed: batch.supplierMilkUsed || 0,
    posRate: batch.posRate || 'Rs. 320 / kg',
    milkUsed: `${batch.milkUsedLiters || 0} L`,
    milkUsedQuantity: batch.milkUsedLiters || 0,
    output: batch.output || `${batch.outputQuantity || 0} ${batch.outputUnit || 'kg'}`,
    outputQuantity: batch.outputQuantity || 0,
    outputVal: batch.outputQuantity || 0,
    milkUsedVal: batch.milkUsedLiters || 0,
    fat: `${batch.fatPercentage || 0}%`,
    date: batch.date ? new Date(batch.date).toISOString().split('T')[0] : '',
  };
};

// Update processing batch
export const updateBatchService = async (batchId, updateData) => {
  const batch = await ProcessingBatch.findById(batchId);
  if (!batch) {
    throw new AppError('Processing batch not found.', 404, 'BATCH_NOT_FOUND');
  }

  if (updateData.milkUsed !== undefined && updateData.milkUsedLiters === undefined) {
    updateData.milkUsedLiters = parseNumeric(updateData.milkUsed, batch.milkUsedLiters);
  }

  if (updateData.fat !== undefined && updateData.fatPercentage === undefined) {
    updateData.fatPercentage = parseNumeric(updateData.fat, batch.fatPercentage);
  }

  if (updateData.output !== undefined && updateData.outputQuantity === undefined) {
    updateData.outputQuantity = parseNumeric(updateData.output, batch.outputQuantity);
  }

  const prevStage = batch.stage;
  Object.assign(batch, updateData);
  await batch.save();

  // If stage changed to 'pos', update product currentStock if matching product exists
  if (batch.stage === 'pos' && prevStage !== 'pos') {
    try {
      const Product = (await import('../../../models/Product.model.js')).default;
      const productRegex = new RegExp(`^${batch.product.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');
      await Product.findOneAndUpdate(
        { $or: [{ name: productRegex }, { sku: productRegex }] },
        { $inc: { currentStock: batch.outputQuantity } }
      );
    } catch (_) {}
  }

  const updated = await ProcessingBatch.findById(batchId)
    .populate('operatorId', 'name username')
    .lean();

  return {
    ...updated,
    id: updated.batchNumber || updated._id.toString(),
    stage: updated.stage || 'pos',
    source: updated.source || 'Farm & Supplier Mix',
    farmMilkUsed: updated.farmMilkUsed || 0,
    supplierMilkUsed: updated.supplierMilkUsed || 0,
    posRate: updated.posRate || 'Rs. 320 / kg',
    milkUsed: `${updated.milkUsedLiters || 0} L`,
    milkUsedQuantity: updated.milkUsedLiters || 0,
    output: updated.output || `${updated.outputQuantity || 0} ${updated.outputUnit || 'kg'}`,
    outputQuantity: updated.outputQuantity || 0,
    outputVal: updated.outputQuantity || 0,
    milkUsedVal: updated.milkUsedLiters || 0,
    fat: `${updated.fatPercentage || 0}%`,
    date: updated.date ? new Date(updated.date).toISOString().split('T')[0] : '',
  };
};

// Delete processing batch
export const deleteBatchService = async (batchId) => {
  const batch = await ProcessingBatch.findByIdAndDelete(batchId);
  if (!batch) {
    throw new AppError('Processing batch not found.', 404, 'BATCH_NOT_FOUND');
  }

  return { message: `Processing batch '${batch.batchNumber || batch._id}' deleted successfully.` };
};

// Get aggregate statistics for processing batches
export const getProcessingStatsService = async () => {
  const [totalBatches, completedBatches, inProgressBatches, aggregates, byProduct] = await Promise.all([
    ProcessingBatch.countDocuments(),
    ProcessingBatch.countDocuments({ status: { $in: ['Completed', 'COMPLETED'] } }),
    ProcessingBatch.countDocuments({ status: { $in: ['In Progress', 'IN_PROGRESS'] } }),
    ProcessingBatch.aggregate([
      {
        $group: {
          _id: null,
          totalMilkUsed: { $sum: '$milkUsedLiters' },
          totalOutputProduced: { $sum: '$outputQuantity' },
        },
      },
    ]),
    ProcessingBatch.aggregate([
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 },
          totalMilkUsed: { $sum: '$milkUsedLiters' },
          totalOutput: { $sum: '$outputQuantity' },
        },
      },
    ]),
  ]);

  const summary = aggregates[0] || { totalMilkUsed: 0, totalOutputProduced: 0 };

  return {
    totalBatches,
    completedBatches,
    inProgressBatches,
    totalMilkUsedLiters: Number(summary.totalMilkUsed.toFixed(1)),
    totalOutputProduced: Number(summary.totalOutputProduced.toFixed(1)),
    byProduct,
  };
};
