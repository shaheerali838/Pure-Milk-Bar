import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Beef,
  Check,
  Calendar,
  DollarSign,
  Activity,
  Milk,
  FileText,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";

const SPECIES_OPTIONS = [
  "Cow (Sahiwal)",
  "Cow (Cholistani)",
  "Buffalo (Nili Ravi)",
  "Buffalo (Kundi)",
];

const LACTATION_STATUS_OPTIONS = [
  "Milking",
  "Dry/Gestating",
  "Calf",
];

const HEALTH_STATUS_OPTIONS = [
  "Healthy & Vaccinated",
  "Under Routine Checkup",
  "Under Treatment / Isolation",
  "Quarantined",
];

const initialForm = {
  tag: "",
  name: "",
  species: "Cow (Sahiwal)",
  lactationStatus: "Milking",
  acquisitionDate: new Date().toISOString().split("T")[0],
  purchasePrice: "",
  morningYield: "",
  eveningYield: "",
  expectedYield: "",
  healthStatus: "Healthy & Vaccinated",
  notes: "",
};

export default function AnimalAdd({ onBack, onClose, editingAnimal = null, onSuccess }) {
  const { addAnimal, updateAnimal } = useAnimalContext();
  const handleBack = onBack || onClose;
  const isEdit = Boolean(editingAnimal);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingAnimal) {
      setFormData({
        tag: editingAnimal.tag || "",
        name: editingAnimal.name || "",
        species: editingAnimal.species || "Cow (Sahiwal)",
        lactationStatus: editingAnimal.lactationStatus || "Milking",
        acquisitionDate: editingAnimal.acquisitionDate || new Date().toISOString().split("T")[0],
        purchasePrice: editingAnimal.purchasePrice
          ? String(editingAnimal.purchasePrice).replace(/[^0-9.]/g, "")
          : "",
        morningYield: editingAnimal.morningYield
          ? String(editingAnimal.morningYield).replace(" L", "").trim()
          : "",
        eveningYield: editingAnimal.eveningYield
          ? String(editingAnimal.eveningYield).replace(" L", "").trim()
          : "",
        expectedYield: editingAnimal.expectedYield
          ? String(editingAnimal.expectedYield).replace(" L", "").trim()
          : "",
        healthStatus: editingAnimal.healthStatus || "Healthy & Vaccinated",
        notes: editingAnimal.notes || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingAnimal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit && editingAnimal) {
        await updateAnimal(editingAnimal._id || editingAnimal.id, formData);
      } else {
        await addAnimal(formData);
      }

      if (onSuccess) onSuccess();
      if (handleBack) handleBack();
    } catch (err) {
      console.error("Failed to save animal:", err);
      alert(err.message || "Failed to save livestock record");
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 no-scrollbar">
      {/* Top action & header bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Livestock
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              {isEdit ? `Edit Livestock — ${editingAnimal?.tag || ""}` : "Register New Livestock Animal"}
            </h1>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isEdit
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isEdit ? "bg-indigo-500" : "bg-emerald-500 animate-pulse"
            }`}
          />
          {isEdit ? `Editing #${editingAnimal?.tag}` : "New Animal"}
        </span>
      </div>

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Section 1: Identification & Breed */}
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                  isEdit ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <Beef className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                1. Livestock Identification &amp; Breed
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tag # <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Tag className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    placeholder="Auto-generated if empty"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Animal Name / Identifier
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  required/>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Species &amp; Breed <span className="text-rose-500">*</span>
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                required>
                  {SPECIES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lactation Status <span className="text-rose-500">*</span>
                </label>
                <select
                  name="lactationStatus"
                  value={formData.lactationStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                required>
                  {LACTATION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Milk Production & Yield */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                <Milk className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                2. Daily Milk Yield Baseline (Liters)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Morning Yield (Liters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    L
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="morningYield"
                    value={formData.morningYield}
                    onChange={handleChange}
                    placeholder="8.5"
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Evening Yield (Liters)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    L
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="eveningYield"
                    value={formData.eveningYield}
                    onChange={handleChange}
                    placeholder="7.0"
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Daily Yield (L)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    L/day
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="expectedYield"
                    value={formData.expectedYield}
                    onChange={handleChange}
                    placeholder="15.5"
                    className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Acquisition, Valuation & Health */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2.5">
              <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                3. Acquisition, Valuation &amp; Health
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Acquisition Date
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="date"
                    name="acquisitionDate"
                    value={formData.acquisitionDate}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Purchase Price (Rs.)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-[11px]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="250000"
                  required  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Health &amp; Vaccination Status
                </label>
                <div className="relative">
                  <select
                    name="healthStatus"
                    value={formData.healthStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition cursor-pointer font-medium"
                  >
                    {HEALTH_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes, Ear Notch or Identification Marks
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter details"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer ${
                isEdit
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-[#00a86b] hover:bg-[#007a52]"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {isEdit ? "Save Changes" : "Register Livestock Animal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
