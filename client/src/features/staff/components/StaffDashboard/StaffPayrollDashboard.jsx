import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  Briefcase,
  Sun,
  Moon,
  Sunset,
  ArrowRight,
  UserPlus,
  Calendar,
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  MapPin,
  Truck,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import StaffDetail from '../ManageStaff/StaffDetail';
import StaffAdd from '../ManageStaff/StaffAdd';

export default function StaffPayrollDashboard({ onNavigateTab }) {
  const navigate = useNavigate();
  const { staffList = [], metrics, getStaffStatusOnDate, deleteStaff } = useStaffPayrollContext();
  const todayStr = new Date().toISOString().split('T')[0];

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'detail' | 'edit' | 'add'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editStaff, setEditStaff] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [currentView]);

  // Full-space Staff Detail View (Exact Livestock / Manage Staff Detail Design Match)
  if (currentView === 'detail' && selectedStaff) {
    return (
      <StaffDetail
        staff={selectedStaff}
        staffId={selectedStaff?.id}
        onBack={() => {
          setSelectedStaff(null);
          setCurrentView('dashboard');
        }}
        onClose={() => {
          setSelectedStaff(null);
          setCurrentView('dashboard');
        }}
        onEdit={(staff) => {
          setEditStaff(staff);
          setSelectedStaff(null);
          setCurrentView('edit');
        }}
        onDelete={() => {
          setSelectedStaff(null);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // Full-space Edit Staff View
  if (currentView === 'edit' && editStaff) {
    return (
      <StaffAdd
        editingStaff={editStaff}
        onBack={() => {
          setEditStaff(null);
          setCurrentView('dashboard');
        }}
        onSuccess={() => {
          setEditStaff(null);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // Full-space Add Staff View
  if (currentView === 'add') {
    return (
      <StaffAdd
        onBack={() => setCurrentView('dashboard')}
        onSuccess={() => setCurrentView('dashboard')}
      />
    );
  }

  const handleNavigate = (tab) => {
    if (typeof onNavigateTab === 'function') {
      onNavigateTab(tab);
    } else {
      if (tab === 'manage') navigate('/staff/manage');
      else if (tab === 'attendance') navigate('/staff/attendance');
      else if (tab === 'daily-sheet' || tab === 'dailysheet') navigate('/staff/dailysheet');
      else navigate('/staff');
    }
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('farm') || r.includes('milk')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (r.includes('security')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (r.includes('cashier')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (r.includes('manager')) return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const handleDeleteStaff = (e, staff) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${staff.name}" (${staff.id})?`)) {
      deleteStaff(staff.id);
    }
  };

  const handleSelectStaff = (staff) => {
    if (!staff) return;
    setSelectedStaff(staff);
    setCurrentView('detail');
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const handleEditStaff = (e, staff) => {
    e.stopPropagation();
    setEditStaff(staff);
    setCurrentView('edit');
  };

  // Filtered staff list for the table
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (staff.name || '').toLowerCase().includes(q) ||
        (staff.id || '').toLowerCase().includes(q) ||
        (staff.role || '').toLowerCase().includes(q) ||
        (staff.mobile || '').toLowerCase().includes(q) ||
        (staff.cnic || '').toLowerCase().includes(q) ||
        (staff.route || '').toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'all' ||
        (staff.role || '').toLowerCase().includes(roleFilter.toLowerCase());

      const matchesShift =
        shiftFilter === 'all' ||
        (staff.shift || '').toLowerCase() === shiftFilter.toLowerCase();

      return matchesQuery && matchesRole && matchesShift;
    });
  }, [staffList, searchTerm, roleFilter, shiftFilter]);

  // Role Breakdown
  const roleGroups = staffList.reduce((acc, staff) => {
    const role = staff.role || 'Other';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // Shift Breakdown
  const shiftGroups = staffList.reduce((acc, staff) => {
    const shift = staff.shift || 'Morning';
    acc[shift] = (acc[shift] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* Overview Banner */}
      <div className=" from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-2 text-black ">
        <div>
          
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            Workforce &amp; Payroll Overview
          </h2>
          
        </div>

        
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Staff */}
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
              {metrics.totalStaff} Members
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Total Workforce
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Registered staff on payroll
            </p>
          </div>
        </div>

        {/* 2. Present Today */}
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
              {metrics.turnoutRate}% Turnout
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
              {metrics.presentToday} Present
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Present On Duty
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Currently working today's shifts
            </p>
          </div>
        </div>

        {/* 3. On Leave & Absent */}
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
              Absence
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular font-mono">
              {metrics.leaveToday}L / {metrics.absentToday}A
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Leave &amp; Off Duty
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Excused leaves &amp; off-duty
            </p>
          </div>
        </div>

        {/* 4. Total Monthly Payroll */}
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
              Payroll
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-blue-700 leading-tight tracking-tight mb-0.5 tabular font-mono truncate">
              Rs. {metrics.totalMonthlyPayroll.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Monthly Base Payroll
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              ~Rs. {metrics.totalDailyPayroll.toLocaleString()} / day estimated
            </p>
          </div>
        </div>
      </div>

      {/* Mid Section: Department Roles & Shifts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Roles / Department Allocation */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Department &amp; Role Breakdown
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {Object.keys(roleGroups).length} Departments
              </span>
            </div>

            {Object.keys(roleGroups).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No staff roles added yet. Click &quot;Manage Staff&quot; to add employees.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {Object.entries(roleGroups).map(([role, count]) => {
                  const pct = Math.round((count / (metrics.totalStaff || 1)) * 100);
                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">{role}</span>
                        <span className="text-slate-500 font-mono">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#00a86b]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.('manage')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <span>View Full Roster in Manage Staff</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shift Allocations */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Shift Distribution
              </h3>
              <span className="text-xs font-bold text-slate-500">3 Shifts</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {/* Morning */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                <Sun className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Morning
                </span>
                <span className="text-lg font-black text-amber-900 font-mono">
                  {shiftGroups['Morning'] || 0}
                </span>
              </div>

              {/* Evening */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-center">
                <Sunset className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-blue-800 uppercase block">
                  Evening
                </span>
                <span className="text-lg font-black text-blue-900 font-mono">
                  {shiftGroups['Evening'] || 0}
                </span>
              </div>

              {/* Night */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 text-center">
                <Moon className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">
                  Night
                </span>
                <span className="text-lg font-black text-indigo-900 font-mono">
                  {shiftGroups['Night'] || 0}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>Morning Milking &amp; Delivery:</span>
                <strong className="text-slate-800">05:00 AM - 01:00 PM</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Evening Milking &amp; Sourcing:</span>
                <strong className="text-slate-800">01:00 PM - 09:00 PM</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Night Dairy Security &amp; Care:</span>
                <strong className="text-slate-800">09:00 PM - 05:00 AM</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.('daily-sheet')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-800 transition cursor-pointer"
          >
            <span>Open Daily Sheet for Shift Tracking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Roll-Call Summary */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Today&apos;s Quick Attendance
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                {metrics.turnoutRate}% On Duty
              </span>
            </div>

            {staffList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No staff registered. Add staff members to track attendance.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2 max-h-[220px] overflow-y-auto">
                {staffList.slice(0, 5).map((staff) => {
                  const status = getStaffStatusOnDate(staff.id, todayStr);
                  const isPres = status === 'present';
                  const isLeave = status === 'leave';

                  return (
                    <div
                      key={staff.id}
                      onClick={() => handleSelectStaff(staff)}
                      className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition"
                      title="Click to view full staff details"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{staff.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {staff.role} • {staff.shift}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPres
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isLeave
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isPres ? 'Present' : isLeave ? 'On Leave' : 'Absent'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab?.('attendance')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <span>View Full Attendance Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Staff Directory Table (Exact Add/Manage Staff Table & Detail Flow) */}
      <div className="space-y-3 pt-2">
        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Staff Directory &amp; Roster
              </h3>
              <p className="text-xs text-slate-500">
                Click any employee row to open full Staff Detail Profile
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, ID, CNIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="delivery">Delivery Riders</option>
              <option value="farm">Farm Workers</option>
              <option value="security">Security</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Dairy Manager</option>
            </select>

            {/* Shift Filter */}
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold outline-none cursor-pointer"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
        </div>

        {/* Staff Information Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 font-display">
              Workforce Roster Table
            </span>
            <span className="text-xs font-bold text-slate-500">
              Showing <strong className="text-slate-800">{filteredStaff.length}</strong> of {staffList.length} staff
            </span>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="py-14 text-center px-4 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 font-display">
                {staffList.length === 0 ? 'No Staff Members Registered' : 'No Matching Staff Found'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {staffList.length === 0
                  ? 'No staff members registered in the workforce roster yet.'
                  : 'Try adjusting your search keyword or clearing the role/shift filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Employee Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">CNIC</th>
                    <th className="py-3 px-4">Monthly Salary</th>
                    <th className="py-3 px-4">Assigned Route</th>
                    <th className="py-3 px-4 text-center">Duty Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStaff.map((staff) => {
                    const todayStatus = getStaffStatusOnDate(staff.id, todayStr);
                    const isDelivery =
                      (staff.role || '').toLowerCase().includes('delivery') ||
                      (staff.role || '').toLowerCase().includes('rider');

                    return (
                      <tr
                        key={staff.id}
                        onClick={() => handleSelectStaff(staff)}
                        className="hover:bg-emerald-50/40 transition duration-150 cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{staff.id}
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
                                Joined {staff.joinedDate || 'Recently'}
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
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {staff.shift || 'Morning'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-800 font-bold">
                          {staff.mobile || '—'}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {staff.cnic || '—'}
                        </td>

                        <td className="py-3 px-4 font-mono tabular">
                          <span className="font-black text-slate-900">
                            Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (~Rs. {staff.dailySalary || Math.round((staff.monthlySalary || 0) / 30)}/d)
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isDelivery ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Truck className="w-3 h-3 text-amber-600" />
                              {staff.route && staff.route.toLowerCase() !== 'not assigned'
                                ? staff.route
                                : 'Unassigned'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Farm Station</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
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
                                  ? 'bg-emerald-500 animate-pulse'
                                  : todayStatus === 'leave'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {todayStatus === 'present'
                              ? 'Present'
                              : todayStatus === 'leave'
                              ? 'On Leave'
                              : 'Absent'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStaff(staff);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleEditStaff(e, staff)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                              title="Edit Staff"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteStaff(e, staff)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
    </div>
  );
}
