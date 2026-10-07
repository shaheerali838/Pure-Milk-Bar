import React from 'react';
import { Banknote, ShieldCheck, Calendar } from 'lucide-react';
import { STATUS_OPTIONS } from './staffFormConstants';

export default function StaffSalarySection({
  formData,
  onChange,
  isAdmin,
  calculatedDailySalary,
}) {
  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
        <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
          <Banknote className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
          4. Monthly Salary &amp; Payroll Rate Terms
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {isAdmin ? (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Monthly Base Salary (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  name="monthlySalary"
                  value={formData.monthlySalary}
                  onChange={onChange}
                  placeholder="35000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Calculated Daily Wage
              </label>
              <div className="px-3 py-2 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-emerald-800 font-mono font-black text-xs">
                Rs. {calculatedDailySalary.toLocaleString()} / day
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600">
              Salary terms &amp; financial compensation are managed exclusively by the Owner.
            </span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Joining / Registration Date
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <input
              type="date"
              name="joinedDate"
              value={formData.joinedDate}
              onChange={onChange}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Employment Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'Active' ? 'Active On Duty' : opt === 'On Leave' ? 'On Leave' : 'Off Duty'}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
