import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Check,
  Calendar,
  DollarSign,
  Phone,
  CreditCard,
  MapPin,
  Clock,
  Briefcase,
  Tag,
  ShieldCheck,
  FileText,
  Truck,
  Sparkles,
  Sliders,
  Car,
  Home,
  Shield,
  Layers,
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';
import ImageUpload from '@/components/common/ImageUpload';

const ROLE_OPTIONS = [
  'Farm Worker',
  'Delivery Rider',
  'Milking Staff',
  'Security Guard',
  'Cashier',
  'Dairy Manager',
  'Accountant',
];

const SHIFT_OPTIONS = [
  'Morning',
  'Evening',
  'Night',
];

const STATUS_OPTIONS = [
  'Active',
  'On Leave',
  'Inactive',
];

const initialForm = {
  id: '',
  name: '',
  role: 'Farm Worker',
  shift: 'Morning',
  mobile: '',
  cnic: '',
  monthlySalary: '',
  status: 'Active',
  joinedDate: new Date().toISOString().split('T')[0],
  route: '',
  address: '',
  emergencyContact: '',
  notes: '',
  image: '',
  // Dynamic fields
  vehicleNumber: '',
  licenseNumber: '',
  vehicleType: 'Motorcycle',
  assignedBarn: '',
  milkingShiftSpecialization: 'Morning & Evening',
  assignedCattleCount: '',
  guardPost: 'Main Gate',
  weaponLicense: '',
  posRegisterId: 'Counter 1',
  khataAuthLimit: '',
  departmentSupervised: 'Livestock & Milking',
};

