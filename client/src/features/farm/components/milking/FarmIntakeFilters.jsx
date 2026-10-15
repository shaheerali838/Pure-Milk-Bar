import React from "react";
import {
  Search,
  X,
  Sun,
  Moon,
  Calendar,
  Trash2,
  Plus,
} from "lucide-react";

export default function FarmIntakeFilters({
  search,
  setSearch,
  shiftFilter,
  setShiftFilter,
  speciesFilter,
  setSpeciesFilter,
  dateFilterMode,
  setDateFilterMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedLogsCount = 0,
  onBulkDelete,
  onNewIntake,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Search */}
      <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-[38px]">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search cattle tag, breed, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
        {/* Shift Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
          {["All", "Morning", "Evening"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShiftFilter(s)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                shiftFilter === s
                  ? "bg-white text-indigo-600 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              {s === "Morning" && (
                <Sun className="w-3 h-3 inline mr-1 text-amber-500" />
              )}
              {s === "Evening" && (
                <Moon className="w-3 h-3 inline mr-1 text-indigo-500" />
              )}
              {s}
            </button>
          ))}
        </div>

        {/* Species Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
          {["All", "Cow", "Buffalo"].map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSpeciesFilter(sp)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                speciesFilter === sp
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setDateFilterMode("today");
              setStartDate("");
              setEndDate("");
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              dateFilterMode === "today"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => {
              setDateFilterMode("all");
              setStartDate("");
              setEndDate("");
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              dateFilterMode === "all"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            All Dates
          </button>
          <button
            type="button"
            onClick={() => {
              setDateFilterMode("custom");
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              dateFilterMode === "custom"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Range Inputs - ONLY rendered when Custom Range is active */}
        {dateFilterMode === "custom" && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 animate-in fade-in duration-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold text-slate-400">
              From:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
            />
            <span className="text-[11px] font-semibold text-slate-400">
              To:
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-rose-600 hover:text-rose-800 text-xs font-bold ml-1 cursor-pointer"
                title="Clear custom dates"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedLogsCount > 0 && (
            <button
              type="button"
              onClick={onBulkDelete}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedLogsCount})
            </button>
          )}

          {/* Quick Action: Log New Intake */}
          {onNewIntake && (
            <button
              type="button"
              onClick={onNewIntake}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Intake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
