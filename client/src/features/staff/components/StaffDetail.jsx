import React from 'react';
import {
  ArrowLeft,
  X,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  DollarSign,
  CreditCard,
  MapPin,
  Calendar,
  Briefcase,
  ShieldCheck,
  User,
  FileText,
} from 'lucide-react';

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

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider'))
      return 'bg-amber-50 text-amber-700 border-amber-200';
    if (r.includes('farm'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (r.includes('security'))
      return 'bg-rose-50 text-rose-700 border-rose-200';
    if (r.includes('cashier'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    if (r.includes('manager'))
      return 'bg-purple-50 text-purple-700 border-purple-200';
    if (r.includes('accountant'))
      return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

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

  // 1. PAGE VIEW MODE: Renders in full space to the right of the sidebar
  if (onBack) {
    return (
      <div className="space-y-4 animate-in fade-in duration-150 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Staff
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Staff Profile — {staff.name}
              </h1>
              <p className="text-xs text-slate-500">
                Staff ID: {staff.id} • Registered on {staff.joinedDate || 'Recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(staff)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Staff
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/70 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
                {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {staff.name}
                  </h2>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {staff.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border ${getRoleBadgeStyle(
                      staff.role
                    )}`}
                  >
                    {staff.role}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {staff.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Compensation
                </span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Monthly Salary
              </div>
              <p className="text-base font-black text-slate-900 font-mono">
                Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70">
              <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                Working Shift
              </div>
              <p className="text-sm font-bold text-slate-800">
                {staff.shift || 'Morning'} Shift
              </p>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70">
              <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Assigned Route / Area
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {staff.route || 'Not Assigned'}
              </p>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70">
              <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined Date
              </div>
              <p className="text-sm font-bold text-slate-800 font-mono">
                {staff.joinedDate || 'Recently'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <User className="w-4 h-4 text-slate-500" />
                Contact &amp; Identification
              </h3>
              <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {staff.mobile || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                  </span>
                  <span className="font-medium text-slate-800">
                    {staff.email || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> CNIC:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {staff.cnic || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <Briefcase className="w-4 h-4 text-slate-500" />
                Job &amp; Assignment
              </h3>
              <div className="space-y-2.5 divide-y divide-slate-200/60 text-slate-700">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500">Official Role:</span>
                  <span className="font-bold text-slate-800">{staff.role}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Shift Schedule:</span>
                  <span className="font-bold text-slate-800">
                    {staff.shift || 'Morning'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500">Duty Location:</span>
                  <span className="font-semibold text-slate-800">
                    {staff.route || 'Farm Base'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {staff.notes && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider mb-2 text-slate-600">
                <FileText className="w-4 h-4 text-slate-500" />
                Notes &amp; Responsibilities
              </h3>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {staff.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. FALLBACK DRAWER MODE (if ever rendered via isOpen without onBack)
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full sm:w-[460px] bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {staff.id}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {staff.status || 'Active'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/80">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xl shadow-xs shrink-0 font-display">
              {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 leading-tight font-display truncate">
                {staff.name}
              </h2>
              <div className="mt-1">
                <span
                  className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getRoleBadgeStyle(
                    staff.role
                  )}`}
                >
                  {staff.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <DollarSign className="w-3.5 h-3.5" />
                Monthly Salary
              </div>
              <p className="text-lg font-black text-slate-900 font-mono tabular">
                Rs. {Number(staff.monthlySalary || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/80">
              <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                Working Shift
              </div>
              <p className="text-sm font-bold text-slate-800">
                {staff.shift || 'Morning'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Mobile Number
              </span>
              <span className="font-bold text-slate-800 font-mono tabular">
                {staff.mobile || '—'}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email
              </span>
              <span className="font-medium text-slate-800">
                {staff.email || '—'}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                CNIC Number
              </span>
              <span className="font-bold text-slate-800 font-mono tabular">
                {staff.cnic || '—'}
              </span>
            </div>
            <div className="p-3 flex items-start justify-between gap-3">
              <span className="text-slate-500 flex items-center gap-2 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Assigned Route / Area
              </span>
              <span className="font-semibold text-slate-800 text-right">
                {staff.route || 'Not Assigned'}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Registered Date
              </span>
              <span className="font-mono text-slate-600 tabular">
                {staff.joinedDate || '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Staff
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 border border-slate-200 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(staff);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
