import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import CustomerDeliveryNav from '../components/CustomerDeliveryNav';
import { useCustomerContext } from '@/context/CustomerContext';

export default function CustomerDeliveryHub() {
  const navigate = useNavigate();
  const { allCustomersCount = 0, totalKhataReceivable = 0 } = useCustomerContext() || {};

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleOpenAddCustomer = () => {
    navigate('/customer-hub/customers?action=add');
  };

  return (
    <div className="customer-delivery-compact relative min-h-screen bg-slate-50/50 pb-10 space-y-3">
      {/* 1. Consolidated Single Main Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              Customers &amp; Deliveries Hub
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {allCustomersCount} Accounts · Rs. {totalKhataReceivable.toLocaleString()} Khata · {todayFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Active Directory
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: Add New Customer CTA */}
        <button
          type="button"
          onClick={handleOpenAddCustomer}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-3" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2. Unified Sub Nav directly below Page Header */}
      <CustomerDeliveryNav />

      {/* 3. Sub-page Content */}
      <Outlet />
    </div>
  );
}
