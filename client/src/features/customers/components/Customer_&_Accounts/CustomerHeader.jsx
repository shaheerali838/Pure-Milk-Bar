import React from 'react';
import { Plus } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerHeader({ onOpenAddModal }) {
  const { allCustomersCount, totalKhataReceivable } = useCustomerContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
          Customers &amp; Accounts Management
        </h2>
        <p className="text-[11px] text-slate-500">
          {allCustomersCount} registered customers · Total Khata receivable Rs.{' '}
          {totalKhataReceivable.toLocaleString()} · Multi-channel Online Payment
        </p>
      </div>

      <button
        onClick={onOpenAddModal}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00a86b] hover:bg-[#00925d] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add New Customer
      </button>
    </div>
  );
}

