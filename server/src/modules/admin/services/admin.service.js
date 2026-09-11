import bcrypt from 'bcryptjs';
import User from '../../../models/User.model.js';

// Create a new staff user
export const createUserService = async (userData) => {
  const { username, phone, email, password, ...rest } = userData;

  // Check for duplicate username or phone
  const existingUser = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { phone },
      ...(email ? [{ email: email.toLowerCase() }] : []),
    ],
  });

  if (existingUser) {
    let field = 'User';
    if (existingUser.username === username.toLowerCase()) field = 'Username';
    else if (existingUser.phone === phone) field = 'Phone number';
    else if (email && existingUser.email === email.toLowerCase()) field = 'Email';

    const error = new Error(`${field} is already registered.`);
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    phone,
    email: email || null,
    passwordHash,
    ...rest,
  });

  return await User.findById(newUser._id).select('-passwordHash');
};

// Get paginated users with filters & search
export const getAllUsersService = async (queryParams) => {
  const {
    search = '',
    role,
    shift,
    isActive,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = queryParams;

  const filter = {};

  // Text search
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { username: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
    ];
  }

  // Exact filters
  if (role) filter.role = role;
  if (shift) filter.shift = shift;
  if (isActive !== undefined && isActive !== '') {
    filter.isActive = isActive === 'true' || isActive === true;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOption = { [sortBy]: sortDirection };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('assignedRouteId', 'runCode route shift'),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    users,
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

// Get single user details by ID
export const getUserByIdService = async (userId) => {
  const user = await User.findById(userId)
    .select('-passwordHash')
    .populate('assignedRouteId', 'runCode route shift');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// Update user details
export const updateUserService = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Check phone uniqueness if phone is being updated
  if (updateData.phone && updateData.phone !== user.phone) {
    const phoneExists = await User.findOne({ phone: updateData.phone, _id: { $ne: userId } });
    if (phoneExists) {
      const error = new Error('Phone number is already in use by another user.');
      error.statusCode = 409;
      throw error;
    }
  }

  // Check email uniqueness if email is being updated
  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
    if (emailExists) {
      const error = new Error('Email is already in use by another user.');
      error.statusCode = 409;
      throw error;
    }
  }

  Object.assign(user, updateData);
  await user.save();

  return await User.findById(userId)
    .select('-passwordHash')
    .populate('assignedRouteId', 'runCode route shift');
};

// Toggle or Set User Active/Inactive Status
export const setUserStatusService = async (currentAdminId, targetUserId, isActive) => {
  if (currentAdminId === targetUserId && !isActive) {
    const error = new Error('You cannot deactivate your own admin account.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { $set: { isActive } },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// Update User Role
export const setUserRoleService = async (currentAdminId, targetUserId, newRole) => {
  if (currentAdminId === targetUserId && newRole !== 'ADMIN') {
    const error = new Error('You cannot change your own admin account role to a non-admin role.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { $set: { role: newRole } },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// Reset User Password
export const resetUserPasswordService = async (targetUserId, newPassword) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: `Password for user '${user.username}' reset successfully.` };
};

// Delete User
export const deleteUserService = async (currentAdminId, targetUserId) => {
  if (currentAdminId === targetUserId) {
    const error = new Error('You cannot delete your own logged-in admin account.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndDelete(targetUserId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return { message: `User account '${user.username}' deleted successfully.` };
};

// Get Admin Dashboard Overview / User Statistics
export const getAdminStatsService = async () => {
  const [totalUsers, activeUsers, inactiveUsers, roleCounts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const rolesMap = {
    ADMIN: 0,
    MANAGER: 0,
    CASHIER: 0,
    RIDER: 0,
    FARM_SUPERVISOR: 0,
  };

  roleCounts.forEach((item) => {
    if (item._id in rolesMap) {
      rolesMap[item._id] = item.count;
    }
  });

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    byRole: rolesMap,
  };
};
