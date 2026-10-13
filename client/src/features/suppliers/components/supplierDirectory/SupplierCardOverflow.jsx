import React, { useState, useMemo } from 'react';
import { Users, Droplets, DollarSign, Receipt, Clock, ChevronRight } from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { KpiGridSkeleton } from '@/components/ui/skeleton';
import { getTodayDateStr, normalizeDateStr } from '@/utils/dateUtils';
import SupplierCardDetailModal from './SupplierCardDetailModal';

export default function SupplierCardOverflow({ onSelectSupplier, selectedDate }) {
  const { totals, suppliers, settleSupplierBalance, isLoading } = useSupplierContext();
  const { intakeLogs = [] } = useIntakeContext() || {};
  const [activeModalCard, setActiveModalCard] = useState(null);

  const todayStr = getTodayDateStr();
  const targetDate = selectedDate || todayStr;
  const isToday = targetDate === todayStr;

  const dateStats = useMemo(() => {
    const logs = (intakeLogs || []).filter((l) => {
      const lDate = normalizeDateStr(l.date || l.createdAt);
      return lDate === targetDate;
    });

    const activeSuppliersSet = new Set();
    let sourcedLiters = 0;
    let spend = 0;
    let payouts = 0;

    logs.forEach((b) => {
      if (b.supplierId) activeSuppliersSet.add(String(b.supplierId));
      else if (b.supplierName) activeSuppliersSet.add(b.supplierName.trim().toLowerCase());

      const qty = parseFloat(b.quantity || b.quantityLiters) || 0;
      const rate = parseFloat(b.ratePerLiter || b.rate) || 220;
      const cost = parseFloat(b.totalCost || b.totalAmount) || (qty * rate);
      const paid = b.paidAmount !== undefined && b.paidAmount !== ''
        ? Math.min(cost, Math.max(0, parseFloat(b.paidAmount) || 0))
        : (b.settlement === 'Paid' ? cost : (b.settlement === 'Partial' ? cost * 0.5 : 0));

      sourcedLiters += qty;
      spend += cost;
      payouts += paid;
    });

    return {
      activeCount: activeSuppliersSet.size,
      sourcedLiters: parseFloat(sourcedLiters.toFixed(1)),
      spend: Math.round(spend),
      payouts: Math.round(payouts),
    };
  }, [intakeLogs, targetDate]);

  if (isLoading && suppliers.length === 0) {
    return <KpiGridSkeleton count={5} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4" />;
  }

  const statCards = [
    {
      id: 'suppliers',
      label: 'Registered Suppliers',
      value: `${totals.totalSuppliers ?? totals.totalVendors} Suppliers`,
      sub: `${dateStats.activeCount} Supplied on ${targetDate} • ${(totals.totalSuppliers ?? 0) - dateStats.activeCount} No Intake`,
      icon: Users,
      color: '#009966',
      badge: isToday ? 'Active Today' : `Date: ${targetDate}`,
    },
    {
      id: 'sourced',
      label: isToday ? "Today's Sourced" : `Sourced (${targetDate})`,
      value: `${dateStats.sourcedLiters.toLocaleString()} L`,
      sub: `All-Time: ${totals.totalSourcedLiters.toLocaleString()} L Total`,
      icon: Droplets,
      color: '#155dfc',
      badge: isToday ? 'Procured Today' : 'Date Volume',
    },
    {
      id: 'intake_spend',
      label: isToday ? "Today's Intake Spend" : `Intake Spend (${targetDate})`,
      value: `Rs. ${dateStats.spend.toLocaleString()}`,
      sub: `All-Time: Rs. ${(totals.totalIntakeSpend ?? totals.totalProcurementValue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: '#0d9488',
      badge: isToday ? 'Spend Today' : 'Date Spend',
    },
    {
      id: 'payouts',
      label: isToday ? "Today's Payouts" : `Payouts (${targetDate})`,
      value: `Rs. ${dateStats.payouts.toLocaleString()}`,
      sub: `All-Time: Rs. ${totals.totalPayouts.toLocaleString()}`,
      icon: Receipt,
      color: '#10b981',
      badge: isToday ? 'Paid Today' : 'Date Payout',
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
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
