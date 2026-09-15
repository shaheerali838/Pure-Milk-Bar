import React, { useState, useEffect } from 'react';
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

export default function RegisterStaffModal({ isOpen, onClose }) {
  const { addStaff } = useDeliveryStaffContext();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'RIDER',
    vehicle: '',
    route: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setFormData({
        name: '',
        phone: '',
        type: 'RIDER',
        vehicle: '',
        route: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Staff member name is required.');
      return;
    }

    addStaff({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      type: formData.type,
      vehicle: formData.type === 'RIDER' ? formData.vehicle.trim() : '',
      route: formData.route.trim(),
      active: true,
    });

    onClose();
  };

  const isRider = formData.type === 'RIDER';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-slate-900">
            Register New Delivery Staff
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Add a new delivery rider or walking delivery boy to your farm fleet.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Name */}
          <div className="space-y-1.5">
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
              className="text-xs"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
            <Input
              type="text"
              placeholder="e.g. 0304-9988771"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="text-xs tabular"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Delivery Role / Type</Label>
            <Select
              value={formData.type}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, type: val }))
              }
            >
              <SelectTrigger className="w-full text-xs">
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

          {/* Vehicle (shown for Rider) */}
          {isRider && (
            <div className="space-y-1.5">
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
                className="text-xs"
              />
            </div>
          )}

          {/* Primary Route */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Assigned Route / Area</Label>
            <Input
              type="text"
              placeholder="e.g. Route 1: Model Town & Faisal Town"
              value={formData.route}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, route: e.target.value }))
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
              className="text-xs bg-purple-600 hover:bg-purple-700"
            >
              Register New Delivery Staff
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
