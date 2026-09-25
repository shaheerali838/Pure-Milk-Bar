import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Beef, Edit3, Trash2, Eye, X, Users, UserCheck } from "lucide-react";
import AnimalStatsCards from "./AnimalStatsCards";
import AnimalAdd from "./AnimalAdd";
import AnimalFilterHeader from "./AnimalFilterHeader";
import AnimalDetail from "./AnimalDetail";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { useStaffContext } from "@/context/StaffContext";
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
  const { staffList = [] } = useStaffContext();
  const displayWorkers = staffList;
  const [activeTab, setActiveTab] = useState("registry"); // 'registry' or 'workers'
  const [searchTerm, setSearchTerm] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editAnimal, setEditAnimal] = useState(null);
  const [deleteTargetAnimal, setDeleteTargetAnimal] = useState(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [selectedAnimalIds, setSelectedAnimalIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedAnimalIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnimalIds.length === filteredAnimals.length && filteredAnimals.length > 0) {
      setSelectedAnimalIds([]);
    } else {
      setSelectedAnimalIds(filteredAnimals.map((a) => a.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAnimalIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      for (const id of selectedAnimalIds) {
        await deleteAnimal(id);
      }
      setSelectedAnimalIds([]);
    } catch (err) {
      console.error("Bulk delete animal error:", err);
    } finally {
      setIsBulkDeleting(false);
    }
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

  // 1. Full-space Add Animal View
  if (isModalOpen) {
    return (
      <AnimalAdd
        onBack={closeModal}
        onSuccess={closeModal}
      />
    );
  }

  // 2. Full-space Edit Animal View
  if (editAnimal) {
    return (
      <AnimalAdd
        editingAnimal={editAnimal}
        onBack={() => setEditAnimal(null)}
        onSuccess={() => setEditAnimal(null)}
      />
    );
  }

  // 3. Full-space Animal Detail View
  if (selectedAnimalId) {
    return (
      <AnimalDetail
        animalId={selectedAnimalId}
        onBack={() => setSelectedAnimalId(null)}
        onClose={() => setSelectedAnimalId(null)}
        onEdit={(animal) => {
          setEditAnimal(animal);
          setSelectedAnimalId(null);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <AnimalStatsCards />

      <AnimalFilterHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        animalsCount={animals.length}
        workersCount={displayWorkers.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        speciesFilter={speciesFilter}
        setSpeciesFilter={setSpeciesFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenAddModal={openModal}
      />

      {/* Bulk Action Bar when items selected */}
      {selectedAnimalIds.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
              {selectedAnimalIds.length}
            </span>
            <span>Animals Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAnimalIds([])}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            >
              Deselect All
            </button>
            <button
              type="button"
              disabled={isBulkDeleting}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedAnimalIds.length})`}
            </button>
          </div>
        </div>
      )}

      {activeTab === "registry" ? (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
          <Table className="w-full border-collapse text-[13px]">
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                <TableHead className="w-10 px-3.5 py-2.5 text-center">
                  <input
                    type="checkbox"
                    checked={filteredAnimals.length > 0 && selectedAnimalIds.length === filteredAnimals.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    title="Select All Animals"
                  />
                </TableHead>
                {headers.map((h) => (
                  <TableHead
                    key={h}
                    className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnimals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={headers.length + 1}
                    className="px-4 py-12 text-center text-slate-400 text-sm"
                  >
                    No matching animals found. Click{" "}
                    <strong className="text-emerald-700 font-semibold">
                      "Add Animal"
                    </strong>{" "}
                    to register a new livestock record.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimals.map((a) => (
                  <TableRow
                    key={a.id}
                    onClick={() => setSelectedAnimalId(a.id)}
                    className={`border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30 transition-colors cursor-pointer group ${
                      selectedAnimalIds.includes(a.id) ? "bg-emerald-50/50" : ""
                    }`}
                  >
                    <TableCell className="w-10 px-3.5 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedAnimalIds.includes(a.id)}
                        onChange={() => handleToggleSelect(a.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5">
                      <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 group-hover:text-emerald-700 tabular">
                        <Beef className="w-3.5 h-3.5 text-emerald-600" />
                        {a.tag}
                      </span>
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5 text-slate-700 font-medium">
                      {a.species}
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5">
                      <Badge
                        variant="outline"
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border-0 " +
                          (statusStyle[a.lactationStatus] ||
                            "bg-slate-100 text-slate-600")
                        }
                      >
                        {a.lactationStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5 text-slate-600 font-mono text-[12px] tabular">
                      {a.acquisitionDate}
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5 text-slate-700 font-semibold tabular">
                      {a.morningYield}
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5 text-slate-700 font-semibold tabular">
                      {a.eveningYield}
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5 font-bold text-emerald-700 text-sm tabular">
                      {a.totalDailyYield}
                    </TableCell>

                    <TableCell className="px-3.5 py-2.5">
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAnimalId(a.id)}
                          className="p-1.5 h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                          title="View Animal Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditAnimal(a)}
                          className="p-1.5 h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                          title="Edit Animal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetAnimal(a)}
                          className="p-1.5 h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete Animal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display text-base font-bold text-slate-800">Farm Workers & Milking Staff</h3>
            </div>
          </div>
          <Table className="w-full text-left text-sm">
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase hover:bg-slate-50">
                <TableHead className="px-6 py-3">Staff Name</TableHead>
                <TableHead className="px-6 py-3">Role</TableHead>
                <TableHead className="px-6 py-3">Assigned Shift</TableHead>
                <TableHead className="px-6 py-3">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {displayWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No Farm Workers Registered</p>
                      <p className="text-slate-400 text-[11px]">Add staff members from the Staff module to track worker shifts.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayWorkers.map((w) => (
                  <TableRow key={w.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      {w.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-semibold text-slate-600">{w.role}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {w.shift}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600 font-mono text-xs tabular">
                      {w.mobile || w.phone || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}



      {deleteTargetAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-display text-xl font-bold text-[#0F172A] tracking-tight">
                Delete Livestock Record
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTargetAnimal(null)}
                className="text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Are you sure you want to remove this animal from the farm register? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTargetAnimal(null)}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    deleteAnimal(deleteTargetAnimal.id);
                    setDeleteTargetAnimal(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#E11D48] hover:bg-[#D91B42] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Delete Animal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}