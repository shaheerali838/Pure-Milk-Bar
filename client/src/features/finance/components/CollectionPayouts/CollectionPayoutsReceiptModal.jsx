import { X, CheckCircle2, Printer, Calendar, User, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CollectionPayoutsReceiptModal({ customer, entry, isOpen, onClose }) {
  if (!isOpen || !customer || !entry) return null;

  const isPending = entry.method === 'Bank' || entry.method === 'Bank Transfer';
  const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `VCH-${Date.now().toString().slice(-4)}`);
  const paymentType = Number(entry.credit) >= 5000 ? 'Full Settlement' : 'Partial Payment';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-xs font-bold text-slate-800 leading-tight font-display">Khata Payment Receipt</h3>
            <p className="text-[10px] text-slate-400">Customer Recovery Inflow · {entry.date}</p>
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

        <div className="p-4 space-y-2 text-xs text-slate-700">
          <div className="p-3.5 bg-emerald-950 text-white rounded-xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                INFLOW RECOVERED
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isPending
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {isPending ? 'Pending Clearance' : 'Confirmed Payment'}
              </span>
            </div>
            <div className="text-2xl font-black text-white tabular">
              Rs. {Number(entry.credit || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Received via {entry.method || 'Cash'}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 bg-slate-50 rounded-lg border border-slate-200/80 p-2.5 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" /> Customer Account
              </span>
              <span className="font-bold text-slate-800 font-display">{customer.name}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Transaction Date
              </span>
              <span className="font-mono text-slate-800 font-semibold tabular">{entry.date}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" /> Receipt Voucher #
              </span>
              <span className="font-mono text-slate-800 font-bold tabular">{refCode}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-400" /> Payment Classification
              </span>
              <span className="font-semibold text-slate-800">{paymentType}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-400" /> Payment Channel
              </span>
              <span className="font-semibold text-slate-800">{entry.method || 'Cash'}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Remarks &amp; Notes</span>
              <span className="font-medium text-slate-700">{entry.notes || entry.description || 'Payment cleared'}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/70">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1 h-7 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md font-semibold transition text-xs cursor-pointer shadow-none"
          >
            <Printer className="w-3 h-3 text-slate-500" />
            Print Inflow Slip
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="px-4 py-1 h-7 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-md font-bold transition text-xs cursor-pointer shadow-2xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

