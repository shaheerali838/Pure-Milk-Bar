import React from 'react';
import { X, Phone, Smartphone, Milk, CreditCard, Shield, MapPin, ShieldCheck, UserCheck } from 'lucide-react';

export default function ViewCustomerModal({ customer, isOpen, onClose }) {
  if (!isOpen || !customer) return null;

  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const khataPercent = Math.min(
    100,
    Math.round(((customer.khataBalance || 0) / (customer.creditLimit || 10000)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-800 leading-tight">{customer.name}</h3>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    customer.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {customer.verificationStatus || 'Verified'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5 leading-none">
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                {customer.area || 'Model Town'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body - Read Only Customer Details */}
        <div className="p-3.5 space-y-2.5 text-xs text-slate-700 max-h-[82vh] overflow-y-auto">
          {/* Primary Phone & Online Account */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-slate-500" /> Primary Phone
              </span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">{customer.phone}</p>
            </div>

            <div>
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Smartphone className="w-2.5 h-2.5 text-emerald-600" /> Online Account
              </span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                {customer.onlineAccount || customer.phone}
              </p>
            </div>
          </div>

          {/* Verification & Identification Details */}
          <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-lg space-y-1.5">
            <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Identity &amp; Verification
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">CNIC / ID Number</span>
                <p className="font-bold text-slate-800 font-mono text-[11px]">{customer.cnicNumber || 'Not Provided'}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">Document Type</span>
                <p className="font-bold text-slate-800 text-[11px]">{customer.idType || 'CNIC'}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">Secondary Phone</span>
                <p className="font-semibold text-slate-800 text-[11px]">{customer.secondaryPhone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">Guarantor / Ref</span>
                <p className="font-semibold text-slate-800 text-[11px]">{customer.referenceName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address & Subscription */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Milk className="w-2.5 h-2.5 text-slate-500" /> Subscription
              </span>
              <p className="font-semibold text-slate-800 text-[11px] mt-0.5">{customer.subscription || '2 L Cow Milk'}</p>
            </div>

            <div className="p-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-blue-500" /> Status &amp; Mode
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${
                    customer.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {customer.status}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[9px] font-semibold">
                  {customer.paymentMode || 'Khata'}
                </span>
              </div>
            </div>
          </div>

          {customer.address && (
            <div className="p-2 bg-white border border-slate-200 rounded-lg">
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-slate-500" /> Full Address
              </span>
              <p className="font-medium text-slate-800 text-[11px] mt-0.5">{customer.address}</p>
            </div>
          )}

          {/* Balance & Limits */}
          <div className="p-2.5 bg-slate-900 text-white rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium">Credit Limit</span>
              <span className="font-bold">Rs. {(customer.creditLimit || 10000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-amber-400 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Khata Balance
              </span>
              <span className="text-amber-400">Rs. {(customer.khataBalance || 0).toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${khataPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 flex justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-semibold transition text-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
