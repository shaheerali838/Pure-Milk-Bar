import React, { useState, useEffect, useMemo } from 'react';
import { X, ShieldCheck, UserCheck, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
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
import ImageUpload from '@/components/common/ImageUpload';
import { toast } from 'sonner';

const normalizeUnit = (unit) => {
  const value = String(unit || '').toLowerCase();
  if (value.includes('liter') || value === 'l') return 'L';
  if (value.includes('kg') || value.includes('kilo')) return 'KG';
  return null;
};

export default function EditCustomerModal({ customer, isOpen, onClose }) {
  const { updateCustomer } = useCustomerContext();
  const { products = [] } = usePOSContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    deliveryFee: '',
    secondaryPhone: '',
    referenceName: '',
    creditLimit: '10000',
    khataBalance: '0',
    paymentMode: 'Khata',
    status: 'Active',
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
    if (!customer || !isOpen) return;

    setFormData({
      id: customer._id || customer.id || '',
      name: customer.name || '',
      area: customer.area || '',
      phone: customer.phone || '',
      onlineAccount: customer.onlineAccount || customer.phone || '',
      cnicNumber: customer.cnicNumber || '',
      idType: customer.idType || 'CNIC',
      verificationStatus: customer.verificationStatus || 'Verified',
      address: customer.address || '',
      deliveryFee: customer.deliveryFee !== undefined && customer.deliveryFee !== null && customer.deliveryFee !== '' ? String(customer.deliveryFee) : '',
      secondaryPhone: customer.secondaryPhone || '',
      referenceName: customer.referenceName || '',
      creditLimit: customer.creditLimit !== undefined ? String(customer.creditLimit) : '10000',
      khataBalance: customer.khataBalance !== undefined ? String(customer.khataBalance) : '0',
      paymentMode: customer.paymentMode || 'Khata',
      status: customer.status || 'Active',
      image: customer.image || '',
    });

    const rawMorning = customer.morningItems || customer.standingOrder?.morningItems || [];
    const rawEvening = customer.eveningItems || customer.standingOrder?.eveningItems || [];

    const mapItems = (items, fallbackQty = 0) => {
      if (Array.isArray(items) && items.length > 0) {
        return items
          .filter((it) => it && (it.productId || it.name))
          .map((it) => {
            const matchedProduct = availableProducts.find(
              (p) => String(p.id) === String(it.productId) || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase())
            );
            const productId = matchedProduct ? matchedProduct.id : (it.productId || (availableProducts[0]?.id || ''));
            return {
              productId,
              qty: it.qty !== undefined ? String(it.qty) : String(it.quantity || 1),
            };
          });
      }

      if (fallbackQty > 0 && availableProducts.length > 0) {
        return [{ productId: availableProducts[0].id, qty: String(fallbackQty) }];
      }

      return [];
    };

    const morningFallback = Number(customer.morningMilkQty || customer.standingOrder?.morningMilkQty || 0);
    const eveningFallback = Number(customer.eveningMilkQty || customer.standingOrder?.eveningMilkQty || 0);

    setAgreementItems({
      morning: mapItems(rawMorning, morningFallback),
      evening: mapItems(rawEvening, eveningFallback),
    });
  }, [customer, isOpen, availableProducts]);

  if (!isOpen || !customer) return null;

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
      [shift]: current[shift].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeAgreementItem = (shift, index) => {
    setAgreementItems((current) => ({
      ...current,
      [shift]: current[shift].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const serializeAgreementItems = (items) =>
    items
      .map((item) => {
        const product = availableProducts.find((p) => String(p.id) === String(item.productId));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Customer name and primary phone are required.');
      return;
    }

    if (
      (agreementItems.morning.length > 0 && morningItems.length !== agreementItems.morning.length) ||
      (agreementItems.evening.length > 0 && eveningItems.length !== agreementItems.evening.length)
    ) {
      toast.error('Enter a valid quantity for every selected agreement product.');
      return;
    }

    setIsSubmitting(true);
    const morningMilkQty = morningItems.filter((item) => item.unit === 'L').reduce((sum, item) => sum + item.qty, 0);
    const eveningMilkQty = eveningItems.filter((item) => item.unit === 'L').reduce((sum, item) => sum + item.qty, 0);
    const formatShiftItems = (items) => items.map((item) => `${item.qty} ${item.unit} ${item.name}`).join(' + ');
    const formattedSubscription = [
      morningItems.length ? `Morning: ${formatShiftItems(morningItems)}` : '',
      eveningItems.length ? `Evening: ${formatShiftItems(eveningItems)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      await updateCustomer({
        ...customer,
        _id: customer._id || customer.id,
        id: customer._id || customer.id,
        name: formData.name,
        area: formData.area || 'Model Town',
        phone: formData.phone,
        onlineAccount: formData.onlineAccount || formData.phone,
        cnicNumber: formData.cnicNumber || '',
        idType: formData.idType,
        verificationStatus: formData.verificationStatus,
        address: formData.address || '',
        deliveryFee: formData.deliveryFee !== '' ? (Number(formData.deliveryFee) || 0) : null,
        secondaryPhone: formData.secondaryPhone || '',
        referenceName: formData.referenceName || '',
        morningMilkQty,
        eveningMilkQty,
        morningItems,
        eveningItems,
        standingOrder: {
          ...(customer.standingOrder || {}),
          morningMilkQty,
          eveningMilkQty,
          morningItems,
          eveningItems,
          deliveryFee: formData.deliveryFee !== '' ? (Number(formData.deliveryFee) || 0) : null,
        },
        subscription: formattedSubscription || customer.subscription,
        creditLimit: Number(formData.creditLimit) || 10000,
        paymentMode: formData.paymentMode,
        status: formData.status,
        image: formData.image || customer.image || null,
      });

      toast.success(`${formData.name} profile updated successfully.`);
      onClose();
    } catch (err) {
      console.error('Failed to update customer:', err);
      toast.error(err?.message || 'Customer update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-display">Edit Customer Profile</h3>
              <p className="text-[10px] text-slate-400">Update account details and delivery agreements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Section 1: Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
              1. Contact &amp; Identity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-8 px-2.5 text-xs bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Primary Phone *</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="h-8 px-2.5 text-xs bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Online Account</label>
                <Input
                  value={formData.onlineAccount}
                  onChange={(e) => setFormData({ ...formData, onlineAccount: e.target.value })}
                  placeholder="EasyPaisa / JazzCash"
                  className="h-8 px-2.5 text-xs bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Area</label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="h-8 px-2.5 text-xs bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Delivery Fee */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
              2. Address &amp; Delivery
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="h-8 px-2.5 text-xs bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Delivery Fee (Rs.)</label>
                <Input
                  inputMode="numeric"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value.replace(/\D/g, '') })}
                  placeholder="0 (optional)"
                  className="h-8 px-2.5 text-xs bg-slate-50 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Agreements */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
              3. Delivery Agreements
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'morning', title: 'Morning Agreement', tone: 'amber', items: agreementItems.morning },
                { key: 'evening', title: 'Evening Agreement', tone: 'indigo', items: agreementItems.evening },
              ].map(({ key, title, tone, items }) => (
                <div
                  key={key}
                  className={`border rounded-xl p-2.5 space-y-1.5 ${
                    tone === 'amber' ? 'border-amber-200 bg-amber-50/30' : 'border-indigo-200 bg-indigo-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-bold text-slate-800">{title}</h5>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addAgreementItem(key)}
                      disabled={!availableProducts.length}
                      className="h-6 px-1.5 text-[9px]"
                    >
                      <Plus className="w-2.5 h-2.5 mr-0.5" /> Add
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <p className="py-2 text-center text-[10px] text-slate-400">No items</p>
                  ) : (
                    items.map((item, index) => {
                      const product = availableProducts.find((p) => String(p.id) === String(item.productId));
                      return (
                        <div key={`${key}-${index}`} className="flex items-center gap-1.5 bg-white p-1 rounded border border-slate-200">
                          <Select
                            value={String(item.productId)}
                            onValueChange={(val) => updateAgreementItem(key, index, 'productId', val)}
                          >
                            <SelectTrigger className="h-7 text-[10px] flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="any"
                            min="0.1"
                            value={item.qty}
                            onChange={(e) => updateAgreementItem(key, index, 'qty', e.target.value)}
                            className="w-14 h-7 text-center text-[10px] font-bold px-1"
                          />
                          <span className="text-[9px] text-slate-400 font-semibold">{product?.unit || 'L'}</span>
                          <button
                            type="button"
                            onClick={() => removeAgreementItem(key, index)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-1.5 rounded text-center">
                Daily: Rs. {dailyCost.toLocaleString()}
              </div>
              <div className="bg-slate-100 text-slate-800 border border-slate-200 p-1.5 rounded text-center">
                Monthly: Rs. {monthlyCost.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Section 4: Finance & Status */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
              4. Finance &amp; Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Credit Limit</label>
                <Input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="h-8 px-2 text-xs bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Payment Mode</label>
                <Select value={formData.paymentMode} onValueChange={(val) => setFormData({ ...formData, paymentMode: val })}>
                  <SelectTrigger className="h-8 text-xs bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khata" className="text-xs">Khata</SelectItem>
                    <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                    <SelectItem value="Online Payment" className="text-xs">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Status</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-8 text-xs bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active" className="text-xs font-bold text-emerald-700">Active</SelectItem>
                    <SelectItem value="Inactive" className="text-xs text-slate-500">Inactive</SelectItem>
                    <SelectItem value="Suspended" className="text-xs text-rose-600">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-8 px-3 text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
