import React, { useState } from "react";
import { X, Beef } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterAnimalModal({ isOpen, onClose, onRegister }) {
  const [formData, setFormData] = useState({
    tag: "",
    species: "Cow (Sahiwal)",
    lactationStatus: "Milking",
    acquisitionDate: new Date().toISOString().split("T")[0],
    morningYield: "",
    eveningYield: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onRegister) {
      onRegister(formData);
    }
    // Reset form fields
    setFormData({
      tag: "",
      species: "Cow (Sahiwal)",
      lactationStatus: "Milking",
      acquisitionDate: new Date().toISOString().split("T")[0],
      morningYield: "",
      eveningYield: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Beef className="w-4 h-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-800">
              Register New Livestock Animal
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tag # */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tag #
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. COW-1050"
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Species */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Species
              </label>
              <Select
                value={formData.species}
                onValueChange={(val) =>
                  setFormData({ ...formData, species: val })
                }
              >
                <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all">
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cow (Sahiwal)">Cow (Sahiwal)</SelectItem>
                  <SelectItem value="Cow (Cholistani)">Cow (Cholistani)</SelectItem>
                  <SelectItem value="Buffalo (Nili Ravi)">Buffalo (Nili Ravi)</SelectItem>
                  <SelectItem value="Buffalo (Kundi)">Buffalo (Kundi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lactation Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Lactation Status
              </label>
              <Select
                value={formData.lactationStatus}
                onValueChange={(val) =>
                  setFormData({ ...formData, lactationStatus: val })
                }
              >
                <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Milking">Milking</SelectItem>
                  <SelectItem value="Dry/Gestating">Dry/Gestating</SelectItem>
                  <SelectItem value="Calf">Calf</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Acquisition Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Acquisition Date
            </label>
            <Input
              type="date"
              required
              value={formData.acquisitionDate}
              onChange={(e) =>
                setFormData({ ...formData, acquisitionDate: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all tabular"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Morning (L) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Morning (L)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={formData.morningYield}
                onChange={(e) =>
                  setFormData({ ...formData, morningYield: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all tabular"
              />
            </div>

            {/* Evening (L) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Evening (L)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
                value={formData.eveningYield}
                onChange={(e) =>
                  setFormData({ ...formData, eveningYield: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all tabular"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Register Animal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
