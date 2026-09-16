import React from "react";
import { Search, Plus } from "lucide-react";

export default function AnimalFilterHeader({
  activeTab,
  setActiveTab,
  animalsCount = 0,
  workersCount = 0,
  searchTerm,
  setSearchTerm,
  speciesFilter,
  setSpeciesFilter,
  statusFilter,
  setStatusFilter,
  onOpenAddModal,
}) {
  return (
    <div className="flex flex-col  w-full">
      <div className="border-b border-slate-200 flex items-center gap-8 text-sm font-bold pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("registry")}
          className={`pb-3 transition-all cursor-pointer relative ${
            activeTab === "registry"
              ? "text-emerald-700 font-extrabold"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Livestock Registry ({animalsCount})
          {activeTab === "registry" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("workers")}
          className={`pb-3 transition-all cursor-pointer relative ${
            activeTab === "workers"
              ? "text-emerald-700 font-extrabold"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Farm Workers & Milkers ({workersCount})
          {activeTab === "workers" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "registry" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 w-full sm:w-72 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by tag or animal name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Species (Cow & Buffalo)</option>
              <option value="cow">Cow</option>
              <option value="buffalo">Buffalo</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="Milking">Milking</option>
              <option value="Dry/Gestating">Dry/Gestating</option>
              <option value="Calf">Calf</option>
            </select>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs sm:text-[13px] font-semibold cursor-pointer hover:brightness-105 active:scale-95 transition-all shadow-xs"
              style={{ background: "#009966" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Animal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
