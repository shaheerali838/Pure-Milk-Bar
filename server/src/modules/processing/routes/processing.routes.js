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
import { authorize } from '../../../middlewares/authorize.js';
import {
  validateCreateBatch,
  validateUpdateBatch,
  validateBatchQuery,
} from '../validators/processing.validator.js';

const router = Router();

// Authentication middleware
router.use(authenticate);

// Processing Metrics & Summary Statistics
router.get('/stats', authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR'), getProcessingStats);

// Batch Collection CRUD
router
  .route('/')
  .post(authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR'), validateCreateBatch, createBatch)
  .get(authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR'), validateBatchQuery, getAllBatches);

// Individual Batch CRUD
router
  .route('/:id')
  .get(authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR'), getBatchById)
  .put(authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR'), validateUpdateBatch, updateBatch)
  .patch(authorize('ADMIN', 'MANAGER', 'FARM_SUPERVISOR'), validateUpdateBatch, updateBatch)
  .delete(authorize('ADMIN', 'MANAGER'), deleteBatch);

export default router;
