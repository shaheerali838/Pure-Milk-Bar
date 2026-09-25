import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Truck,
  FileSpreadsheet,
  Clock,
  DollarSign,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import StaffAdd from './StaffAdd';
import AttendanceSheetDetail from '../StaffAttendance/AttendanceSheetDetail';

export default function StaffDetail({
  staffId,
  staff: propStaff,
  onClose,
  onBack,
  onEdit,
  onDelete,
}) {
  const {
    staffList = [],
    deleteStaff,
    getStaffMonthlyAttendance,
    getStaffStatusOnDate,
  } = useStaffPayrollContext();

  const handleBack = onBack || onClose;
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const staff =
    (propStaff?.id ? staffList.find((s) => String(s.id) === String(propStaff.id)) : null) ||
    propStaff ||
    staffList.find(
      (s) =>
        String(s.id) === String(staffId) ||
        String(s.name).toLowerCase() === String(staffId).toLowerCase()
    );

  if (!staff) {
    return (
      <div className="p-8 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Staff Record Not Found</h2>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
        >
          Back to Staff Roster
        </button>
      </div>
    );
  }

  if (isEditingInline) {
    return (
      <StaffAdd
        editingStaff={staff}
        onBack={() => setIsEditingInline(false)}
        onSuccess={() => setIsEditingInline(false)}
      />
    );
  }

  if (isAttendanceModalOpen) {
    return (
      <AttendanceSheetDetail
        staff={staff}
        onBack={() => setIsAttendanceModalOpen(false)}
      />
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${staff.name}" (${staff.id})?`)) {
      if (onDelete) onDelete(staff.id);
      else deleteStaff(staff.id);
      if (handleBack) handleBack();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayStatus = getStaffStatusOnDate ? getStaffStatusOnDate(staff.id, todayStr) : 'present';
  const monthStats = (getStaffMonthlyAttendance && staff?.id)
    ? (getStaffMonthlyAttendance(staff.id) || {})
    : {};
  const netPay = Number(monthStats?.netSalary ?? staff?.monthlySalary ?? 0);
  const turnoutRate = Number(monthStats?.turnoutRate ?? 100);
  const presentDays = Number(monthStats?.presentCount ?? 0);
  const totalMonthDays = Number(monthStats?.daysInMonth ?? 30);
  const dailySalaryRate =
    Number(staff?.dailySalary) || Math.round((Number(staff?.monthlySalary) || 0) / 30) || 0;
  const isDeliveryStaff = Boolean(
    (staff?.role || '').toLowerCase().includes('delivery') ||
    (staff?.role || '').toLowerCase().includes('rider')
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* 1. Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
              {staff.name}
            </h1>
            <p className="text-xs text-slate-500">
              Staff ID #{staff.id} • {staff.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAttendanceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Attendance Sheet
          </button>
          <button
            type="button"
            onClick={() => onEdit ? onEdit(staff) : setIsEditingInline(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition shadow-2xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* 2. Top Profile Card (Card Stays Here) */}
      <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          {staff.image ? (
            <img
              src={staff.image}
              alt={staff.name}
              className="w-14 h-14 rounded-full object-cover shadow-xs border border-slate-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xl shadow-xs font-display">
              {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {staff.name}
              </h2>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                #{staff.id}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {staff.role}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  todayStatus === 'present'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : todayStatus === 'leave'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    todayStatus === 'present'
                      ? 'bg-emerald-500'
                      : todayStatus === 'leave'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                {todayStatus === 'present'
                  ? 'Present Today'
                  : todayStatus === 'leave'
                  ? 'On Leave'
                  : 'Absent Today'}
              </span>
              {isDeliveryStaff && staff.route && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Truck className="w-3 h-3 text-amber-600" />
                  {staff.route}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Monthly Pay
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            Rs. {netPay.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. 4 Highlight Stat Cards (Exact AnimalStatsCards Signature Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Working Shift */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #10b981' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#10b98115' }}
            >
              <Clock style={{ width: 16, height: 16, color: '#10b981' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
              Shift
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {staff.shift || 'Morning'}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Assigned Shift
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Standard 8-hour daily duty
            </p>
          </div>
        </div>

        {/* 2. Monthly Salary */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #3b82f6' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#3b82f615' }}
            >
              <DollarSign style={{ width: 16, height: 16, color: '#3b82f6' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-blue-700 bg-blue-50 border border-blue-200">
              Monthly
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-black text-blue-700 leading-tight tracking-tight mb-0.5 tabular font-mono">
              Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Base Monthly Pay
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Fixed monthly contract
            </p>
          </div>
        </div>

        {/* 3. Daily Wage Rate */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #f59e0b' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#f59e0b15' }}
            >
              <DollarSign style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200">
              Day Rate
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-black text-amber-800 leading-tight tracking-tight mb-0.5 tabular font-mono">
              Rs. {dailySalaryRate.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Daily Wage Rate
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Calculated on 30-day base
            </p>
          </div>
        </div>

        {/* 4. Attendance Record */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #009966' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#00996615' }}
            >
              <CheckCircle2 style={{ width: 16, height: 16, color: '#009966' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono">
              {turnoutRate}%
            </span>
          </div>
          <div>
            <p className="font-display text-xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular font-mono">
              {presentDays} / {totalMonthDays} Days
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Monthly Turnout
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Net: Rs. {netPay.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Operational Duty & Details Table (Clean, Simple, Above) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Operational Duty &amp; Details
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            ID #{staff.id}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Designation</th>
                <th className="py-2.5 px-4">Shift</th>
                <th className="py-2.5 px-4">Station / Route</th>
                <th className="py-2.5 px-4">Mobile Phone</th>
                <th className="py-2.5 px-4">CNIC</th>
                <th className="py-2.5 px-4 text-right">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3 px-4 font-bold text-slate-900">
                  {staff.role}
                </td>
                <td className="py-3 px-4 text-slate-800 font-semibold">
                  {staff.shift || 'Morning'}
                </td>
                <td className="py-3 px-4">
                  {isDeliveryStaff ? (
                    <span className="font-semibold text-amber-800 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      {staff.route || 'Delivery Route'}
                    </span>
                  ) : (
                    <span className="text-slate-600">Farm Station</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                  {staff.mobile || '—'}
                </td>
                <td className="py-3 px-4 font-mono text-slate-800">
                  {staff.cnic || '—'}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
