import React from 'react';
import { Plus } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { Button } from '@/components/ui/button';

export default function CustomerHeader({ onOpenAddModal, title = "Customers & Accounts Management" }) {
  const { allCustomersCount, totalKhataReceivable } = useCustomerContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight font-display">
          {title}
        </h2>
        <p className="text-[11px] text-slate-500">
          {allCustomersCount} registered customers · Total Khata receivable <span className="tabular font-semibold">Rs. {totalKhataReceivable.toLocaleString()}</span> · Multi-channel Online Payment
        </p>
      </div>

      <Button
        onClick={onOpenAddModal}
        size="sm"
        className="flex items-center gap-1.5 text-xs font-bold shadow-2xs"
      >
        <Plus className="w-3.5 h-3.5" />
        Add New Customer
      </Button>
    </div>
  );
}
