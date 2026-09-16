import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { AlertCircle } from 'lucide-react';

export default function AddDeliveryModal({ isOpen, onClose }) {
  const { rawCustomers = [] } = useCustomerContext();
  const { addDelivery } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    deliveryAddress: '',
    itemDescription: '2 L Cow Milk',
    qtyLiters: '2',
    date: todayStr,
    shift: 'MORNING',
    staffType: 'MOTORCYCLE_RIDER',
    route: 'Model Town & Faisal Town',
    riderNameSnapshot: 'Shahid Rider',
    paymentMode: 'CASH',
    codAmountToCollect: '240',
    bottlesReturned: '0',
  });

  const [error, setError] = useState('');

  // Reset and prefill form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError('');
      const defaultRider = staffList.length > 0 ? staffList[0].name : 'Shahid Rider';
      const defaultRoute = staffList.length > 0 && staffList[0].route ? staffList[0].route : 'Model Town & Faisal Town';
      const defaultStaffType = staffList.length > 0 && staffList[0].type === 'WALKING' ? 'WALKING_BOY' : 'MOTORCYCLE_RIDER';

      if (rawCustomers.length > 0) {
        const firstCust = rawCustomers[0];
        setFormData({
          customerId: String(firstCust.id),
          customerName: firstCust.name || '',
          deliveryAddress: firstCust.address || firstCust.area || '',
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
      } else {
        setFormData({
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
          codAmountToCollect: '0',
          bottlesReturned: '0',
        });
      }
    }
  }, [isOpen, rawCustomers, staffList]);

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
      codAmountToCollect: mode === 'CASH' || mode === 'ONLINE' ? prev.codAmountToCollect || '0' : '0',
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

    addDelivery({
      ...formData,
      customerId: isNaN(Number(formData.customerId)) ? formData.customerId : Number(formData.customerId),
      qtyLiters: Number(formData.qtyLiters),
      codAmountToCollect:
        formData.paymentMode === 'CASH' || formData.paymentMode === 'ONLINE'
          ? Number(formData.codAmountToCollect) || 0
          : 0,
      bottlesReturned: Number(formData.bottlesReturned) || 0,
    });

    onClose();
  };

  const isCodVisible = formData.paymentMode === 'CASH' || formData.paymentMode === 'ONLINE';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-slate-900">
            Book New Delivery
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Schedule a daily milk delivery run linked to a registered customer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Customer <span className="text-rose-500">*</span>
            </Label>
            {rawCustomers.length === 0 ? (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                No customers found — please add a customer in Customer Management first.
              </div>
            ) : (
              <Select
                value={formData.customerId}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger className="w-full text-xs">
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

          <div className="space-y-1.5">
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
              className="text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Delivery Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="text-xs tabular"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Shift</Label>
              <Select
                value={formData.shift}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, shift: val }))
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING" className="text-xs">Morning Shift</SelectItem>
                  <SelectItem value="EVENING" className="text-xs">Evening Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Delivery Staff Role</Label>
              <Select
                value={formData.staffType}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, staffType: val }))
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOTORCYCLE_RIDER" className="text-xs">Delivery Rider</SelectItem>
                  <SelectItem value="WALKING_BOY" className="text-xs">Walking Delivery Man</SelectItem>
                  <SelectItem value="VAN_DRIVER" className="text-xs">Van Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Assigned Route</Label>
              <Input
                type="text"
                placeholder="e.g. Model Town & Faisal Town"
                value={formData.route}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, route: e.target.value }))
                }
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Delivery Staff Name</Label>
              {staffList.length > 0 ? (
                <Select
                  value={formData.riderNameSnapshot}
                  onValueChange={handleStaffChange}
                >
                  <SelectTrigger className="w-full text-xs">
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
                  className="text-xs"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
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
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
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
                className="text-xs tabular"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={handlePaymentModeChange}
              >
                <SelectTrigger className="w-full text-xs">
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

            <div className="space-y-1.5">
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
                className="text-xs tabular"
              />
              {!isCodVisible && (
                <p className="text-[10px] text-slate-400">
                  Not applicable for Khata or Prepaid deliveries.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
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
              className="text-xs tabular"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={rawCustomers.length === 0}
              className="text-xs"
            >
              Book New Delivery
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
