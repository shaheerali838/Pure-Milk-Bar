import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Truck,
  Users,
  Printer,
  Download,
  CheckCheck,
  UserCheck,
  MapPin,
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';

export default function AttendanceSheetDetail({ staff, isOpen, onClose, onBack, initialDate }) {
  const { getStaffMonthlyAttendance, markAttendance, markAllAttendance } =
    useStaffPayrollContext();

  const handleBack = onBack || onClose;

  const getInitialTargetDate = () => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      const [y, m, d] = initialDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const [currentDate, setCurrentDate] = useState(getInitialTargetDate);
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) return initialDate;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  if (!staff || (isOpen !== undefined && !isOpen)) return null;

  const monthStats = getStaffMonthlyAttendance(staff.id, currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearNum = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateChange = (newDateStr) => {
    if (!newDateStr) return;
    setSelectedDateStr(newDateStr);
    const [y, m, d] = newDateStr.split('-').map(Number);
    if (y && m) {
      setCurrentDate(new Date(y, m - 1, d || 1));
    }
  };

  // Find currently selected day record
  const selectedDayRecord =
    monthStats.days.find((d) => (d.dateString || d.dateStr) === selectedDateStr) ||
    monthStats.days[0] ||
    null;

  const isDeliveryStaff =
    (staff.role || '').toLowerCase().includes('delivery') ||
    (staff.role || '').toLowerCase().includes('rider');

  const dailySalaryRate =
    staff.dailySalary || Math.round((Number(staff.monthlySalary) || 0) / 30);

  const handleMarkAllPresent = () => {
    monthStats.days.forEach((d) => {
      const dateVal = d.dateString || d.dateStr;
      if (dateVal) {
        markAttendance(staff.id, dateVal, 'present');
      }
    });
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider'))
      return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('farm') || r.includes('milk'))
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (r.includes('security'))
      return 'bg-rose-50 text-rose-800 border-rose-200';
    if (r.includes('cashier'))
      return 'bg-blue-50 text-blue-800 border-blue-200';
    if (r.includes('manager'))
      return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 pb-10">
      {/* 1. In-Page Top Navigation Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          {handleBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Attendance Register</span>
            </button>
          )}

          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center font-display shadow-xs shrink-0">
              {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-display text-slate-900 tracking-tight">
                  {staff.name}
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  #{staff.id}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                    staff.role
                  )}`}
                >
                  {staff.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span>{staff.shift || 'Morning'} Shift</span>
                <span>•</span>
                {isDeliveryStaff && staff.route ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Route: {staff.route}
                  </span>
                ) : (
                  <span>Farm Station</span>
                )}
                <span>•</span>
                <span className="text-emerald-700 font-bold font-mono">
                  {monthName} {yearNum} Sheet
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Sheet
          </button>
        </div>
      </div>

      {/* 2. Top Summary Ribbon & Month Controls (Cards Stay Here) */}
      <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                Select Attendance Cycle &amp; Date
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Jump to specific date picker */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500">Pick Date:</span>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="border-none outline-none bg-transparent text-xs font-bold text-slate-800 cursor-pointer"
                />
              </div>

              {/* Month Navigation */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  &larr; Prev
                </button>
                <span className="text-xs font-black text-slate-900 px-2 font-mono">
                  {monthName} {yearNum}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Present
              </button>
            </div>
          </div>

          {/* 6 Metric Highlight Cards (Exact AnimalStatsCards Signature Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Total Days */}
            <div
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
              style={{ borderTop: '4px solid #64748b' }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: '#64748b15' }}
                >
                  <Calendar style={{ width: 14, height: 14, color: '#64748b' }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded text-slate-600 bg-slate-100 border border-slate-200">
                  Cycle
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                  {monthStats.days.length} Days
                </p>
                <p className="text-[11px] font-bold text-slate-700 font-display">
                  Total Days
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Full month cycle
                </p>
              </div>
            </div>

            {/* Days Present */}
            <div
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
              style={{ borderTop: '4px solid #009966' }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: '#00996615' }}
                >
                  <CheckCircle2 style={{ width: 14, height: 14, color: '#009966' }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono">
                  {monthStats.turnoutRate}%
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
                  {monthStats.presentCount} Days
                </p>
                <p className="text-[11px] font-bold text-slate-700 font-display">
                  Present on Duty
                </p>
                <p className="text-[10px] text-emerald-600 font-medium truncate">
                  Earned base pay
                </p>
              </div>
            </div>

            {/* Excused Leaves */}
            <div
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
              style={{ borderTop: '4px solid #f59e0b' }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: '#f59e0b15' }}
                >
                  <Clock style={{ width: 14, height: 14, color: '#f59e0b' }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded text-amber-700 bg-amber-50 border border-amber-200">
                  Covered
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-black text-amber-600 leading-tight tracking-tight mb-0.5 tabular">
                  {monthStats.leaveCount} Days
                </p>
                <p className="text-[11px] font-bold text-slate-700 font-display">
                  Excused Leaves
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Salary protected
                </p>
              </div>
            </div>

            {/* Absents */}
            <div
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
              style={{ borderTop: '4px solid #ef4444' }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: '#ef444415' }}
                >
                  <XCircle style={{ width: 14, height: 14, color: '#ef4444' }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded text-rose-700 bg-rose-50 border border-rose-200">
                  Deductions
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-black text-rose-600 leading-tight tracking-tight mb-0.5 tabular">
                  {monthStats.absentCount} Days
                </p>
                <p className="text-[11px] font-bold text-slate-700 font-display">
                  Unexcused Absent
                </p>
                <p className="text-[10px] text-rose-600 font-medium truncate">
                  -Rs. {monthStats.absentDeduction.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Daily Wage Rate */}
            <div
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
              style={{ borderTop: '4px solid #3b82f6' }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: '#3b82f615' }}
                >
                  <DollarSign style={{ width: 14, height: 14, color: '#3b82f6' }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded text-blue-700 bg-blue-50 border border-blue-200">
                  Wage
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-black text-blue-700 leading-tight tracking-tight mb-0.5 tabular">
                  Rs. {dailySalaryRate.toLocaleString()}
                </p>
                <p className="text-[11px] font-bold text-slate-700 font-display">
                  Daily Wage Rate
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Per day worked
                </p>
              </div>
            </div>

            {/* Net Monthly Payable */}
            <div
              className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
              style={{ borderTop: '4px solid #10b981' }}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ background: '#10b98115' }}
                >
                  <TrendingUp style={{ width: 14, height: 14, color: '#10b981' }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200">
                  Payout
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular truncate">
                  Rs. {monthStats.netSalary.toLocaleString()}
                </p>
                <p className="text-[11px] font-bold text-slate-700 font-display">
                  Net Disbursable
                </p>
                <p className="text-[10px] text-emerald-600 font-medium truncate">
                  Earned net salary
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Attendance in TABLE FORM */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Selected Date Information Banner / Card */}
          {selectedDayRecord && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-slate-50 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                      <Calendar className="w-3 h-3" />
                      Day {selectedDayRecord.dayNumber || (selectedDayRecord.dayNum || '—')} Details
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 font-display">
                      {selectedDayRecord.weekday}, {selectedDayRecord.dateString || selectedDayRecord.dateStr}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black border ${
                        selectedDayRecord.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedDayRecord.status === 'leave'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {selectedDayRecord.status === 'present'
                        ? '● Present On Duty'
                        : selectedDayRecord.status === 'leave'
                        ? '● Excused Leave'
                        : '● Absent Off Duty'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    <span>
                      Shift: <strong className="text-slate-800">{staff.shift || 'Morning'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Station / Route:{' '}
                      <strong className="text-slate-800">
                        {isDeliveryStaff ? staff.route || 'Delivery Route' : 'Farm Station'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Daily Accrual:{' '}
                      <strong
                        className={
                          selectedDayRecord.status === 'present'
                            ? 'text-emerald-700'
                            : selectedDayRecord.status === 'leave'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }
                      >
                        {selectedDayRecord.status === 'present'
                          ? `+Rs. ${dailySalaryRate.toLocaleString()} (Earned)`
                          : selectedDayRecord.status === 'leave'
                          ? 'Rs. 0 (Covered Leave)'
                          : `-Rs. ${dailySalaryRate.toLocaleString()} (Deducted)`}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Quick 1-Click Status Switcher for Selected Date */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 px-1">Set Date Status:</span>
                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        staff.id,
                        selectedDayRecord.dateString || selectedDayRecord.dateStr,
                        'present'
                      )
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      selectedDayRecord.status === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        staff.id,
                        selectedDayRecord.dateString || selectedDayRecord.dateStr,
                        'leave'
                      )
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      selectedDayRecord.status === 'leave'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    On Leave
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        staff.id,
                        selectedDayRecord.dateString || selectedDayRecord.dateStr,
                        'absent'
                      )
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      selectedDayRecord.status === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Click any calendar date row below to inspect its detailed metrics
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {monthStats.days.length} Days in Cycle
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs z-10">
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Day #</th>
                  <th className="py-3 px-4">Calendar Date</th>
                  <th className="py-3 px-4">Weekday</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Work Station / Route</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Daily Accrual</th>
                  <th className="py-3 px-4 text-center">Quick Set Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {monthStats.days.map((d, index) => {
                  const isPres = d.status === 'present';
                  const isLeave = d.status === 'leave';
                  const isAbs = d.status === 'absent';
                  const isSun = d.weekday === 'Sun' || d.weekday === 'Sunday';
                  const dayNum = d.dayNumber || d.dayNum || (index + 1);
                  const dateStr = d.dateString || d.dateStr;
                  const isSelected = dateStr === selectedDateStr;

                  return (
                    <tr
                      key={dateStr || index}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`cursor-pointer transition duration-150 ${
                        isSelected
                          ? 'bg-emerald-100/70 border-l-4 border-l-emerald-600 font-bold shadow-inner'
                          : isSun
                          ? 'bg-slate-50/60 hover:bg-emerald-50/40'
                          : 'hover:bg-emerald-50/40'
                      }`}
                    >
                      {/* Day # */}
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        Day {String(dayNum).padStart(2, '0')}
                        {isSelected && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-700 text-white uppercase">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-4 font-mono text-slate-800 font-medium">
                        {dateStr}
                      </td>

                      {/* Weekday */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-semibold ${
                            isSun ? 'text-rose-600 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {d.weekday}
                          {isSun && (
                            <span className="ml-1 text-[10px] text-rose-500 font-mono">
                              (Weekend)
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Shift */}
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {staff.shift || 'Morning'}
                        </span>
                      </td>

                      {/* Route / Station (Only show route for delivery staff) */}
                      <td className="py-2.5 px-4">
                        {isDeliveryStaff ? (
                          <span className="text-amber-800 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {staff.route || 'Delivery Route'}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            Farm Station
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isPres
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isLeave
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPres
                                ? 'bg-emerald-500'
                                : isLeave
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {isPres ? 'Present' : isLeave ? 'On Leave' : 'Absent'}
                        </span>
                      </td>

                      {/* Daily Accrual */}
                      <td className="py-2.5 px-4 text-right font-mono font-bold">
                        {isPres ? (
                          <span className="text-emerald-700">
                            +Rs. {dailySalaryRate.toLocaleString()}
                          </span>
                        ) : isLeave ? (
                          <span className="text-amber-700">Rs. 0 (Covered)</span>
                        ) : (
                          <span className="text-rose-600">
                            -Rs. {dailySalaryRate.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* 1-Click Interactive Switcher Buttons */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() =>
                              markAttendance(staff.id, dateStr, 'present')
                            }
                            className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                              isPres
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
                            }`}
                          >
                            P
                          </button>

                          {/* Leave Button */}
                          <button
                            type="button"
                            onClick={() =>
                              markAttendance(staff.id, dateStr, 'leave')
                            }
                            className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                              isLeave
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-white'
                            }`}
                          >
                            L
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() =>
                              markAttendance(staff.id, dateStr, 'absent')
                            }
                            className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                              isAbs
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                            }`}
                          >
                            A
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* 4. Footer Summary & Back Bar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
          <span>Monthly Summary:</span>
          <span className="text-emerald-700 font-mono">
            {monthStats.presentCount} Present
          </span>
          <span>•</span>
          <span className="text-amber-700 font-mono">
            {monthStats.leaveCount} Excused
          </span>
          <span>•</span>
          <span className="text-rose-700 font-mono">
            {monthStats.absentCount} Deducted
          </span>
          <span>•</span>
          <span className="text-slate-900 font-mono font-black">
            Net: Rs. {monthStats.netSalary.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
          {handleBack && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              Back to Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
