import React, { useState } from "react";
import { ClipboardEdit, History, Milk, Plus } from "lucide-react";
import MilkingRegisterTable from "../components/milking/MilkingRegisterTable";
import FarmIntakeHistory from "../components/milking/FarmIntakeHistory";
import { useAnimalContext } from "@/context/AnimalContext";

export default function MilkingRegister() {
  const [activeTab, setActiveTab] = useState("register"); // 'register' | 'history'
  const { milkingLogs = [] } = useAnimalContext();

  return (
    <div className="flex flex-col gap-4 p-1 animate-in fade-in duration-150">
      {/* Top Header Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display">
              Farm Milking Operations &amp; Intake
            </h1>
            <p className="text-xs text-slate-400">
              Shift milk yields, herd benchmark variance, and permanent database intake history
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <ClipboardEdit className="w-3.5 h-3.5" />
            Milking Register
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-indigo-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Intake History
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "history"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {milkingLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeTab === "register" ? (
        <MilkingRegisterTable onSaveSuccess={() => setActiveTab("history")} />
      ) : (
        <FarmIntakeHistory onNewIntake={() => setActiveTab("register")} />
      )}
    </div>
  );
}
