import {
  createBatchService,
  getAllBatchesService,
  getBatchByIdService,
  updateBatchService,
  deleteBatchService,
  getProcessingStatsService,
} from '../services/processing.service.js';

// Create a new dairy processing batch
export const createBatch = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const batch = await createBatchService(req.body, userId);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Processing batch registered successfully',
      data: batch,
      batch,
    });
  } catch (error) {
    next(error);
  }
};

// Get list of processing batches with filters, search, pagination
export const getAllBatches = async (req, res, next) => {
  try {
    const result = await getAllBatchesService(req.query);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Processing batches retrieved successfully',
      data: result.batches,
      batches: result.batches,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get single batch details by ID
export const getBatchById = async (req, res, next) => {
  try {
    const batch = await getBatchByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: batch,
      batch,
    });
  } catch (error) {
    next(error);
  }
};

// Update batch details
export const updateBatch = async (req, res, next) => {
  try {
    const updatedBatch = await updateBatchService(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Processing batch updated successfully',
      data: updatedBatch,
      batch: updatedBatch,
    });
  } catch (error) {
    next(error);
  }
};

// Delete batch
export const deleteBatch = async (req, res, next) => {
  try {
    const result = await deleteBatchService(req.params.id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Get processing analytics & statistics
export const getProcessingStats = async (req, res, next) => {
  try {
    const stats = await getProcessingStatsService();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: stats,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
