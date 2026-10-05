import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Staff from '../../../models/Staff.model.js';
import User from '../../../models/User.model.js';
import Expense from '../../../models/Expense.model.js';
import SalaryPayment from '../../../models/SalaryPayment.model.js';
import { ROLES } from '../../../config/rbac.config.js';
import { sendStaffCredentialsEmail } from '../../../utils/email.util.js';
import { uploadToCloudinary } from '../../../config/cloudinary.js';

// Helper to map human-readable staff designation to RBAC User Role
export const mapStaffRoleToUserRole = (staffRole) => {
  const r = (staffRole || '').toLowerCase().trim();
  if (r.includes('manager')) return ROLES.MANAGER;
  if (r.includes('cashier')) return ROLES.CASHIER;
  if (r.includes('farm') || r.includes('supervisor') || r.includes('milking') || r.includes('livestock')) return ROLES.FARM_SUPERVISOR;
  if (r.includes('rider') || r.includes('delivery')) return ROLES.RIDER;
  return ROLES.CASHIER;
};

// Helper to generate a strong random temporary password
export const generateSecurePassword = (length = 10) => {
  const letters = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const specials = '!@#$%';
  let pwd = 'Pmb@';
  const allChars = letters + numbers + specials;
  for (let i = 0; i < length - 4; i++) {
    pwd += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  return pwd;
};

// Helper to generate a clean unique username for new staff user
const generateUniqueUsername = async (name, email) => {
  let base = '';
  if (email && email.includes('@')) {
    base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  } else if (name) {
    base = name.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
  } else {
    base = 'staff';
  }

  if (base.length < 3) base = `staff_${base}`;
  base = base.substring(0, 16);

  let candidate = base;
  let counter = 1;
  while (await User.findOne({ username: candidate })) {
    candidate = `${base}${Math.floor(100 + Math.random() * 900)}`;
    counter++;
    if (counter > 10) {
      candidate = `${base}_${Date.now().toString().slice(-4)}`;
      break;
    }
  }
  return candidate;
};

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
    email: rawEmail,
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
    createLoginAccount,
    sendEmailCredentials = true,
    username: customUsername,
    password: customPassword,
    portalUrl,
  } = staffData;

  const staffCode = (rawStaffCode || rawId || '').trim() || undefined;
  const contactPhone = (mobile || phone || '').trim();
  const email = (rawEmail || '').trim().toLowerCase();

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
  const isOwner = user?.role === ROLES.ADMIN || !user || (user?.role || '').toUpperCase() === 'ADMIN';

  // Manager cannot set salary or terminate on creation
  const effectiveMonthlySalary = isManager ? 0 : (Number(monthlySalary) || 0);
  const computedDaily = isManager
    ? 0
    : (dailySalary !== undefined && dailySalary !== null
        ? Number(dailySalary)
        : Math.round(effectiveMonthlySalary / 30));

  const initialStatus = (isManager && status === 'Terminated') ? 'Active' : status;

  // Determine if login account should be provisioned
  // Auto-enabled for Owner enrolling Manager, Cashier, Farm Supervisor, Delivery Rider or if explicitly requested
  const normalizedRoleName = role.toLowerCase();
  const shouldCreateAccount =
    isOwner &&
    !isManager &&
    (createLoginAccount === true ||
      customPassword ||
      (createLoginAccount !== false &&
        (normalizedRoleName.includes('manager') ||
          normalizedRoleName.includes('cashier') ||
          normalizedRoleName.includes('supervisor') ||
          normalizedRoleName.includes('rider') ||
          normalizedRoleName.includes('accountant'))));

  let linkedUserDoc = null;
  let generatedPlainPassword = null;
  let emailDispatchResult = null;

  if (shouldCreateAccount && (email || customUsername)) {
    const mappedRole = mapStaffRoleToUserRole(role);
    const targetUsername = customUsername ? customUsername.trim().toLowerCase() : await generateUniqueUsername(name, email);
    generatedPlainPassword = customPassword && customPassword.trim() ? customPassword.trim() : generateSecurePassword(10);

    // Check if user already exists
    let existingUser = await User.findOne({
      $or: [
        { username: targetUsername },
        ...(email ? [{ email }] : []),
      ],
    });

    if (existingUser) {
      linkedUserDoc = existingUser;
      // Update role/active if necessary
      linkedUserDoc.role = mappedRole;
      linkedUserDoc.isActive = true;
      if (email && !linkedUserDoc.email) linkedUserDoc.email = email;
      await linkedUserDoc.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(generatedPlainPassword, salt);
      const userPhone = contactPhone || `+92300${Math.floor(1000000 + Math.random() * 9000000)}`;

      linkedUserDoc = await User.create({
        username: targetUsername,
        name: name.trim(),
        phone: userPhone,
        email: email || null,
        passwordHash,
        role: mappedRole,
        shift: shift ? shift.toUpperCase().replace(/\s+/g, '_') : 'MORNING',
        isActive: true,
      });
    }

    // Send credentials onboarding email if email is provided
    if (email && sendEmailCredentials !== false) {
      emailDispatchResult = await sendStaffCredentialsEmail({
        email,
        name: name.trim(),
        username: linkedUserDoc.username,
        password: generatedPlainPassword,
        role: mappedRole,
        shift,
        portalUrl,
      });
    }
  }

  const finalUserAccountId = isManager ? null : (linkedUserDoc?._id || userAccountId || null);

  let staffImageUrl = image;
  if (staffImageUrl && typeof staffImageUrl === 'string' && staffImageUrl.startsWith('data:image')) {
    staffImageUrl = await uploadToCloudinary(staffImageUrl, 'puremilkbar/staff');
  }

  const newStaff = await Staff.create({
    staffCode,
    name: name.trim(),
    role: role.trim(),
    mobile: contactPhone,
    email,
    cnic: (cnic || '').trim(),
    shift,
    monthlySalary: effectiveMonthlySalary,
    dailySalary: computedDaily,
    status: initialStatus,
    route: (route || '').trim() || 'Not Assigned',
    joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
    notes: (notes || '').trim(),
    image: staffImageUrl,
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
    userAccountId: finalUserAccountId,
    createdBy: user?.id && mongoose.Types.ObjectId.isValid(user.id) ? user.id : null,
  });

  const sanitized = sanitizeStaffForRole(newStaff, user?.role);

  // If credentials were created, attach credentials summary for Owner confirmation
  if (linkedUserDoc) {
    sanitized.accountDetails = {
      userId: linkedUserDoc._id,
      username: linkedUserDoc.username,
      email: linkedUserDoc.email || email,
      role: linkedUserDoc.role,
      temporaryPassword: generatedPlainPassword,
      emailSent: emailDispatchResult?.success ?? false,
      emailPreviewUrl: emailDispatchResult?.previewUrl || null,
    };
  }

  return sanitized;
};

