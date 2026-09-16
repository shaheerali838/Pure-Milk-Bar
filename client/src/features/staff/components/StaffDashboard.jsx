import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Users, Phone, MapPin, Clock } from 'lucide-react';
import { useStaffContext } from '@/context/StaffContext';
import StaffCardOverflow from './StaffCardOverflow';
import StaffAdd from './StaffAdd';
import StaffDetail from './StaffDetail';

export default function StaffDashboard() {
  const { staffList = [], deleteStaff } = useStaffContext();

  // Page View Modes: 'list' | 'add' | 'edit' | 'detail'
  // When 'add' or 'edit' or 'detail' is active, it renders in full space to the right of the sidebar
  const [currentView, setCurrentView] = useState('list');
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  // 1. Full-Width Add Staff View (Opens beside the ERP sidebar taking full space)
  if (currentView === 'add') {
    return <StaffAdd onBack={() => setCurrentView('list')} />;
  }

  // 2. Full-Width Edit Staff View (Prefilled form taking full space)
  if (currentView === 'edit' && selectedStaff) {
    return (
      <StaffAdd
        editingStaff={selectedStaff}
        onBack={() => {
          setSelectedStaff(null);
          setCurrentView('list');
        }}
      />
    );
  }

  // 3. Full-Width Staff Detail View (Taking full space)
  if (currentView === 'detail' && selectedStaff) {
    return (
      <StaffDetail
        staff={selectedStaff}
        onBack={() => {
          setSelectedStaff(null);
          setCurrentView('list');
        }}
        onEdit={(staff) => {
          setSelectedStaff(staff);
          setCurrentView('edit');
        }}
        onDelete={(id) => {
          deleteStaff(id);
          setSelectedStaff(null);
          setCurrentView('list');
        }}
      />
    );
  }

  // Filter staff by search and role
  const filteredStaff = staffList.filter((staff) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (staff.name || '').toLowerCase().includes(q) ||
      (staff.id || '').toLowerCase().includes(q) ||
      (staff.role || '').toLowerCase().includes(q) ||
      (staff.mobile || '').toLowerCase().includes(q) ||
      (staff.cnic || '').toLowerCase().includes(q) ||
      (staff.route || '').toLowerCase().includes(q);

    const matchesRole =
      selectedRoleFilter === 'all' ||
      (staff.role || '').toLowerCase().includes(selectedRoleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${name}" from staff records?`)) {
      deleteStaff(id);
    }
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (r.includes('farm')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r.includes('security')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (r.includes('cashier')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (r.includes('manager')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r.includes('accountant')) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Header with Title & 'Add Staff' Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-display">
              Staff &amp; Workforce Management
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dairy farm labor, delivery men, security, and monthly staff payroll
          </p>
        </div>

        {/* 'Add Staff' Button: switches to full-width Add view */}
        <button
          type="button"
          onClick={() => setCurrentView('add')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00a86b] hover:bg-[#008f5a] text-white text-xs font-bold shadow-xs transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Staff
        </button>
      </div>

      {/* 2. Top 5 Summary Cards */}
      <StaffCardOverflow />

      {/* 3. Main Data Card with Search & Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          {/* Left Search Input */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-2xs focus-within:border-[#00a86b] transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search staff by name, role, mobile, CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'delivery', label: 'Riders' },
              { id: 'farm', label: 'Farm Work' },
              { id: 'security', label: 'Security' },
              { id: 'cashier', label: 'Cashier' },
              { id: 'manager', label: 'Manager' },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedRoleFilter(filter.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedRoleFilter === filter.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Table */}
        {filteredStaff.length === 0 ? (
          <div className="py-14 text-center px-4 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-display">
              {staffList.length === 0 ? 'No Staff Members Added Yet' : 'No Matching Staff Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {staffList.length === 0
                ? 'Click the "Add Staff" button to register farm workers, delivery riders, or security staff.'
                : 'Try adjusting your search query or role filter.'}
            </p>
            {staffList.length === 0 && (
              <button
                type="button"
                onClick={() => setCurrentView('add')}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a86b] text-white text-xs font-bold shadow-xs hover:bg-[#008f5a] transition cursor-pointer"
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
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">CNIC</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Assigned Area</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    onClick={() => {
                      setSelectedStaff(staff);
                      setCurrentView('detail');
                    }}
                    className="hover:bg-emerald-50/30 transition duration-150 cursor-pointer"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {staff.id}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 font-display">
                          {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="font-bold text-slate-900">{staff.name}</span>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(staff.role)}`}>
                        {staff.role}
                      </span>
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{staff.shift || 'Morning'}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-slate-800 font-bold tabular">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{staff.mobile || '—'}</span>
                      </div>
                      {staff.email && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {staff.email}
                        </p>
                      )}
                    </td>

                    {/* CNIC */}
                    <td className="py-3 px-4 font-mono text-slate-600 tabular">
                      {staff.cnic || '—'}
                    </td>

                    {/* Monthly Salary */}
                    <td className="py-3 px-4 font-mono font-black text-slate-900 tabular">
                      Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
                    </td>

                    {/* Route */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{staff.route || 'Not Assigned'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setCurrentView('detail');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setCurrentView('edit');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, staff.id, staff.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Staff Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
