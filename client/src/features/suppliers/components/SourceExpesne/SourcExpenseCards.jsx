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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 font-display tracking-tight">
                Rs. {card.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium truncate">
                {card.subtitle}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${card.badgeBg}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
