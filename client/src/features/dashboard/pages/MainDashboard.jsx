import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Droplets,
  ClipboardCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Modular Components
import DashboardDateFilter from '@/components/common/DashboardDateFilter';
import TopSummaryCards from '../components/mainDashboard/TopSummaryCards';
import FarmYieldHub from '../components/mainDashboard/FarmYieldHub';
import SupplierProcurementHub from '../components/mainDashboard/SupplierProcurementHub';
import DahiProcessingHub from '../components/mainDashboard/DahiProcessingHub';
import ProfitLossSnapshot from '../components/mainDashboard/ProfitLossSnapshot';
import TotalFinancialSummary from '../components/mainDashboard/TotalFinancialSummary';
import MilkProductionAndFlow from '../components/mainDashboard/MilkProductionAndFlow';
import SalesAndReceivablesSection from '../components/mainDashboard/SalesAndReceivablesSection';
import DashboardFooterSummary from '../components/mainDashboard/DashboardFooterSummary';

export default function MainDashboard() {
  const [timeRange, setTimeRange] = useState('today'); // 'today' | 'week' | 'month' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-10 space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Bar with Business Title & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              Enterprise Command Center
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Pure Milk Bar · {todayFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                Live Operations
              </span>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/pos"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS Register</span>
          </Link>

          <Link
            to="/supplier/intake"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Intake Register</span>
          </Link>

          <Link
            to="/finance/daily-closing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Daily Closing</span>
          </Link>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <DashboardDateFilter
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          showAll={true}
          activeTheme="emerald"
        />
      </div>

      {/* 2. Top Summary Cards (10 Cards responding to selected date timeframe) */}
      <section aria-label="Top KPI Summary">
        <TopSummaryCards
          timeRange={timeRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </section>

      {/* 3. Detailed Hub Cards (3 Detailed Cards: Farm, Supplier Procurement, Dahi Processing) */}
      <section aria-label="Core Business Hubs" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FarmYieldHub />
        <SupplierProcurementHub />
        <DahiProcessingHub />
      </section>

      {/* 4. Total Financial Summary (Aggregated Profit & Segregated Breakdowns) */}
      <section aria-label="Total Financial Summary">
        <TotalFinancialSummary />
      </section>

      {/* 5. Profit & Loss Snapshot Component */}
      <section aria-label="Financial Profit & Loss Snapshot">
        <ProfitLossSnapshot />
      </section>

      {/* 6. Charts & Milk Flow Component */}
      <section aria-label="Milk Production & Flow Reconciliation">
        <MilkProductionAndFlow />
      </section>

      {/* 7. Sales & Receivables Component */}
      <section aria-label="Sales and Receivables Overview">
        <SalesAndReceivablesSection />
      </section>

      {/* 8. Bottom Footer Summary (4 Simple Cards) */}
      <section aria-label="Footer Metrics">
        <DashboardFooterSummary />
      </section>
    </div>
  );
}
