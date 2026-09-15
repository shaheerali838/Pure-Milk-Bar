import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Milk, ArrowRight, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ReceivablesAgingDetailView({ customer, buckets, onBack, onRecordPayment }) {
  const navigate = useNavigate();

  if (!customer) return null;

  const total = Number(customer.khataBalance || 0);

  const b0_30 = buckets?.d0_30 || 0;
  const b31_60 = buckets?.d31_60 || 0;
  const b61_90 = buckets?.d61_90 || 0;
  const b90plus = buckets?.d90plus || 0;

  let riskLabel = 'Low Risk (0-30 Days)';
  let riskBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';

  if (b90plus > 0) {
    riskLabel = 'Critical Risk (90+ Days Overdue)';
    riskBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/30';
  } else if (b61_90 > 0) {
    riskLabel = 'High Risk (61-90 Days Overdue)';
    riskBadgeColor = 'bg-orange-500/20 text-orange-300 border-orange-400/30';
  } else if (b31_60 > 0) {
    riskLabel = 'Moderate Risk (31-60 Days Overdue)';
    riskBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  }

  const recommendation =
    b90plus > 0
      ? 'Send final WhatsApp reminder, freeze credit, and assign direct field recovery agent.'
      : b61_90 > 0
      ? 'Send urgent payment notice and restrict new high-volume orders.'
      : b31_60 > 0
      ? 'Send scheduled billing reminder for monthly billing cycle.'
      : 'Regular monthly billing reminder on WhatsApp/SMS.';

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      {/* Header */}
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
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
              Receivable Aging Breakdown &bull; {customer.name}
            </h1>
            <p className="text-xs text-slate-500">
              Customer Phone: <span className="font-mono">{customer.phone}</span> &bull; Total Khata Due: <strong className="font-mono text-slate-800 tabular">Rs. {total.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRecordPayment && (
            <Button
              type="button"
              onClick={() => onRecordPayment(customer)}
              size="sm"
              className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Collect Payment
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/customer-khata-ledger')}
            className="h-8 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>Open Full Khata Ledger</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Dark Total Debt Card */}
      <Card className="p-4 sm:p-5 bg-slate-900 text-white border-0 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            TOTAL OUTSTANDING KHATA DEBT
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${riskBadgeColor}`}>
            {riskLabel}
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular mt-1">
          Rs. {total.toLocaleString()}
        </div>
        <div className="text-xs text-slate-400 font-medium pt-0.5 tabular">
          Credit Limit Approved: Rs. {(customer.creditLimit || 10000).toLocaleString()}
        </div>
      </Card>

      {/* 4 Aging Buckets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Card className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase block">0–30 DAYS</span>
          <span className="text-sm sm:text-base font-black text-blue-950 block mt-0.5 font-mono tabular">
            Rs. {b0_30.toLocaleString()}
          </span>
        </Card>

        <Card className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">31–60 DAYS</span>
          <span className="text-sm sm:text-base font-black text-amber-950 block mt-0.5 font-mono tabular">
            Rs. {b31_60.toLocaleString()}
          </span>
        </Card>

        <Card className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-orange-700 uppercase block">61–90 DAYS</span>
          <span className="text-sm sm:text-base font-black text-orange-950 block mt-0.5 font-mono tabular">
            Rs. {b61_90.toLocaleString()}
          </span>
        </Card>

        <Card className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase block">90+ DAYS OVERDUE</span>
          <span className="text-sm sm:text-base font-black text-rose-950 block mt-0.5 font-mono tabular">
            Rs. {b90plus.toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Profile Details & Recovery Recommendation */}
      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Address</span>
            <p className="font-semibold text-slate-800 mt-0.5">{customer.address || customer.area || 'Model Town'}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Payment Mode</span>
            <p className="font-semibold text-slate-800 mt-0.5">{customer.paymentMode || 'Khata'}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Milk Subscription</span>
            <p className="font-semibold text-slate-800 mt-0.5">{customer.subscription || '2 L Cow Milk'}</p>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block font-display">
            Recommended Recovery Strategy
          </span>
          <p className="text-xs font-semibold text-slate-800">
            {recommendation}
          </p>
        </div>
      </Card>
    </div>
  );
}
