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
  Loader2,
  Sparkles,
  Heart,
} from "lucide-react";
import { useAnimalContext } from "../../../../context/AnimalContext";
import ImageUpload from "@/components/common/ImageUpload";

const SPECIES_OPTIONS = ["Cow", "Buffalo"];

const LACTATION_STATUS_OPTIONS = ["Milking", "Dry/Gestating", "Calf"];

const HEALTH_STATUS_OPTIONS = [
  "Healthy & Vaccinated",
  "Under Routine Checkup",
  "Under Treatment / Isolation",
  "Quarantined",
];

const initialForm = {
  tag: "",
  name: "",
  species: "Cow",
  lactationStatus: "Milking",
  acquisitionDate: new Date().toISOString().split("T")[0],
  purchasePrice: "",
  morningYield: "",
  eveningYield: "",
  expectedYield: "",
  healthStatus: "Healthy & Vaccinated",
  notes: "",
  image: "",
  hasCalf: false,
  calfTag: "",
  calfGender: "Male",
  calfDob: "",
  calfAge: "",
  calfNotes: "",
};

export default function AnimalAdd({
  onBack,
  onClose,
  editingAnimal = null,
  onSuccess,
}) {
  const { addAnimal, updateAnimal } = useAnimalContext();
  const handleBack = onBack || onClose;
  const isEdit = Boolean(editingAnimal);

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAnimal) {
      setFormData({
        tag: editingAnimal.tag || "",
        name: editingAnimal.name || "",
        species: editingAnimal.species || "Cow (Sahiwal)",
        lactationStatus: editingAnimal.lactationStatus || "Milking",
        acquisitionDate:
          editingAnimal.acquisitionDate ||
          new Date().toISOString().split("T")[0],
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
        image: editingAnimal.image || "",
        hasCalf: Boolean(editingAnimal.hasCalf),
        calfTag: editingAnimal.calfTag || "",
        calfGender: editingAnimal.calfGender || "Male",
        calfDob: editingAnimal.calfDob ? String(editingAnimal.calfDob).slice(0, 10) : "",
        calfAge: editingAnimal.calfAge || "",
        calfNotes: editingAnimal.calfNotes || "",
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingAnimal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMorningChange = (e) => {
    const val = e.target.value;
    const mNum = parseFloat(val);
    const eNum = parseFloat(formData.eveningYield);

    let nextExpected = formData.expectedYield;
    if (val === "" && (!formData.eveningYield || formData.eveningYield === "")) {
      nextExpected = "";
    } else {
      const total = (isNaN(mNum) ? 0 : mNum) + (isNaN(eNum) ? 0 : eNum);
      nextExpected = total > 0 || val !== "" || formData.eveningYield !== "" ? String(parseFloat(total.toFixed(2))) : "";
    }

    setFormData((prev) => ({
      ...prev,
      morningYield: val,
      expectedYield: nextExpected,
    }));
  };

  const handleEveningChange = (e) => {
    const val = e.target.value;
    const mNum = parseFloat(formData.morningYield);
    const eNum = parseFloat(val);

    let nextExpected = formData.expectedYield;
    if (val === "" && (!formData.morningYield || formData.morningYield === "")) {
      nextExpected = "";
    } else {
      const total = (isNaN(mNum) ? 0 : mNum) + (isNaN(eNum) ? 0 : eNum);
      nextExpected = total > 0 || val !== "" || formData.morningYield !== "" ? String(parseFloat(total.toFixed(2))) : "";
    }

    setFormData((prev) => ({
      ...prev,
      eveningYield: val,
      expectedYield: nextExpected,
    }));
  };

  const handleExpectedChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setFormData((prev) => ({
        ...prev,
        expectedYield: "",
      }));
      return;
    }

    const expNum = parseFloat(val);
    if (isNaN(expNum)) {
      setFormData((prev) => ({ ...prev, expectedYield: val }));
      return;
    }

    const mNum = parseFloat(formData.morningYield);
    const eNum = parseFloat(formData.eveningYield);

    let nextMorning = formData.morningYield;
    let nextEvening = formData.eveningYield;

    if (!isNaN(mNum) && mNum > 0 && isNaN(eNum)) {
      nextEvening = String(Math.max(0, parseFloat((expNum - mNum).toFixed(2))));
    } else if (!isNaN(eNum) && eNum > 0 && isNaN(mNum)) {
      nextMorning = String(Math.max(0, parseFloat((expNum - eNum).toFixed(2))));
    } else if (!isNaN(mNum) && !isNaN(eNum) && (mNum > 0 || eNum > 0)) {
      nextEvening = String(Math.max(0, parseFloat((expNum - mNum).toFixed(2))));
    } else {
      const half = parseFloat((expNum / 2).toFixed(2));
      nextMorning = String(half);
      nextEvening = String(parseFloat((expNum - half).toFixed(2)));
    }

    setFormData((prev) => ({
      ...prev,
      expectedYield: val,
      morningYield: nextMorning,
      eveningYield: nextEvening,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
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
      setIsSubmitting(false);
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
              {isEdit
                ? `Edit Livestock — ${editingAnimal?.tag || ""}`
                : "Register New Livestock Animal"}
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
          {isEdit ? `Editing ${editingAnimal?.tag || 'Animal'}` : "New Animal"}
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
                  isEdit
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-emerald-100 text-emerald-700"
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
                  Animal Tag{" "}
                  <span className="text-slate-400 font-normal lowercase">
                    (optional)
                  </span>
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
                  required
                />
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
                  required
                >
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
                  required
                >
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
                    onChange={handleMorningChange}
                    onWheel={(e) => e.target.blur()}
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
                    onChange={handleEveningChange}
                    onWheel={(e) => e.target.blur()}
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
                    onChange={handleExpectedChange}
                    onWheel={(e) => e.target.blur()}
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
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
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

              <div className="md:col-span-3 pt-2">
                <ImageUpload
                  label="Cattle Photograph / Identification Image"
                  value={formData.image}
                  onChange={(img) =>
                    setFormData((prev) => ({ ...prev, image: img }))
                  }
                  helpText="Upload pure breed cattle photograph (JPG, PNG)"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Calf Information */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-pink-100 text-pink-700 flex items-center justify-center text-xs">
                  <Heart className="w-3.5 h-3.5 fill-pink-500" />
                </div>
                <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                  4. Calf at Side (Optional)
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-full transition select-none">
                <input
                  type="checkbox"
                  name="hasCalf"
                  checked={formData.hasCalf}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      hasCalf: isChecked,
                      calfTag: isChecked && !prev.calfTag && prev.tag ? `${prev.tag}-C1` : prev.calfTag,
                    }));
                  }}
                  className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700">
                  {formData.hasCalf ? "Has Calf (Yes)" : "No Calf"}
                </span>
              </label>
            </div>

            {formData.hasCalf && (
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Calf Tag / Identifier
                    </label>
                    <input
                      type="text"
                      name="calfTag"
                      value={formData.calfTag}
                      onChange={handleChange}
                      placeholder={formData.tag ? `${formData.tag}-C1` : "CALF-01"}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Calf Gender
                    </label>
                    <select
                      name="calfGender"
                      value={formData.calfGender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Calf Age / DOB
                    </label>
                    <input
                      type="text"
                      name="calfAge"
                      value={formData.calfAge}
                      onChange={handleChange}
                      placeholder="e.g. 1 Month, 20 Days"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Calf Health &amp; Markings
                    </label>
                    <input
                      type="text"
                      name="calfNotes"
                      value={formData.calfNotes}
                      onChange={handleChange}
                      placeholder="Healthy, suckling well, markings"
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed opacity-80"
                  : isEdit
                  ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  : "bg-[#00a86b] hover:bg-[#007a52] cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEdit ? "Saving Changes..." : "Registering Livestock..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEdit ? "Save Changes" : "Register Livestock Animal"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
