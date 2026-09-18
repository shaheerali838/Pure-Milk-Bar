import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  ShoppingBag,
  Droplets,
  Beef,
  ClipboardCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Modular Components
import TopSummaryCards from '../components/mainDashboard/TopSummaryCards';
import FarmYieldHub from '../components/mainDashboard/FarmYieldHub';
import SupplierProcurementHub from '../components/mainDashboard/SupplierProcurementHub';
import DahiProcessingHub from '../components/mainDashboard/DahiProcessingHub';
import ProfitLossSnapshot from '../components/mainDashboard/ProfitLossSnapshot';
import MilkProductionAndFlow from '../components/mainDashboard/MilkProductionAndFlow';
import SalesAndReceivablesSection from '../components/mainDashboard/SalesAndReceivablesSection';
import DashboardFooterSummary from '../components/mainDashboard/DashboardFooterSummary';

export default function MainDashboard() {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-8">
      {/* 1. Header Bar with Business Title & Quick Action Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:px-6 sm:py-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
              Pure Milk Bar — Enterprise Command Center
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Operational Day: <strong className="text-slate-800">{todayFormatted}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Real-time Dairy Farm, Intake &amp; POS Telemetry</span>
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/pos"
            className="flex items-center gap-1.5 px-3.5 h-[36px] rounded-full text-xs font-bold text-white shadow-xs hover:brightness-110 transition-all cursor-pointer select-none"
            style={{ backgroundColor: '#009966' }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS Register</span>
          </Link>

          <Link
            to="/supplier/intake"
            className="flex items-center gap-1.5 px-3.5 h-[36px] rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer select-none"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Intake Register</span>
          </Link>

          <Link
            to="/finance/daily-closing"
            className="flex items-center gap-1.5 px-3.5 h-[36px] rounded-full text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer select-none"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Daily Closing</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Summary Cards (6 Cards) */}
      <section aria-label="Top KPI Summary">
        <TopSummaryCards />
      </section>

      {/* 3. Detailed Hub Cards (3 Detailed Cards: Farm, Supplier Procurement, Dahi Processing) */}
      <section aria-label="Core Business Hubs" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FarmYieldHub />
        <SupplierProcurementHub />
        <DahiProcessingHub />
      </section>

      {/* 4. Profit & Loss Snapshot Component */}
      <section aria-label="Financial Profit & Loss Snapshot">
        <ProfitLossSnapshot />
      </section>

      {/* 5. Charts & Milk Flow Component */}
      <section aria-label="Milk Production & Flow Reconciliation">
        <MilkProductionAndFlow />
      </section>

      {/* 6. Sales & Receivables Component */}
      <section aria-label="Sales and Receivables Overview">
        <SalesAndReceivablesSection />
      </section>

      {/* 7. Bottom Footer Summary (4 Simple Cards) */}
      <section aria-label="Footer Metrics">
        <DashboardFooterSummary />
      </section>
    </div>
  );
}
