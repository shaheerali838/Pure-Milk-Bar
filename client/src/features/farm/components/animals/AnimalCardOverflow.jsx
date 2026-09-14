import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Beef, Edit3, Trash2, Eye, X, Users, UserCheck } from "lucide-react";
import AnimalStatsCards from "./AnimalStatsCards";
import RegisterAnimalModal from "./RegisterAnimalModal";
import AnimalFilterHeader from "./AnimalFilterHeader";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusStyle = {
  "Milking": "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "Dry/Gestating": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "Calf": "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

// Default Farm Workers list for the Workers Tab
const mockWorkers = [
  { id: 1, name: "Muhammad Ali", role: "Head Herdsman", shift: "Morning & Evening", phone: "+92 300 1234567" },
  { id: 2, name: "Tariq Mahmood", role: "Senior Milker", shift: "Morning", phone: "+92 301 7654321" },
  { id: 3, name: "Rashid Khan", role: "Milker & Feed Care", shift: "Evening", phone: "+92 302 9876543" },
  { id: 4, name: "Usman Ghani", role: "Veterinary Technician", shift: "Full-Time", phone: "+92 303 4567890" },
];

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

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("registry"); // 'registry' or 'workers'
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Filter animals list based on search term, species, and status
  const filteredAnimals = animals.filter((a) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      (a.tag && a.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecies =
      speciesFilter === "all" ||
      (speciesFilter === "cow" && a.species && a.species.toLowerCase().includes("cow")) ||
      (speciesFilter === "buffalo" && a.species && a.species.toLowerCase().includes("buffalo"));

    const matchesStatus =
      statusFilter === "all" || a.lactationStatus === statusStatusFilter(a.lactationStatus, statusFilter);

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  function statusStatusFilter(animalStatus, filterValue) {
    if (filterValue === "all") return animalStatus;
    return filterValue;
  }

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

      {/* Separate Filter & Search Header Component */}
      <AnimalFilterHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        animalsCount={animals.length}
        workersCount={mockWorkers.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        speciesFilter={speciesFilter}
        setSpeciesFilter={setSpeciesFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenAddModal={openModal}
      />

      {/* Main Content Depending on Active Tab */}
      {activeTab === "registry" ? (
        /* Animals Table */
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
              {filteredAnimals.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-4 py-12 text-center text-slate-400 text-sm"
                  >
                    No matching animals found. Click{" "}
                    <strong className="text-emerald-700 font-semibold">
                      "Add Animal"
                    </strong>{" "}
                    to register a new livestock record.
                  </td>
                </tr>
              ) : (
                filteredAnimals.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/farm/animals/detail/${a.id}`)}
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
                          onClick={() => navigate(`/farm/animals/detail/${a.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                          title="View Animal Details"
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
      ) : (
        /* Workers & Milkers View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-800">Farm Workers & Milking Staff</h3>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Staff Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Assigned Shift</th>
                <th className="px-6 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    {w.name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{w.role}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {w.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{w.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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


    </div>
  );
}