import { Router } from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  setStaffStatus,
  deleteStaff,
  getStaffStats,
  sendStaffCredentials,
  payStaffSalary,
  getStaffSalaries,
  deleteSalaryPayment,
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

// Base authentication for all staff endpoints
router.use(authenticate);

// Workforce Analytics & Summary Statistics (ADMIN & MANAGER)
router.get('/stats', authorize('ADMIN', 'MANAGER'), getStaffStats);

// Salary Payments Collection & History (strictly before /:id routes)
router
  .route('/salaries')
  .get(authorize('ADMIN', 'MANAGER'), getStaffSalaries)
  .post(authorize('ADMIN', 'MANAGER'), payStaffSalary);

router.delete('/salaries/:salaryId', authorize('ADMIN'), deleteSalaryPayment);

// Send / Resend Login Credentials Email (strictly ADMIN)
router.post('/:id/send-credentials', authorize('ADMIN'), sendStaffCredentials);

// Staff-specific Salary payment & history
router
  .route('/:id/salaries')
  .get(authorize('ADMIN', 'MANAGER'), getStaffSalaries)
  .post(authorize('ADMIN', 'MANAGER'), payStaffSalary);

router.post('/:id/pay-salary', authorize('ADMIN', 'MANAGER'), payStaffSalary);

// Staff Collection CRUD (ADMIN & MANAGER)
router
  .route('/')
  .get(authorize('ADMIN', 'MANAGER'), validateStaffQuery, getAllStaff)
  .post(authorize('ADMIN', 'MANAGER'), validateCreateStaff, createStaff);

// Staff Status Toggle (ADMIN & MANAGER)
router.patch('/:id/status', authorize('ADMIN', 'MANAGER'), validateSetStatus, setStaffStatus);

// Individual Staff CRUD
router
  .route('/:id')
  .get(authorize('ADMIN', 'MANAGER'), getStaffById)
  .put(authorize('ADMIN', 'MANAGER'), validateUpdateStaff, updateStaff)
  .patch(authorize('ADMIN', 'MANAGER'), validateUpdateStaff, updateStaff)
  .delete(authorize('ADMIN'), deleteStaff); // Strictly ADMIN delete

export default router;
