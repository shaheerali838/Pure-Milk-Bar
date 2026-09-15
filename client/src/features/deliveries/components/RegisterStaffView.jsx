import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Bike, MapPin, AlertCircle } from 'lucide-react';
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

export default function RegisterStaffView({ onBack, onComplete }) {
  const { addStaff } = useDeliveryStaffContext();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'RIDER',
    vehicle: '',
    route: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Staff member name is required.');
      return;
    }

    const created = addStaff({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      type: formData.type,
      vehicle: formData.type === 'RIDER' ? formData.vehicle.trim() : '',
      route: formData.route.trim(),
      active: true,
    });

    if (onComplete) {
      onComplete(created);
    } else if (onBack) {
      onBack();
    }
  };

  const isRider = formData.type === 'RIDER';

  return (
    <div className="space-y-2.5 animate-in fade-in duration-150 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-7.5 w-7.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          title="Back to Fleet & Staff"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none">
            Register New Delivery Staff
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Add a new delivery rider or walking delivery boy to your farm delivery team
          </p>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-3 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Name */}
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">
              Staff Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g. Shahid Rider"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="text-xs h-8"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
            <Input
              type="text"
              placeholder="e.g. 0304-9988771"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="text-xs tabular h-8"
            />
          </div>

          {/* Role / Type */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Delivery Role</Label>
            <Select
              value={formData.type}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, type: val }))
              }
            >
              <SelectTrigger className="w-full text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RIDER" className="text-xs">
                  Delivery Rider (Motorcycle / Van)
                </SelectItem>
                <SelectItem value="WALKING" className="text-xs">
                  Walking Delivery Man (Foot / Cart)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle (for Rider) */}
          {isRider && (
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Vehicle & Registration Number
              </Label>
              <Input
                type="text"
                placeholder="e.g. Honda CD 70 (LER-4521)"
                value={formData.vehicle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vehicle: e.target.value }))
                }
                className="text-xs h-8"
              />
            </div>
          )}

          {/* Route */}
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700">Assigned Route / Delivery Area</Label>
            <Input
              type="text"
              placeholder="e.g. Route 1: Model Town & Faisal Town"
              value={formData.route}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, route: e.target.value }))
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
            className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white h-7.5 px-3.5 cursor-pointer"
          >
            Register New Delivery Staff
          </Button>
        </div>
      </form>
    </div>
  );
}
