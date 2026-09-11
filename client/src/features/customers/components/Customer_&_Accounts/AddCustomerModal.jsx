import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function AddCustomerModal({ isOpen, onClose }) {
  const { addCustomer } = useCustomerContext();
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    phone: '',
    onlineAccount: '',
    cnicNumber: '',
    idType: 'CNIC',
    verificationStatus: 'Verified',
    address: '',
    secondaryPhone: '',
    referenceName: '',
    subscription: '2 L Cow Milk',
    creditLimit: '10000',
    khataBalance: '0',
    paymentMode: 'Khata',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    addCustomer({
      name: formData.name,
      area: formData.area || 'Model Town',
      phone: formData.phone,
      onlineAccount: formData.onlineAccount || formData.phone,
      cnicNumber: formData.cnicNumber || '',
      idType: formData.idType,
      verificationStatus: formData.verificationStatus,
      address: formData.address || '',
      secondaryPhone: formData.secondaryPhone || '',
      referenceName: formData.referenceName || '',
      subscription: formData.subscription,
      creditLimit: Number(formData.creditLimit) || 10000,
      khataBalance: Number(formData.khataBalance) || 0,
      paymentMode: formData.paymentMode,
      status: 'Active',
    });

    setFormData({
      name: '',
      area: '',
      phone: '',
      onlineAccount: '',
      cnicNumber: '',
      idType: 'CNIC',
      verificationStatus: 'Verified',
      address: '',
      secondaryPhone: '',
      referenceName: '',
      subscription: '2 L Cow Milk',
      creditLimit: '10000',
      khataBalance: '0',
      paymentMode: 'Khata',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Add New Customer</h3>
              <p className="text-[10px] text-slate-400 leading-tight">Customer profile &amp; verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs max-h-[82vh] overflow-y-auto">
          {/* Section 1: Customer Info */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Basic Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ali Hassan"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Primary Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1111111"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Online Payment Account <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <input
                  type="text"
                  value={formData.onlineAccount}
                  onChange={(e) => setFormData({ ...formData, onlineAccount: e.target.value })}
                  placeholder="e.g. 0300-1111111"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Secondary / Emergency Phone <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <input
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  placeholder="0321-7654321"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Verification Details */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verification Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  CNIC No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                  placeholder="35202-1234567-1"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">ID Document Type</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                >
                  <option value="CNIC">CNIC (Smart Card)</option>
                  <option value="Utility Bill">Utility Bill</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Verification Status</label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Guarantor / Reference <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  placeholder="Reference person name"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Address & Subscription */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Address &amp; Subscription
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Area / Sector</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Model Town"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Milk Subscription</label>
                <input
                  type="text"
                  value={formData.subscription}
                  onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
                  placeholder="e.g. 2 L Cow Milk"
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Full Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. House #45, Block C"
                className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Finance & Limits */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Finance &amp; Khata Limits
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Credit Limit (Rs.)</label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Initial Khata (Rs.)</label>
                <input
                  type="number"
                  value={formData.khataBalance}
                  onChange={(e) => setFormData({ ...formData, khataBalance: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                >
                  <option value="Khata">Khata</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-md font-bold transition shadow-2xs cursor-pointer text-xs"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
