import React, { useState } from 'react';
import { Droplets, DollarSign, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import IntakeCardDetailModal from './IntakeCardDetailModal';

export default function IntakeCardOverflow({ onViewBatch }) {
  const { totals, intakeLogs, updateBatchSettlement } = useIntakeContext();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
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
            {/* Top Row: Icon Container, Badge & Arrow */}
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

            {/* Bottom Row: Value, Label, and Subtitle */}
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
