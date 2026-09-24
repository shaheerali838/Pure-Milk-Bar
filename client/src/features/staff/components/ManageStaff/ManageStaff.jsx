import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Clock,
  DollarSign,
  Briefcase,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  UserCheck,
  Truck,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';
import StaffAdd from './StaffAdd';
import StaffDetail from './StaffDetail';

export default function ManageStaff() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const {
    staffList = [],
    metrics,
    deleteStaff,
    getStaffStatusOnDate,
  } = useStaffPayrollContext();

  const [currentView, setCurrentView] = useState('list'); // 'list' | 'add' | 'edit' | 'detail'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editStaff, setEditStaff] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  
  const [selectedIds, setSelectedIds] = useState([]);
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredStaff.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} staff members?`)) return;
    for (const id of selectedIds) {
      await deleteStaff(id);
    }
    setSelectedIds([]);
  };

  // 1. Full-space Add Staff View (Exact AnimalAdd Design Match)
  if (currentView === 'add') {
    return (
      <StaffAdd
        onBack={() => setCurrentView('list')}
        onSuccess={() => setCurrentView('list')}
      />
    );
  }

  // 2. Full-space Edit Staff View (Exact AnimalAdd Design Match)
  if (currentView === 'edit' && editStaff) {
    return (
      <StaffAdd
        editingStaff={editStaff}
        onBack={() => {
          setEditStaff(null);
          setCurrentView('list');
        }}
        onSuccess={() => {
          setEditStaff(null);
          setCurrentView('list');
        }}
      />
    );
  }

  // 3. Full-space Staff Detail View (Exact AnimalDetail Design Match)
  if (currentView === 'detail' && selectedStaff) {
    return (
      <StaffDetail
        staff={selectedStaff}
        onBack={() => {
          setSelectedStaff(null);
          setCurrentView('list');
        }}
        onEdit={(staff) => {
          setEditStaff(staff);
          setSelectedStaff(null);
          setCurrentView('edit');
        }}
        onDelete={() => {
          setSelectedStaff(null);
          setCurrentView('list');
        }}
      />
    );
  }

  // Filter staff list
  const filteredStaff = staffList.filter((staff) => {
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

  const todayStr = new Date().toISOString().split('T')[0];

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

  const handleEditStaff = (e, staff) => {
    e.stopPropagation();
    setEditStaff(staff);
    setCurrentView('edit');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Top Summary Cards (Exact AnimalStatsCards Signature Style) */}
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
              Registered employees
            </p>
          </div>
        </div>

        {/* 2. Active / On Duty */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #009966' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#00996615' }}
            >
              <UserCheck style={{ width: 16, height: 16, color: '#009966' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono">
              {metrics.turnoutRate}% Rate
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
              {metrics.presentToday} Present
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Active / On Duty
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Working today's dairy shifts
            </p>
          </div>
        </div>

        {/* 3. Delivery Riders */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #f59e0b' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#f59e0b15' }}
            >
              <Truck style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200">
              Fleet
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-amber-800 leading-tight tracking-tight mb-0.5 tabular">
              {
                staffList.filter((s) =>
                  (s.role || '').toLowerCase().includes('delivery') ||
                  (s.role || '').toLowerCase().includes('rider')
                ).length
              }{' '}
              Riders
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Delivery Logistics
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Assigned to customer routes
            </p>
          </div>
        </div>

        {/* 4. Monthly Budget / Operational Duty Card */}
        {isAdmin ? (
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
                Base salary obligation
              </p>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
            style={{ borderTop: '4px solid #00a86b' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{ background: '#00a86b15' }}
              >
                <Users style={{ width: 16, height: 16, color: '#00a86b' }} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
                Operations
              </span>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-[#00a86b] leading-tight tracking-tight mb-0.5 tabular font-mono truncate">
                {metrics.activeStaffCount} / {metrics.totalStaff}
              </p>
              <p className="text-xs font-bold text-slate-700 font-display">
                Workforce Active
              </p>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Roster operational status
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Controls & Search Toolbar with 'Add Staff' Button */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-80 shadow-2xs focus-within:border-emerald-600 focus-within:bg-white transition">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, role, phone, CNIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filters & Add Staff Button */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="delivery">Delivery Riders</option>
            <option value="farm">Farm Workers</option>
            <option value="milking">Milking Staff</option>
            <option value="security">Security</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
          </select>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Shifts</option>
            <option value="morning">Morning</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>

          {/* Right-Side Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentView('add')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a86b] hover:bg-[#008f5a] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* 3. Staff Information Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Staff Directory Table
            </h3>
            <p className="text-xs text-slate-400">
              Click any employee row to open full Livestock-style Staff Profile
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-800">{filteredStaff.length}</strong> of {staffList.length} staff
          </span>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="py-16 text-center px-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
              <Users className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 font-display">
              {staffList.length === 0 ? 'No Staff Members Registered' : 'No Matching Staff Found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {staffList.length === 0
                ? 'Click the "Add Staff" button on the top-right to register workers, delivery men, and security staff.'
                : 'Try clearing your search keyword or changing the role/shift filters.'}
            </p>
            {staffList.length === 0 && (
              <button
                type="button"
                onClick={() => setCurrentView('add')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a86b] text-white text-xs font-bold shadow-xs hover:bg-[#008f5a] transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">
                    <input type="checkbox" checked={selectedIds.length === filteredStaff.length && filteredStaff.length > 0} onChange={handleSelectAll} className="cursor-pointer" />
                  </th>
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">CNIC</th>
                  {isAdmin && <th className="py-3 px-4">Monthly Salary</th>}
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
                      onClick={() => {
                        setSelectedStaff(staff);
                        setCurrentView('detail');
                      }}
                      className="hover:bg-emerald-50/40 transition duration-150 cursor-pointer group"
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(staff.id)} 
                          onChange={(e) => handleSelectRow(e, staff.id)} 
                          className="cursor-pointer" 
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{staff.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {staff.image ? (
                            <img
                              src={staff.image}
                              alt={staff.name}
                              className="w-8 h-8 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 font-display">
                              {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                          )}
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

                      {isAdmin && (
                        <td className="py-3 px-4 font-mono tabular">
                          <span className="font-black text-slate-900">
                            Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (~Rs. {staff.dailySalary || Math.round((staff.monthlySalary || 0) / 30)}/d)
                          </span>
                        </td>
                      )}

                      <td className="py-3 px-4">
                        {isDelivery ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {staff.route || 'Unassigned'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
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
                            onClick={(e) => handleEditStaff(e, staff)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                            title="Edit Staff"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteStaff(e, staff)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
  );
}
