import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  setUserStatusService,
  setUserRoleService,
  resetUserPasswordService,
  deleteUserService,
  getAdminStatsService,
} from '../services/admin.service.js';

// Create a new staff user
export const createUser = async (req, res, next) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Get list of users with pagination and search/filtering
export const getUsers = async (req, res, next) => {
  try {
    const result = await getAllUsersService(req.query);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get user details by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Update user details
export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await updateUserService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Toggle or update active/inactive user status
export const setUserStatus = async (req, res, next) => {
  try {
    const currentAdminId = req.user.id;
    const updatedUser = await setUserStatusService(
      currentAdminId,
      req.params.id,
      req.body.isActive
    );

    res.status(200).json({
      success: true,
      message: `User status changed to ${updatedUser.isActive ? 'Active' : 'Inactive'}`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
export const setUserRole = async (req, res, next) => {
  try {
    const currentAdminId = req.user.id;
    const updatedUser = await setUserRoleService(
      currentAdminId,
      req.params.id,
      req.body.role
    );

    res.status(200).json({
      success: true,
      message: `User role changed to ${updatedUser.role}`,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Reset user password by Admin
export const resetUserPassword = async (req, res, next) => {
  try {
    const result = await resetUserPasswordService(req.params.id, req.body.newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
export const deleteUser = async (req, res, next) => {
  try {
    const currentAdminId = req.user.id;
    const result = await deleteUserService(currentAdminId, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Get Admin System Overview & Statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const stats = await getAdminStatsService();
    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};
