import { Router } from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  setStaffStatus,
  deleteStaff,
  getStaffStats,
} from '../controllers/staff.controller.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';
import {
  validateCreateStaff,
  validateUpdateStaff,
  validateSetStatus,
  validateStaffQuery,
} from '../validators/staff.validator.js';

const router = Router();

// Restrict all staff management operations to authenticated ADMIN users
router.use(authenticate, authorize('ADMIN'));

// Workforce Analytics & Summary Statistics
router.get('/stats', getStaffStats);

// Staff Collection CRUD
router
  .route('/')
  .post(validateCreateStaff, createStaff)
  .get(validateStaffQuery, getAllStaff);

// Staff Status Toggle
router.patch('/:id/status', validateSetStatus, setStaffStatus);

// Individual Staff CRUD
router
  .route('/:id')
  .get(getStaffById)
  .put(validateUpdateStaff, updateStaff)
  .patch(validateUpdateStaff, updateStaff)
  .delete(deleteStaff);

export default router;
