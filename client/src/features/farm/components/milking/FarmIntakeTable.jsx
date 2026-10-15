import React from "react";
import {
  Droplets,
  Plus,
  Sun,
  Moon,
  Check,
  Trash2,
  Edit2,
  Eye,
} from "lucide-react";
import { formatStandardDate } from "@/utils/dateUtils";

export default function FarmIntakeTable({
  filteredLogs = [],
  selectedLogs = [],
  setSelectedLogs,
  hasActiveFilters = false,
  onSelectRecord,
  onDeleteLog,
  onEditLog,
  onNewIntake,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Farm Milking &amp; Intake Records
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">
          Showing{" "}
          <strong className="text-slate-800">{filteredLogs.length}</strong>{" "}
          entries
        </span>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-16 text-center px-4 flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
            <Droplets className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 font-display">
            No Milking Records Found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm">
            {hasActiveFilters
              ? "Try clearing your search query or filters."
              : 'Click "Log Intake" or switch to the Milking Register to enter today\'s morning and evening yield.'}
          </p>
          {onNewIntake && (
            <button
              type="button"
              onClick={onNewIntake}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Go to Milking Register
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredLogs.length > 0 &&
                      selectedLogs.length === filteredLogs.length
                    }
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedLogs(filteredLogs.map((log) => log.id));
                      else setSelectedLogs([]);
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Cattle Tag</th>
                <th className="py-3 px-4">Animal &amp; Species</th>
                <th className="py-3 px-4 text-right">Actual Yield</th>
                <th className="py-3 px-4 text-right">Expected Yield</th>
                <th className="py-3 px-4 text-right">Yield Variance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map((log, idx) => {
                const isMorning = (log.shift || "")
                  .toLowerCase()
                  .includes("morning");
                const isPositive = log.variance >= 0;

                return (
                  <tr
                    key={
                      log.id ||
                      `${log.animalTag}-${log.dateStr}-${log.shift}-${idx}`
                    }
                    onClick={() => onSelectRecord(log)}
                    className="hover:bg-indigo-50/40 transition duration-150 cursor-pointer group"
                  >
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedLogs((prev) => [...prev, log.id]);
                          else
                            setSelectedLogs((prev) =>
                              prev.filter((id) => id !== log.id),
                            );
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {formatStandardDate(log.date || log.dateStr)}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isMorning
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {isMorning ? (
                          <Sun className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Moon className="w-3 h-3 text-indigo-500" />
                        )}
                        {log.shift}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        {log.animalTag}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {log.animalName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            log.species === "Buffalo"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {log.species}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {log.actualYield.toFixed(1)} L
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                      {log.expectedShiftYield.toFixed(1)} L
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isPositive
                          ? `+${log.variance.toFixed(1)}`
                          : log.variance.toFixed(1)}{" "}
                        L
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        Logged
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLog(log);
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 shadow-2xs transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditLog(log);
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(log);
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
