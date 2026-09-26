import mongoose from 'mongoose';
import Staff from '../../../models/Staff.model.js';
import User from '../../../models/User.model.js';
import { ROLES } from '../../../config/rbac.config.js';

// Helper to find a staff member by Mongoose ObjectId OR custom staffCode / id
const findStaffByAnyId = async (staffId) => {
  if (!staffId) return null;
  const sStr = String(staffId).trim();
  if (mongoose.Types.ObjectId.isValid(sStr)) {
    const doc = await Staff.findById(sStr);
    if (doc) return doc;
  }
  return await Staff.findOne({
    $or: [
      { staffCode: sStr.toUpperCase() },
      { staffCode: sStr },
      { id: sStr },
    ],
  });
};

// Helper to sanitize/redact sensitive financial fields for MANAGER role
const sanitizeStaffForRole = (staffDoc, userRole) => {
  if (!staffDoc) return null;
  const staffObj = staffDoc.toObject ? staffDoc.toObject() : { ...staffDoc };

  if (userRole === ROLES.MANAGER) {
    delete staffObj.monthlySalary;
    delete staffObj.dailySalary;
  }

  return staffObj;
};

// Create a new staff member
export const createStaffService = async (staffData, user) => {
  const {
    staffCode: rawStaffCode,
    id: rawId,
    name,
    role = 'Farm Work Man',
    mobile,
    phone,
    email,
    cnic,
    shift = 'Morning',
    monthlySalary = 0,
    dailySalary,
    status = 'Active',
    route = 'Not Assigned',
    joinedDate,
    notes = '',
    image = null,
    address = '',
    emergencyContact = '',
    vehicleNumber = '',
    licenseNumber = '',
    vehicleType = 'Motorcycle',
    assignedBarn = '',
    milkingShiftSpecialization = '',
    assignedCattleCount = '',
    guardPost = '',
    weaponLicense = '',
    posRegisterId = '',
    khataAuthLimit = '',
    departmentSupervised = '',
    attendanceMap = {},
    userAccountId = null,
  } = staffData;

  const staffCode = (rawStaffCode || rawId || '').trim() || undefined;

  const contactPhone = (mobile || phone || '').trim();

  // If phone is provided, verify uniqueness
  if (contactPhone) {
    const existingStaff = await Staff.findOne({ mobile: contactPhone });
    if (existingStaff) {
      const error = new Error(`Staff member with phone number '${contactPhone}' already exists.`);
      error.statusCode = 409;
      throw error;
    }
  }

  const isManager = user?.role === ROLES.MANAGER;

  // Manager cannot set salary or terminate on creation
  const effectiveMonthlySalary = isManager ? 0 : (Number(monthlySalary) || 0);
  const computedDaily = isManager
    ? 0
    : (dailySalary !== undefined && dailySalary !== null
        ? Number(dailySalary)
        : Math.round(effectiveMonthlySalary / 30));

  const initialStatus = (isManager && status === 'Terminated') ? 'Active' : status;

  const newStaff = await Staff.create({
    staffCode,
    name: name.trim(),
    role: role.trim(),
    mobile: contactPhone,
    email: (email || '').trim().toLowerCase(),
    cnic: (cnic || '').trim(),
    shift,
    monthlySalary: effectiveMonthlySalary,
    dailySalary: computedDaily,
    status: initialStatus,
    route: (route || '').trim() || 'Not Assigned',
    joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
    notes: (notes || '').trim(),
    image,
    address,
    emergencyContact,
    vehicleNumber,
    licenseNumber,
    vehicleType,
    assignedBarn,
    milkingShiftSpecialization,
    assignedCattleCount,
    guardPost,
    weaponLicense,
    posRegisterId,
    khataAuthLimit,
    departmentSupervised,
    attendanceMap,
    userAccountId: isManager ? null : (userAccountId || null),
    createdBy: user?.id || null,
  });

  return sanitizeStaffForRole(newStaff, user?.role);
};

