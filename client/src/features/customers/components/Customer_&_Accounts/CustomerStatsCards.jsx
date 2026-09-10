import React from 'react';
import { Users, UserCheck, CreditCard } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerStatsCards() {
  const { allCustomersCount, activeAccountsCount, withKhataBalCount, totalKhataReceivable } =
    useCustomerContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Customers */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            TOTAL CUSTOMERS
          </span>
          <div className="text-2xl font-black text-slate-800 mt-1">{allCustomersCount}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Active Accounts */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            ACTIVE ACCOUNTS
          </span>
          <div className="text-2xl font-black text-slate-800 mt-1">{activeAccountsCount}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <UserCheck className="w-4 h-4" />
        </div>
      </div>

      {/* With Khata Bal */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            WITH KHATA BAL.
          </span>
          <div className="text-2xl font-black text-slate-800 mt-1">{withKhataBalCount}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <CreditCard className="w-4 h-4" />
        </div>
      </div>

      {/* Total Receivable */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            TOTAL RECEIVABLE
          </span>
          <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
            <span>Rs. {totalKhataReceivable.toLocaleString()}</span>
            <span className="text-xs font-bold text-rose-500">↓ 5%</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
          <CreditCard className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
