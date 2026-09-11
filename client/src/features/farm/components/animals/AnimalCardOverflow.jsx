import React from "react";
import { Beef, Plus, Trash2 } from "lucide-react";
import AnimalStatsCards from "./AnimalStatsCards";
import RegisterAnimalModal from "./RegisterAnimalModal";
import { useAnimalContext } from "../../../../context/AnimalContext";

const statusStyle = {
  "Milking": "bg-emerald-100 text-emerald-700",
  "Dry/Gestating": "bg-amber-100 text-amber-700",
  "Calf": "bg-blue-100 text-blue-700",
};

export default function AnimalCardOverflow() {
  const { animals = [], addAnimal, deleteAnimal, isModalOpen, openModal, closeModal } = useAnimalContext();

  const headers = [
    "Tag #",
    "Species",
    "Lactation Status",
    "Acquisition Date",
    "Morning (L)",
    "Evening (L)",
    "Total Daily Yield",
    "Actions",
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Stat Cards */}
      <AnimalStatsCards />

      {/* Header & Add Button */}
      <div className="flex flex-wrap items-start justify-between gap-3 mt-1">
        
        <div className="flex items-center gap-2">
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-4 h-[34px] rounded-full text-white text-[13px] font-semibold cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            style={{ background: "#009966" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Animal
          </button>
        </div>
      </div>

      {/* Animals Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((h) => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {animals.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                  No animals registered yet. Click <strong className="text-emerald-700 font-semibold">"Add Animal"</strong> to register your first livestock.
                </td>
              </tr>
            ) : (
              animals.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                  {/* Tag # */}
                  <td className="px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800">
                      <Beef className="w-3 h-3 text-emerald-600" />
                      {a.tag}
                    </span>
                  </td>

                  {/* Species */}
                  <td className="px-3.5 py-2.5 text-slate-700 font-medium">{a.species}</td>

                  {/* Lactation Status */}
                  <td className="px-3.5 py-2.5">
                    <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold " + (statusStyle[a.lactationStatus] || "bg-slate-100 text-slate-600")}>
                      {a.lactationStatus}
                    </span>
                  </td>

                  {/* Acquisition Date */}
                  <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[12px]">{a.acquisitionDate}</td>

                  {/* Morning (L) */}
                  <td className="px-3.5 py-2.5 text-slate-700 font-semibold">{a.morningYield}</td>

                  {/* Evening (L) */}
                  <td className="px-3.5 py-2.5 text-slate-700 font-semibold">{a.eveningYield}</td>

                  {/* Total Daily Yield */}
                  <td className="px-3.5 py-2.5 font-bold text-emerald-700 text-sm">{a.totalDailyYield}</td>

                  {/* Actions */}
                  <td className="px-3.5 py-2.5">
                    <button
                      onClick={() => deleteAnimal(a.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete Animal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Animal Web Form Modal */}
      <RegisterAnimalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onRegister={addAnimal}
      />
    </div>
  );
}