// Get all staff members with filters, search, and pagination
export const getAllStaffService = async (queryParams = {}, user) => {
  const {
    search = '',
    role,
    shift,
    status,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = queryParams;

  const filter = {};

  // Search by text (name, staffCode, mobile, cnic, route, role)
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { staffCode: searchRegex },
      { mobile: searchRegex },
      { cnic: searchRegex },
      { route: searchRegex },
      { role: searchRegex },
      { email: searchRegex },
    ];
  }

  // Role filter
  if (role && role !== 'all') {
    filter.role = new RegExp(role.trim(), 'i');
  }

  // Shift filter
  if (shift && shift !== 'all') {
    filter.shift = shift;
  }

  // Status filter
  if (status && status !== 'all') {
    filter.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOption = { [sortBy]: sortDirection };

  // If Manager, exclude sensitive salary fields in projection
  const isManager = user?.role === ROLES.MANAGER;
  const selectFields = isManager ? '-monthlySalary -dailySalary' : '';

  const [staffList, total] = await Promise.all([
    Staff.find(filter)
      .select(selectFields)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('userAccountId', 'username email role isActive')
      .populate('createdBy', 'name username'),
    Staff.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    staff: staffList,
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

// Get single staff profile by ID
export const getStaffByIdService = async (staffId, user) => {
  const staff = await findStaffByAnyId(staffId);

  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  const isManager = user?.role === ROLES.MANAGER;
  return sanitizeStaffForRole(staff, user?.role);
};

// Update staff profile
export const updateStaffService = async (staffId, updateData, user) => {
  const staff = await findStaffByAnyId(staffId);
  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  const isManager = user?.role === ROLES.MANAGER;

  // Protect sensitive fields from Manager modifications
  if (isManager) {
    delete updateData.monthlySalary;
    delete updateData.dailySalary;
    delete updateData.userAccountId;

    // Prevent Manager from setting status to Terminated
    if (updateData.status === 'Terminated') {
      delete updateData.status;
    }
  }

  const contactPhone = (updateData.mobile || updateData.phone || '').trim();

  // If phone is modified, verify uniqueness
  if (contactPhone && contactPhone !== staff.mobile) {
    const phoneExists = await Staff.findOne({ mobile: contactPhone, _id: { $ne: staff._id } });
    if (phoneExists) {
      const error = new Error(`Phone number '${contactPhone}' is already assigned to another staff member.`);
      error.statusCode = 409;
      throw error;
    }
    updateData.mobile = contactPhone;
  }

  if (updateData.monthlySalary !== undefined && updateData.dailySalary === undefined) {
    updateData.dailySalary = Math.round(Number(updateData.monthlySalary) / 30);
  }

  if (updateData.attendanceMap !== undefined) {
    staff.attendanceMap = {
      ...(staff.attendanceMap || {}),
      ...updateData.attendanceMap,
    };
    staff.markModified('attendanceMap');
  }

  Object.assign(staff, updateData);
  if (updateData.attendanceMap !== undefined) {
    staff.markModified('attendanceMap');
  }
  await staff.save();

  return sanitizeStaffForRole(staff, user?.role);
};

// Update staff status (Active, On Leave, Inactive, etc.)
export const setStaffStatusService = async (staffId, status, user) => {
  if (user?.role === ROLES.MANAGER && status === 'Terminated') {
    const error = new Error('Forbidden: Terminating staff members requires Owner (ADMIN) authorization.');
    error.statusCode = 403;
    throw error;
  }

  const staff = await findStaffByAnyId(staffId);
  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  staff.status = status;
  await staff.save();

  return sanitizeStaffForRole(staff, user?.role);
};

// Delete staff member (ADMIN strictly enforced)
export const deleteStaffService = async (staffId) => {
  const staff = await findStaffByAnyId(staffId);
  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  await Staff.deleteOne({ _id: staff._id });

  return { message: `Staff member '${staff.name}' (${staff.staffCode || staff._id}) removed successfully.` };
};

// Get live aggregate statistics for staff (Redacts payroll for Manager)
export const getStaffStatsService = async (user) => {
  const isManager = user?.role === ROLES.MANAGER;

  const [totalStaff, activeStaff, onLeaveStaff, inactiveStaff, roleAggregation, totalSalaryAgg] =
    await Promise.all([
      Staff.countDocuments(),
      Staff.countDocuments({ status: { $in: ['Active', 'ACTIVE'] } }),
      Staff.countDocuments({ status: { $in: ['On Leave', 'ON_LEAVE'] } }),
      Staff.countDocuments({ status: { $in: ['Inactive', 'INACTIVE', 'Off Duty', 'Terminated'] } }),
      Staff.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            totalSalary: isManager ? { $sum: 0 } : { $sum: '$monthlySalary' },
          },
        },
      ]),
      isManager
        ? Promise.resolve([{ totalMonthlyPayroll: 0 }])
        : Staff.aggregate([
            {
              $group: {
                _id: null,
                totalMonthlyPayroll: { $sum: '$monthlySalary' },
              },
            },
          ]),
    ]);

  const totalMonthlyPayrollObligation = isManager ? 0 : (totalSalaryAgg[0]?.totalMonthlyPayroll || 0);

  return {
    totalStaff,
    activeStaff,
    onLeaveStaff,
    inactiveStaff,
    totalMonthlyPayrollObligation: isManager ? undefined : totalMonthlyPayrollObligation,
    byRole: roleAggregation,
  };
};
