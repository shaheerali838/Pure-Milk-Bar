import React, { useState } from "react";
import { X, Beef } from "lucide-react";

const initialFormState = {
  tag: "",
  name: "",
  species: "Cow (Sahiwal)",
  lactationStatus: "Milking",
  acquisitionDate: new Date().toISOString().split("T")[0],
  purchasePrice: "",
  expectedYield: "",
  morningYield: "",
  eveningYield: "",
};

export default function RegisterAnimalModal({ isOpen, onClose, onRegister }) {
  const [formData, setFormData] = useState(initialFormState);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onRegister) {
      onRegister(formData);
    }
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Beef className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Register New Livestock Animal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Tag & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tag # <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                name="tag"
                placeholder="Auto-generated if blank"
                value={formData.tag}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Animal Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Sahiwal Queen"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Species & Lactation Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Species
              </label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
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
                name="lactationStatus"
                value={formData.lactationStatus}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              >
                <option value="Milking">Milking</option>
                <option value="Dry/Gestating">Dry/Gestating</option>
                <option value="Calf">Calf</option>
              </select>
            </div>
          </div>

          {/* Date & Purchase Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Acquisition Date
              </label>
              <input
                type="date"
                name="acquisitionDate"
                required
                value={formData.acquisitionDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Purchase Price (Rs)
              </label>
              <input
                type="number"
                name="purchasePrice"
                min="0"
                placeholder="e.g. 250000"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Expected Yield */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Expected Daily Yield (Kg/L)
            </label>
            <input
              type="number"
              name="expectedYield"
              step="0.1"
              min="0"
              placeholder="e.g. 15.5"
              value={formData.expectedYield}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Baseline Morning & Evening Yields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Avg Morning Yield (L)
              </label>
              <input
                type="number"
                name="morningYield"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={formData.morningYield}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Avg Evening Yield (L)
              </label>
              <input
                type="number"
                name="eveningYield"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={formData.eveningYield}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Register Animal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
