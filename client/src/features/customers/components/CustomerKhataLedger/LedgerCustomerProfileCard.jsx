import React from 'react';
import {
  User,
  Phone,
  Smartphone,
  Milk,
  MapPin,
  ShieldCheck,
  CreditCard,
  Edit3,
  Calendar,
  DollarSign,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LedgerCustomerProfileCard({ customer, onEdit }) {
  if (!customer) return null;

  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const creditLimit = Number(customer.creditLimit || 10000);
  const khataBalance = Number(customer.khataBalance || 0);
  const khataPercent = Math.min(100, Math.round((khataBalance / creditLimit) * 100));
  const availableCredit = Math.max(0, creditLimit - khataBalance);

  return (
    <Card className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5 mb-3 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0 font-display">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display truncate">
                {customer.name}
              </h2>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border-none ${
                  customer.verificationStatus === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {customer.verificationStatus || 'Verified'}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full border-none ${
                  customer.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {customer.status || 'Active'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{customer.area || 'Model Town'}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">ID: #{customer.id}</span>
              {customer.cnicNumber && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-500">{customer.idType || 'CNIC'}: {customer.cnicNumber}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {onEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(customer)}
            className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            <Phone className="w-3 h-3 text-blue-500" />
            <span>Contact Information</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Primary Mobile</span>
            <span className="font-bold text-slate-900 font-mono text-xs tabular">{customer.phone || 'Not Provided'}</span>
          </div>
          {customer.secondaryPhone && (
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Secondary Mobile</span>
              <span className="font-semibold text-slate-700 font-mono text-xs tabular">{customer.secondaryPhone}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Online Wallet / Acc</span>
            <span className="font-semibold text-emerald-700 font-mono text-xs tabular">
              {customer.onlineAccount || customer.phone || 'Cash Only'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-rose-500" />
            <span>Delivery &amp; Area</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Delivery Address</span>
            <span className="font-semibold text-slate-800 line-clamp-1" title={customer.address || 'Address not registered'}>
              {customer.address || 'Address not registered'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Sector / Area</span>
              <span className="font-bold text-slate-800">{customer.area || 'Model Town'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Shift</span>
              <span className="font-bold text-blue-700 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {customer.shift || 'Morning'}
              </span>
            </div>
          </div>
          {customer.referenceName && (
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Reference / Guarantor</span>
              <span className="font-semibold text-slate-700">{customer.referenceName}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            <Milk className="w-3 h-3 text-emerald-600" />
            <span>Subscription &amp; Mode</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Active Subscription</span>
            <span className="font-bold text-emerald-800 text-xs">
              {customer.subscription || '2 L Cow Milk'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Payment Mode</span>
            <span className="font-bold text-purple-700">
              {customer.paymentMode || 'Khata'}
            </span>
          </div>
          {customer.createdAt && (
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Registered Since</span>
              <span className="font-semibold text-slate-600 font-mono text-[11px]">{customer.createdAt}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-xl space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <CreditCard className="w-3 h-3" /> Khata Standing
            </span>
            <span className="text-slate-300 font-mono">{khataPercent}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-medium">Due Balance</span>
            <span className="text-sm font-black text-amber-400 font-display tabular">
              Rs. {khataBalance.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                khataPercent > 80 ? 'bg-rose-500' : khataPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${khataPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Limit: Rs. {creditLimit.toLocaleString()}</span>
            <span className="text-emerald-400 font-semibold">Avail: Rs. {availableCredit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
