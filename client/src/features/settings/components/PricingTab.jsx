import React from 'react';
import { Banknote, ShieldAlert, Calendar, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/common/Typography';

export default function PricingTab({ data = {}, onChange }) {
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
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 font-display">
                Baseline Pricing &amp; Customer Credit Rules
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure default retail rates for bulk milk and automatic credit risk thresholds
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cow Milk Rate */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Default Cow Milk Rate (Rs. / liter or kg) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  Rs.
                </span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 180"
                  value={data.defaultCowMilkRate !== undefined && data.defaultCowMilkRate !== null ? data.defaultCowMilkRate : ''}
                  onChange={(e) => handleChange('defaultCowMilkRate', e.target.value === '' ? '' : Number(e.target.value))}
                  className="pl-10 h-9 text-xs font-mono font-bold text-slate-800"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400">Syncs automatically to Cow Milk products in POS on Save</p>
            </div>

            {/* Buffalo Milk Rate */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Default Buffalo Milk Rate (Rs. / liter or kg) <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  Rs.
                </span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 220"
                  value={data.defaultBuffaloMilkRate !== undefined && data.defaultBuffaloMilkRate !== null ? data.defaultBuffaloMilkRate : ''}
                  onChange={(e) => handleChange('defaultBuffaloMilkRate', e.target.value === '' ? '' : Number(e.target.value))}
                  className="pl-10 h-9 text-xs font-mono font-bold text-slate-800"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400">Syncs automatically to Buffalo Milk products in POS on Save</p>
            </div>

            {/* Maximum Customer Credit Limit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Maximum Customer Credit Limit (Rs.)</Label>
              <div className="relative">
                <Wallet className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 10000"
                  value={data.maxCustomerCreditLimit !== undefined && data.maxCustomerCreditLimit !== null ? data.maxCustomerCreditLimit : ''}
                  onChange={(e) => handleChange('maxCustomerCreditLimit', e.target.value === '' ? '' : Number(e.target.value))}
                  className="pl-9 h-9 text-xs font-mono text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400">Default credit ceiling for new khata account registrations</p>
            </div>

            {/* Payment Grace Period */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Khata Payment Grace Period (Days)</Label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 30"
                  value={data.paymentGracePeriod !== undefined && data.paymentGracePeriod !== null ? data.paymentGracePeriod : ''}
                  onChange={(e) => handleChange('paymentGracePeriod', e.target.value === '' ? '' : Number(e.target.value))}
                  className="pl-9 h-9 text-xs font-mono text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400">Allowed overdue days before customer aging alert is flagged</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
