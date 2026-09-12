import React from "react";
import { Beef, Droplets, TrendingUp, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Total Animals",   value: "124",      sub: "Head of cattle",     icon: Beef,       color: "#009966" },
  { label: "Active Milking",  value: "86",       sub: "Cows in production", icon: Droplets,   color: "#155dfc" },
  { label: "Daily Yield",     value: "1,840 L",  sub: "Total today",        icon: Activity,   color: "#009689" },
  { label: "Monthly Revenue", value: "Rs. 3.2M", sub: "Farm income",        icon: TrendingUp, color: "#4f39f6" },
];

export default function FarmDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-xl p-4 shadow-none" style={{ borderLeft: "3px solid " + color }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
              <Icon style={{ width: 22, height: 22, color }} />
            </div>
            <div>
              <p className="font-display text-[22px] font-extrabold text-slate-900 leading-none mb-0.5 tabular">{value}</p>
              <p className="text-[13px] font-semibold text-slate-700 mb-0.5">{label}</p>
              <p className="text-[11px] text-slate-400">{sub}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card className="bg-white border border-slate-200 rounded-xl p-5 shadow-none">
        <h3 className="font-display text-base font-bold text-slate-800 mb-1">Farm Overview</h3>
        <p className="text-sm text-slate-500">Quick summary of farm operations, health alerts, and production metrics.</p>
      </Card>
    </div>
  );
}
