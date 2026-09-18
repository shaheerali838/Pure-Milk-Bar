import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Calendar, Clock, Bike, Package, AlertCircle } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BookDeliveryView({ onBack, onComplete }) {
  const { rawCustomers = [] } = useCustomerContext();
  const { addDelivery } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultRider = staffList.length > 0 ? staffList[0].name : 'Shahid Rider';
  const defaultRoute =
    staffList.length > 0 && staffList[0].route
      ? staffList[0].route
      : 'Model Town & Faisal Town';
  const defaultStaffType =
    staffList.length > 0 && staffList[0].type === 'WALKING'
      ? 'WALKING_BOY'
      : 'MOTORCYCLE_RIDER';

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    deliveryAddress: '',
    itemDescription: '2 L Cow Milk',
    qtyLiters: '2',
    date: todayStr,
    shift: 'MORNING',
    staffType: defaultStaffType,
    route: defaultRoute,
    riderNameSnapshot: defaultRider,
    paymentMode: 'CASH',
    codAmountToCollect: '240',
    bottlesReturned: '0',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (rawCustomers.length > 0 && !formData.customerId) {
      const firstCust = rawCustomers[0];
      setFormData((prev) => ({
        ...prev,
        customerId: String(firstCust.id),
        customerName: firstCust.name || '',
        deliveryAddress: firstCust.address || firstCust.area || '',
      }));
    }
  }, [rawCustomers, formData.customerId]);

  useEffect(() => {
    if (staffList.length > 0 && (!formData.riderNameSnapshot || formData.riderNameSnapshot === 'Shahid Rider')) {
      const firstStaff = staffList[0];
      setFormData((prev) => ({
        ...prev,
        riderNameSnapshot: firstStaff.name,
        staffType: firstStaff.type === 'WALKING' ? 'WALKING_BOY' : 'MOTORCYCLE_RIDER',
        route: firstStaff.route || prev.route,
      }));
    }
  }, [staffList]);

  const handleCustomerChange = (selectedCustId) => {
    const selected = rawCustomers.find((c) => String(c.id) === String(selectedCustId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        customerId: String(selected.id),
        customerName: selected.name || '',
        deliveryAddress: selected.address || selected.area || '',
      }));
    }
  };

  const handleStaffChange = (staffName) => {
    const selectedStaff = staffList.find((s) => s.name === staffName);
    setFormData((prev) => ({
      ...prev,
      riderNameSnapshot: staffName,
      staffType: selectedStaff?.type === 'WALKING' ? 'WALKING_BOY' : 'MOTORCYCLE_RIDER',
      route: selectedStaff?.route || prev.route,
    }));
  };

  const handlePaymentModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      paymentMode: mode,
      codAmountToCollect:
        mode === 'CASH' || mode === 'ONLINE' ? prev.codAmountToCollect || '0' : '0',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.customerName) {
      setError('Please select a valid registered customer.');
      return;
    }

    if (!formData.deliveryAddress.trim()) {
      setError('Delivery address is required.');
      return;
    }

    if (!formData.qtyLiters || Number(formData.qtyLiters) <= 0) {
      setError('Please enter a valid quantity in liters.');
      return;
    }

    const created = addDelivery({
      ...formData,
      customerId: isNaN(Number(formData.customerId))
        ? formData.customerId
        : Number(formData.customerId),
      qtyLiters: Number(formData.qtyLiters),
      codAmountToCollect:
        formData.paymentMode === 'CASH' || formData.paymentMode === 'ONLINE'
          ? Number(formData.codAmountToCollect) || 0
          : 0,
      bottlesReturned: Number(formData.bottlesReturned) || 0,
    });

    if (onComplete) {
      onComplete(created);
    } else if (onBack) {
      onBack();
    }
  };

  const isCodVisible = formData.paymentMode === 'CASH' || formData.paymentMode === 'ONLINE';

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7.5 w-7.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Deliveries"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none">
              Book New Milk Delivery
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Schedule a daily doorstep milk delivery run for a registered customer
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            1. Customer & Drop Point Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Registered Customer <span className="text-rose-500">*</span>
              </Label>
              {rawCustomers.length === 0 ? (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                  No customers found — please add a customer in Customer Management first.
                </div>
              ) : (
                <Select
                  value={formData.customerId}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawCustomers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                        {c.name} — {c.phone || 'No phone'} · {c.area || c.address || 'Standard Area'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Delivery Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. House 12, Street 4, Block B"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deliveryAddress: e.target.value }))
                }
                className="text-xs h-8"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            2. Milk Item & Quantity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Item Description</Label>
              <Input
                type="text"
                placeholder="e.g. 2 L Cow Milk"
                value={formData.itemDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    itemDescription: e.target.value,
                  }))
                }
                className="text-xs h-8"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Quantity (Liters)</Label>
              <Input
                type="number"
                step="0.5"
                min="0.1"
                placeholder="2"
                value={formData.qtyLiters}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, qtyLiters: e.target.value }))
                }
                className="text-xs tabular h-8"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Empty Bottles Collected</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.bottlesReturned}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bottlesReturned: e.target.value,
                  }))
                }
                className="text-xs tabular h-8"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-purple-600" />
            3. Schedule, Route & Fleet Staff
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Delivery Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="text-xs tabular h-8"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Shift</Label>
              <Select
                value={formData.shift}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, shift: val }))
                }
              >
                <SelectTrigger className="w-full text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING" className="text-xs">Morning Shift</SelectItem>
                  <SelectItem value="EVENING" className="text-xs">Evening Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Staff Assigned</Label>
              {staffList.length > 0 ? (
                <Select
                  value={formData.riderNameSnapshot}
                  onValueChange={handleStaffChange}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.name} className="text-xs">
                        {s.name} ({s.type === 'RIDER' ? 'Rider' : 'Walking'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="text"
                  placeholder="e.g. Shahid Rider"
                  value={formData.riderNameSnapshot}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      riderNameSnapshot: e.target.value,
                    }))
                  }
                  className="text-xs h-8"
                />
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Assigned Route</Label>
              <Input
                type="text"
                placeholder="e.g. Model Town & Faisal Town"
                value={formData.route}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, route: e.target.value }))
                }
                className="text-xs h-8"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            4. Payment Terms & Cash on Delivery
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={handlePaymentModeChange}
              >
                <SelectTrigger className="w-full text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH" className="text-xs">Cash on Delivery (CASH)</SelectItem>
                  <SelectItem value="KHATA" className="text-xs">Customer Khata (KHATA)</SelectItem>
                  <SelectItem value="ONLINE" className="text-xs">Online Payment (ONLINE)</SelectItem>
                  <SelectItem value="PREPAID" className="text-xs">Prepaid Balance (PREPAID)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Cash to Collect (Rs.)
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData.codAmountToCollect}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    codAmountToCollect: e.target.value,
                  }))
                }
                disabled={!isCodVisible}
                className="text-xs tabular h-8"
              />
              {!isCodVisible && (
                <p className="text-[10px] text-slate-400">
                  Not applicable for Khata or Prepaid accounts.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="text-xs h-7.5 px-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={rawCustomers.length === 0}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 h-7.5 px-3.5 cursor-pointer"
          >
            Book New Delivery
          </Button>
        </div>
      </form>
    </div>
  );
}
