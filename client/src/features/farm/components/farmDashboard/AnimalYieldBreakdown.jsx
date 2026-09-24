import React, { useState } from "react";
import { Droplets, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { useStaffContext } from "../../../../context/StaffContext";
import LogYieldModal from "./LogYieldModal";

// Helper to convert yield string to number
const parseYield = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const match = String(val).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export default function AnimalYieldBreakdown({ onSelectAnimal }) {
  const { animals = [] } = useAnimalContext();
  const { staffList = [] } = useStaffContext();
  const farmWorkers = staffList.filter(s => s.role?.toLowerCase().includes('farm') || s.role?.toLowerCase().includes('milker') || s.role?.toLowerCase().includes('herdsman') || s.role?.toLowerCase().includes('worker'));
  const navigate = useNavigate();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const handleAnimalClick = (animal) => {
    const animalId = animal.id || animal.tag;
    if (onSelectAnimal) {
      onSelectAnimal(animalId);
    } else {
      navigate(`/farm/animals/detail/${animalId}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-emerald-600 fill-emerald-100" />
          <h3 className="text-base font-black text-emerald-900 tracking-tight">
            Today's Milking Register (24-Aug-2026)
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#007a5e] hover:bg-[#00634c] text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Yield
          </button>

          <button
            type="button"
            onClick={() => navigate("/farm/milking")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            View All Logs
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">ANIMAL TAG</th>
              <th className="py-3 px-3">SPECIES</th>
              <th className="py-3 px-3">MORNING (L)</th>
              <th className="py-3 px-3">EVENING (L)</th>
              <th className="py-3 px-3 bg-emerald-50/70 text-emerald-800">TOTAL (L)</th>
              {farmWorkers.length > 0 && <th className="py-3 px-3">MILKER</th>}
              <th className="py-3 px-3">HEALTH NOTE</th>
              <th className="py-3 px-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {animals.map((animal, idx) => {
              const morning = parseYield(animal.morningYield);
              const evening = parseYield(animal.eveningYield);
              const total = morning + evening > 0 ? morning + evening : parseYield(animal.totalDailyYield);
              const isBuffalo = animal.species?.toLowerCase().includes("buffalo");

              const milkerName = farmWorkers.length > 0 
                ? farmWorkers[idx % farmWorkers.length]?.name 
                : "";
              
              const healthNote = animal.tag === "COW-B" 
                ? "High peak lactation yield."
                : isBuffalo 
                ? "Premium fat yield." 
                : "Normal health, fed standard silage.";

              return (
                <tr
                  key={animal.id || animal.tag}
                  onClick={() => handleAnimalClick(animal)}
                  className="hover:bg-emerald-50/50 transition-colors font-medium cursor-pointer group"
                >
                  <td className="py-3.5 px-3 font-mono font-black text-slate-900 tracking-wider group-hover:text-emerald-700">
                    {animal.tag}
                  </td>

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

                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {morning.toFixed(1)} L
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {evening.toFixed(1)} L
                  </td>

                  <td className="py-3.5 px-3 font-black text-slate-900 bg-emerald-50/50">
                    {total.toFixed(1)} L
                  </td>

                  {farmWorkers.length > 0 && (
                    <td className="py-3.5 px-3 text-slate-700 font-semibold">
                      {milkerName}
                    </td>
                  )}

                  <td className="py-3.5 px-3 font-serif italic text-slate-600 text-xs">
                    {healthNote}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnimalClick(animal);
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

      <LogYieldModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
}
