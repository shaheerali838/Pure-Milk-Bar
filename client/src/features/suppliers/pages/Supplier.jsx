import React, { useState } from 'react';
import {
  LayoutGrid,
  Users,
  Droplets,
  Receipt,
  TrendingUp,
  FileText,
} from 'lucide-react';

const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    color: '#1a2340', // Dark Navy/Black
  },
  {
    id: 'directory',
    label: 'Suppliers Directory',
    icon: Users,
    color: '#009966', // Green
  },
  {
    id: 'intake',
    label: 'Intake Register',
    icon: Droplets,
    color: '#155dfc', // Blue
  },
  {
    id: 'expenses',
    label: 'Sourcing Expenses',
    icon: Receipt,
    color: '#4f39f6', // Purple
  },
  {
    id: 'pl',
    label: 'Supplier P&L',
    icon: TrendingUp,
    color: '#0092b8', // Teal/Cyan
  },
  {
    id: 'procurement',
    label: 'Procurement Sheet',
    icon: FileText,
    color: '#d97706', // Orange
  },
];

export default function Supplier() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Horizontal Navigation Bar (Pill Tabs) */}
      <div className="overflow-x-auto pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 min-w-[680px] lg:min-w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center justify-center gap-2 px-4 h-[42px] rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer font-semibold text-xs sm:text-sm text-white select-none"
                style={{
                  backgroundColor: isActive ? tab.color : `${tab.color}d9`,
                  boxShadow: isActive ? `0 6px 20px ${tab.color}66` : 'none',
                  border: isActive ? '2px solid rgba(255, 255, 255, 0.45)' : '2px solid transparent',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
              >
                <Icon className="w-4 h-4 shrink-0 text-white" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="w-full">
        {activeTab === 'dashboard' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a2340]/10 text-[#1a2340] flex items-center justify-center mb-4">
              <LayoutGrid className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Dashboard Component</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Overview KPIs, total registered suppliers, monthly milk intake volume, and pending payments will appear here.
            </p>
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#009966]/10 text-[#009966] flex items-center justify-center mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Suppliers Directory Component</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Registered farmers &amp; suppliers directory, contact numbers, assigned milk routes, and active contracts.
            </p>
          </div>
        )}

        {activeTab === 'intake' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#155dfc]/10 text-[#155dfc] flex items-center justify-center mb-4">
              <Droplets className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Intake Register Component</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Daily morning and evening milk intake logging, fat %, LR test, quantity (liters), and accepted gate entries.
            </p>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#4f39f6]/10 text-[#4f39f6] flex items-center justify-center mb-4">
              <Receipt className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Sourcing Expenses Component</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Procurement operational costs, chiller diesel/electricity, milk testing kits, collection center transport, and labor.
            </p>
          </div>
        )}

        {activeTab === 'pl' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0092b8]/10 text-[#0092b8] flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Supplier P&L Component</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Procured milk margins, cost per liter vs selling rate, supplier payments ledger, and sourcing net profitability.
            </p>
          </div>
        )}

        {activeTab === 'procurement' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs text-center min-h-[320px] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#d97706]/10 text-[#d97706] flex items-center justify-center mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-display">Procurement Sheet Component</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              Daily summary sheet, total liters collected per route, weighted avg fat %, total payable, and exportable reconciliation reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
