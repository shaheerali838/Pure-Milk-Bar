import React, { useState } from 'react';
import { Users, Droplets, Receipt, Clock, ChevronRight } from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import SupplierCardDetailModal from './SupplierCardDetailModal';

export default function SupplierCardOverflow({ onSelectSupplier }) {
  const { totals, suppliers, settleSupplierBalance } = useSupplierContext();
  const [activeModalCard, setActiveModalCard] = useState(null);

  const statCards = [
    {
      id: 'suppliers',
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-4">
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
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:border-slate-300"
            style={{ borderTop: `3.5px solid ${color}` }}
            title={`Click to view detailed ${label} breakdown`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                style={{ background: `${color}15` }}
              >
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                  {badge}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div>
              <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                {value}
              </p>
              <p className="text-xs font-bold text-slate-800">{label}</p>
              <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{sub}</p>
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
