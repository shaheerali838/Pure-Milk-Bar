import React, { useState, useEffect, useMemo } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { usePOSContext } from '../../../../context/POSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EditCustomerModal({ customer, isOpen, onClose }) {
  const { updateCustomer } = useCustomerContext();
  const { products = [] } = usePOSContext();

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

  const milkProducts = useMemo(() => {
    if (products && products.length > 0) {
      const milkOnly = products.filter(
        (p) => p.category?.toLowerCase() === 'milk' || /milk/i.test(p.name)
      );
      if (milkOnly.length > 0) return milkOnly;
      return products;
    }
    return [
      { id: 'cow-milk', name: 'Cow Milk', price: 240, unit: 'L' },
      { id: 'buffalo-milk', name: 'Buffalo Milk', price: 260, unit: 'L' },
      { id: 'mixed-milk', name: 'Mixed Milk', price: 250, unit: 'L' },
    ];
  }, [products]);

  const [selectedProductId, setSelectedProductId] = useState(() => milkProducts[0]?.id || 'cow-milk');

  const selectedProduct = milkProducts.find((p) => String(p.id) === String(selectedProductId)) || milkProducts[0];
  const currentPrice = Number(selectedProduct?.price) || 240;

  const [subQty, setSubQty] = useState('2');
  const [subUnit, setSubUnit] = useState('L');

  const numQty = parseFloat(subQty) || 0;
  const dailyCost = numQty * currentPrice;
  const monthlyCost = dailyCost * 30;

  const parseSubscriptionDetails = (str) => {
    if (!str) return { qty: '2', unit: 'L', productId: milkProducts[0]?.id || 'cow-milk' };
    const numMatch = str.match(/(\d+(\.\d+)?)/);
    const qty = numMatch ? numMatch[1] : '2';
    const unit = /kg/i.test(str) ? 'KG' : 'L';
    const matched = milkProducts.find(p => p.name && str.toLowerCase().includes(p.name.toLowerCase()));
    const productId = matched ? matched.id : (milkProducts[0]?.id || 'cow-milk');
    return { qty, unit, productId };
  };

  useEffect(() => {
    if (customer) {
      const parsed = parseSubscriptionDetails(customer.subscription);
      setSubQty(parsed.qty);
      setSubUnit(parsed.unit);
      setSelectedProductId(parsed.productId);

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

    const formattedSubscription = `${subQty} ${subUnit} ${selectedProduct?.name || 'Cow Milk'}`.trim();

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
      subscription: formattedSubscription,
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
              <h3 className="text-xs font-bold text-slate-800 font-display">Edit Customer Details</h3>
              <p className="text-[10px] text-slate-400 leading-tight">Update profile &amp; parameters for {customer.name}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 text-xs max-h-[82vh] overflow-y-auto">
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
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Online Account <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.onlineAccount}
                  onChange={(e) => setFormData({ ...formData, onlineAccount: e.target.value })}
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  Secondary Phone <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1 font-display">
              <ShieldCheck className="w-3 h-3" /> Verification Parameters
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                  CNIC / ID Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
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
                  Guarantor / Reference <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
              Address &amp; Subscription Plan
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Area / Sector</label>
                <Input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area"
                  className="h-8 px-2.5 py-1 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Milk Product (From Products)</label>
                <Select
                  value={String(selectedProductId)}
                  onValueChange={(val) => setSelectedProductId(val)}
                >
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {milkProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                        {p.name} (Rs. {Number(p.price) || 0}/{p.unit ? p.unit.replace(/^per\s+/i, '') : 'L'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Daily Qty</label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={subQty}
                  onChange={(e) => setSubQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="h-8 px-2.5 py-1 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Unit</label>
                <Select
                  value={subUnit}
                  onValueChange={(val) => setSubUnit(val)}
                >
                  <SelectTrigger className="h-8 text-xs font-bold">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L" className="text-xs font-semibold">L (Liters)</SelectItem>
                    <SelectItem value="KG" className="text-xs font-semibold">KG (Kilos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Unit Price</label>
                <Input
                  disabled
                  readOnly
                  value={`Rs. ${currentPrice} / ${subUnit}`}
                  className="h-8 px-2 py-1 text-xs bg-slate-100 font-bold text-slate-800 cursor-not-allowed select-none shadow-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Price / Day</label>
                <Input
                  disabled
                  readOnly
                  value={`Rs. ${dailyCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                  className="h-8 px-2 py-1 text-xs bg-slate-100 font-bold text-slate-800 cursor-not-allowed select-none shadow-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Price / Month</label>
                <Input
                  disabled
                  readOnly
                  value={`Rs. ${monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
                  className="h-8 px-2 py-1 text-xs bg-slate-100 font-bold text-slate-800 cursor-not-allowed select-none shadow-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Full Address</label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
                className="h-8 px-2.5 py-1 text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">
              Finance &amp; Status
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Credit Limit (Rs.)</label>
                <Input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="h-8 px-2 py-1 text-xs tabular font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Khata Balance (Rs.)</label>
                <Input
                  type="number"
                  value={formData.khataBalance}
                  onChange={(e) => setFormData({ ...formData, khataBalance: e.target.value })}
                  className="h-8 px-2 py-1 text-xs tabular font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Account Status</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Account Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
            >
              Update Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
