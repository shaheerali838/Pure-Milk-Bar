import React from "react";
import { Beef, Activity, Droplets, Users } from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";

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
      label: "TOTAL FARM ANIMALS",
      value: String(totalAnimals),
      sub: `${cowsCount} Cows · ${buffaloesCount} Buffaloes`,
      icon: Beef,
      bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      label: "ACTIVE IN MILKING",
      value: String(milkingCount),
      sub: `${nonMilkingCount} Dry / non-milking`,
      icon: Activity,
      bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      label: "TOTAL DAILY OUTPUT",
      value: `${totalDailyYield} L`,
      sub: "Morning + Evening Yield",
      icon: Droplets,
      bg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    },
    {
      label: "FARM MILKING STAFF",
      value: "4 Staff",
      sub: "Herdsmen & Milkers",
      icon: Users,
      bg: "bg-purple-50 text-purple-600 border border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-[20px] p-3 flex flex-col justify-center shadow-2xs hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {s.label}
              </span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-2xl font-semibold text-slate-800 tracking-tight leading-none">
                {s.value}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                {s.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
