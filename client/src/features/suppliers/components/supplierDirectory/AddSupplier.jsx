import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Save,
  Building2,
  Phone,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSupplierContext } from '@/context/SupplierContext';
import { Button } from '@/components/ui/button';

const SUPPLIER_TYPES = [
  'Commercial Dairy Farm',
  'Individual Farmer',
  'Dairy Cooperative',
  'Middleman / Collection Center',
];

/**
 * AddSupplier Component
 * Full-Space Form component for adding and editing suppliers in Supplier Directory.
 * Takes 100% of the content space next to the app sidebar.
 */
export default function AddSupplier({ onCancel, editSupplier = null }) {
  const { addSupplier, updateSupplier } = useSupplierContext();

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    area: '',
    supplierType: 'Commercial Dairy Farm',
    ratePerLiter: '228',
    avgLiters: '10',
    address: '',
    status: 'Active',
  });

  // Sync state with editSupplier if editing, or reset if adding
  useEffect(() => {
    if (editSupplier) {
      setFormData({
        name: editSupplier.name || '',
        contact: editSupplier.contact || '',
        area: editSupplier.area || '',
        supplierType: editSupplier.supplierType || 'Commercial Dairy Farm',
        ratePerLiter: editSupplier.ratePerLiter ? String(editSupplier.ratePerLiter) : '228',
        avgLiters: editSupplier.avgLiters ? String(editSupplier.avgLiters) : '10',
        address: editSupplier.address || '',
        status: editSupplier.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        area: '',
        supplierType: 'Commercial Dairy Farm',
        ratePerLiter: '228',
        avgLiters: '10',
        address: '',
        status: 'Active',
      });
    }
  }, [editSupplier]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter supplier name.');
      return;
    }

    if (editSupplier) {
      updateSupplier(editSupplier.id, formData);
    } else {
      addSupplier(formData);
    }

    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-[38px] px-3.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Supplier Directory</span>
          </Button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-[#009966]" />
              <span>{editSupplier ? `Edit Supplier Profile: ${editSupplier.name}` : 'Register New Milk Supplier'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage vendor contacts, commercial entity type, and agreed procurement rates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-[38px] px-4 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            className="h-[38px] px-6 rounded-full text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 cursor-pointer hover:brightness-110"
            style={{ backgroundColor: '#009966' }}
          >
            <Save className="w-4 h-4" />
            <span>{editSupplier ? 'Update Supplier' : 'Save Supplier Profile'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Full-Space Multi-Column Form Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Vendor Profile Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
              <Building2 className="w-4 h-4 text-[#009966]" />
              <span>Vendor Profile &amp; Location Details</span>
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Supplier / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahim Ullah Dairy Farm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-[#009966] transition-colors shadow-2xs"
              />
            </div>

            {/* Entity Type & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Supplier Category *
                </label>
                <select
                  value={formData.supplierType}
                  onChange={(e) => setFormData({ ...formData, supplierType: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white outline-none focus:border-[#009966]"
                >
                  {SUPPLIER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Contact Number
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-[42px]">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Collection Area / Route */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Collection Route / Area *
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-[42px]">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Meadows, Sahiwal, Sector 4"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Physical Address */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Physical Address / Shed Location
              </label>
              <textarea
                rows={2}
                placeholder="Village address, farm location, landmark..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#009966]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Operational Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
              <Tag className="w-4 h-4 text-[#009966]" />
              <span>Procurement Terms &amp; Status</span>
            </div>

            {/* Agreed Rate per Liter */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
              <label className="block font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
                Agreed Milk Rate (Rs. / Liter) *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-700">Rs.</span>
                <input
                  type="number"
                  step="0.5"
                  min="50"
                  required
                  placeholder="e.g. 230"
                  value={formData.ratePerLiter}
                  onChange={(e) => setFormData({ ...formData, ratePerLiter: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-xl border border-emerald-300 text-lg font-black text-emerald-800 bg-white outline-none focus:border-[#009966] tabular"
                />
                <span className="text-xs text-emerald-600 font-medium">/ Liter</span>
              </div>
              <p className="text-[11px] text-emerald-700/80">
                This default rate will auto-populate during intake slips and shift entries.
              </p>
            </div>

            {/* Expected Daily/Shift Volume (Liters) */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Expected Supply per Shift (Liters) *
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-[42px]">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  placeholder="e.g. 10"
                  value={formData.avgLiters}
                  onChange={(e) => setFormData({ ...formData, avgLiters: e.target.value })}
                  className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-900"
                />
                <span className="text-xs text-slate-400 font-semibold">L / Shift</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used to calculate expected shift volume and variance in the Intake Register.
              </p>
            </div>

            {/* Vendor Operational Status */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Vendor Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-[42px] px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#009966]"
              >
                <option value="Active">Active Supplier (Eligible for Shifts)</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <span className="font-bold block text-slate-800">Auto-Integration:</span>
              <p className="text-[11px] text-slate-500">
                Newly registered active suppliers automatically appear in the Milk Intake Register and Shift Collection screens with their agreed rates.
              </p>
            </div>
          </div>

          {/* Submission Button */}
          <Button
            type="submit"
            className="w-full h-[46px] rounded-2xl text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
            style={{ backgroundColor: '#009966' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{editSupplier ? 'Update & Save Profile' : 'Complete Registration'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
