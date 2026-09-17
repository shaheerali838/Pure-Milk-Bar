import React from 'react';
import { Building2, Phone, MapPin, Globe, CreditCard, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/common/Typography';

export default function BusinessInfoTab({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 font-display">
                Business & Entity Details
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Primary dairy enterprise information displayed on customer bills, receipts, and reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">
                Business Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="e.g. Pure Milk Bar & Dairy Farm"
                value={data.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Owner / Proprietor Name</Label>
              <Input
                type="text"
                placeholder="e.g. Haji Muhammad Aslam"
                value={data.ownerName || ''}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Official Phone Number</Label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={data.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-9 h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">Farm / Shop Address Line 1</Label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="e.g. Plot 14-B, Dairy Complex, Bedian Road"
                  value={data.address1 || ''}
                  onChange={(e) => handleChange('address1', e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">City</Label>
              <Input
                type="text"
                placeholder="e.g. Lahore"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* NTN / Tax ID */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">NTN / Registration Number (Optional)</Label>
              <div className="relative">
                <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="e.g. 7812903-4"
                  value={data.ntn || ''}
                  onChange={(e) => handleChange('ntn', e.target.value)}
                  className="pl-9 h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Default Currency</Label>
              <Select
                value={data.defaultCurrency || 'PKR'}
                onValueChange={(val) => handleChange('defaultCurrency', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">Pakistani Rupee (PKR - Rs.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Zone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Time Zone</Label>
              <Select
                value={data.timeZone || 'Asia/Karachi'}
                onValueChange={(val) => handleChange('timeZone', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Time Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