// Explicitly send or re-send login credentials to a staff member (Owner only)
export const sendStaffCredentialsService = async (staffId, customData = {}, user) => {
  const staff = await findStaffByAnyId(staffId);
  if (!staff) {
    const error = new Error('Staff member not found.');
    error.statusCode = 404;
    throw error;
  }

  const targetEmail = (customData.email || staff.email || '').trim().toLowerCase();
  if (!targetEmail || !targetEmail.includes('@')) {
    const error = new Error(`Staff member '${staff.name}' does not have a valid email address. Please update their email first.`);
    error.statusCode = 400;
    throw error;
  }

  // Update staff email if new one provided
  if (customData.email && customData.email.trim() !== staff.email) {
    staff.email = targetEmail;
    await staff.save();
  }

  const mappedRole = mapStaffRoleToUserRole(staff.role);
  const plainPassword = customData.password && customData.password.trim() ? customData.password.trim() : generateSecurePassword(10);

  let userDoc = null;
  if (staff.userAccountId) {
    userDoc = await User.findById(staff.userAccountId);
  }

  if (!userDoc) {
    userDoc = await User.findOne({
      $or: [
        { email: targetEmail },
        ...(staff.mobile ? [{ phone: staff.mobile }] : []),
      ],
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(plainPassword, salt);

  if (userDoc) {
    userDoc.passwordHash = passwordHash;
    userDoc.role = mappedRole;
    userDoc.isActive = true;
    userDoc.email = targetEmail;
    await userDoc.save();
  } else {
    const targetUsername = customData.username ? customData.username.trim().toLowerCase() : await generateUniqueUsername(staff.name, targetEmail);
    const userPhone = staff.mobile || `+92300${Math.floor(1000000 + Math.random() * 9000000)}`;

    userDoc = await User.create({
      username: targetUsername,
      name: staff.name,
      phone: userPhone,
      email: targetEmail,
      passwordHash,
      role: mappedRole,
      shift: staff.shift ? staff.shift.toUpperCase().replace(/\s+/g, '_') : 'MORNING',
      isActive: true,
    });

    staff.userAccountId = userDoc._id;
    await staff.save();
  }

  const emailResult = await sendStaffCredentialsEmail({
    email: targetEmail,
    name: staff.name,
    username: userDoc.username,
    password: plainPassword,
    role: mappedRole,
    shift: staff.shift,
    portalUrl: customData.portalUrl,
  });

  return {
    success: true,
    message: emailResult.success
      ? `Login credentials successfully emailed to ${targetEmail}`
      : `Credentials generated, but email delivery encountered a notice: ${emailResult.error || 'Check server logs'}`,
    emailSent: emailResult.success,
    previewUrl: emailResult.previewUrl,
    accountDetails: {
      userId: userDoc._id,
      username: userDoc.username,
      email: targetEmail,
      role: mappedRole,
      temporaryPassword: plainPassword,
    },
  };
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

  if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
    updateData.image = await uploadToCloudinary(updateData.image, 'puremilkbar/staff');
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

// Disburse Staff Salary: creates SalaryPayment document, creates Expense document, and marks Staff as Paid in DB
export const payStaffSalaryService = async (payload, user) => {
  const {
    staffId,
    id,
    amount,
    amountPaid,
    paymentDate,
    paymentMethod = 'CASH',
    notes = '',
    monthYear,
    absentDays = 0,
    deduction = 0,
  } = payload;

  const targetStaffId = staffId || id;
  const staff = await findStaffByAnyId(targetStaffId);
  if (!staff) {
    const error = new Error(`Staff member with ID '${targetStaffId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const finalAmount = Number(amountPaid !== undefined ? amountPaid : amount) || 0;
  if (finalAmount <= 0) {
    const error = new Error('Salary payment amount must be greater than zero.');
    error.statusCode = 400;
    throw error;
  }

  const pDate = paymentDate ? new Date(paymentDate) : new Date();
  const dateStr = paymentDate
    ? (typeof paymentDate === 'string' ? paymentDate.slice(0, 10) : new Date(paymentDate).toISOString().split('T')[0])
    : new Date().toISOString().split('T')[0];

  const currentMonthStr = monthYear || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // STRICT RULE: Only allow paying salary ONCE per staff per month ("only one time i pay the salery in staff")
  const existingPayment = await SalaryPayment.findOne({
    staffId: staff._id,
    monthYear: currentMonthStr,
    status: 'Paid',
  });

  if (existingPayment) {
    const error = new Error(`Salary for ${staff.name} has already been paid for ${currentMonthStr}. Staff can only be paid once per month.`);
    error.statusCode = 400;
    throw error;
  }

  // 1. Create corresponding Expense in DB (Farm Operating Expenses)
  const expenseDoc = await Expense.create({
    scope: 'FARM',
    category: 'SALARIES',
    title: `Staff Salary: ${staff.name}`,
    amountRupees: finalAmount,
    paymentMethod: ['CASH', 'ONLINE', 'CHEQUE'].includes(String(paymentMethod).toUpperCase())
      ? String(paymentMethod).toUpperCase()
      : 'CASH',
    date: pDate,
    description: `Staff Salary disbursed to ${staff.name} (${staff.role || 'Staff'}) for ${currentMonthStr}. Absent Days: ${absentDays}, Deduction: Rs. ${Number(deduction || 0).toLocaleString()}`,
    notes: notes || '',
    authorizedBy: user?.name || 'Admin',
    loggedByUserId: user?._id || null,
  });

  // 2. Create SalaryPayment record in DB
  const paymentDoc = await SalaryPayment.create({
    staffId: staff._id,
    staffCode: staff.staffCode || '',
    staffName: staff.name,
    role: staff.role || 'Farm Staff',
    monthlySalary: staff.monthlySalary || 0,
    dailySalary: staff.dailySalary || Math.round((staff.monthlySalary || 0) / 30),
    absentDays: Number(absentDays) || 0,
    deduction: Number(deduction) || 0,
    amount: finalAmount,
    amountPaid: finalAmount,
    status: 'Paid',
    paymentDate: pDate,
    date: dateStr,
    monthYear: currentMonthStr,
    paymentMethod: expenseDoc.paymentMethod,
    notes: notes || '',
    expenseId: expenseDoc._id,
    paidBy: user?._id || null,
  });

  // 3. Update Staff status to Paid in DB
  staff.salaryStatus = 'Paid';
  staff.salaryPaidDate = pDate;
  staff.salaryPaidMonth = currentMonthStr;
  await staff.save();

  // 4. Ensure bidirectional link between Expense and SalaryPayment
  try {
    expenseDoc.salaryPaymentId = paymentDoc._id;
    await expenseDoc.save();
  } catch (err) {
    console.error('Error linking salaryPaymentId to expenseDoc:', err);
  }

  return {
    success: true,
    message: `Salary of Rs. ${finalAmount.toLocaleString()} paid to ${staff.name}.`,
    payment: {
      ...paymentDoc.toObject(),
      id: paymentDoc._id,
    },
    expense: {
      ...expenseDoc.toObject(),
      id: expenseDoc._id,
      amount: expenseDoc.amountRupees,
    },
    staff: sanitizeStaffForRole(staff, user?.role),
  };
};

// Retrieve salary payment records from DB (filterable by staffId and monthYear)
export const getStaffSalariesService = async ({ staffId, monthYear, limit = 500, page = 1 }) => {
  const query = {};

  if (staffId) {
    const staff = await findStaffByAnyId(staffId);
    if (staff) {
      query.staffId = staff._id;
    } else if (mongoose.Types.ObjectId.isValid(staffId)) {
      query.staffId = staffId;
    }
  }

  if (monthYear) {
    query.monthYear = monthYear;
  }

  const numericLimit = Math.min(1000, Math.max(1, Number(limit) || 500));
  const numericPage = Math.max(1, Number(page) || 1);
  const skip = (numericPage - 1) * numericLimit;

  const [salaries, total] = await Promise.all([
    SalaryPayment.find(query)
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    SalaryPayment.countDocuments(query),
  ]);

  const normalized = salaries.map((s) => ({
    ...s,
    id: s._id,
    paymentDate: s.paymentDate ? new Date(s.paymentDate).toISOString().split('T')[0] : s.date,
    date: s.date || (s.paymentDate ? new Date(s.paymentDate).toISOString().split('T')[0] : ''),
  }));

  return {
    salaries: normalized,
    total,
    page: numericPage,
    limit: numericLimit,
  };
};

// Delete a salary payment record from DB (and delete associated expense)
export const deleteSalaryPaymentService = async (paymentId) => {
  const payment = await SalaryPayment.findById(paymentId);
  if (!payment) {
    const error = new Error('Salary payment record not found.');
    error.statusCode = 404;
    throw error;
  }

  // 1. Delete associated expense if payment has expenseId
  if (payment.expenseId) {
    await Expense.findByIdAndDelete(payment.expenseId);
  }

  // 2. Also delete any expense referencing this salary payment id
  await Expense.deleteMany({ salaryPaymentId: payment._id });

  // 3. Fallback: Also remove any lingering expense for this staff salary in case of unlinked record
  if (payment.staffName) {
    const nameRegex = new RegExp(payment.staffName.trim(), 'i');
    await Expense.deleteMany({
      category: 'SALARIES',
      $or: [
        { title: { $regex: nameRegex } },
        { description: { $regex: nameRegex } },
      ],
      amountRupees: payment.amountPaid || payment.amount,
    });
  }

  // 4. Delete the salary payment document itself
  await SalaryPayment.findByIdAndDelete(paymentId);

  // 5. Reset staff salary status back to Pending if no other payments exist for this month
  if (payment.staffId) {
    const remaining = await SalaryPayment.findOne({
      staffId: payment.staffId,
      monthYear: payment.monthYear,
      status: 'Paid',
    });
    if (!remaining) {
      await Staff.findByIdAndUpdate(payment.staffId, {
        salaryStatus: 'Pending',
        salaryPaidDate: null,
        salaryPaidMonth: null,
      });
    }
  }

  return {
    success: true,
    message: 'Salary payment and associated expense deleted successfully from database.',
  };
};

