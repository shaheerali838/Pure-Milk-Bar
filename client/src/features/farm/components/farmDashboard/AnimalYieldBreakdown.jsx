import React, { useState } from "react";
import { Droplets, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAnimalContext } from "../../../../context/AnimalContext";
import LogYieldModal from "./LogYieldModal";

// Helper to convert yield string to number
const parseYield = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const match = String(val).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export default function AnimalYieldBreakdown() {
  const { animals = [] } = useAnimalContext();
  const navigate = useNavigate();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      {/* Component Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-emerald-600 fill-emerald-100" />
          <h3 className="text-base font-black text-emerald-900 tracking-tight">
            Today's Milking Register (24-Aug-2026)
          </h3>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Log Yield Button */}
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#007a5e] hover:bg-[#00634c] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Yield
          </button>

          {/* View All Logs Button */}
          <button
            type="button"
            onClick={() => navigate("/farm/milking")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            View All Logs
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">ANIMAL TAG</th>
              <th className="py-3 px-3">SPECIES</th>
              <th className="py-3 px-3">MORNING (L)</th>
              <th className="py-3 px-3">EVENING (L)</th>
              <th className="py-3 px-3 bg-emerald-50/70 text-emerald-800">TOTAL (L)</th>
              <th className="py-3 px-3">MILKER</th>
              <th className="py-3 px-3">HEALTH NOTE</th>
              <th className="py-3 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {animals.map((animal) => {
              const morning = parseYield(animal.morningYield);
              const evening = parseYield(animal.eveningYield);
              const total = morning + evening > 0 ? morning + evening : parseYield(animal.totalDailyYield);
              const isBuffalo = animal.species?.toLowerCase().includes("buffalo");

              const milkerName = isBuffalo ? "Ramzan Ali" : "Allah Ditta";
              const healthNote = animal.tag === "COW-B" 
                ? "High peak lactation yield."
                : isBuffalo 
                ? "Premium fat yield." 
                : "Normal health, fed standard silage.";

              return (
                <tr
                  key={animal.id || animal.tag}
                  onClick={() => navigate(`/farm/animals/detail/${animal.id || animal.tag}`)}
                  className="hover:bg-emerald-50/50 transition-colors font-medium cursor-pointer group"
                >
                  {/* Animal Tag */}
                  <td className="py-3.5 px-3 font-mono font-black text-slate-900 tracking-wider group-hover:text-emerald-700">
                    {animal.tag}
                  </td>

                  {/* Species Pill */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                        isBuffalo
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isBuffalo ? "Buffalo" : "Cow"}
                    </span>
                  </td>

                  {/* Morning Yield */}
                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {morning.toFixed(1)} L
                  </td>

                  {/* Evening Yield */}
                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {evening.toFixed(1)} L
                  </td>

                  {/* Total Yield (Highlighted) */}
                  <td className="py-3.5 px-3 font-black text-slate-900 bg-emerald-50/50">
                    {total.toFixed(1)} L
                  </td>

                  {/* Milker */}
                  <td className="py-3.5 px-3 text-slate-700 font-semibold">
                    {milkerName}
                  </td>

                  {/* Health Note */}
                  <td className="py-3.5 px-3 font-serif italic text-slate-600 text-xs">
                    {healthNote}
                  </td>

                  {/* Action View Button */}
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/farm/animals/detail/${animal.id || animal.tag}`);
                      }}
                      className="px-3 py-1 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-[11px] font-extrabold transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Log Yield Form Modal */}
      <LogYieldModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
}
