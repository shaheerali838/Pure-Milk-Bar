import React, { useState, useMemo } from 'react';
import { ArrowLeft, ShieldCheck, UserPlus, CheckCircle2 } from 'lucide-react';
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
import { Card } from '@/components/ui/card';

export default function AddNewCustomerView({ onBack }) {
  const { addCustomer } = useCustomerContext();
  const { products = [] } = usePOSContext();

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

  const [selectedProductId, setSelectedProductId] = useState(() => {
    return milkProducts[0]?.id || 'cow-milk';
  });

  const selectedProduct = milkProducts.find((p) => String(p.id) === String(selectedProductId)) || milkProducts[0];
  const currentPrice = Number(selectedProduct?.price) || 240;

  const [subQty, setSubQty] = useState('2');
  const [subUnit, setSubUnit] = useState('L');

  const numQty = parseFloat(subQty) || 0;
  const dailyCost = numQty * currentPrice;
  const monthlyCost = dailyCost * 30;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const formattedSubscription = `${subQty} ${subUnit} ${selectedProduct?.name || 'Cow Milk'}`.trim();

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
      subscription: formattedSubscription,
      creditLimit: Number(formData.creditLimit) || 10000,
      khataBalance: 0,
      paymentMode: formData.paymentMode,
      status: 'Active',
    });

    onBack();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-emerald-600" />
            Register New Customer Account
          </h1>
        </div>
      </div>

      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px]">
                1
              </span>
              <h3 className="font-display text-xs font-bold text-slate-800">
                Primary Contact &amp; Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ali Hassan"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Primary Phone <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1234567"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Online Wallet / Bank <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <Input
                  type="text"
                  value={formData.onlineAccount}
                  onChange={(e) => setFormData({ ...formData, onlineAccount: e.target.value })}
                  placeholder="EasyPaisa / JazzCash"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Secondary Phone <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <Input
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  placeholder="0321-7654321"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                2
              </span>
              <h3 className="font-display text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verification &amp; Security
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Document Type
                </label>
                <Select value={formData.idType} onValueChange={(val) => setFormData({ ...formData, idType: val })}>
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-medium">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNIC" className="text-xs">CNIC (Smart Card)</SelectItem>
                    <SelectItem value="Utility Bill" className="text-xs">Utility Bill</SelectItem>
                    <SelectItem value="Driving License" className="text-xs">Driving License</SelectItem>
                    <SelectItem value="Passport" className="text-xs">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  CNIC No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                  placeholder="35202-1234567-1"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Verification Status
                </label>
                <Select value={formData.verificationStatus} onValueChange={(val) => setFormData({ ...formData, verificationStatus: val })}>
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-medium">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verified" className="text-xs">Verified</SelectItem>
                    <SelectItem value="Pending Verification" className="text-xs">Pending Verification</SelectItem>
                    <SelectItem value="Unverified" className="text-xs">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Guarantor / Ref <span className="text-slate-400 font-normal">(Opt)</span>
                </label>
                <Input
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
                  placeholder="Reference person name"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-[11px]">
                3
              </span>
              <h3 className="font-display text-xs font-bold text-slate-800">
                Delivery Location &amp; Subscription Plan
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Area / Sector
                </label>
                <Input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Model Town"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Street / House Address
                </label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House #45, Block C"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Milk Product (From Products)
                </label>
                <Select
                  value={String(selectedProductId)}
                  onValueChange={(val) => setSelectedProductId(val)}
                >
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-medium">
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Daily Subscription Qty
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={subQty}
                  onChange={(e) => setSubQty(e.target.value)}
                  placeholder="e.g. 2, 3, 5.3"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Unit
                </label>
                <Select
                  value={subUnit}
                  onValueChange={(val) => setSubUnit(val)}
                >
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-bold">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L" className="text-xs font-semibold">L (Liters)</SelectItem>
                    <SelectItem value="KG" className="text-xs font-semibold">KG (Kilos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Unit Price
                </label>
                <Input
                  disabled
                  readOnly
                  value={`Rs. ${currentPrice} / ${subUnit}`}
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-100/90 border-slate-200 rounded-lg font-bold text-slate-800 cursor-not-allowed select-none shadow-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Price Per Day
                </label>
                <Input
                  disabled
                  readOnly
                  value={`Rs. ${dailyCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / day`}
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-100/90 border-slate-200 rounded-lg font-bold text-slate-800 cursor-not-allowed select-none shadow-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Price Per Month (30 Days)
                </label>
                <Input
                  disabled
                  readOnly
                  value={`Rs. ${monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / month`}
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-100/90 border-slate-200 rounded-lg font-bold text-slate-800 cursor-not-allowed select-none shadow-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[11px]">
                4
              </span>
              <h3 className="font-display text-xs font-bold text-slate-800">
                Finance &amp; Khata Limits
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Credit Limit (PKR)
                </label>
                <Input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="10000"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-bold tabular"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Default Payment Mode
                </label>
                <Select value={formData.paymentMode} onValueChange={(val) => setFormData({ ...formData, paymentMode: val })}>
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-medium">
                    <SelectValue placeholder="Select Payment Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khata" className="text-xs">Khata (Monthly Credit Ledger)</SelectItem>
                    <SelectItem value="Online Payment" className="text-xs">Online Payment</SelectItem>
                    <SelectItem value="Cash on Delivery" className="text-xs">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="px-4 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-6 py-1.5 h-8 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Customer Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
