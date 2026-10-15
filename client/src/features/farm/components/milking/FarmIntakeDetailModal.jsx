import React from "react";
import { Milk, X, Info, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FarmIntakeDetailModal({ selectedRecord, onClose }) {
  if (!selectedRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Milking Intake Detail Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Tag: {selectedRecord.animalTag} • {selectedRecord.animalName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Top Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recorded Date &amp; Shift
              </span>
              <span className="text-sm font-bold text-slate-800">
                {selectedRecord.dateStr} • {selectedRecord.shift} Shift
              </span>
            </div>
            <Badge
              variant="outline"
              className={
                selectedRecord.shift === "Morning"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }
            >
              {selectedRecord.shift}
            </Badge>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Actual Yield
              </span>
              <span className="text-lg font-black text-indigo-600 font-mono">
                {selectedRecord.actualYield.toFixed(1)} L
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Benchmark
              </span>
              <span className="text-lg font-black text-slate-600 font-mono">
                {selectedRecord.expectedShiftYield.toFixed(1)} L
              </span>
            </div>

            <div
              className={`border rounded-xl p-3 ${
                selectedRecord.variance >= 0
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                  : "bg-rose-50/70 border-rose-200 text-rose-800"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-80">
                Variance
              </span>
              <span className="text-lg font-black font-mono">
                {selectedRecord.variance >= 0
                  ? `+${selectedRecord.variance.toFixed(1)}`
                  : selectedRecord.variance.toFixed(1)}{" "}
                L
              </span>
            </div>
          </div>

          {/* Cattle Information */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" /> Cattle Profile
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">
                  Identification Tag:
                </span>
                <strong className="text-slate-800 font-mono">
                  {selectedRecord.animalTag}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">
                  Species &amp; Breed:
                </span>
                <strong className="text-slate-800">
                  {selectedRecord.breed}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">
                  Daily Expected:
                </span>
                <strong className="text-slate-800 font-mono">
                  {selectedRecord.dailyExpected.toFixed(1)} L/day
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">
                  Record Status:
                </span>
                <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved on Database
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
