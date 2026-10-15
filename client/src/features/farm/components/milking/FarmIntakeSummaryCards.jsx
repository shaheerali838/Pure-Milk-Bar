import React from "react";
import {
  Droplets,
  Milk,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";

export default function FarmIntakeSummaryCards({
  totalActualMilk = 0,
  totalExpectedMilk = 0,
  totalNetVariance = 0,
  variancePercent = 0,
  recordCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Actual Intake */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Actual Intake
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-display">
              {totalActualMilk.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">Liters</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Farm Direct Yield
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Milk className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Expected Benchmark */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Expected Benchmark
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-display">
              {totalExpectedMilk.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">Liters</span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-flex items-center gap-1">
            Herd Baseline Standard
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Net Farm Variance */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Net Farm Variance
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-black font-display ${
                totalNetVariance >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {totalNetVariance >= 0
                ? `+${totalNetVariance.toFixed(1)}`
                : totalNetVariance.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500">
              L ({variancePercent}%)
            </span>
          </div>
          <span
            className={`text-[11px] font-bold mt-1 inline-flex items-center gap-1 ${
              totalNetVariance >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {totalNetVariance >= 0 ? (
              <>
                <TrendingUp className="w-3 h-3" /> Surplus Yield
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3" /> Production Deficit
              </>
            )}
          </span>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            totalNetVariance >= 0
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {totalNetVariance >= 0 ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* 4. Logged Records */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Logged Records
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-display">
              {recordCount}
            </span>
            <span className="text-xs font-bold text-slate-500">entries</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Server Synced
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
