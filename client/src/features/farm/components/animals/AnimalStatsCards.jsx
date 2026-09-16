import React from "react";
import { useNavigate } from "react-router-dom";
import { Beef, Activity, Droplets, Users } from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { useStaffContext } from "@/context/StaffContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnimalStatsCards() {
  const navigate = useNavigate();
  const { animals = [] } = useAnimalContext();
  const { staffList = [] } = useStaffContext();

  const totalAnimals = animals.length;
  const cowsCount = animals.filter((a) => a.species && a.species.includes("Cow")).length;
  const buffaloesCount = animals.filter((a) => a.species && a.species.includes("Buffalo")).length;

  const milkingCount = animals.filter((a) => a.lactationStatus === "Milking").length;
  const nonMilkingCount = totalAnimals - milkingCount;

  const totalDailyYield = animals
    .reduce((sum, a) => {
      const val = parseFloat(a.totalDailyYield) || 0;
      return sum + val;
    }, 0)
    .toFixed(1);

  // Dynamic Staff Stats from StaffContext
  const totalStaff = staffList.length;
  const farmWorkers = staffList.filter((s) => {
    const role = (s.role || '').toLowerCase();
    return role.includes('farm') || role.includes('milker') || role.includes('herdsman') || role.includes('worker');
  }).length;

  const stats = [
    {
      title: "Total Farm Animals",
      amount: String(totalAnimals),
      sub: `${cowsCount} Cows · ${buffaloesCount} Buffaloes`,
      icon: Beef,
      color: "#009966",
      badge: "Herd Size",
    },
    {
      title: "Active In Milking",
      amount: String(milkingCount),
      sub: `${nonMilkingCount} Dry / non-milking`,
      icon: Activity,
      color: "#155dfc",
      badge: "Milking",
    },
    {
      title: "Total Daily Output",
      amount: `${totalDailyYield} L`,
      sub: "Morning + Evening Yield",
      icon: Droplets,
      color: "#009689",
      badge: "Yield",
    },
    {
      title: "Total Farm Staff",
      amount: `${totalStaff} Staff`,
      sub: totalStaff > 0
        ? `${farmWorkers} Farm Workers · ${totalStaff} Active`
        : "No Staff Registered",
      icon: Users,
      color: "#10b981",
      badge: "Total Staff",
      path: "/staff",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      {stats.map(({ title, amount, sub, icon: Icon, color, badge, path }) => (
        <Card
          key={title}
          onClick={() => path && navigate(path)}
          className={`flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200 ${
            path ? "cursor-pointer" : ""
          }`}
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200"
            >
              {badge}
            </Badge>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {amount}
            </p>
            <p className="text-xs font-bold text-slate-700">{title}</p>
            <p className="text-[11px] font-medium text-slate-400">{sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
