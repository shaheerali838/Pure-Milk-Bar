import React, { useState, useEffect } from "react";
import { Beef, Plus, Edit3, Trash2, Eye, X } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import AnimalStatsCards from "./AnimalStatsCards";
import RegisterAnimalModal from "./RegisterAnimalModal";
import { useAnimalContext } from "../../../../context/AnimalContext";

const statusStyle = {
  "Milking": "bg-emerald-100 text-emerald-700",
  "Dry/Gestating": "bg-amber-100 text-amber-700",
  "Calf": "bg-blue-100 text-blue-700",
};

export default function AnimalCardOverflow() {
  const {
    animals = [],
    addAnimal,
    updateAnimal,
    deleteAnimal,
    isModalOpen,
    openModal,
    closeModal,
  } = useAnimalContext();

  const [detailAnimal, setDetailAnimal] = useState(null);
  const [editAnimal, setEditAnimal] = useState(null);
  const [deleteTargetAnimal, setDeleteTargetAnimal] = useState(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    tag: "",
    species: "Cow (Sahiwal)",
    lactationStatus: "Milking",
    acquisitionDate: "",
    morningYield: "",
    eveningYield: "",
  });

  useEffect(() => {
    if (editAnimal) {
      setEditFormData({
        tag: editAnimal.tag || "",
        species: editAnimal.species || "Cow (Sahiwal)",
        lactationStatus: editAnimal.lactationStatus || "Milking",
        acquisitionDate: editAnimal.acquisitionDate || new Date().toISOString().split("T")[0],
        morningYield: editAnimal.morningYield ? editAnimal.morningYield.replace(" L", "") : "",
        eveningYield: editAnimal.eveningYield ? editAnimal.eveningYield.replace(" L", "") : "",
      });
    }
  }, [editAnimal]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editAnimal && updateAnimal) {
      updateAnimal(editAnimal.id, editFormData);
    }
    setEditAnimal(null);
  };

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
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {animals.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-12 text-center text-slate-400 text-sm"
                >
                  No animals registered yet. Click{" "}
                  <strong className="text-emerald-700 font-semibold">
                    "Add Animal"
                  </strong>{" "}
                  to register your first livestock.
                </td>
              </tr>
            ) : (
              animals.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setDetailAnimal(a)}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                >
                  {/* Tag # */}
                  <td className="px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 group-hover:text-emerald-700">
                      <Beef className="w-3.5 h-3.5 text-emerald-600" />
                      {a.tag}
                    </span>
                  </td>

                  {/* Species */}
                  <td className="px-3.5 py-2.5 text-slate-700 font-medium">
                    {a.species}
                  </td>

                  {/* Lactation Status */}
                  <td className="px-3.5 py-2.5">
                    <span
                      className={
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold " +
                        (statusStyle[a.lactationStatus] ||
                          "bg-slate-100 text-slate-600")
                      }
                    >
                      {a.lactationStatus}
                    </span>
                  </td>

                  {/* Acquisition Date */}
                  <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[12px]">
                    {a.acquisitionDate}
                  </td>

                  {/* Morning (L) */}
                  <td className="px-3.5 py-2.5 text-slate-700 font-semibold">
                    {a.morningYield}
                  </td>

                  {/* Evening (L) */}
                  <td className="px-3.5 py-2.5 text-slate-700 font-semibold">
                    {a.eveningYield}
                  </td>

                  {/* Total Daily Yield */}
                  <td className="px-3.5 py-2.5 font-bold text-emerald-700 text-sm">
                    {a.totalDailyYield}
                  </td>

                  {/* Actions */}
                  <td className="px-3.5 py-2.5">
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* View Detail Button */}
                      <button
                        onClick={() => setDetailAnimal(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                        title="View Profile & Chart"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditAnimal(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                        title="Edit Animal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteTargetAnimal(a)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Animal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register Animal Modal */}
      <RegisterAnimalModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onRegister={addAnimal}
      />

      {/* Inline Edit Animal Modal */}
      {editAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Edit Livestock Record
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditAnimal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tag #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COW-1050"
                  value={editFormData.tag}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tag: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Species
                  </label>
                  <select
                    value={editFormData.species}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, species: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="Cow (Sahiwal)">Cow (Sahiwal)</option>
                    <option value="Cow (Cholistani)">Cow (Cholistani)</option>
                    <option value="Buffalo (Nili Ravi)">Buffalo (Nili Ravi)</option>
                    <option value="Buffalo (Kundi)">Buffalo (Kundi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lactation Status
                  </label>
                  <select
                    value={editFormData.lactationStatus}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, lactationStatus: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="Milking">Milking</option>
                    <option value="Dry/Gestating">Dry/Gestating</option>
                    <option value="Calf">Calf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.acquisitionDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, acquisitionDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Morning (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={editFormData.morningYield}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, morningYield: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Evening (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={editFormData.eveningYield}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, eveningYield: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditAnimal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Delete Confirmation Modal */}
      {deleteTargetAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                Delete Livestock Record
              </h2>
              <button
                type="button"
                onClick={() => setDeleteTargetAnimal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Are you sure you want to remove this animal from the farm register? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetAnimal(null)}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteAnimal(deleteTargetAnimal.id);
                    setDeleteTargetAnimal(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#E11D48] hover:bg-[#D91B42] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Delete Animal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Detail & Recharts Profile Modal */}
      {detailAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
                Livestock Profile: {detailAnimal.tag}
              </h2>
              <button
                type="button"
                onClick={() => setDetailAnimal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-500">
                    Animal Tag / Name:
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {detailAnimal.tag} {detailAnimal.name && detailAnimal.name !== detailAnimal.tag ? `(${detailAnimal.name})` : ''}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">
                    Species:
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {detailAnimal.species || "Cow"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">
                    Purchase Price:
                  </span>
                  <span className="text-sm font-bold text-purple-700">
                    {detailAnimal.purchasePrice || "Rs 200,000"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">
                    Expected Daily Yield:
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {detailAnimal.expectedYield || "15.0 L"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">
                    Morning Yield:
                  </span>
                  <span className="text-sm font-bold text-[#009966]">
                    {detailAnimal.morningYield || "0.0 L"}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-500">
                    Evening Yield:
                  </span>
                  <span className="text-sm font-bold text-[#009966]">
                    {detailAnimal.eveningYield || "0.0 L"}
                  </span>
                </div>
              </div>


              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  7-Day Milking Performance
                </h3>

                <div className="border border-slate-200/70 rounded-2xl p-4 bg-white h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        detailAnimal.history || [
                          { date: "18 Aug", morning: 8.2, evening: 7.0 },
                          { date: "19 Aug", morning: 8.8, evening: 7.3 },
                          { date: "20 Aug", morning: 8.0, evening: 6.8 },
                          { date: "21 Aug", morning: 9.1, evening: 7.5 },
                          { date: "22 Aug", morning: 8.5, evening: 7.2 },
                          { date: "23 Aug", morning: 8.9, evening: 7.4 },
                          { date: "24 Aug", morning: 8.5, evening: 7.2 },
                        ]
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009966" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#009966" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tick={{ fill: "#64748B", fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val} L`}
                        domain={[0, 12]}
                        ticks={[0, 3, 6, 9, 12]}
                        tick={{ fill: "#64748B", fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(val, name) => [
                          `${val} L`,
                          name === "morning" ? "Morning" : "Evening",
                        ]}
                        contentStyle={{
                          backgroundColor: "#FFF",
                          borderRadius: "12px",
                          borderColor: "#E2E8F0",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="morning"
                        stroke="#009966"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#morningGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="evening"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#eveningGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDetailAnimal(null)}
                  className="px-6 py-2 rounded-full text-white font-bold text-sm cursor-pointer hover:brightness-105 transition-all shadow-xs"
                  style={{ background: "#009966" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}