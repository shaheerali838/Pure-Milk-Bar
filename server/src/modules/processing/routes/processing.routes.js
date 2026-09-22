import { Router } from 'express';
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getProcessingStats,
} from '../controllers/processing.controller.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import {
  validateCreateBatch,
  validateUpdateBatch,
  validateBatchQuery,
} from '../validators/processing.validator.js';

const router = Router();

// Authentication middleware
router.use(authenticate);

// Processing Metrics & Summary Statistics
router.get('/stats', getProcessingStats);

// Batch Collection CRUD
router
  .route('/')
  .post(validateCreateBatch, createBatch)
  .get(validateBatchQuery, getAllBatches);

// Individual Batch CRUD
router
  .route('/:id')
  .get(getBatchById)
  .put(validateUpdateBatch, updateBatch)
  .patch(validateUpdateBatch, updateBatch)
  .delete(deleteBatch);

export default router;
