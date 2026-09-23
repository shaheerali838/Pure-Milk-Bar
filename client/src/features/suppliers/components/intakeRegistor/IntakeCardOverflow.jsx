import React, { useState } from 'react';
import { Droplets, DollarSign, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';
import IntakeCardDetailModal from './IntakeCardDetailModal';

export default function IntakeCardOverflow({ onViewBatch }) {
  const { totals, intakeLogs, updateBatchSettlement } = useIntakeContext();
  const posCtx = usePOSContext?.();
  const supplierMilkStock = posCtx?.inventoryMetrics?.supplierMilkStock ?? (totals.totalProcuredVolume > 0 ? totals.totalProcuredVolume.toFixed(1) : '0');
  const [activeModalCard, setActiveModalCard] = useState(null);

  const statCards = [
    {
      id: 'volume',
      label: 'Procured Volume',
      value: `${(totals.totalProcuredVolume || 0).toLocaleString()} L`,
      sub: `M: ${(totals.morningVolume || 0).toFixed(0)} L • E: ${(totals.eveningVolume || 0).toFixed(0)} L`,
      icon: Droplets,
      color: '#155dfc',
      badge: 'Total Liters',
    },
    {
      id: 'available_stock',
      label: 'Available Supplier Stock',
      value: `${supplierMilkStock} L`,
      sub: 'In dock chiller storage',
      icon: Droplets,
      color: '#0284c7',
      badge: 'Chiller Stock',
    },
    {
      id: 'spend',
      label: 'Total Intake Spend',
      value: `Rs. ${(totals.totalIntakeSpend || 0).toLocaleString()}`,
      sub: `Across ${totals.totalRecords} collection slips`,
      icon: DollarSign,
      color: '#009966',
      badge: 'Total Cost',
    },
    {
      id: 'rate',
      label: 'Avg Purchase Rate',
      value: `Rs. ${(totals.avgPurchaseRate || 0).toFixed(1)} / L`,
      sub: 'Fat-adjusted weighted avg',
      icon: TrendingUp,
      color: '#4f39f6',
      badge: 'Weighted Avg',
    },
    {
      id: 'pending',
      label: 'Pending Settlements',
      value: `Rs. ${(totals.pendingSettlements || 0).toLocaleString()}`,
      sub: 'Unsettled supplier balances',
      icon: Clock,
      color: '#d97706',
      badge: 'Pending Due',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3">
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
            {/* Top Row: Icon Container, Badge & Arrow */}
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

            {/* Bottom Row: Value, Label, and Subtitle */}
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

      {/* Intake Card Detail Modal */}
      {activeModalCard && (
        <IntakeCardDetailModal
          cardType={activeModalCard}
          onClose={() => setActiveModalCard(null)}
          intakeLogs={intakeLogs}
          totals={totals}
          updateBatchSettlement={updateBatchSettlement}
          onViewBatch={onViewBatch}
        />
      )}
    </>
  );
}
