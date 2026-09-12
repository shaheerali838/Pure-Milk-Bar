import React from 'react';
import { Users, UserCheck, CreditCard, Wallet } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { Card, CardContent } from '@/components/ui/card';

export default function CustomerStatsCards() {
  const { allCustomersCount, activeAccountsCount, withKhataBalCount, totalKhataReceivable } =
    useCustomerContext();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5">
      {/* Total Customers */}
      <Card className="p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
              TOTAL CUSTOMERS
            </span>
            <div className="text-lg font-black text-slate-800 leading-tight mt-0.5 tabular">{allCustomersCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
      </Card>

      {/* Active Accounts */}
      <Card className="p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
              ACTIVE ACCOUNTS
            </span>
            <div className="text-lg font-black text-slate-800 leading-tight mt-0.5 tabular">{activeAccountsCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        </div>
      </Card>

      {/* With Khata Bal */}
      <Card className="p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
              WITH KHATA BAL.
            </span>
            <div className="text-lg font-black text-slate-800 leading-tight mt-0.5 tabular">{withKhataBalCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
      </Card>

      {/* Total Receivable */}
      <Card className="p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
              TOTAL RECEIVABLE
            </span>
            <div className="text-lg font-black text-slate-900 leading-tight mt-0.5 tabular">
              Rs. {totalKhataReceivable.toLocaleString()}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
