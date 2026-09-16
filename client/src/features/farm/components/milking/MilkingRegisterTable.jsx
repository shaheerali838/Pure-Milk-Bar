import React, { useState, useEffect } from "react";
import { Sun, Moon, Zap, RotateCcw, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { useAnimalContext } from "../../../../context/AnimalContext";

export default function MilkingRegisterTable() {
  const { animals = [], saveMilkingShift } = useAnimalContext();

  const [selectedDate, setSelectedDate] = useState("2026-08-24");
  const [shift, setShift] = useState("Morning"); // 'Morning' or 'Evening'

  // Draft inputs while typing
  const [inputValues, setInputValues] = useState({ Morning: {}, Evening: {} });

  // Confirmed saved entries (updated ONLY on Save click)
  const [savedEntries, setSavedEntries] = useState(() => {
    try {
      const saved = localStorage.getItem("pure_milk_bar_milking_saved_entries");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { Morning: {}, Evening: {} };
  });

  useEffect(() => {
    try {
      localStorage.setItem("pure_milk_bar_milking_saved_entries", JSON.stringify(savedEntries));
    } catch (e) {
      console.error(e);
    }
  }, [savedEntries]);

  // Process registered animals from context
  const cattleList = animals.map((a, idx) => {
    const isBuff = a.species && a.species.toLowerCase().includes("buffalo");
    const mVal = parseFloat(a.morningYield || 0);
    const eVal = parseFloat(a.eveningYield || 0);
    const expVal = parseFloat(a.expectedYield || a.totalDailyYield || 0);

    const expectedDaily = expVal > 0 ? expVal : (mVal + eVal > 0 ? mVal + eVal : 15.0);

    let displayName = a.tag;
    if (a.tag.startsWith("COW-")) {
      displayName = `Cow ${a.tag.replace("COW-", "")}`;
    } else if (a.tag.startsWith("BUF-")) {
      displayName = `Buffalo ${a.tag.replace("BUF-", "")}`;
    }

    return {
      id: a.id || idx + 1,
      tag: a.tag,
      name: displayName,
      type: isBuff ? "Buffalo" : "Cow",
      expectedDaily,
      avgMorning: mVal > 0 ? mVal : parseFloat((expectedDaily / 2).toFixed(1)),
      avgEvening: eVal > 0 ? eVal : parseFloat((expectedDaily / 2).toFixed(1)),
    };
  });

  const activeInputs = inputValues[shift] || {};
  const activeSaved = savedEntries[shift] || {};

  // Shift metrics
  const shiftExpected = cattleList.reduce((sum, item) => {
    return sum + (shift === "Morning" ? item.avgMorning : item.avgEvening);
  }, 0);

  const shiftEntered = cattleList.reduce((sum, item) => {
    return sum + (parseFloat(activeSaved[item.tag]) || 0);
  }, 0);

  // Total daily variance across both shifts
  const totalDailyExpected = cattleList.reduce((sum, item) => sum + item.expectedDaily, 0);
  const totalDailyEntered = cattleList.reduce((sum, item) => {
    const m = parseFloat(savedEntries.Morning?.[item.tag] || 0);
    const e = parseFloat(savedEntries.Evening?.[item.tag] || 0);
    return sum + m + e;
  }, 0);

  const totalVariance = totalDailyEntered === 0 ? 0.0 : totalDailyEntered - totalDailyExpected;

  // Logged count for current shift
  const loggedCount = cattleList.filter((item) => {
    const val = activeSaved[item.tag];
    return val !== undefined && val !== "" && !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }).length;

  const totalCattle = cattleList.length;

  // Handlers
  const handleInputChange = (tag, val) => {
    setInputValues((prev) => ({
      ...prev,
      [shift]: { ...prev[shift], [tag]: val },
    }));
  };

  const handleClear = () => {
    setInputValues((prev) => ({ ...prev, [shift]: {} }));
    toast.info(`Cleared inputs for ${shift} shift`);
  };

  const handleSave = () => {
    const hasTypedValues = cattleList.some((item) => {
      const val = activeInputs[item.tag];
      return val !== undefined && val !== "" && !isNaN(parseFloat(val)) && parseFloat(val) > 0;
    });

    if (!hasTypedValues) {
      toast.error("Please enter yield for at least one cattle before saving");
      return;
    }

    setSavedEntries((prev) => ({
      ...prev,
      [shift]: { ...activeInputs },
    }));

    if (saveMilkingShift) {
      saveMilkingShift(shift, selectedDate, activeInputs);
    }

    const newlySavedTotal = cattleList.reduce((sum, item) => {
      return sum + (parseFloat(activeInputs[item.tag]) || 0);
    }, 0);

    toast.success(`Successfully saved ${shift} shift entries (${newlySavedTotal.toFixed(1)} kg)!`);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              DATE
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              SHIFT
            </span>
            <div className="bg-slate-100/80 border border-slate-200/60 rounded-full p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShift("Morning")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  shift === "Morning" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Morning
              </button>
              <button
                type="button"
                onClick={() => setShift("Evening")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  shift === "Evening" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Evening
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center sm:items-end">
            <div className="text-2xl font-black text-indigo-600 tracking-tight">
              {shiftEntered.toFixed(1)} <span className="text-lg font-bold">kg</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
              ENTERED
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <div className="text-2xl font-black text-slate-500 tracking-tight">
              {shiftExpected.toFixed(1)} <span className="text-lg font-bold">kg</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
              EXPECTED
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <div
              className={`px-4 py-1.5 rounded-full border text-lg font-extrabold flex items-center justify-center transition-all ${
                totalVariance === 0
                  ? "bg-slate-100 border-slate-200 text-slate-700"
                  : totalVariance > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-rose-50 border-rose-200 text-rose-600"
              }`}
            >
              {totalVariance > 0 ? `+${totalVariance.toFixed(1)}` : totalVariance.toFixed(1)} kg
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
              TOTAL VARIANCE
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">TAG</th>
                <th className="px-5 py-3.5">ANIMAL</th>
                <th className="px-5 py-3.5">TYPE</th>
                <th className="px-5 py-3.5">AVG {shift.toUpperCase()} (KG)</th>
                <th className="px-5 py-3.5">ENTER (KG)</th>
                <th className="px-5 py-3.5 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cattleList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No cattle registered yet.
                  </td>
                </tr>
              ) : (
                cattleList.map((item) => {
                  const avgYield = shift === "Morning" ? item.avgMorning : item.avgEvening;
                  const currentInput = activeInputs[item.tag] ?? "";
                  const savedVal = activeSaved[item.tag];

                  const isSavedLogged =
                    savedVal !== undefined &&
                    savedVal !== "" &&
                    !isNaN(parseFloat(savedVal)) &&
                    parseFloat(savedVal) > 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 font-mono text-xs font-bold text-slate-700">
                          {item.tag}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-800">{item.name}</td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                            item.type === "Cow" ? "bg-slate-100 text-slate-700" : "bg-purple-100/80 text-purple-700"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-500">{avgYield.toFixed(1)} kg</td>

                      <td className="px-5 py-3.5">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder={avgYield.toString()}
                          value={currentInput}
                          onChange={(e) => handleInputChange(item.tag, e.target.value)}
                          className="w-36 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-sm font-semibold text-slate-800 text-center focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center">
                          {isSavedLogged ? (
                            <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs animate-in zoom-in duration-150">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
            <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <span>
              Progress: <strong className="font-extrabold text-slate-900">{loggedCount} / {totalCattle}</strong> cattle logged
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 bg-white text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Clear
            </button>

            <div className="text-sm font-bold text-slate-700">
              {shift} Total: <span className="text-indigo-600 font-black text-base">{shiftEntered.toFixed(1)} kg</span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save {shift} Entries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
