import React from 'react';
import {
  Users,
  Bike,
  ArrowRight,
  TrendingUp,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Receipt,
  Truck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';

export default function FinanceOverviewCards({ onSelectCustomerFinance, onSelectRiderFinance, onSelectFarmReport, onSelectSupplierReport, onSelectDahiReport, onSelectPos }) {
  const {
    totalKhataReceivable = 0,
    activeAccountsCount = 0,
    withKhataBalCount = 0,
  } = useCustomerContext();

  const { deliveries = [] } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();
  const { salaries = [] } = useRiderSalaryContext();

  const totalSalariesPaid = salaries.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Sleek Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Financial Operations
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Select an account module to manage ledgers, billing, collections, and payroll.
          </p>
        </div>
        <button type="button" onClick={onSelectPos} className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/60 self-start sm:self-center cursor-pointer">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>POS Sales &amp; Ledger</span>
        </button>
      </div>

      {/* 2 Compact Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Customer Finance */}
        <Card
          onClick={onSelectCustomerFinance}
          className="group relative bg-white border border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 group-hover:bg-[#00a86b] group-hover:text-white transition-colors duration-200">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Customer Finance
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-emerald-50/70 text-emerald-700 border-emerald-200">
                    Khata &amp; Invoices
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Ledgers, collections, receipts &amp; receivables aging
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Due</span>
              <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                Rs. {Number(totalKhataReceivable).toLocaleString()}
              </span>
            </div>
            <div className="border-x border-slate-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Accounts</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {activeAccountsCount}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Khata Users</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {withKhataBalCount}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              Khata / Collections / Aging
            </span>
            <span className="font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
              View Ledger <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* CARD 2: Rider & Delivery Finance */}
        <Card
          onClick={onSelectRiderFinance}
          className="group relative bg-white border border-slate-200/90 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Rider &amp; Delivery Finance
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-blue-50/70 text-blue-700 border-blue-200">
                    Logistics &amp; Payroll
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Drop point billing, transit fuel &amp; rider salaries
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Mini Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-center">
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Deliveries</span>
              <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                {deliveries.length}
              </span>
            </div>
            <div className="border-x border-slate-200/70 px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Active Riders</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                {staffList.length}
              </span>
            </div>
            <div className="px-1">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Salaries Paid</span>
              <span className="text-xs font-bold text-slate-800 tabular-nums">
                Rs. {totalSalariesPaid.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Drop Points / Fuel / Payroll
            </span>
            <span className="font-bold text-blue-700 group-hover:underline flex items-center gap-1">
              View Payroll <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Card>

        {/* CARD 3: Farm Daily Report */}
        <Card
          onClick={onSelectFarmReport}
          className="group relative bg-white border border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Farm Daily Report
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Farm Milking Yield & Liquid Sales
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Card>

        {/* CARD 4: Supplier Daily Report */}
        <Card
          onClick={onSelectSupplierReport}
          className="group relative bg-white border border-slate-200/90 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Supplier Daily Report
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Supplier Intakes & Procurement
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Card>

        {/* CARD 5: Dahi Daily Report */}
        <Card
          onClick={onSelectDahiReport}
          className="group relative bg-white border border-slate-200/90 hover:border-indigo-500 shadow-2xs hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer p-4 hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Dahi Daily Report
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  Conversions and POS Dahi Sales
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
