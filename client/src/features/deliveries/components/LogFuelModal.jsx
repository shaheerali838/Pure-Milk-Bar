import React, { useState, useEffect } from 'react';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
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

export default function LogFuelModal({ isOpen, onClose }) {
  const { staffList = [] } = useDeliveryStaffContext();
  const { addFuelLog } = useFuelLogContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    staffName: '',
    date: todayStr,
    liters: '3.0',
    amount: '840',
    distanceKm: '25',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      const defaultStaff = staffList.length > 0 ? staffList[0].name : '';
      setFormData({
        staffName: defaultStaff,
        date: todayStr,
        liters: '3.0',
        amount: '840',
        distanceKm: '25',
        notes: '',
      });
    }
  }, [isOpen, staffList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.staffName.trim()) {
      setError('Please select a delivery staff member.');
      return;
    }

    if (!formData.liters || Number(formData.liters) <= 0) {
      setError('Please enter a valid fuel quantity in liters.');
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter the fuel amount paid.');
      return;
    }

    addFuelLog({
      staffName: formData.staffName.trim(),
      date: formData.date,
      liters: Number(formData.liters),
      amount: Number(formData.amount),
      distanceKm: Number(formData.distanceKm) || 0,
      notes: formData.notes.trim(),
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-slate-900">
            Log Fuel Receipt
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Record vehicle fuel expenses and distance traveled for delivery staff.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Staff Member */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Staff Member <span className="text-rose-500">*</span>
            </Label>
            {staffList.length === 0 ? (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                No delivery staff registered yet — add a staff member in Fleet & Staff first.
              </div>
            ) : (
              <Select
                value={formData.staffName}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, staffName: val }))
                }
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select delivery staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id} value={s.name} className="text-xs">
                      {s.name} ({s.type === 'RIDER' ? 'Rider' : 'Walking'} · {s.vehicle || s.route || 'Fleet'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Receipt Date</Label>
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

          {/* Liters & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Fuel Liters <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="3.0"
                value={formData.liters}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, liters: e.target.value }))
                }
                className="text-xs tabular"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Amount Paid (Rs.) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="840"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="text-xs tabular"
                required
              />
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Distance Covered (KM)
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 25"
              value={formData.distanceKm}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, distanceKm: e.target.value }))
              }
              className="text-xs tabular"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Notes / Remarks</Label>
            <Input
              type="text"
              placeholder="e.g. Morning route fill-up at PSO pump"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="text-xs"
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
              disabled={staffList.length === 0}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              Log Fuel Receipt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
