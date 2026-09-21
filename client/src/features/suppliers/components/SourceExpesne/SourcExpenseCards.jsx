import React from 'react';
import { DollarSign, Fuel, FlaskConical, Users2, TrendingUp } from 'lucide-react';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';

export default function SourcExpenseCards() {
  const {
    expenses,
    totalSourcingCosts,
    collectionRouteFuel,
    chillingLabTesting,
    handlingLabor,
  } = useSourcExpenseContext();

  const cards = [
    {
      title: 'Total Sourcing Costs',
      amount: totalSourcingCosts,
      subtitle: `${expenses.length} vouchers recorded`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badge: 'All Procurement',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Collection Route Fuel',
      amount: collectionRouteFuel,
      subtitle: 'Van diesel & route transit',
      icon: Fuel,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      badge: 'Logistics',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Chilling & Lab Testing',
      amount: chillingLabTesting,
      subtitle: 'Preservation & chemical tests',
      icon: FlaskConical,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      badge: 'Quality Lab',
      badgeBg: 'bg-indigo-50 text-indigo-700',
    },
    {
      title: 'Handling & Labor',
      amount: handlingLabor,
      subtitle: 'Loading, docks & weighing',
      icon: Users2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badge: 'Operations',
      badgeBg: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const colorHex = card.color === 'text-emerald-600' ? '#059669' :
                         card.color === 'text-blue-600' ? '#2563eb' :
                         card.color === 'text-indigo-600' ? '#4f46e5' :
                         card.color === 'text-amber-600' ? '#d97706' : '#64748b';
                         
        return (
          <div
            key={card.title}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs"
            style={{ borderTop: `3.5px solid ${colorHex}` }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${card.bgColor} ${card.color}`}
              >
                <Icon className="w-[15px] h-[15px]" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                  {card.badge}
                </span>
              </div>
            </div>

            <div>
              <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                Rs. {card.amount.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-800">{card.title}</p>
              <p className="text-[10px] font-medium text-slate-400 line-clamp-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
