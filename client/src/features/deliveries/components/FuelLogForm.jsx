import React from 'react';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FuelLogForm({
  staffList: passedStaffList,
  values = {},
  onChange,
  errors,
  compact = false,
}) {
  const staffContext = useDeliveryStaffContext();
  const staffList = passedStaffList || staffContext?.staffList || [];

  const handleFieldChange = (field, value) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  const showStaffAndDate = !compact || values.staffName !== undefined;

  return (
    <div className={compact ? "space-y-2 text-xs" : "space-y-3 text-xs"}>
      {errors && typeof errors === 'string' && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {errors}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {showStaffAndDate && (
          <>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Staff Member / Rider <span className="text-rose-500">*</span>
              </Label>
              {staffList.length === 0 ? (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
                  No delivery staff registered yet — please add a staff member in Fleet &amp; Staff first.
                </div>
              ) : (
                <Select
                  value={values.staffName || ''}
                  onValueChange={(val) => handleFieldChange('staffName', val)}
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
                value={values.date || ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className="text-xs tabular h-8"
                required={!compact}
              />
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-700">
            Fuel Used (Liters) {!compact && <span className="text-rose-500">*</span>}
          </Label>
          <Input
            type="number"
            step="0.1"
            min="0.1"
            placeholder="3.0"
            value={values.liters || ''}
            onChange={(e) => handleFieldChange('liters', e.target.value)}
            className="text-xs tabular h-8"
            required={!compact}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-700">
            Amount Paid (Rs.) {!compact && <span className="text-rose-500">*</span>}
          </Label>
          <Input
            type="number"
            min="1"
            placeholder="840"
            value={values.amount || ''}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
            className="text-xs tabular h-8"
            required={!compact}
          />
        </div>

        <div className={`space-y-1 ${compact ? '' : 'sm:col-span-2'}`}>
          <Label className="text-xs font-semibold text-slate-700">
            Distance Covered (KM)
          </Label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 25"
            value={values.distanceKm || ''}
            onChange={(e) => handleFieldChange('distanceKm', e.target.value)}
            className="text-xs tabular h-8"
          />
        </div>

        <div className={`space-y-1 ${compact ? '' : 'sm:col-span-2'}`}>
          <Label className="text-xs font-semibold text-slate-700">Notes / Fuel Station Info</Label>
          <Input
            type="text"
            placeholder="e.g. Morning delivery route fill-up at PSO pump"
            value={values.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="text-xs h-8"
          />
        </div>
      </div>
    </div>
  );
}
