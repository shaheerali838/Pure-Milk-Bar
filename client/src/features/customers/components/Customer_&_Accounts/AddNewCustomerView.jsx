import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ShieldCheck, UserPlus, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
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
import ImageUpload from '@/components/common/ImageUpload';
import { toast } from 'sonner';

const normalizeUnit = (unit) => {
  const value = String(unit || '').toLowerCase();
  if (value.includes('liter') || value === 'l') return 'L';
  if (value.includes('kg') || value.includes('kilo')) return 'KG';
  return null;
};

export default function AddNewCustomerView({ onBack }) {
  const { addCustomer } = useCustomerContext();
  const { products = [] } = usePOSContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    phone: '',
    onlineAccount: '',
    cnicNumber: '',
    idType: 'CNIC',
    verificationStatus: 'Verified',
    address: '',
    deliveryFee: '',
    secondaryPhone: '',
    referenceName: '',
    creditLimit: '10000',
    openingBalance: '',
    openingPaymentMethod: 'CASH_ADVANCE',
    paymentMode: 'Khata',
    image: '',
  });

  const availableProducts = useMemo(() => {
    return (products || [])
      .filter((p) => p?.id || p?._id || p?.sku)
      .map((p) => ({
        id: String(p.id || p._id || p.sku),
        name: p.name || 'Unnamed product',
        price: Number(p.price !== undefined ? p.price : (p.sellingPrice || 0)),
        unit: normalizeUnit(p.unit),
        category: p.category || 'General',
      }))
      .filter((p) => {
        const productText = `${p.name} ${p.category}`.toLowerCase();
        return p.unit && (productText.includes('milk') || productText.includes('dahi'));
      });
  }, [products]);

  const [agreementItems, setAgreementItems] = useState({ morning: [], evening: [] });

  useEffect(() => {
    setAgreementItems((current) => ({
      morning: current.morning.filter((item) => availableProducts.some((p) => p.id === item.productId)),
      evening: current.evening.filter((item) => availableProducts.some((p) => p.id === item.productId)),
    }));
  }, [availableProducts]);

  const addAgreementItem = (shift) => {
    if (!availableProducts.length) return;
    setAgreementItems((current) => ({
      ...current,
      [shift]: [...current[shift], { productId: availableProducts[0].id, qty: '' }],
    }));
  };

  const updateAgreementItem = (shift, index, field, value) => {
    setAgreementItems((current) => ({
      ...current,
      [shift]: current[shift].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeAgreementItem = (shift, index) => {
    setAgreementItems((current) => ({
      ...current,
      [shift]: current[shift].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const serializeAgreementItems = (items) => items
    .map((item) => {
      const product = availableProducts.find((p) => p.id === item.productId);
      const qty = Number(item.qty) || 0;
      return product && qty > 0
        ? { productId: product.id, name: product.name, qty, unit: product.unit, unitPrice: product.price }
        : null;
    })
    .filter(Boolean);

  const morningItems = serializeAgreementItems(agreementItems.morning);
  const eveningItems = serializeAgreementItems(agreementItems.evening);
  const morningTotal = morningItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const eveningTotal = eveningItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const dailyCost = morningTotal + eveningTotal;
  const monthlyCost = dailyCost * 30;

  // Kept only while the previous single-product markup remains hidden below.
  const selectedProductId = '';
  const selectedProduct = null;
  const currentPrice = 0;
  const morningQty = '';
  const eveningQty = '';
  const subUnit = 'L';
  const totalDailyQty = 0;
  const handleProductChange = () => {};
  const setMorningQty = () => {};
  const setEveningQty = () => {};
  const setSubUnit = () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Customer name and primary phone are required.');
      return;
    }
    if (agreementItems.morning.length > 0 && morningItems.length !== agreementItems.morning.length || agreementItems.evening.length > 0 && eveningItems.length !== agreementItems.evening.length) {
      toast.error('Enter a valid quantity for every selected agreement product.');
      return;
    }
    if (morningItems.length === 0 && eveningItems.length === 0) {
      toast.error('Add at least one Milk or Dahi agreement item.');
      return;
    }

    setIsSubmitting(true);
    const morningMilkQty = morningItems.filter((item) => item.unit === 'L').reduce((sum, item) => sum + item.qty, 0);
    const eveningMilkQty = eveningItems.filter((item) => item.unit === 'L').reduce((sum, item) => sum + item.qty, 0);
    const formatShiftItems = (items) => items.map((item) => `${item.qty} ${item.unit} ${item.name}`).join(' + ');
    const formattedSubscription = [
      morningItems.length ? `Morning: ${formatShiftItems(morningItems)}` : '',
      eveningItems.length ? `Evening: ${formatShiftItems(eveningItems)}` : '',
    ].filter(Boolean).join(' | ');

    try {
      await addCustomer({
        name: formData.name,
        area: formData.area || 'Model Town',
        phone: formData.phone,
        onlineAccount: formData.onlineAccount || formData.phone,
        cnicNumber: formData.cnicNumber || '',
        idType: formData.idType,
        verificationStatus: formData.verificationStatus,
        address: formData.address || '',
        deliveryFee: formData.deliveryFee !== '' ? (Number(formData.deliveryFee) || 0) : 0,
        secondaryPhone: formData.secondaryPhone || '',
        referenceName: formData.referenceName || '',
        morningMilkQty,
        eveningMilkQty,
        morningItems,
        eveningItems,
        standingOrder: {
          morningMilkQty,
          eveningMilkQty,
          morningItems,
          eveningItems,
        },
        subscription: formattedSubscription,
        creditLimit: Number(formData.creditLimit) || 10000,
        openingBalance: Number(formData.openingBalance) || 0,
        openingPaymentMethod: formData.openingPaymentMethod || 'CASH',
        paymentMode: formData.paymentMode,
        status: 'Active',
        image: formData.image || null,
      });

      toast.success(`${formData.name} has been added successfully.`);
      onBack();
    } catch (err) {
      console.error('Failed to add customer:', err);
      toast.error(err?.message || 'Customer could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-0">
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

      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
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
                  placeholder="Enter name"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Primary Phone <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="03001111111"
                  maxLength={15}
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
                  type="tel"
                  inputMode="numeric"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="03002222222"
                  maxLength={15}
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
                  CNIC No. <span className="text-slate-400 font-normal">(Optional - Digits Only)</span>
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formData.cnicNumber}
                  onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="3520112345671"
                  maxLength={15}
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
                  placeholder="Enter reference"
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

            <div className="hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Area / Sector
                </label>
                <Input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area"
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
                  placeholder="Enter address"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Doorstep Delivery Charges (Rs.) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value.replace(/\D/g, '') })}
                  placeholder="0 (Optional - Free if empty)"
                  className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-bold tabular"
                />
                <span className="text-[9px] text-slate-400 block mt-1">
                  Optional: only added to delivery orders if specified
                </span>
              </div>

              <div className="hidden">
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Product (From Catalog)
                </label>
                <Select
                  value={String(selectedProductId)}
                  onValueChange={(val) => handleProductChange(val)}
                  disabled={!availableProducts.length}
                >
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-medium">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                        {p.name} (Rs. {Number(p.price) || 0} / {p.unit || 'L'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!availableProducts.length && (
                  <span className="text-[9px] text-amber-700 block mt-1">
                    Add a product in Products first.
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  🌅 Morning Shift Requirement
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={morningQty}
                  onChange={(e) => setMorningQty(e.target.value)}
                  placeholder="Morning Qty"
                  className="h-8.5 px-2.5 py-1 text-xs bg-amber-50/40 border-amber-200 rounded-lg focus-visible:bg-white font-bold text-amber-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  🌙 Evening Shift Requirement
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={eveningQty}
                  onChange={(e) => setEveningQty(e.target.value)}
                  placeholder="Evening Qty"
                  className="h-8.5 px-2.5 py-1 text-xs bg-indigo-50/40 border-indigo-200 rounded-lg focus-visible:bg-white font-bold text-indigo-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Unit
                </label>
                <Select
                  value={subUnit || selectedProduct?.unit || 'Piece'}
                  onValueChange={(val) => setSubUnit(val)}
                >
                  <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-bold">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L" className="text-xs font-semibold">L (Liters)</SelectItem>
                    <SelectItem value="KG" className="text-xs font-semibold">KG (Kilos)</SelectItem>
                    <SelectItem value="Pack" className="text-xs font-semibold">Pack</SelectItem>
                    <SelectItem value="Pcs" className="text-xs font-semibold">Pcs</SelectItem>
                    <SelectItem value="Piece" className="text-xs font-semibold">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Total Daily Agreement Qty
                </label>
                <Input
                  disabled
                  readOnly
                  value={`${totalDailyQty} ${subUnit} / day`}
                  className="h-8.5 px-2.5 py-1 text-xs bg-emerald-50/50 border-emerald-200 rounded-lg font-bold text-emerald-800 cursor-not-allowed select-none shadow-none"
                />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Area / Sector</label>
                <Input value={formData.area} onChange={(event) => setFormData({ ...formData, area: event.target.value })} placeholder="Enter area" className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Street / House Address</label>
                <Input value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} placeholder="Enter address" className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Doorstep Delivery Charges (Rs.)</label>
                <Input inputMode="numeric" value={formData.deliveryFee} onChange={(event) => setFormData({ ...formData, deliveryFee: event.target.value.replace(/\D/g, '') })} placeholder="0 (optional)" className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg font-bold tabular" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[
                { key: 'morning', title: 'Morning Agreement', tone: 'amber', items: agreementItems.morning },
                { key: 'evening', title: 'Evening Agreement', tone: 'indigo', items: agreementItems.evening },
              ].map(({ key, title, tone, items }) => (
                <div key={key} className={`border rounded-xl p-3 space-y-2 ${tone === 'amber' ? 'border-amber-200 bg-amber-50/30' : 'border-indigo-200 bg-indigo-50/30'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{title}</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addAgreementItem(key)}
                      disabled={!availableProducts.length}
                      className="h-7 px-2 text-[10px]"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add item
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <p className="py-3 text-center text-[11px] text-slate-500">No {key} delivery agreed.</p>
                  ) : items.map((item, index) => {
                    const product = availableProducts.find((p) => p.id === item.productId);
                    return (
                      <div key={`${key}-${index}`} className="grid grid-cols-[minmax(0,1fr)_76px_42px] gap-2 items-end">
                        <div>
                          <label className="block mb-1 text-[10px] font-semibold text-slate-600">Milk or Dahi</label>
                          <Select value={item.productId} onValueChange={(value) => updateAgreementItem(key, index, 'productId', value)}>
                            <SelectTrigger className="h-8.5 bg-white text-xs">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((productOption) => (
                                <SelectItem key={productOption.id} value={productOption.id} className="text-xs">
                                  {productOption.name} (Rs. {productOption.price}/{productOption.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] font-semibold text-slate-600">Qty {product?.unit || ''}</label>
                          <Input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.qty}
                            onChange={(event) => updateAgreementItem(key, index, 'qty', event.target.value)}
                            className="h-8.5 bg-white px-2 text-center text-xs font-bold"
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeAgreementItem(key, index)}
                          className="h-8.5 w-8.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input disabled readOnly value={`Morning: Rs. ${morningTotal.toLocaleString()}`} className="h-8.5 bg-amber-50 border-amber-200 text-xs font-bold text-amber-900" />
              <Input disabled readOnly value={`Evening: Rs. ${eveningTotal.toLocaleString()}`} className="h-8.5 bg-indigo-50 border-indigo-200 text-xs font-bold text-indigo-900" />
              <Input disabled readOnly value={`Daily agreement: Rs. ${dailyCost.toLocaleString()}`} className="h-8.5 bg-emerald-50 border-emerald-200 text-xs font-bold text-emerald-800" />
              <Input disabled readOnly value={`Monthly estimate: Rs. ${monthlyCost.toLocaleString()}`} className="h-8.5 bg-slate-100 border-slate-200 text-xs font-bold text-slate-800" />
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
                  placeholder="Enter credit limit"
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

            {/* Optional Opening Balance & Payment Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Opening Balance (PKR) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  placeholder="0 (Optional - default is 0)"
                  className="h-8.5 px-2.5 py-1 text-xs bg-white border-slate-200 rounded-lg focus-visible:bg-white font-bold tabular"
                />
                <span className="text-[9px] text-slate-400 block mt-1">
                  Initial opening balance or advance (leave 0 if none).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Opening Payment Channel
                </label>
                <Select
                  value={formData.openingPaymentMethod}
                  onValueChange={(val) => setFormData({ ...formData, openingPaymentMethod: val })}
                  disabled={!formData.openingBalance || Number(formData.openingBalance) <= 0}
                >
                  <SelectTrigger className="h-8.5 bg-white border-slate-200 rounded-lg text-xs font-medium">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH_ADVANCE" className="text-xs">💵 Advance Cash Deposit (Paid in advance)</SelectItem>
                    <SelectItem value="ONLINE_ADVANCE" className="text-xs">📱 Advance Online Deposit (Paid in advance)</SelectItem>
                    <SelectItem value="KHATA_DEBIT" className="text-xs">📋 Previous Khata Dues (Customer owes shop)</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[9px] text-slate-400 block mt-1">
                  Choose advance deposit or previous dues.
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <ImageUpload
              label="Customer Photograph / Passbook Photo"
              value={formData.image}
              onChange={(img) => setFormData((prev) => ({ ...prev, image: img }))}
              helpText="Upload customer image for passbook & POS customer profile"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="px-6 py-1.5 h-8 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Customer Record...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Customer Record
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
