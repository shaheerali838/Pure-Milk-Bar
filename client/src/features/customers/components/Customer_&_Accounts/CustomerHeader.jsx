import React from 'react';
import { Download, Bike, Search, Bell, Plus } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerHeader({ onOpenAddModal }) {
  const { allCustomersCount, totalKhataReceivable } = useCustomerContext();

  return (
    <div className="space-y-4 mb-6">
      {/* Top Navbar / Breadcrumbs */}

      {/* Main Title Banner */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customers &amp; Accounts Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {allCustomersCount} registered customers · Total Khata receivable Rs.{' '}
            {totalKhataReceivable.toLocaleString()} · Multi-channel Online Payment support
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#00a86b] hover:bg-[#00925d] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>
    </div>
  );
}
