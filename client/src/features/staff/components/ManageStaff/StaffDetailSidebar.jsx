import React, { useState } from 'react';
import {
  X,
  Phone,
  CreditCard,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';

export default function StaffDetailSidebar({ staff, isOpen, onClose }) {
  const { updateStaff, deleteStaff, getStaffMonthlyAttendance, getStaffStatusOnDate } =
    useStaffPayrollContext();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  if (!isOpen || !staff) return null;

  // Initialize edit form data
  const handleStartEdit = () => {
    setFormData({
      name: staff.name || '',
      role: staff.role || 'Farm Worker',
      shift: staff.shift || 'Morning',
      mobile: staff.mobile || '',
      cnic: staff.cnic || '',
      monthlySalary: staff.monthlySalary || '',
      route: staff.route || '',
      address: staff.address || '',
      emergencyContact: staff.emergencyContact || '',
      notes: staff.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateStaff(staff.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${staff.name}" (${staff.id}) from staff records?`)) {
      deleteStaff(staff.id);
      onClose();
    }
  };

  // Month stats for payroll
  const monthStats = getStaffMonthlyAttendance(staff.id);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStatus = getStaffStatusOnDate(staff.id, todayStr);

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('farm') || r.includes('milk')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (r.includes('security')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (r.includes('cashier')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (r.includes('manager')) return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Black Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-over Right Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-300 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center font-display shadow-md">
                {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 className="text-lg font-black font-display tracking-tight leading-snug">
                  {staff.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-300 font-mono font-bold">
                    ID: #{staff.id}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {staff.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Today&apos;s Status:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    todayStatus === 'present'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : todayStatus === 'leave'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      todayStatus === 'present'
                        ? 'bg-emerald-500 animate-pulse'
                        : todayStatus === 'leave'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  {todayStatus === 'present'
                    ? 'Present On Duty'
                    : todayStatus === 'leave'
                    ? 'On Leave'
                    : 'Absent / Off Duty'}
                </span>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* If Edit Mode is Active: Show Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium cursor-pointer"
                    >
                      <option value="Delivery Rider">Delivery Rider</option>
                      <option value="Farm Worker">Farm Worker</option>
                      <option value="Milking Staff">Milking Staff</option>
                      <option value="Security Guard">Security Guard</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Dairy Manager">Dairy Manager</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Shift</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium cursor-pointer"
                    >
                      <option value="Morning">Morning (05 AM - 01 PM)</option>
                      <option value="Evening">Evening (01 PM - 09 PM)</option>
                      <option value="Night">Night (09 PM - 05 AM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">CNIC</label>
                    <input
                      type="text"
                      value={formData.cnic}
                      onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Monthly Base Salary (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Assigned Delivery Route / Area
                  </label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="e.g. Route A - Model Town"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-600 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Residential Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-600 font-medium resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* 1. Personal & Role Details Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Staff Identity &amp; Job Role
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Role</span>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${getRoleBadgeStyle(staff.role)}`}>
                        {staff.role}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Shift</span>
                      <span className="text-slate-800 font-bold flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {staff.shift}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">Contact</span>
                      <span className="text-slate-800 font-bold flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {staff.mobile || '—'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-bold">CNIC</span>
                      <span className="text-slate-800 font-bold flex items-center gap-1 mt-0.5 font-mono">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        {staff.cnic || '—'}
                      </span>
                    </div>
                  </div>

                  {staff.route && staff.route.toLowerCase() !== 'n/a' && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-amber-800 font-bold block">
                          Assigned Delivery Route
                        </span>
                        <strong className="text-amber-950 font-bold">{staff.route}</strong>
                      </div>
                    </div>
                  )}

                  {staff.address && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="text-[10px] text-slate-400 font-bold block">Address</span>
                      <span className="text-slate-700">{staff.address}</span>
                    </div>
                  )}
                </div>

                {/* 2. Monthly Payroll & Attendance Breakdown */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Payroll &amp; Attendance Standing
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      Current 30-Day Cycle
                    </span>
                  </div>

                  {/* Present / Absent / Leave Quick Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                        Present
                      </span>
                      <span className="text-lg font-black text-emerald-700 font-mono">
                        {monthStats.presentCount}
                      </span>
                      <span className="text-[10px] text-emerald-600 block">Days</span>
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-800 block uppercase">
                        On Leave
                      </span>
                      <span className="text-lg font-black text-amber-700 font-mono">
                        {monthStats.leaveCount}
                      </span>
                      <span className="text-[10px] text-amber-600 block">Excused</span>
                    </div>

                    <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-800 block uppercase">
                        Absent
                      </span>
                      <span className="text-lg font-black text-rose-700 font-mono">
                        {monthStats.absentCount}
                      </span>
                      <span className="text-[10px] text-rose-600 block">Deducted</span>
                    </div>
                  </div>

                  {/* Net Salary Calculation Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Monthly Base Salary:</span>
                      <span className="font-mono font-bold text-white">
                        Rs. {monthStats.monthlySalary.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Daily Wage Rate:</span>
                      <span className="font-mono text-slate-200">
                        Rs. {monthStats.dailySalary.toLocaleString()} / day
                      </span>
                    </div>

                    {monthStats.absentCount > 0 && (
                      <div className="flex items-center justify-between text-xs text-rose-400">
                        <span>Absent Deductions ({monthStats.absentCount} days):</span>
                        <span className="font-mono font-bold">
                          -Rs. {monthStats.absentDeduction.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                          Net Take-Home Pay
                        </span>
                        <span className="text-xs text-slate-400">
                          {monthStats.turnoutRate}% Monthly Turnout
                        </span>
                      </div>
                      <span className="text-xl font-black text-emerald-400 font-mono">
                        Rs. {monthStats.netSalary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Delete Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Staff Member
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