export default function StaffAdd({ onBack, onClose, onCancel, editingStaff = null, onSuccess }) {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN || !user || (user?.role || '').toUpperCase() === 'ADMIN';

  const { addStaff, updateStaff } = useStaffPayrollContext();
  const handleBack = onBack || onClose || onCancel;
  const isEdit = Boolean(editingStaff);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        id: editingStaff.id || '',
        name: editingStaff.name || '',
        role: editingStaff.role || 'Farm Worker',
        shift: editingStaff.shift || 'Morning',
        mobile: editingStaff.mobile || '',
        cnic: editingStaff.cnic ? String(editingStaff.cnic).replace(/\D/g, '') : '',
        monthlySalary: editingStaff.monthlySalary
          ? String(editingStaff.monthlySalary)
          : '',
        status: editingStaff.status || 'Active',
        joinedDate: editingStaff.joinedDate || new Date().toISOString().split('T')[0],
        route: editingStaff.route || '',
        address: editingStaff.address || '',
        emergencyContact: editingStaff.emergencyContact || '',
        notes: editingStaff.notes || '',
        image: editingStaff.image || '',
        vehicleNumber: editingStaff.vehicleNumber || '',
        licenseNumber: editingStaff.licenseNumber || '',
        vehicleType: editingStaff.vehicleType || 'Motorcycle',
        assignedBarn: editingStaff.assignedBarn || '',
        milkingShiftSpecialization: editingStaff.milkingShiftSpecialization || 'Morning & Evening',
        assignedCattleCount: editingStaff.assignedCattleCount || '',
        guardPost: editingStaff.guardPost || 'Main Gate',
        weaponLicense: editingStaff.weaponLicense || '',
        posRegisterId: editingStaff.posRegisterId || 'Counter 1',
        khataAuthLimit: editingStaff.khataAuthLimit || '',
        departmentSupervised: editingStaff.departmentSupervised || 'Livestock & Milking',
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingStaff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCnicChange = (e) => {
    // Only accept numeric digits
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, cnic: digitsOnly }));
  };

  const calculatedDailySalary = formData.monthlySalary
    ? Math.round(parseFloat(formData.monthlySalary) / 30)
    : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSubmitError('Employee Full Name is required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isEdit && editingStaff) {
        await updateStaff(editingStaff.id, formData);
      } else {
        await addStaff(formData);
      }

      if (onSuccess) {
        onSuccess();
      } else if (handleBack) {
        handleBack();
      }
    } catch (err) {
      console.error('Failed to save staff:', err);
      setSubmitError(err.message || 'Failed to save staff record to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150 no-scrollbar pb-8">
      {/* Top action & header bar (Exact AnimalAdd Style) */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Staff Roster
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              {isEdit
                ? `Edit Staff Profile — ${editingStaff?.name || ''}`
                : 'Register New Staff Member'}
            </h1>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isEdit
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isEdit ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          {isEdit ? `Editing #${editingStaff?.id}` : 'New Staff'}
        </span>
      </div>

      {/* Main form container (Exact AnimalAdd Style) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-6 shadow-2xs no-scrollbar">
        {submitError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>{submitError}</span>
            <button type="button" onClick={() => setSubmitError(null)} className="text-rose-500 hover:text-rose-700 ml-2 font-black">
              &times;
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Staff Identification & Role */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                  isEdit ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                1. Staff Identification &amp; Designation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Staff ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="id"
                    disabled={isEdit}
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="Auto-generated if empty"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Employee Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Role / Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work Shift <span className="text-rose-500">*</span>
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                >
                  {SHIFT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} Shift
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Identity Information */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                2. Contact &amp; Identity Verification
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile / WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CNIC Number <span className="text-slate-400 font-normal lowercase">(digits only)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="number"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleCnicChange}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="3520112345671 (Digits only)"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Relative name & phone"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Village / Town / City"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Salary Terms & Payroll Rate */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                3. Monthly Salary &amp; Payroll Rate Terms
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {isAdmin ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Monthly Base Salary (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                        Rs.
                      </span>
                      <input
                        type="number"
                        min="0"
                        required
                        name="monthlySalary"
                        value={formData.monthlySalary}
                        onChange={handleChange}
                        placeholder="35000"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Calculated Daily Wage
                    </label>
                    <div className="px-3 py-2 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-800 font-mono font-black text-xs">
                      Rs. {calculatedDailySalary.toLocaleString()} / day
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-600">
                    Salary terms &amp; financial compensation are managed exclusively by the Owner.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Joining / Registration Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    name="joinedDate"
                    value={formData.joinedDate}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Employment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'Active' ? 'Active On Duty' : opt === 'On Leave' ? 'On Leave' : 'Off Duty'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Role-Specific Operational Details */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                  4. Role-Specific Details ({formData.role})
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Dynamic fields for {formData.role}
              </span>
            </div>

            {/* A. If Delivery Rider */}
            {formData.role === 'Delivery Rider' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Route / Delivery Area <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      name="route"
                      value={formData.route}
                      onChange={handleChange}
                      placeholder="e.g. Route A - Model Town"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Number / Plate
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g. LEA-2024-8921"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Driving License No.
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. DL-LHR-98213"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                  >
                    <option value="Motorcycle">Motorcycle / Bike</option>
                    <option value="Chilled Van">Chilled Milk Van</option>
                    <option value="Loader Rickshaw">Loader Rickshaw</option>
                    <option value="Pickup Truck">Pickup Carrier</option>
                  </select>
                </div>
              </div>
            )}

            {/* B. If Farm Worker or Milking Staff */}
            {(formData.role === 'Farm Worker' || formData.role === 'Milking Staff') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Barn / Shed
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Home className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      name="assignedBarn"
                      value={formData.assignedBarn}
                      onChange={handleChange}
                      placeholder="e.g. Shed 1 (High Yield) or Shed 2"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Milking Specialization / Duty
                  </label>
                  <select
                    name="milkingShiftSpecialization"
                    value={formData.milkingShiftSpecialization}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                  >
                    <option value="Machine Milking Specialist">Machine Milking Specialist</option>
                    <option value="Hand Milking Staff">Hand Milking Staff</option>
                    <option value="Bulk Tank Chiller Operator">Bulk Tank Chiller Operator</option>
                    <option value="Cattle Feeding & Barn Cleaning">Cattle Feeding &amp; Barn Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Cattle Count (Approx)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="assignedCattleCount"
                    value={formData.assignedCattleCount}
                    onChange={handleChange}
                    placeholder="e.g. 15 animals"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>
            )}

            {/* C. If Security Guard */}
            {formData.role === 'Security Guard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Guard Post / Gate
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Shield className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      name="guardPost"
                      value={formData.guardPost}
                      onChange={handleChange}
                      placeholder="e.g. Main Gate 1, Bulk Intake Gate"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Security Clearance / Weapon License #
                  </label>
                  <input
                    type="text"
                    name="weaponLicense"
                    value={formData.weaponLicense}
                    onChange={handleChange}
                    placeholder="e.g. WPN-99214 (or None)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Emergency Hotline / Police Check
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Verified by local police station"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>
            )}

            {/* D. If Cashier or Accountant */}
            {(formData.role === 'Cashier' || formData.role === 'Accountant') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned POS Counter / Terminal
                  </label>
                  <input
                    type="text"
                    name="posRegisterId"
                    value={formData.posRegisterId}
                    onChange={handleChange}
                    placeholder="e.g. Counter 1 - Retail Counter"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Khata / Credit Authorization Limit (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="khataAuthLimit"
                    value={formData.khataAuthLimit}
                    onChange={handleChange}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Daily Drawer Clearance Note
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Daily shift close at 9:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>
            )}

            {/* E. If Dairy Manager */}
            {formData.role === 'Dairy Manager' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supervised Department
                  </label>
                  <select
                    name="departmentSupervised"
                    value={formData.departmentSupervised}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                  >
                    <option value="Livestock & Milking">Livestock &amp; Milking Operations</option>
                    <option value="Procurement & Supplier Intake">Procurement &amp; Supplier Intake</option>
                    <option value="Retail POS & Home Deliveries">Retail POS &amp; Home Deliveries</option>
                    <option value="General Farm Management">General Farm Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Administrative Authority Notes
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Full inventory and shift approval authority"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>
            )}

            {/* Common Notes field for any role if not filled */}
            {formData.role !== 'Security Guard' &&
              formData.role !== 'Cashier' &&
              formData.role !== 'Accountant' &&
              formData.role !== 'Dairy Manager' && (
                <div className="mt-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    General Duty Notes &amp; Special Instructions
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Trained in machine milking, key holder..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              )}
          </div>

          {/* Section 5: Staff Photograph */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                5. Staff Identification Photograph
              </h2>
            </div>
            <div className="max-w-md">
              <ImageUpload
                label="Staff Photograph (JPG, PNG)"
                value={formData.image}
                onChange={(img) => setFormData((prev) => ({ ...prev, image: img }))}
                helpText="Upload employee passport photo or clear face picture"
              />
            </div>
          </div>

          {/* Form Action Buttons (Exact AnimalAdd Style) */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5a] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {isSubmitting ? 'Saving Staff...' : isEdit ? 'Save Staff Changes' : 'Register Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
