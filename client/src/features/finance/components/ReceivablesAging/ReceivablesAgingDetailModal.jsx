import { useNavigate } from 'react-router-dom';
import { X, MapPin, CreditCard, Milk, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReceivablesAgingDetailModal({ customer, buckets, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !customer) return null;

  const total = Number(customer.khataBalance || 0);

  const b0_30 = buckets?.d0_30 || 0;
  const b31_60 = buckets?.d31_60 || 0;
  const b61_90 = buckets?.d61_90 || 0;
  const b90plus = buckets?.d90plus || 0;

  let riskLabel = 'Low Risk (0-30 Days)';
  let riskBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';

  if (b90plus > 0) {
    riskLabel = 'Critical Risk (90+ Days)';
    riskBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/30';
  } else if (b61_90 > 0) {
    riskLabel = 'High Risk (61-90 Days)';
    riskBadgeColor = 'bg-orange-500/20 text-orange-300 border-orange-400/30';
  } else if (b31_60 > 0) {
    riskLabel = 'Moderate Risk (31-60 Days)';
    riskBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  }

  const recommendation =
    b90plus > 0
      ? 'Send final WhatsApp reminder & pause new credit sales'
      : b61_90 > 0
      ? 'Send urgent payment reminder'
      : b31_60 > 0
      ? 'Send payment reminder for due cycle'
      : 'Send friendly payment reminder';

  const handleOpenKhata = () => {
    onClose();
    navigate('/customer-khata-ledger');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-xs font-bold text-slate-800 leading-tight font-display">
              Receivable Aging Breakdown — {customer.name}
            </h3>
            <p className="text-[10px] text-slate-400">
              Customer Phone: {customer.phone} · Total Outstanding: Rs. {total.toLocaleString()}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 text-xs text-slate-700">
          {/* Dark Red Total Debt Card */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                TOTAL OUTSTANDING KHATA DEBT
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${riskBadgeColor}`}>
                {riskLabel}
              </span>
            </div>
            <div className="text-2xl font-black text-white tabular">
              Rs. {total.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-medium pt-0.5 tabular">
              Credit Limit: Rs. {(customer.creditLimit || 10000).toLocaleString()}
            </div>
          </div>

          {/* 4 Aging Bucket Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-200/80 text-center">
              <span className="text-[9px] font-bold text-blue-700 uppercase block">0–30 DAYS</span>
              <span className="text-xs font-black text-blue-900 block mt-0.5 tabular">
                Rs. {b0_30.toLocaleString()}
              </span>
            </div>

            <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-200/80 text-center">
              <span className="text-[9px] font-bold text-amber-700 uppercase block">31–60 DAYS</span>
              <span className="text-xs font-black text-amber-900 block mt-0.5 tabular">
                Rs. {b31_60.toLocaleString()}
              </span>
            </div>

            <div className="p-2 bg-orange-50/60 rounded-lg border border-orange-200/80 text-center">
              <span className="text-[9px] font-bold text-orange-700 uppercase block">61–90 DAYS</span>
              <span className="text-xs font-black text-orange-900 block mt-0.5 tabular">
                Rs. {b61_90.toLocaleString()}
              </span>
            </div>

            <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-200/80 text-center">
              <span className="text-[9px] font-bold text-rose-700 uppercase block">90+ DAYS OVERDUE</span>
              <span className="text-xs font-black text-rose-900 block mt-0.5 tabular">
                Rs. {b90plus.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Customer Details & Recovery Recommendation */}
          <div className="divide-y divide-slate-100 bg-slate-50 rounded-lg border border-slate-200/80 p-2.5 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> Customer Address
              </span>
              <span className="font-semibold text-slate-800">{customer.address || customer.area || 'Model Town'}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-400" /> Preferred Payment
              </span>
              <span className="font-semibold text-slate-800">{customer.paymentMode || 'Online Payment'}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Milk className="w-3 h-3 text-slate-400" /> Daily Subscription
              </span>
              <span className="font-semibold text-slate-800">{customer.subscription || '2 L Cow Milk'}</span>
            </div>

            <div className="py-1">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5 font-display">
                Recovery Recommendation
              </span>
              <span className="font-bold text-slate-800 bg-white p-2 rounded border border-slate-200 block">
                {recommendation}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/70">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenKhata}
            className="flex items-center gap-1 px-3 py-1 h-7 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-semibold transition text-xs cursor-pointer shadow-none"
          >
            <span>Open Full Khata</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="px-4 py-1 h-7 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-md font-bold transition text-xs cursor-pointer shadow-2xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

