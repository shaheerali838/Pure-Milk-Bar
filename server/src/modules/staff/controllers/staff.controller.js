import {
  createStaffService,
  getAllStaffService,
  getStaffByIdService,
  updateStaffService,
  setStaffStatusService,
  deleteStaffService,
  getStaffStatsService,
} from '../services/staff.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

// Create a new staff member (Admin Only)
export const createStaff = async (req, res, next) => {
  try {
    const adminUserId = req.user?.id;
    const staff = await createStaffService(req.body, adminUserId);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Staff member registered successfully',
      data: staff,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

// Get list of all staff with search, filters, pagination
export const getAllStaff = async (req, res, next) => {
  try {
    const result = await getAllStaffService(req.query);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Staff records retrieved successfully',
      data: result.staff,
      staff: result.staff,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get single staff member by ID
export const getStaffById = async (req, res, next) => {
  try {
    const staff = await getStaffByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: staff,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

// Update staff member details
export const updateStaff = async (req, res, next) => {
  try {
    const updatedStaff = await updateStaffService(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Staff profile updated successfully',
      data: updatedStaff,
      staff: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// Update staff status (Active, On Leave, Inactive, etc.)
export const setStaffStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedStaff = await setStaffStatusService(req.params.id, status);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Staff status changed to ${updatedStaff.status}`,
      data: updatedStaff,
      staff: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// Delete staff member
export const deleteStaff = async (req, res, next) => {
  try {
    const result = await deleteStaffService(req.params.id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// Get workforce analytics & statistics
export const getStaffStats = async (req, res, next) => {
  try {
    const stats = await getStaffStatsService();

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
