import React, { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
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

export default function LogFuelView({ onBack, onComplete }) {
  const { staffList = [] } = useDeliveryStaffContext();
  const { addFuelLog } = useFuelLogContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const defaultStaff = staffList.length > 0 ? staffList[0].name : '';

  const [formData, setFormData] = useState({
    staffName: defaultStaff,
    date: todayStr,
    liters: '3.0',
    amount: '840',
    distanceKm: '25',
    notes: '',
  });

  const [error, setError] = useState('');

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

    const created = addFuelLog({
      staffName: formData.staffName.trim(),
      date: formData.date,
      liters: Number(formData.liters),
      amount: Number(formData.amount),
      distanceKm: Number(formData.distanceKm) || 0,
      notes: formData.notes.trim(),
    });

    if (onComplete) {
      onComplete(created);
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150 pb-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-7.5 w-7.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          title="Back to Fuel Logs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none">
            Log Vehicle Fuel Receipt
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Record vehicle fuel purchases and kilometer readings for your delivery team
          </p>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-3 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">
              Staff Member / Rider <span className="text-rose-500">*</span>
            </Label>
            {staffList.length === 0 ? (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                No delivery staff registered yet — please add a staff member in Fleet & Staff first.
              </div>
            ) : (
              <Select
                value={formData.staffName}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, staffName: val }))
                }
              >
                <SelectTrigger className="w-full text-xs h-8">
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

          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">Receipt Date</Label>
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
              className="text-xs tabular h-8"
              required
            />
          </div>

          <div className="space-y-1">
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
              className="text-xs tabular h-8"
              required
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">
              Distance Covered (KM)
            </Label>
            <Input
              type="number"
              min="0"
              placeholder="Enter value"
              value={formData.distanceKm}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, distanceKm: e.target.value }))
              }
              className="text-xs tabular h-8"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">Notes / Fuel Station Info</Label>
            <Input
              type="text"
              placeholder="Enter details"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="text-xs h-8"
            />
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
            disabled={staffList.length === 0}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white h-7.5 px-3.5 cursor-pointer"
          >
            Log Fuel Receipt
          </Button>
        </div>
      </form>
    </div>
  );
}
