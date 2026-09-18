import React, { useState } from 'react';
import { Users, Droplets, Receipt, Clock, ChevronRight } from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import SupplierCardDetailModal from './SupplierCardDetailModal';

export default function SupplierCardOverflow({ onSelectSupplier }) {
  const { totals, suppliers, settleSupplierBalance } = useSupplierContext();
  const [activeModalCard, setActiveModalCard] = useState(null);

  const statCards = [
    {
      id: 'vendors',
      label: 'Registered Suppliers',
      value: `${totals.totalSuppliers ?? totals.totalVendors} Suppliers`,
      sub: `${totals.activeSuppliers ?? totals.activeVendors} Active • ${totals.inactiveSuppliers ?? totals.inactiveVendors} Inactive`,
      icon: Users,
      color: '#009966',
      badge: 'Total Suppliers',
    },
    {
      id: 'sourced',
      label: 'Total Sourced Liters',
      value: `${totals.totalSourcedLiters.toLocaleString()} L`,
      sub: 'Total milk volume procured',
      icon: Droplets,
      color: '#155dfc',
      badge: 'Procured Volume',
    },
    {
      id: 'payouts',
      label: 'Total Supplier Payouts',
      value: `Rs. ${totals.totalPayouts.toLocaleString()}`,
      sub: 'Disbursed supplier payments',
      icon: Receipt,
      color: '#10b981',
      badge: 'Total Paid',
    },
    {
      id: 'balances',
      label: 'Outstanding Balances',
      value: `Rs. ${totals.outstandingBalances.toLocaleString()}`,
      sub: 'Pending farmer clearance',
      icon: Clock,
      color: '#d97706',
      badge: 'Pending Due',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map(({ id, label, value, sub, icon: Icon, color, badge }) => (
          <div
            key={id}
            onClick={() => setActiveModalCard(id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveModalCard(id);
              }
            }}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer select-none group"
            style={{ borderTop: `4px solid ${color}` }}
            title={`Click to view detailed ${label} breakdown`}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                style={{ background: `${color}15` }}
              >
                <Icon style={{ width: 16, height: 16, color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
                  {badge}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 font-display tabular">
                {value}
              </p>
              <p className="text-xs font-bold text-slate-700">{label}</p>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[11px] font-medium text-slate-400">{sub}</p>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  View Detail &rarr;
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Detail Modal */}
      {activeModalCard && (
        <SupplierCardDetailModal
          cardType={activeModalCard}
          onClose={() => setActiveModalCard(null)}
          suppliers={suppliers}
          totals={totals}
          onSelectSupplier={onSelectSupplier}
          settleSupplierBalance={settleSupplierBalance}
        />
      )}
    </>
  );
}
