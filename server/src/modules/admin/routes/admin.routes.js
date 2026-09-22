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

import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize } from '../../../middlewares/authorize.js';

import {
  validateCreateUser,
  validateUpdateUser,
  validateSetStatus,
  validateSetRole,
  validateResetPassword,
} from '../validators/admin.validator.js';

const router = Router();

// Only authenticated users with ADMIN role can access these routes
router.use(authenticate, authorize('ADMIN'));

// Get overall statistics for the admin dashboard
router.get('/stats', getAdminStats);

// Create a new user or get the list of all users
router.route('/users')
  .post(validateCreateUser, createUser) // Create a new user
  .get(getUsers); // Get all users

router.route('/staff')
  .post(createUser)
  .get(getUsers);

// Manage a specific user by their ID
router.route('/users/:id')
  .get(getUserById) // Get user details by ID
  .put(validateUpdateUser, updateUser) // Update user information
  .delete(deleteUser); // Delete a user

router.route('/staff/:id')
  .get(getUserById)
  .put(updateUser)
  .patch(updateUser)
  .delete(deleteUser);

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