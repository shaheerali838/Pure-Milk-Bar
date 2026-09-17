import React from 'react';
import {
  X,
  Phone,
  MapPin,
  Building2,
  Droplets,
  Receipt,
  Clock,
  DollarSign,
  Edit,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SupplierDetailSidebar({
  supplier,
  onClose,
  onEdit,
}) {
  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Slide-in Sidebar Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-2xs">
              {supplier.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 font-display">
                  {supplier.name}
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  {supplier.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">{supplier.supplierType}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Status and Rate Ribbon */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Agreed Rate
              </span>
              <span className="text-lg font-black text-emerald-700 font-display tabular">
                Rs. {supplier.ratePerLiter}{' '}
                <span className="text-xs font-medium text-emerald-600">/ Liter</span>
              </span>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-bold border-0 px-3 py-1 rounded-full ${
                supplier.status === 'Active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {supplier.status === 'Active' ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              ) : (
                <XCircle className="w-3.5 h-3.5 mr-1" />
              )}
              {supplier.status}
            </Badge>
          </div>

          {/* Sourcing & Financial Metrics Grid */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Procurement & Accounts Summary
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-600" />
                  Total Sourced
                </span>
                <p className="text-base font-bold text-slate-900 mt-1 tabular font-display">
                  {(supplier.totalSourced || 0).toLocaleString()} Liters
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-emerald-600" />
                  Total Payout
                </span>
                <p className="text-base font-bold text-emerald-700 mt-1 tabular font-display">
                  Rs. {(supplier.totalPayout || 0).toLocaleString()}
                </p>
              </div>

              <div className="col-span-2 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Outstanding Balance Due
                  </span>
                  <p className="text-lg font-black text-amber-700 mt-0.5 tabular font-display">
                    Rs. {(supplier.balanceDue || 0).toLocaleString()}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {(supplier.balanceDue || 0) > 0 ? 'Pending' : 'Cleared'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Contact & Location Info
            </h4>
            <div className="space-y-2.5 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Contact Number</span>
                  <a
                    href={`tel:${supplier.contact}`}
                    className="font-mono font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                  >
                    {supplier.contact || 'No contact provided'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Procurement Area</span>
                  <span className="font-semibold text-slate-900">{supplier.area}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 text-[11px] block">Physical Address</span>
                  <span className="font-medium text-slate-800">
                    {supplier.address || 'Address not registered'}
                  </span>
                </div>
              </div>

              {supplier.createdAt && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-[11px] block">Registered On</span>
                    <span className="font-medium text-slate-600 font-mono">
                      {supplier.createdAt}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full h-[40px] text-xs font-semibold text-slate-700 bg-white"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(supplier);
            }}
            className="flex-1 rounded-full h-[40px] text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm"
            style={{ backgroundColor: '#009966' }}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
