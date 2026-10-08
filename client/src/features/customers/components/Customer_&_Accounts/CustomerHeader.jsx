import React from 'react';
import { Users, Plus } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerHeader({ onOpenAddModal, title = "Customers & Accounts Management" }) {
  const { allCustomersCount, totalKhataReceivable } = useCustomerContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {allCustomersCount} Accounts · Rs. {totalKhataReceivable.toLocaleString()} Khata
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              Active Directory
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 stroke-3" />
        <span>Add New Customer</span>
      </button>
    </div>
  );
}
