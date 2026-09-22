import { Router } from 'express';

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  setUserStatus,
  setUserRole,
  resetUserPassword,
  deleteUser,
  getAdminStats,
} from '../controllers/admin.controller.js';

import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  setStaffStatus,
  deleteStaff,
  getStaffStats,
} from '../../staff/controllers/staff.controller.js';

import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

import {
  validateCreateUser,
  validateUpdateUser,
  validateSetStatus,
  validateSetRole,
  validateResetPassword,
} from '../validators/admin.validator.js';

import {
  validateCreateStaff,
  validateUpdateStaff,
  validateSetStatus as validateStaffSetStatus,
  validateStaffQuery,
} from '../../staff/validators/staff.validator.js';

const router = Router();

// Only authenticated users with ADMIN role can access these routes
router.use(authenticate, authorize('ADMIN'));

// Get overall statistics for the admin dashboard
router.get('/stats', getAdminStats);

// Create a new user or get the list of all users
router.route('/users')
  .post(validateCreateUser, createUser) // Create a new user
  .get(getUsers); // Get all users

// Manage a specific user by their ID
router.route('/users/:id')
  .get(getUserById)
  .put(validateUpdateUser, updateUser)
  .delete(deleteUser);

// Dedicated Staff routes
router.route('/staff')
  .post(validateCreateStaff, createStaff)
  .get(validateStaffQuery, getAllStaff);

router.get('/staff/stats', getStaffStats);

router.route('/staff/:id')
  .get(getStaffById)
  .put(validateUpdateStaff, updateStaff)
  .patch(validateUpdateStaff, updateStaff)
  .delete(deleteStaff);

router.patch('/staff/:id/status', validateStaffSetStatus, setStaffStatus);

// Settings routes
router.route('/settings')
  .get((req, res) => res.json({ success: true, data: {} }))
  .put((req, res) => res.json({ success: true, data: req.body }));

// Change the user's account status (active/inactive)
router.patch(
  '/users/:id/status',
  validateSetStatus,
  setUserStatus
);

// Change the user's role, for example STAFF to MANAGER
router.patch(
  '/users/:id/role',
  validateSetRole,
  setUserRole
);

// Allow admin to reset a user's password
router.patch(
  '/users/:id/reset-password',
  validateResetPassword,
  resetUserPassword
);

export default router;