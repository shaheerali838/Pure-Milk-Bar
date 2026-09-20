import React from 'react';
import {
  ArrowLeft,
  X,
  Edit,
  Trash2,
  Printer,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/common/Typography';
import StaffProfileHeader from './StaffProfileHeader';
import StaffScheduleCards from './StaffScheduleCards';
import StaffPayrollBreakdown from './StaffPayrollBreakdown';
import StaffContactCard from './StaffContactCard';
import StaffJobCard from './StaffJobCard';

export default function StaffDetail({
  staff,
  isOpen,
  onClose,
  onBack,
  onEdit,
  onDelete,
}) {
  if (!staff) return null;
  // If used as drawer/modal without onBack, ensure isOpen is true
  if (!onBack && !isOpen) return null;

  const handleBack = onBack || onClose;

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to remove "${staff.name}" from staff records?`
      )
    ) {
      if (onDelete) onDelete(staff.id);
      if (handleBack) handleBack();
    }
  };

  const handlePrintSalarySlip = () => {
    window.print();
  };

  // 1. FULL-PAGE VIEW MODE (Standard Architecture)
  if (onBack) {
    return (
      <div className="space-y-5 animate-in fade-in duration-150 pb-8 max-w-7xl mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="cursor-pointer font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Staff List
            </Button>
            <div>
              <Typography variant="h3" className="font-bold text-slate-900 tracking-tight font-display text-lg sm:text-xl">
                Staff Profile &amp; Payroll — {staff.name}
              </Typography>
              <Typography variant="caption" color="muted">
                Staff ID: {staff.id} • Registered on {staff.joinedDate || 'Recently'}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintSalarySlip}
              className="cursor-pointer font-semibold text-xs text-slate-700 hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Print Salary Slip
            </Button>

            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(staff)}
                className="cursor-pointer font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/70"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit Staff
              </Button>
            )}

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="cursor-pointer font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content Card Panels */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-6">
          {/* Subcomponent 1: Staff Profile Header */}
          <StaffProfileHeader staff={staff} />

          {/* Subcomponent 2: Schedule & Route Cards */}
          <StaffScheduleCards staff={staff} />

          {/* Subcomponent 3: Monthly Payroll & Wage Slip Breakdown */}
          <StaffPayrollBreakdown staff={staff} />

          {/* Subcomponents 4 & 5: Contact & Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <StaffContactCard staff={staff} />
            <StaffJobCard staff={staff} />
          </div>

          {/* Optional Notes Section */}
          {staff.notes && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
              <div className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider mb-2 text-slate-600">
                <FileText className="w-4 h-4 text-slate-500" />
                Notes &amp; Operational Responsibilities
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {staff.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. FALLBACK DRAWER MODE (if rendered via isOpen)
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full sm:w-[480px] bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            {staff.id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <StaffProfileHeader staff={staff} />
        <StaffScheduleCards staff={staff} />
        <StaffPayrollBreakdown staff={staff} />
        <StaffContactCard staff={staff} />
        <StaffJobCard staff={staff} />
      </div>
    </div>
  );
}
