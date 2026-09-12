import React from 'react';
import { Beef, Droplets, Activity, DollarSign } from 'lucide-react';

export default function FarmCardOverflow({ 
  totalAnimals = 0, 
  cowsCount = 0, 
  buffCount = 0, 
  totalFarmYield = 0, 
  avgAnimalYield = 0, 
  dailyNetProfit = 0, 
  monthlyNetProfit = 0 
}) {
  const statCards = [
    {
      label: "Total Animals",
      value: `${totalAnimals}`,
      sub: `${cowsCount} Cows • ${buffCount} Buffaloes`,
      icon: Beef,
      color: "#009966",
      badge: "Active Herd"
    },
    {
      label: "Total Farm Yield",
      value: `${totalFarmYield.toFixed(1)} L`,
      sub: "Daily total production",
      icon: Droplets,
      color: "#155dfc",
      badge: "Today's Milk"
    },
    {
      label: "Average Animal Yield",
      value: `${avgAnimalYield.toFixed(1)} L`,
      sub: "Avg output per animal",
      icon: Activity,
      color: "#009689",
      badge: "Yield / Head"
    },
    {
      label: "Farm Net Profit",
      value: `Rs. ${dailyNetProfit.toLocaleString()}`,
      sub: `~ Rs. ${(monthlyNetProfit / 100000).toFixed(2)}M / month net`,
      icon: DollarSign,
      color: "#10b981",
      badge: "Net Profit / Day"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2 shadow-sm hover:shadow-md transition-all duration-200"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-6 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
