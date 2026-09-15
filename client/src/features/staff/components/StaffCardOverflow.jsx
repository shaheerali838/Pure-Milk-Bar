import React from 'react';
import { Users, Banknote, Bike, Tractor, ShieldCheck } from 'lucide-react';
import { useStaffContext } from '../context/StaffContext';

export default function StaffCardOverflow() {
  const { metrics } = useStaffContext();

  const statCards = [
    {
      id: 'total_staff',
      label: 'Total Staff',
      value: `${metrics.totalStaff}`,
      sub: metrics.totalStaff === 1 ? '1 Registered Member' : `${metrics.totalStaff} Registered Members`,
      icon: Users,
      color: '#009966',
      badge: 'Active Team',
    },
    {
      id: 'monthly_salaries',
      label: 'Monthly Salaries',
      value: `Rs. ${metrics.monthlySalaries.toLocaleString()}`,
      sub: 'Total monthly payroll',
      icon: Banknote,
      color: '#155dfc',
      badge: 'Payroll Total',
    },
    {
      id: 'delivery_men',
      label: 'Total Delivery Men',
      value: `${metrics.totalDeliveryMen}`,
      sub: 'Milk delivery riders',
      icon: Bike,
      color: '#f59e0b',
      badge: 'Rider Fleet',
    },
    {
      id: 'farm_workers',
      label: 'Total Farm Workers',
      value: `${metrics.totalFarmWorkers}`,
      sub: 'Herdsmen & milkers',
      icon: Tractor,
      color: '#8b5cf6',
      badge: 'Dairy Field',
    },
    {
      id: 'security_guards',
      label: 'Total Security Guards',
      value: `${metrics.totalSecurityGuards}`,
      sub: 'Facility & gate security',
      icon: ShieldCheck,
      color: '#e11d48',
      badge: 'Site Security',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
      {statCards.map(({ id, label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={id}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
              {badge}
            </span>
          </div>

          <div>
            <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular font-mono">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
