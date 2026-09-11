import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function EditCustomerModal({ customer, isOpen, onClose }) {
  const { updateCustomer } = useCustomerContext();
  const [formData, setFormData] = useState({
    id: '',
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
    subscription: '',
    creditLimit: '',
    khataBalance: '',
    paymentMode: 'Khata',
    status: 'Active',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        id: customer.id,
        name: customer.name || '',
        area: customer.area || '',
        phone: customer.phone || '',
        onlineAccount: customer.onlineAccount || customer.phone || '',
        cnicNumber: customer.cnicNumber || '',
        idType: customer.idType || 'CNIC',
        verificationStatus: customer.verificationStatus || 'Verified',
        address: customer.address || '',
        secondaryPhone: customer.secondaryPhone || '',
        referenceName: customer.referenceName || '',
        subscription: customer.subscription || '2 L Cow Milk',
        creditLimit: customer.creditLimit !== undefined ? String(customer.creditLimit) : '10000',
        khataBalance: customer.khataBalance !== undefined ? String(customer.khataBalance) : '0',
        paymentMode: customer.paymentMode || 'Khata',
        status: customer.status || 'Active',
      });
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    updateCustomer({
      ...customer,
      name: formData.name,
      area: formData.area,
      phone: formData.phone,
      onlineAccount: formData.onlineAccount,
      cnicNumber: formData.cnicNumber,
      idType: formData.idType,
      verificationStatus: formData.verificationStatus,
      address: formData.address,
      secondaryPhone: formData.secondaryPhone,
      referenceName: formData.referenceName,
      subscription: formData.subscription,
      creditLimit: Number(formData.creditLimit) || 0,
      khataBalance: Number(formData.khataBalance) || 0,
      paymentMode: formData.paymentMode,
      status: formData.status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-100 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Edit Customer Details</h3>
              <p className="text-[10px] text-slate-400 leading-tight">Update profile &amp; parameters for {customer.name}</p>
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
          {/* Basic Details */}
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
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Online Account <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.onlineAccount}
                  onChange={(e) => setFormData({ ...formData, onlineAccount: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Secondary Phone <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Verification Details */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verification Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  CNIC / ID Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
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
                  Guarantor / Reference <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Address & Subscription */}
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
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Milk Subscription</label>
                <input
                  type="text"
                  value={formData.subscription}
                  onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
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
                className="w-full px-2.5 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Finance & Status */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Finance &amp; Status
            </h4>
            <div className="grid grid-cols-2 gap-2">
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
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Khata Balance (Rs.)</label>
                <input
                  type="number"
                  value={formData.khataBalance}
                  onChange={(e) => setFormData({ ...formData, khataBalance: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold transition shadow-2xs cursor-pointer text-xs"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
