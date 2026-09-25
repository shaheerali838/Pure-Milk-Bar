import React from 'react';
import {
  Phone,
  MapPin,
  CreditCard,
  Edit3,
  Milk,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LedgerCustomerProfileCard({ customer, onEdit }) {
  if (!customer) return null;

  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const creditLimit = Number(customer.creditLimit || 10000);
  const khataBalance = Number(customer.khataBalance ?? customer.currentBalance ?? 0);
  const khataPercent = Math.min(100, Math.round((khataBalance / creditLimit) * 100));

  return (
    <Card className="bg-white border-slate-200/80 shadow-2xs">
      <CardContent className="p-2.5 sm:px-4 sm:py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 1. Customer Avatar + Name + Status Badges */}
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0 font-display">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-slate-900 tracking-tight font-display truncate">
                  {customer.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-semibold px-1.5 py-0 rounded bg-emerald-50 text-emerald-700 border-emerald-200/80"
                >
                  {customer.verificationStatus || 'Verified'}
                </Badge>
                <span className="font-mono text-[10px] text-slate-400">#{customer.id}</span>
              </div>
            </div>
          </div>

          {/* 2. Inline Key Details: Phone, Area, Plan, Shift */}
          <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
            {/* Phone */}
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 font-mono text-[11px]">
                {customer.phone || 'No phone'}
              </span>
            </div>

            {/* Delivery Area */}
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-700 text-[11px] font-medium max-w-[140px] truncate" title={customer.area || customer.address}>
                {customer.area || customer.address || 'Model Town'}
              </span>
            </div>

            {/* Subscription Plan */}
            <div className="flex items-center gap-1">
              <Milk className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 text-[11px] font-bold">
                {customer.subscription || '2 L Cow Milk'}
              </span>
            </div>

            {/* Shift */}
            <div className="hidden lg:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 text-[11px] capitalize">{customer.shift || 'Morning'}</span>
            </div>
          </div>

          {/* 3. Khata Due Balance & Mini Utilization Strip */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Khata Due
                </div>
                <div
                  className={`text-xs font-bold font-mono ${
                    khataBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  Rs. {khataBalance.toLocaleString()}
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="w-12 space-y-0.5">
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      khataPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${khataPercent}%` }}
                  />
                </div>
                <div className="text-[8px] text-slate-400 font-mono text-center">
                  {khataPercent}%
                </div>
              </div>
            </div>

            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(customer)}
                className="h-7 px-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs gap-1 rounded-md"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
