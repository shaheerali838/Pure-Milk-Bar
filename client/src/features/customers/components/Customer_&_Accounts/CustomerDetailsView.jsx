import React from 'react';
import {
  ArrowLeft,
  Phone,
  Smartphone,
  Milk,
  CreditCard,
  MapPin,
  ShieldCheck,
  Edit3,
  Calendar,
  User,
  Activity,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CustomerDetailsView({ customer, onBack, onEdit }) {
  if (!customer) return null;

  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const creditLimit = customer.creditLimit || 10000;
  const khataBalance = customer.khataBalance || 0;
  const khataPercent = Math.min(100, Math.round((khataBalance / creditLimit) * 100));

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs font-display">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display">
                  {customer.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-none ${
                    customer.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {customer.verificationStatus || 'Verified'}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-none ${
                    customer.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {customer.status || 'Active'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {customer.area || 'Model Town'} &bull; ID: #{customer.id || 'CUST-01'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              type="button"
              onClick={() => onEdit(customer)}
              size="sm"
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Customer Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between border-t-3 border-t-emerald-500">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khata Balance</p>
            <p className="text-base font-bold text-slate-900 font-display tabular mt-0.5">
              Rs. {khataBalance.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              of <span className="font-semibold tabular">Rs. {creditLimit.toLocaleString()}</span> limit
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between border-t-3 border-t-blue-500">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Subscription</p>
            <p className="text-base font-bold text-slate-900 font-display mt-0.5">
              {customer.subscription || '2 L Cow Milk'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Mode: <span className="font-semibold text-blue-700">{customer.paymentMode || 'Khata'}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Milk className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between border-t-3 border-t-purple-500">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Phone</p>
            <p className="text-base font-bold text-slate-900 font-mono tabular mt-0.5">
              {customer.phone}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Online: <span className="font-mono">{customer.onlineAccount || customer.phone}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-display text-xs font-bold text-slate-800">
              Identity &amp; Contact Parameters
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Full Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{customer.name}</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Contact</span>
              <p className="font-bold text-slate-900 font-mono mt-0.5 tabular">{customer.phone}</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Secondary Contact</span>
              <p className="font-semibold text-slate-700 font-mono mt-0.5 tabular">{customer.secondaryPhone || 'Not Provided'}</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Online Account / Wallet</span>
              <p className="font-semibold text-slate-700 font-mono mt-0.5 tabular">{customer.onlineAccount || customer.phone}</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CNIC / ID Number</span>
              <p className="font-bold text-slate-900 font-mono mt-0.5 tabular">{customer.cnicNumber || 'Not Registered'}</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Document Type</span>
              <p className="font-bold text-slate-900 mt-0.5">{customer.idType || 'CNIC'}</p>
            </div>

            <div className="col-span-2 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guarantor / Reference Name</span>
              <p className="font-semibold text-slate-700 mt-0.5">{customer.referenceName || 'No Reference Added'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="font-display text-xs font-bold text-slate-800">
              Delivery Location &amp; Khata Limits
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Address</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {customer.address || 'Address not registered'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Area: <span className="font-bold text-slate-700">{customer.area || 'Model Town'}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Khata Credit Limit</span>
                <span className="font-bold tabular">Rs. {creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Outstanding Khata
                </span>
                <span className="text-amber-400 tabular text-base">Rs. {khataBalance.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    khataPercent > 80 ? 'bg-rose-500' : khataPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${khataPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Credit Utilization: {khataPercent}%</span>
                <span>Remaining: Rs. {Math.max(0, creditLimit - khataBalance).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscription Type</span>
                <p className="font-bold text-slate-900 mt-0.5">{customer.subscription || '2 L Cow Milk'}</p>
              </div>

              <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Payment Mode</span>
                <p className="font-bold text-slate-900 mt-0.5">{customer.paymentMode || 'Khata'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
