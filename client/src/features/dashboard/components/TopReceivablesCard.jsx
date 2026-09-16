import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';

export default function TopReceivablesCard() {
  const { customers = [], rawCustomers = [] } = useCustomerContext() || {};
  const allCusts = rawCustomers.length > 0 ? rawCustomers : customers;

  // Filter customers with positive khata balances and sort descending
  const debtors = allCusts
    .filter((c) => Number(c.khataBalance) > 0)
    .sort((a, b) => Number(b.khataBalance) - Number(a.khataBalance))
    .slice(0, 6);

  const maxBalance = debtors.length > 0 ? Math.max(...debtors.map((d) => Number(d.khataBalance) || 0)) : 1;

  return (
    <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                Top Receivables
              </h3>
              <p className="text-[11px] text-slate-400">
                Highest outstanding customer balances
              </p>
            </div>
          </div>
          <Link
            to="/customer-khata-ledger"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
          >
            <span>Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="py-2 divide-y divide-slate-100">
          {debtors.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No outstanding customer balances found.
            </div>
          ) : (
            debtors.map((cust) => {
              const bal = Number(cust.khataBalance) || 0;
              const pct = Math.min(100, Math.max(5, Math.round((bal / maxBalance) * 100)));

              return (
                <div key={cust.id} className="py-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight">
                        {cust.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {cust.phone || 'No Phone'} {cust.area ? `· ${cust.area}` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-rose-600 tabular text-xs">
                        Rs. {bal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {debtors.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Showing top {debtors.length} debtors</span>
          <Link
            to="/customer-khata-ledger"
            className="font-bold text-slate-700 hover:text-emerald-700 transition"
          >
            View all accounts &rarr;
          </Link>
        </div>
      )}
    </Card>
  );
}
