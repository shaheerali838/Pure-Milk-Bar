import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Search,
  Check,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import AttendanceSheetDetail from './AttendanceSheetDetail';

export default function StaffAttendance() {
  const {
    staffList = [],
    markAttendance,
    markAllAttendance,
    getStaffStatusOnDate,
    getStaffMonthlyAttendance,
  } = useStaffPayrollContext();

  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected staff member for AttendanceSheetDetail component modal
  const [selectedStaffForSheet, setSelectedStaffForSheet] = useState(null);

  // Date metadata
  const parseSafeDate = (dStr) => {
    if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const selectedDateObj = parseSafeDate(selectedDate);
  const formattedDate = selectedDateObj.toLocaleDateString('default', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handlePrevDay = () => {
    const cur = parseSafeDate(selectedDate);
    cur.setDate(cur.getDate() - 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    const cur = parseSafeDate(selectedDate);
    cur.setDate(cur.getDate() + 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Generate quick 7-day strip around selectedDate
  const quickDateStrip = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = parseSafeDate(selectedDate);
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    return {
      dateStr,
      dayNum: d.getDate(),
      weekday: d.toLocaleDateString('default', { weekday: 'short' }),
      isCurrent: dateStr === selectedDate,
    };
  });

  // Daily statistics for selectedDate
  let presentCount = 0;
  let leaveCount = 0;
  let absentCount = 0;

  staffList.forEach((s) => {
    const status = getStaffStatusOnDate(s.id, selectedDate);
    if (status === 'present') presentCount++;
    else if (status === 'leave') leaveCount++;
    else if (status === 'absent') absentCount++;
  });

  const turnoutRate =
    staffList.length > 0 ? Math.round((presentCount / staffList.length) * 100) : 0;

  // Filtered staff list
  const filteredStaff = staffList.filter((staff) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (staff.name || '').toLowerCase().includes(q) ||
      (staff.id || '').toLowerCase().includes(q) ||
      (staff.role || '').toLowerCase().includes(q);

    const matchesShift =
      shiftFilter === 'all' ||
      (staff.shift || '').toLowerCase() === shiftFilter.toLowerCase();

    const status = getStaffStatusOnDate(staff.id, selectedDate);
    const matchesStatus =
      statusFilter === 'all' || status === statusFilter;

    return matchesQuery && matchesShift && matchesStatus;
  });

  // If a staff member is selected, open AttendanceSheetDetail as a full in-page component view
  if (selectedStaffForSheet) {
    return (
      <AttendanceSheetDetail
        staff={selectedStaffForSheet}
        initialDate={selectedDate}
        onBack={() => setSelectedStaffForSheet(null)}
      />
    );
  }

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
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* 1. Date Controls & Quick Batch Tools */}
      <div className=" p-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 font-display">
              Daily Attendance Register
            </h2>
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Today
              </span>
            )}
          </div>
          
        </div>

        {/* Date Picker and Batch Marking Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevDay}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
              title="Previous Day"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
              title="Next Day"
            >
              Next &rarr;
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer border border-emerald-200 shadow-2xs"
              >
                Today
              </button>
            )}
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2.5">
            <button
              type="button"
              onClick={() => markAllAttendance(selectedDate, 'present')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer"
              title="Mark all staff members as present for this day"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Present
            </button>

            <button
              type="button"
              onClick={() => markAllAttendance(selectedDate, 'leave')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition cursor-pointer"
              title="Mark all staff members as on leave for this day"
            >
              <Clock className="w-3.5 h-3.5" />
              All Leave
            </button>
          </div>
        </div>
      </div>

      {/* Quick 7-Day Clickable Date Strip */}
      <div className="bg-slate-100/80 p-2 rounded-2xl border border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase px-2 shrink-0">
          Jump to Day:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {quickDateStrip.map((item) => (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => setSelectedDate(item.dateStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                item.isCurrent
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span className="text-[10px] uppercase opacity-80">{item.weekday}</span>
              <span className="font-mono">{item.dayNum}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Today's Attendance Metric Cards (Exact AnimalStatsCards Design Match) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Total Roster */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #10b981' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#10b98115' }}
            >
              <Users style={{ width: 16, height: 16, color: '#10b981' }} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              Roster
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {staffList.length}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Total Workforce
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Registered staff members
            </p>
          </div>
        </div>

        {/* 2. Present On Duty */}
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
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono">
              {turnoutRate}% Turnout
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
              {presentCount}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Present On Duty
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Active workers on shift today
            </p>
          </div>
        </div>

        {/* 3. On Leave (Excused) */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #f59e0b' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#f59e0b15' }}
            >
              <Clock style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200">
              Excused
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-amber-600 leading-tight tracking-tight mb-0.5 tabular">
              {leaveCount}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              On Leave
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Approved leave (Salary covered)
            </p>
          </div>
        </div>

        {/* 4. Absent (Unexcused) */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #ef4444' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#ef444415' }}
            >
              <XCircle style={{ width: 16, height: 16, color: '#ef4444' }} />
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-rose-700 bg-rose-50 border border-rose-200">
              Deductions
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-rose-600 leading-tight tracking-tight mb-0.5 tabular">
              {absentCount}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Absent Off Duty
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Daily salary deducted
            </p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-2xs focus-within:border-emerald-600 focus-within:bg-white transition">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search staff by name, role, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Shifts</option>
            <option value="morning">Morning Shift</option>
            <option value="evening">Evening Shift</option>
            <option value="night">Night Shift</option>
          </select>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({staffList.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('present')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'present'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-white/60'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('leave')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'leave'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-700 hover:bg-white/60'
              }`}
            >
              Leave ({leaveCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('absent')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === 'absent'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-white/60'
              }`}
            >
              Absent ({absentCount})
            </button>
          </div>
        </div>
      </div>

      {/* 4. Staff Attendance Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Workforce Attendance Sheet
            </h3>
            <p className="text-xs text-slate-400">
              Click any employee row to open full monthly attendance sheet &amp; detail
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {filteredStaff.length} Staff Listed
          </span>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            {staffList.length === 0
              ? 'No staff registered. Please add staff in the "Manage Staff" tab.'
              : 'No staff match the current search or filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Role &amp; Route</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4 text-center">
                    Attendance on {selectedDate}
                  </th>
                  <th className="py-3 px-4">Daily Wage</th>
                  <th className="py-3 px-4">Monthly Standing</th>
                  <th className="py-3 px-4 text-right">Detail Sheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStaff.map((staff) => {
                  const currentStatus = getStaffStatusOnDate(staff.id, selectedDate);
                  const isPres = currentStatus === 'present';
                  const isLeave = currentStatus === 'leave';
                  const isAbs = currentStatus === 'absent';
                  const isDelivery =
                    (staff.role || '').toLowerCase().includes('delivery') ||
                    (staff.role || '').toLowerCase().includes('rider');

                  const monthStats = getStaffMonthlyAttendance(staff.id, selectedDateObj);

                  return (
                    <tr
                      key={staff.id}
                      onClick={() => setSelectedStaffForSheet(staff)}
                      className="hover:bg-emerald-50/50 transition duration-150 cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {staff.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 font-display">
                            {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-emerald-700 transition">
                              {staff.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {staff.mobile || 'No contact'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                            staff.role
                          )}`}
                        >
                          {staff.role}
                        </span>
                        {isDelivery && staff.route && (
                          <span className="block text-[10px] font-semibold text-amber-700 mt-0.5">
                            Route: {staff.route}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {staff.shift || 'Morning'}
                        </span>
                      </td>

                      {/* 3 Interactive Buttons: Present, On Leave, Absent */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl shadow-2xs">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => markAttendance(staff.id, selectedDate, 'present')}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isPres
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* On Leave Button */}
                          <button
                            type="button"
                            onClick={() => markAttendance(staff.id, selectedDate, 'leave')}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isLeave
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-white'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>On Leave</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => markAttendance(staff.id, selectedDate, 'absent')}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isAbs
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-800 font-bold">
                        Rs. {staff.dailySalary || Math.round((staff.monthlySalary || 0) / 30)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                          <span className="text-emerald-700">{monthStats.presentCount}P</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-amber-700">{monthStats.leaveCount}L</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-rose-700">{monthStats.absentCount}A</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {monthStats.turnoutRate}% Turnout
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStaffForSheet(staff);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition cursor-pointer shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Attendance Sheet</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
