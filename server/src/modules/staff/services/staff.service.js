import Staff from '../../../models/Staff.model.js';
import User from '../../../models/User.model.js';

// Create a new staff member
export const createStaffService = async (staffData, adminUserId) => {
  const {
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
    userAccountId = null,
    staffCode,
  } = staffData;

  const contactPhone = (mobile || phone || '').trim();

  // If phone is provided, optionally check if another staff has it
  if (contactPhone) {
    const existingStaff = await Staff.findOne({ mobile: contactPhone });
    if (existingStaff) {
      const error = new Error(`Staff member with phone number '${contactPhone}' already exists.`);
      error.statusCode = 409;
      throw error;
    }
  }

  // Calculate daily salary if not explicitly provided
  const computedDaily = dailySalary !== undefined && dailySalary !== null
    ? Number(dailySalary)
    : Math.round((Number(monthlySalary) || 0) / 30);

  const newStaff = await Staff.create({
    staffCode,
    name: name.trim(),
    role: role.trim(),
    mobile: contactPhone,
    email: (email || '').trim().toLowerCase(),
    cnic: (cnic || '').trim(),
    shift,
    monthlySalary: Number(monthlySalary) || 0,
    dailySalary: computedDaily,
    status,
    route: (route || '').trim() || 'Not Assigned',
    joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
    notes: (notes || '').trim(),
    userAccountId: userAccountId || null,
    createdBy: adminUserId || null,
  });

  return newStaff;
};

// Get all staff members with filters, search, and pagination
export const getAllStaffService = async (queryParams = {}) => {
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

  const [staff, total] = await Promise.all([
    Staff.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('userAccountId', 'username email role isActive')
      .populate('createdBy', 'name username'),
    Staff.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    staff,
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
export const getStaffByIdService = async (staffId) => {
  const staff = await Staff.findById(staffId)
    .populate('userAccountId', 'username email role isActive')
    .populate('createdBy', 'name username');

  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  return staff;
};

// Update staff profile
export const updateStaffService = async (staffId, updateData) => {
  const staff = await Staff.findById(staffId);
  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  const contactPhone = (updateData.mobile || updateData.phone || '').trim();

  // If phone is modified, verify uniqueness
  if (contactPhone && contactPhone !== staff.mobile) {
    const phoneExists = await Staff.findOne({ mobile: contactPhone, _id: { $ne: staffId } });
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

  Object.assign(staff, updateData);
  await staff.save();

  return await Staff.findById(staffId)
    .populate('userAccountId', 'username email role isActive')
    .populate('createdBy', 'name username');
};

// Update staff status (Active, On Leave, Inactive, etc.)
export const setStaffStatusService = async (staffId, status) => {
  const staff = await Staff.findByIdAndUpdate(
    staffId,
    { $set: { status } },
    { returnDocument: 'after', runValidators: true }
  );

  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  return staff;
};

// Delete staff member
export const deleteStaffService = async (staffId) => {
  const staff = await Staff.findByIdAndDelete(staffId);
  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  return { message: `Staff member '${staff.name}' (${staff.staffCode || staff._id}) removed successfully.` };
};

// Get live aggregate statistics for staff
export const getStaffStatsService = async () => {
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
            totalSalary: { $sum: '$monthlySalary' },
          },
        },
      ]),
      Staff.aggregate([
        {
          $group: {
            _id: null,
            totalMonthlyPayroll: { $sum: '$monthlySalary' },
          },
        },
      ]),
    ]);

  const totalMonthlyPayrollObligation = totalSalaryAgg[0]?.totalMonthlyPayroll || 0;

  return {
    totalStaff,
    activeStaff,
    onLeaveStaff,
    inactiveStaff,
    totalMonthlyPayrollObligation,
    byRole: roleAggregation,
  };
};
