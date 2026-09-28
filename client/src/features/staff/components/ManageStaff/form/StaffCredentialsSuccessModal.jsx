import React, { useState } from 'react';
import { UserCheck, Copy } from 'lucide-react';

export default function StaffCredentialsSuccessModal({
  modalData,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  if (!modalData) return null;

  const handleCopy = () => {
    const text = `Pure Milk Bar Login Credentials\nPortal: ${window.location.origin}/login\nUser: ${modalData.username || modalData.email}\nPassword: ${modalData.password}\nRole: ${modalData.role}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <UserCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-slate-900 font-display tracking-tight">
            Staff Enrolled &amp; Credentials Generated!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {modalData.emailSent ? (
              <span className="text-emerald-700 font-semibold">
                ✅ An official welcome email with login credentials has been sent to{' '}
                <strong className="font-mono text-slate-800">{modalData.email}</strong>.
              </span>
            ) : (
              <span>The staff member has been registered. You can provide these credentials directly.</span>
            )}
          </p>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              Employee Onboarding Summary
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              {modalData.role}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Full Name:</span>
              <span className="font-bold text-slate-800">{modalData.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Assigned Shift:</span>
              <span className="font-bold text-slate-800">{modalData.shift} Shift</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Username / Login ID:</span>
              <span className="font-mono font-bold text-slate-800">{modalData.username || modalData.email}</span>
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-emerald-300">
              <span className="text-slate-500 font-medium">Temporary Password:</span>
              <span className="font-mono font-black text-emerald-700 text-sm tracking-wider">
                {modalData.password}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied to Clipboard!' : 'Copy Full Credentials Package'}
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#00a86b] hover:bg-[#008f5a] text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            Done &amp; Return to Roster
          </button>
        </div>
      </div>
    </div>
  );
}
