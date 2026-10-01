import React, { useState, useEffect } from "react";
import { X, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { useStaffContext } from "../../../../context/StaffContext";
import { useStaffPayrollContext } from "../../../../context/StaffPayrollContext";

export default function LogYieldModal({ isOpen, onClose }) {
  const { animals = [], updateAnimal, saveMilkingShift } = useAnimalContext();
  const staffCtx = useStaffContext();
  const payrollCtx = useStaffPayrollContext();

  const rawStaffList = (payrollCtx?.staffList?.length > 0 ? payrollCtx.staffList : staffCtx?.staffList) || [];
  
  // Filter for farm/milking/labor roles, or fallback to all registered staff
  const farmWorkers = rawStaffList.filter((s) => {
    const r = (s.role || "").toLowerCase();
    return (
      r.includes("farm") ||
      r.includes("milk") ||
      r.includes("herd") ||
      r.includes("work") ||
      r.includes("labor") ||
      r.includes("oper") ||
      r.includes("staff") ||
      r.includes("manag") ||
      r.includes("superv")
    );
  });
  const availableStaff = farmWorkers.length > 0 ? farmWorkers : rawStaffList;

  const [formData, setFormData] = useState({
    tag: animals[0]?.tag || "",
    morning: "8.5",
    evening: "7.0",
    milker: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (animals.length > 0 && !formData.tag) {
      setFormData((prev) => ({ ...prev, tag: animals[0].tag }));
    }
  }, [animals, formData.tag]);

  useEffect(() => {
    if (availableStaff.length > 0 && !formData.milker) {
      setFormData((prev) => ({ ...prev, milker: availableStaff[0].name }));
    }
  }, [availableStaff, formData.milker]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetAnimal = animals.find((a) => a.tag === formData.tag);
    const mVal = parseFloat(formData.morning) || 0;
    const eVal = parseFloat(formData.evening) || 0;

    if (mVal <= 0 && eVal <= 0) {
      toast.error("Please enter a valid morning or evening yield (liters)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (targetAnimal && updateAnimal) {
        await updateAnimal(targetAnimal.id, {
          ...targetAnimal,
          morningYield: `${mVal} L`,
          eveningYield: `${eVal} L`,
          totalDailyYield: `${(mVal + eVal).toFixed(1)} L`,
        });
      }

      // Persist to MilkingLogs / MilkingShift API
      if (saveMilkingShift) {
        const todayDate = new Date().toISOString().split("T")[0];
        const selectedWorker = availableStaff.find((s) => s.name === formData.milker);
        const opId = selectedWorker?.id || selectedWorker?._id || formData.milker || undefined;

        if (mVal > 0) {
          await saveMilkingShift("Morning", todayDate, { [formData.tag]: mVal }, opId);
        }
        if (eVal > 0) {
          await saveMilkingShift("Evening", todayDate, { [formData.tag]: eVal }, opId);
        }
      }

      toast.success(`Milking yield log saved for ${formData.tag || "animal"}!`);
      onClose();
    } catch (err) {
      console.error("Failed to save milking log:", err);
      toast.error("Failed to save milking log to database");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-slate-900 font-display">Log Farm Milking Yield</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Select Livestock Animal
            </label>
            <select
              value={formData.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
            >
              {animals.map((animal) => (
                <option key={animal.id || animal.tag} value={animal.tag}>
                  {animal.tag} ({animal.name || animal.tag} · {animal.species?.includes("Buffalo") ? "Buffalo" : "Cow"} · Status: Active)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Morning Milking (Liters)"
              type="number"
              value={formData.morning}
              onChange={(val) => handleChange("morning", val)}
              placeholder="8.5"
            />
            <InputField
              label="Evening Milking (Liters)"
              type="number"
              value={formData.evening}
              onChange={(val) => handleChange("evening", val)}
              placeholder="7.0"
            />
          </div>

          {/* Milker / Herdsman Selection */}
          <div>
            <label className="flex items-center justify-between text-slate-700 font-bold mb-1">
              <span>Herdsman / Milker Name</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {availableStaff.length} registered staff available
              </span>
            </label>
            {availableStaff.length > 0 ? (
              <select
                value={formData.milker}
                onChange={(e) => handleChange("milker", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
              >
                {availableStaff.map((worker) => (
                  <option key={worker.id || worker._id} value={worker.name}>
                    {worker.name} ({worker.role || "Staff Member"})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Enter Milker / Herdsman Name"
                value={formData.milker}
                onChange={(e) => handleChange("milker", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#007a5e] hover:bg-[#00634c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Yield...</span>
                </>
              ) : (
                "Save Milking Log"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Input Field Component
function InputField({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-slate-700 font-bold mb-1">{label}</label>
      <input
        type={type}
        step={type === "number" ? "0.1" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
      />
    </div>
  );
}
