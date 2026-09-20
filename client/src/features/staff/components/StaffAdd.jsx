import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Check,
  Phone,
  Mail,
  Clock,
  CreditCard,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
} from 'lucide-react';
import { useStaffContext } from '@/context/StaffContext';

const ROLE_OPTIONS = [
  'Delivery Man / Milk Rider',
  'Security Guard',
  'Farm Work Man',
  'Retail Cashier',
  'Store & Farm Manager',
  'Accountant',
  'Owner',
];

const SHIFT_OPTIONS = [
  'Morning',
  'Evening',
  'Both',
  'Night',
  'Full Day',
  'Morning & Evening',
];

const initialForm = {
  name: '',
  role: 'Farm Work Man',
  mobile: '',
  email: '',
  shift: 'Morning',
  monthlySalary: '',
  cnic: '',
  route: '',
  status: 'Active',
  joinedDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function StaffAdd({ onBack, onClose, editingStaff = null }) {
  const { addStaff, updateStaff } = useStaffContext();
  const handleBack = onBack || onClose;

  const [formData, setFormData] = useState(initialForm);
  const isEdit = Boolean(editingStaff);

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        name: editingStaff.name || '',
        role: editingStaff.role || 'Farm Work Man',
        mobile: editingStaff.mobile || '',
        email: editingStaff.email || '',
        shift: editingStaff.shift || 'Morning',
        monthlySalary: editingStaff.monthlySalary ?? '',
        cnic: editingStaff.cnic || '',
        route: editingStaff.route || '',
        status: editingStaff.status || 'Active',
        joinedDate: editingStaff.joinedDate || new Date().toISOString().split('T')[0],
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter staff full name.');
      return;
    }

    if (isEdit && editingStaff) {
      updateStaff(editingStaff.id, formData);
    } else {
      addStaff(formData);
    }

    if (handleBack) handleBack();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 no-scrollbar">
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Staff
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              {isEdit ? `Edit Staff — ${editingStaff?.name || ''}` : 'Add New Staff Member'}
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

      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                  isEdit ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isEdit ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                1. Basic &amp; Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role / Designation <span className="text-rose-500">*</span>
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
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@puremilkbar.com"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition"
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
                    placeholder="35201-1234567-1"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                2. Shift, Compensation &amp; Area
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Salary (Rs.)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
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
                  Joining Date
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
                  Delivery Route / Station
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
                    placeholder="Enter address"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes &amp; Emergency Contact
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Emergency phone, duties, or special notes..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer ${
                isEdit
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-[#00a86b] hover:bg-[#007a52]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {isEdit ? 'Save Changes' : 'Register Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
