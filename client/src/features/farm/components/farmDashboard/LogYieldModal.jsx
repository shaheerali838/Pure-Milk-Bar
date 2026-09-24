import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAnimalContext } from "../../../../context/AnimalContext";
import { useStaffContext } from "../../../../context/StaffContext";

export default function LogYieldModal({ isOpen, onClose }) {
  const { animals = [], updateAnimal } = useAnimalContext();
  const { staffList = [] } = useStaffContext();
  const farmWorkers = staffList.filter(s => s.role?.toLowerCase().includes('farm') || s.role?.toLowerCase().includes('milker') || s.role?.toLowerCase().includes('herdsman') || s.role?.toLowerCase().includes('worker'));

  const [formData, setFormData] = useState({
    tag: animals[0]?.tag || "",
    morning: "8.5",
    evening: "7.0",
    milker: "",
  });

  useEffect(() => {
    if (farmWorkers.length > 0 && !formData.milker) {
      setFormData(prev => ({ ...prev, milker: farmWorkers[0].name }));
    }
  }, [farmWorkers, formData.milker]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetAnimal = animals.find((a) => a.tag === formData.tag);

    if (targetAnimal && updateAnimal) {
      updateAnimal(targetAnimal.id, {
        ...targetAnimal,
        morningYield: `${formData.morning} L`,
        eveningYield: `${formData.evening} L`,
      });
    }

    toast.success(`Milking yield log saved for ${formData.tag || "animal"}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-slate-900">Log Farm Milking Yield</h3>
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

          {farmWorkers.length > 0 && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Herdsman / Milker Name
              </label>
              <select
                value={formData.milker}
                onChange={(e) => handleChange("milker", e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-500"
              >
                {farmWorkers.map((worker) => (
                  <option key={worker.id} value={worker.name}>
                    {worker.name} ({worker.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#007a5e] hover:bg-[#00634c] text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
            >
              Save Milking Log
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
