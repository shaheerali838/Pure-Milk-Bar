import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
      khataBalance: 0,
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
              <h3 className="text-xs font-bold text-slate-800 font-display">Add New Customer</h3>
              <p className="text-[10px] text-slate-400 leading-tight">Customer profile &amp; verification</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs max-h-[82vh] overflow-y-auto">
          {/* Section 1: Customer Info */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
              Basic Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Customer Name *</label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ali Hassan"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Primary Phone *</label>
                <Input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1111111"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Online Payment Account <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <Input
                  type="text"
                  value={formData.onlineAccount}
                  onChange={(e) => setFormData({ ...formData, onlineAccount: e.target.value })}
                  placeholder="e.g. 0300-1111111"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Secondary / Emergency Phone <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <Input
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  placeholder="0321-7654321"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Verification Details */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1 font-display">
              <ShieldCheck className="w-3 h-3" /> Verification Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  CNIC No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                  placeholder="35202-1234567-1"
                  className="h-8 px-2.5 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">ID Document Type</label>
                <Select value={formData.idType} onValueChange={(val) => setFormData({ ...formData, idType: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNIC">CNIC (Smart Card)</SelectItem>
                    <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                    <SelectItem value="Driving License">Driving License</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Verification Status</label>
                <Select value={formData.verificationStatus} onValueChange={(val) => setFormData({ ...formData, verificationStatus: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                    <SelectItem value="Unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Guarantor / Reference <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <Input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  placeholder="Reference person name"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Address & Subscription */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
              Address &amp; Subscription
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Area / Sector</label>
                <Input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Model Town"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Milk Subscription</label>
                <Input
                  type="text"
                  value={formData.subscription}
                  onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
                  placeholder="e.g. 2 L Cow Milk"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Full Address</label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. House #45, Block C"
                className="h-8 px-2.5 py-1 text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Finance & Limits */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
              Finance &amp; Khata Limits
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Credit Limit (Rs.)</label>
                <Input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="h-8 px-2.5 py-1 text-xs tabular font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Payment Mode</label>
                <Select value={formData.paymentMode} onValueChange={(val) => setFormData({ ...formData, paymentMode: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Payment Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khata">Khata</SelectItem>
                    <SelectItem value="Online Payment">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-bold shadow-2xs"
            >
              Save Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
