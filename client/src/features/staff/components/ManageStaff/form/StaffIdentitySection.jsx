import React from 'react';
import { Users, Tag } from 'lucide-react';
import { ROLE_OPTIONS, SHIFT_OPTIONS } from './staffFormConstants';

export default function StaffIdentitySection({ formData, onChange, isEdit }) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
            isEdit ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
          1. Staff Identification &amp; Designation
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Staff ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Tag className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              name="id"
              disabled={isEdit}
              value={formData.id}
              onChange={onChange}
              placeholder="Auto-generated"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Employee Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="e.g. Tariq Mehmood"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Job Role / Designation <span className="text-rose-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={onChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Work Shift <span className="text-rose-500">*</span>
          </label>
          <select
            name="shift"
            value={formData.shift}
            onChange={onChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
          >
            {SHIFT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'Both' ? 'Both (Morning & Evening)' : `${opt} Shift`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
