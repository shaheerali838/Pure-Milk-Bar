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
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';

const ROLE_OPTIONS = [
  'Delivery Rider',
  'Farm Worker',
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
};

export default function StaffAdd({ onBack, onClose, editingStaff = null, onSuccess }) {
  const { addStaff, updateStaff } = useStaffPayrollContext();
  const handleBack = onBack || onClose;
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
        cnic: editingStaff.cnic || '',
        monthlySalary: editingStaff.monthlySalary
          ? String(editingStaff.monthlySalary)
          : '',
        status: editingStaff.status || 'Active',
        joinedDate: editingStaff.joinedDate || new Date().toISOString().split('T')[0],
        route: editingStaff.route || '',
        address: editingStaff.address || '',
        emergencyContact: editingStaff.emergencyContact || '',
        notes: editingStaff.notes || '',
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingStaff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculatedDailySalary = formData.monthlySalary
    ? Math.round(parseFloat(formData.monthlySalary) / 30)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEdit && editingStaff) {
      updateStaff(editingStaff.id, formData);
    } else {
      addStaff(formData);
    }

    if (onSuccess) onSuccess();
    if (handleBack) handleBack();
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
                  CNIC Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    placeholder="35201-XXXXXXX-X"
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

          {/* Section 4: Operational Assignment & Delivery Route */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
              <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                4. Operational Assignment &amp; Delivery Route
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Route / Delivery Area
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
                    placeholder="e.g. Route A - Model Town & Gulberg"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Duty Notes &amp; Special Instructions
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Milking technician, Key holder, Morning delivery driver..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                />
              </div>
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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5a] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {isEdit ? 'Save Staff Changes' : 'Register Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
