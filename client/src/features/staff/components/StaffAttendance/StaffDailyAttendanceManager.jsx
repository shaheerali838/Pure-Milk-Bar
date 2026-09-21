import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  Check,
  X,
  Printer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaffContext, generateDefaultAttendanceMap } from '@/context/StaffContext';

export default function StaffDailyAttendanceManager({
  onSelectStaff,
  staffFilterId,
  onClose,
  initialTab = 'daily',
}) {
  const {
    staffList = [],
    markStaffToday,
    markEntireStaffToday,
    toggleDayAttendance,
    setStaffAttendance,
  } = useStaffContext();

  const [activeTab, setActiveTab] = useState(initialTab); // 'daily' | 'matrix'
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all'); // 'all' | 'Morning' | 'Evening' | 'Night'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'present' | 'absent'

  // Filter strictly to the related staff member if staffFilterId is passed
  const targetStaff = staffFilterId
    ? staffList.find((s) => String(s.id) === String(staffFilterId))
    : null;
  const baseStaffList = staffFilterId
    ? (targetStaff ? [targetStaff] : [])
    : staffList;

  // Date metadata
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const todayDayNum = Math.min(30, Math.max(1, today.getDate()));
  const monthName = today.toLocaleString('default', { month: 'short' });
  const fullMonthName = today.toLocaleString('default', { month: 'long' });
  const dayOfWeekName = today.toLocaleString('default', { weekday: 'long' });
  const formattedToday = `${dayOfWeekName}, ${today.getDate()} ${fullMonthName} ${currentYear}`;

  // Helper to get a staff member's today status ('present' | 'leave' | 'absent')
  const getStaffTodayStatus = (member) => {
    if (member.attendanceMap && member.attendanceMap[todayDayNum] !== undefined) {
      return member.attendanceMap[todayDayNum];
    }
    if (member.status === 'On Leave') return 'leave';
    const isActive =
      member.status !== 'Inactive' &&
      member.status !== 'Off Duty' &&
      member.active !== false;
    return isActive ? 'present' : 'absent';
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return baseStaffList.filter((staff) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (staff.name && staff.name.toLowerCase().includes(q)) ||
        (staff.id && staff.id.toLowerCase().includes(q)) ||
        (staff.role && staff.role.toLowerCase().includes(q)) ||
        (staff.mobile && staff.mobile.includes(q)) ||
        (staff.route && staff.route.toLowerCase().includes(q));

      const matchesShift =
        shiftFilter === 'all' ||
        (staff.shift || '').toLowerCase().includes(shiftFilter.toLowerCase());

      const todayStatus = getStaffTodayStatus(staff);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'present' && todayStatus === 'present') ||
        (statusFilter === 'leave' && todayStatus === 'leave') ||
        (statusFilter === 'absent' && todayStatus === 'absent');

      return matchesSearch && matchesShift && matchesStatus;
    });
  }, [baseStaffList, searchQuery, shiftFilter, statusFilter, todayDayNum]);

  // Overall Today Metrics
  const totalStaff = baseStaffList.length;
  const presentTodayCount = baseStaffList.filter((s) => getStaffTodayStatus(s) === 'present').length;
  const leaveTodayCount = baseStaffList.filter((s) => getStaffTodayStatus(s) === 'leave').length;
  const absentTodayCount = baseStaffList.filter((s) => getStaffTodayStatus(s) === 'absent').length;
  const attendanceRate = totalStaff > 0 ? Math.round((presentTodayCount / totalStaff) * 100) : 0;

  // Print attendance sheet
  const handlePrint = () => {
    window.print();
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('farm')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (r.includes('security')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (r.includes('cashier')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (r.includes('manager')) return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 w-full">
      {/* Top Banner / Date Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {targetStaff ? 'Individual Staff Attendance Sheet' : 'Live Attendance Register'}
            </span>
            <span className="text-xs text-slate-400 font-mono font-bold">
              Day #{todayDayNum} of 30
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            {targetStaff ? `${targetStaff.name}'s Attendance Sheet` : formattedToday}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {targetStaff ? (
              <span>
                Staff ID: <strong className="text-white font-mono">#{targetStaff.id}</strong> • Role: <strong className="text-emerald-300">{targetStaff.role}</strong> • Shift: <strong>{targetStaff.shift || 'Morning'}</strong>
              </span>
            ) : (
              'Single-click daily attendance marking, salary deduction calculation & 30-day master attendance matrix'
            )}
          </p>
        </div>

        {/* View mode toggle tabs & Back button */}
        <div className="flex items-center gap-2 flex-wrap">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </button>
          )}

          <div className="inline-flex rounded-xl p-1 bg-white/10 backdrop-blur-xs border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'daily'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <Users className="w-3.5 h-3.5" />
              Daily Roll-Call
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'matrix'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              30-Day Master Matrix
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 px-3 text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print Sheet
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards (Signature AnimalStatsCards Design) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Workforce */}
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              Roster
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {staffFilterId && targetStaff ? targetStaff.id : totalStaff}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              {staffFilterId ? 'Staff Record' : 'Total Workforce'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {staffFilterId && targetStaff ? targetStaff.name : 'Registered active roster'}
            </p>
          </div>
        </div>

        {/* Present Today */}
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
              {attendanceRate}% Turnout
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
              {presentTodayCount}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Present Today
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Staff on duty
            </p>
          </div>
        </div>

        {/* On Leave Today */}
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200">
              Approved
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-amber-800 leading-tight tracking-tight mb-0.5 tabular">
              {leaveTodayCount}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              On Leave
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Excused leaves approved
            </p>
          </div>
        </div>

        {/* Absent Today */}
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-rose-700 bg-rose-50 border border-rose-200">
              Absence
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-rose-600 leading-tight tracking-tight mb-0.5 tabular">
              {absentTodayCount}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Absent Today
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Unexcused absences
            </p>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200 col-span-2 sm:col-span-1"
          style={{ borderTop: '4px solid #6366f1' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#6366f115' }}
            >
              <Sparkles style={{ width: 16, height: 16, color: '#6366f1' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-indigo-700 bg-indigo-50 border border-indigo-200">
              Quick Batch
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 font-display mb-1.5">
              {targetStaff ? 'Quick Actions' : 'Workforce Batch'}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (staffFilterId) {
                    markStaffToday(staffFilterId, 'present');
                  } else {
                    markEntireStaffToday('present');
                  }
                }}
                className="flex-1 h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer px-1"
                title="Mark Present"
              >
                <Check className="w-3 h-3 mr-0.5" />
                Present
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (staffFilterId) {
                    markStaffToday(staffFilterId, 'leave');
                  } else {
                    markEntireStaffToday('leave');
                  }
                }}
                className="flex-1 h-7 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer px-1"
                title="Mark On Leave"
              >
                <Clock className="w-3 h-3 mr-0.5" />
                Leave
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (staffFilterId) {
                    markStaffToday(staffFilterId, 'absent');
                  } else {
                    markEntireStaffToday('absent');
                  }
                }}
                className="h-7 px-2 text-[11px] font-bold text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                title="Mark Absent"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search staff by name, ID, role, mobile, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs bg-slate-50 border-slate-200 h-8.5 rounded-xl focus-visible:bg-white"
          />
        </div>

        {/* Filter Badges: Status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            All ({totalStaff})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${statusFilter === 'present'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present ({presentTodayCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('leave')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${statusFilter === 'leave'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 border border-amber-200/70 hover:bg-amber-100'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            On Leave ({leaveTodayCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('absent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${statusFilter === 'absent'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200/70 hover:bg-rose-100'
              }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Absent ({absentTodayCount})
          </button>
        </div>

        {/* Filter by Shift */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Shift:
          </span>
          {['all', 'Morning', 'Evening', 'Night'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShiftFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${shiftFilter === s
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              {s === 'all' ? 'All Shifts' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content View: Daily Roll-Call OR 30-Day Matrix */}
      {activeTab === 'daily' ? (
        /* ==================================================================== */
        /* TAB 1: DAILY ROLL-CALL LIST WITH 1-CLICK ATTENDANCE TOGGLE           */
        /* ==================================================================== */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-display flex items-center gap-2">
                <span>Today's Staff Roll-Call Table</span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ({filteredStaff.length} displayed)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click the <strong className="text-emerald-700">Present (P)</strong> or <strong className="text-rose-700">Absent (A)</strong> icon button on any row to toggle attendance instantly.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {presentTodayCount} of {totalStaff} Present Today
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role &amp; Shift</th>
                  <th className="py-3 px-4">Assigned Route</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Today's Attendance Toggle</th>
                  <th className="py-3 px-4 text-center">Month Attendance Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-700">No staff members match the filters</p>
                      <p className="text-xs text-slate-400">Try clearing the search or status filters above</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const todayStatus = getStaffTodayStatus(staff);
                    const isPresent = todayStatus === 'present';
                    const monthlySalary = Number(staff.monthlySalary) || 0;
                    const dailySalary = staff.dailySalary || Math.round(monthlySalary / 30);
                    const absentDays = staff.absentDays !== undefined ? Number(staff.absentDays) : (!isPresent ? 1 : 0);
                    const presentDays = Math.max(0, 30 - absentDays);
                    const absentDeduction = absentDays * dailySalary;
                    const attendancePct = Math.round((presentDays / 30) * 100);

                    return (
                      <tr
                        key={staff.id}
                        className="hover:bg-slate-50/70 transition duration-150"
                      >
                        {/* 1. Staff Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-display shadow-2xs">
                              {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {staff.name}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                #{staff.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role & Shift */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                                staff.role
                              )}`}
                            >
                              {staff.role}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{staff.shift || 'Morning'} Shift</span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Assigned Route (Only shown for delivery staff) */}
                        <td className="py-3 px-4">
                          {(() => {
                            const r = (staff.role || '').toLowerCase();
                            const isDelivery =
                              r.includes('delivery') ||
                              r.includes('rider') ||
                              r.includes('driver') ||
                              r.includes('courier');

                            if (!isDelivery) {
                              return <span className="text-slate-400 font-mono text-xs">—</span>;
                            }

                            return (
                              <div className="flex items-center gap-1.5 text-slate-700 font-semibold truncate max-w-[150px]">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">
                                  {staff.route && staff.route.toLowerCase() !== 'not assigned'
                                    ? staff.route
                                    : 'Unassigned'}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* 4. Contact */}
                        <td className="py-3 px-4 font-mono text-slate-800 text-xs">
                          {staff.mobile ? (
                            <a href={`tel:${staff.mobile}`} className="hover:underline flex items-center gap-1 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{staff.mobile}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No mobile</span>
                          )}
                        </td>

                        {/* 5. TODAY ATTENDANCE TOGGLE (Supports Present / On Leave / Absent) */}
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            const todayStatus = getStaffTodayStatus(staff);
                            return (
                              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => markStaffToday(staff.id, 'present')}
                                  title="Mark Present"
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${todayStatus === 'present'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
                                    }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => markStaffToday(staff.id, 'leave')}
                                  title="Mark On Leave"
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${todayStatus === 'leave'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-amber-700 hover:bg-white'
                                    }`}
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Leave
                                </button>
                                <button
                                  type="button"
                                  onClick={() => markStaffToday(staff.id, 'absent')}
                                  title="Mark Absent"
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${todayStatus === 'absent'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                                    }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Absent
                                </button>
                              </div>
                            );
                          })()}
                        </td>

                        {/* 6. Month Stats */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {presentDays} / 30 Days ({attendancePct}%)
                            </span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden flex mt-1">
                              <div
                                style={{ width: `${attendancePct}%` }}
                                className="bg-emerald-500 h-full"
                              />
                              <div
                                style={{ width: `${100 - attendancePct}%` }}
                                className="bg-rose-500 h-full"
                              />
                            </div>
                            {absentDays > 0 && (
                              <span className="text-[10px] text-rose-600 font-mono font-bold mt-0.5">
                                -Rs. {absentDeduction.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 7. View Profile Action */}
                        <td className="py-3 px-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectStaff && onSelectStaff(staff)}
                            className="h-7 px-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            Sheet &amp; Profile
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* TAB 2: 30-DAY MASTER ATTENDANCE MATRIX FOR ALL STAFF                 */
        /* ==================================================================== */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-display flex items-center gap-2">
                <span>30-Day Master Attendance Register ({fullMonthName})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Master day-by-day sheet for the entire workforce. Click any day cell (<strong className="text-emerald-700">P</strong> / <strong className="text-amber-700">L</strong> / <strong className="text-rose-700">A</strong>) to toggle attendance.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                P = Present
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                L = On Leave
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                A = Absent
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-left sticky left-0 bg-slate-50/95 z-10 w-[180px] shadow-xs">
                    Staff Member
                  </th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                    <th
                      key={d}
                      className={`py-2 px-1 min-w-[28px] ${d === todayDayNum ? 'bg-blue-100/70 text-blue-900 font-black' : ''
                        }`}
                    >
                      <span>{d}</span>
                      {d === todayDayNum && <span className="block text-[8px] text-blue-600">TODAY</span>}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 bg-emerald-50 text-emerald-800 font-bold min-w-[45px]">
                    Pres
                  </th>
                  <th className="py-2.5 px-2 bg-amber-50 text-amber-800 font-bold min-w-[45px]">
                    Leave
                  </th>
                  <th className="py-2.5 px-2 bg-rose-50 text-rose-800 font-bold min-w-[45px]">
                    Abs
                  </th>
                  <th className="py-2.5 px-3 text-right bg-slate-50 min-w-[80px]">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.map((staff) => {
                  const attendanceMap = staff.attendanceMap && Object.keys(staff.attendanceMap).length > 0
                    ? staff.attendanceMap
                    : generateDefaultAttendanceMap(staff.absentDays || 0, 30);

                  const absentCount = Object.values(attendanceMap).filter((v) => v === 'absent').length;
                  const leaveCount = Object.values(attendanceMap).filter((v) => v === 'leave').length;
                  const presentCount = Object.values(attendanceMap).filter((v) => v === 'present').length;
                  const monthlySalary = Number(staff.monthlySalary) || 0;
                  const dailySalary = staff.dailySalary || Math.round(monthlySalary / 30);
                  const netSalary = Math.max(0, monthlySalary - absentCount * dailySalary);

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition">
                      {/* Fixed Staff Name */}
                      <td className="py-2.5 px-3 text-left sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-xs border-r border-slate-100">
                        <span className="font-bold text-slate-900 block leading-tight text-xs truncate max-w-[170px]">
                          {staff.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {staff.role}
                        </span>
                      </td>

                      {/* 30 Day Interactive Matrix Cells */}
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                        const status = attendanceMap[d] || 'present';
                        const isPres = status === 'present';
                        const isLeave = status === 'leave';
                        const isToday = d === todayDayNum;

                        const label = isPres ? 'P' : (isLeave ? 'L' : 'A');
                        const tooltipText = isPres ? 'Present' : (isLeave ? 'On Leave' : 'Absent');

                        return (
                          <td
                            key={d}
                            className={`p-0.5 ${isToday ? 'bg-blue-50/30' : ''}`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleDayAttendance(staff.id, d)}
                              title={`${staff.name} - Day ${d}: ${tooltipText} (Click to cycle Present → Leave → Absent)`}
                              className={`w-6 h-6 rounded-md font-mono font-bold text-[10px] transition-all flex items-center justify-center cursor-pointer mx-auto ${isPres
                                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                  : isLeave
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                    : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                            >
                              {label}
                            </button>
                          </td>
                        );
                      })}

                      {/* Present Days Total */}
                      <td className="py-2.5 px-2 bg-emerald-50/60 font-mono font-black text-emerald-700 text-xs">
                        {presentCount}
                      </td>

                      {/* Leave Days Total */}
                      <td className="py-2.5 px-2 bg-amber-50/60 font-mono font-black text-amber-700 text-xs">
                        {leaveCount}
                      </td>

                      {/* Absent Days Total */}
                      <td className="py-2.5 px-2 bg-rose-50/60 font-mono font-black text-rose-700 text-xs">
                        {absentCount}
                      </td>

                      {/* Net Salary */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                        Rs. {netSalary.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
