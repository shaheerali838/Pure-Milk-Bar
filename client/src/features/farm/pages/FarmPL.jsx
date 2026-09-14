import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const revenue = [
  { label: "Milk Sales",           amount: 2240000 },
  { label: "Dahi & Product Sales", amount: 580000 },
  { label: "Animal Sales",         amount: 150000 },
];

const expenseItems = [
  { label: "Feed & Fodder",      amount: 480000 },
  { label: "Veterinary Costs",   amount: 95000 },
  { label: "Labor Wages",        amount: 350000 },
  { label: "Utilities",          amount: 62000 },
  { label: "Equipment & Repairs",amount: 48000 },
  { label: "Other Expenses",     amount: 31000 },
];

const totalRevenue  = revenue.reduce((s, r) => s + r.amount, 0);
const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0);
const netProfit     = totalRevenue - totalExpenses;
const margin        = ((netProfit / totalRevenue) * 100).toFixed(1);
const fmt = n => "Rs. " + n.toLocaleString();

export default function FarmPL() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-800 mb-0.5">Farm P&L Statement</h3>
          <p className="text-sm text-slate-500">September 2026 — Monthly Profit & Loss Overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[13px] font-semibold border-0 tabular">
            <TrendingUp className="w-3.5 h-3.5" /> Net: {fmt(netProfit)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[13px] font-semibold border-0 tabular">
            Margin: {margin}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="bg-white border border-slate-200 rounded-xl p-4 shadow-none">
          <div className="flex items-center gap-2 text-[14px] font-bold text-emerald-700 pb-3 mb-3 border-b border-slate-100">
            <TrendingUp className="w-4 h-4" /> Revenue
            <span className="ml-auto tabular">{fmt(totalRevenue)}</span>
          </div>
          <div className="flex flex-col gap-2">
            {revenue.map(r => (
              <div key={r.label} className="flex justify-between text-[13px] text-slate-700">
                <span>{r.label}</span>
                <span className="font-semibold text-emerald-600 tabular">{fmt(r.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-xl p-4 shadow-none">
          <div className="flex items-center gap-2 text-[14px] font-bold text-red-600 pb-3 mb-3 border-b border-slate-100">
            <TrendingDown className="w-4 h-4" /> Expenses
            <span className="ml-auto tabular">{fmt(totalExpenses)}</span>
          </div>
          <div className="flex flex-col gap-2">
            {expenseItems.map(e => (
              <div key={e.label} className="flex justify-between text-[13px] text-slate-700">
                <span>{e.label}</span>
                <span className="font-semibold text-red-500 tabular">{fmt(e.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white border-2 border-[#4f39f6] rounded-xl p-4 shadow-none">
          <div className="flex items-center gap-2 text-[14px] font-bold text-[#4f39f6] pb-3 mb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4" /> Net Profit
          </div>
          <div className="font-display text-[30px] font-black text-[#4f39f6] leading-none mb-1 tabular">{fmt(netProfit)}</div>
          <div className="text-[13px] text-slate-500 mb-4 tabular">Profit Margin: {margin}%</div>
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[13px] text-slate-700">
              <span>Total Revenue</span>
              <span className="font-bold text-emerald-600 tabular">{fmt(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-slate-700">
              <span>Total Expenses</span>
              <span className="font-bold text-red-500 tabular">{fmt(totalExpenses)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold border-t border-slate-100 pt-2">
              <span>Net Profit</span>
              <span className="text-[#4f39f6] tabular">{fmt(netProfit)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
