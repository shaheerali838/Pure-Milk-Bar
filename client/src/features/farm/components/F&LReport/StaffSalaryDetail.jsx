import React, { useState } from 'react';
import { ArrowLeft, Users, Banknote, Calendar, Filter, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaffSalaryDetail({ data, onClose, onBack, onDeletePayment }) {
  const handleBack = onBack || onClose;

  const {
    totalStaffSalaryPaid = 0,
    salaryPayments = [],
  } = data || {};

  const [selectedStaffFilter, setSelectedStaffFilter] = useState('All');

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  const uniqueStaffNames = Array.from(new Set(salaryPayments.map((p) => p.staffName).filter(Boolean)));

  const filteredPayments = selectedStaffFilter === 'All'
    ? salaryPayments
    : salaryPayments.filter((p) => (p.staffName || '').toLowerCase() === selectedStaffFilter.toLowerCase());

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 md:p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Farm P&amp;L
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 font-display">Staff Salary &amp; Wages Detail</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                Farm Labor Expense
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/staff"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            Manage Staff &amp; Pay Salaries
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </Link>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
            Disbursements: <strong className="text-slate-800 font-bold">{salaryPayments.length} Payments</strong>
          </span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Total Staff Salary Disbursed (Farm Expense)
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            100% Farm P&amp;L Deducted
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">
            - {fmt(totalStaffSalaryPaid)}
          </h2>
          <span className="text-xs text-purple-200 font-medium">PKR</span>
        </div>
        <p className="mt-2 text-xs text-purple-200/90 leading-relaxed max-w-xl">
          All salary payments are deducted exclusively from Farm Operating Profit. Supplier P&amp;L is not affected.
        </p>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter by Staff Member:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedStaffFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  selectedStaffFilter === 'All'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({salaryPayments.length})
              </button>
              {uniqueStaffNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedStaffFilter(name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    selectedStaffFilter === name
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredPayments.length} of {salaryPayments.length} records
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Salary Payments Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No salary payments have been recorded for this period yet. You can disburse salaries from the Staff Management module.
            </p>
            <Link
              to="/staff"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Users className="w-4 h-4" /> Go to Staff Management
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Month / Period</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3">Notes</th>
                  {onDeletePayment && <th className="px-4 py-3 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPayments.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{p.staffName || 'Staff Member'}</div>
                      <div className="text-[10px] text-slate-400">ID: {p.staffId || p.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {p.role || 'Staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {p.monthYear || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.date ? p.date.slice(0, 10) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.paymentMethod === 'CASH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {p.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-rose-700 font-mono text-sm">
                      - {fmt(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={p.notes || ''}>
                      {p.notes || 'Routine salary payment'}
                    </td>
                    {onDeletePayment && (
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete this salary record for ${p.staffName || 'this staff member'}? This will also remove the corresponding farm expense from all reports.`)) {
                              onDeletePayment(p._id || p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete salary record &amp; linked expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
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
