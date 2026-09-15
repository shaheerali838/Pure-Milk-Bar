import React from "react";
import { Beef, Activity, Droplets, Users } from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnimalStatsCards() {
  const { animals = [] } = useAnimalContext();

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
      title: "Farm Milking Staff",
      amount: "4 Staff",
      sub: "Herdsmen & Milkers",
      icon: Users,
      color: "#10b981",
      badge: "Staff",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      {stats.map(({ title, amount, sub, icon: Icon, color, badge }) => (
        <Card
          key={title}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: `4px solid ${color}` }}
        >
          <div className="flex items-start justify-between mb-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <Badge variant="outline" className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
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
