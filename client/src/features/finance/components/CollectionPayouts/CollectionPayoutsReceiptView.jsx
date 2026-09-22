import React from 'react';
import { ArrowLeft, CheckCircle2, Printer, Calendar, User, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CollectionPayoutsReceiptView({ customer, entry, onBack }) {
  if (!customer || !entry) return null;

  const isPending = entry.method === 'Bank' || entry.method === 'Bank Transfer';
  const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `VCH-${Date.now().toString().slice(-4)}`);
  const paymentType = Number(entry.credit) >= 5000 ? 'Full Settlement' : 'Partial Payment';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-200 pb-4">
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
              <FileText className="w-4.5 h-4.5 text-emerald-600" />
              Khata Collection Voucher &bull; #{refCode}
            </h1>
            <p className="text-xs text-slate-500">
              Customer Recovery Inflow &bull; Recorded on {entry.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Inflow Voucher
          </Button>
        </div>
      </div>

      <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 max-w-3xl">
        <div className="p-4 bg-emerald-950 text-white rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              INFLOW RECOVERED (PKR)
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isPending
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {isPending ? 'Pending Clearance' : 'Confirmed Recovery'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular">
            Rs. {Number(entry.credit || 0).toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-300 font-medium pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Received via {entry.method || 'Cash'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Account</span>
            <p className="font-bold text-slate-900 mt-0.5 font-display">{customer.name}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Date</span>
            <p className="font-bold text-slate-900 font-mono mt-0.5 tabular">{entry.date}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Voucher #</span>
            <p className="font-bold text-blue-600 font-mono mt-0.5 tabular">{refCode}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Classification</span>
            <p className="font-semibold text-slate-800 mt-0.5">{paymentType}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Channel</span>
            <p className="font-semibold text-slate-800 mt-0.5">{entry.method || 'Cash'}</p>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resulting Khata Balance</span>
            <p className="font-black text-slate-900 font-mono mt-0.5 tabular">
              Rs. {Number(entry.runningBalance || 0).toLocaleString()}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remarks &amp; Notes</span>
            <p className="font-medium text-slate-700 mt-0.5">{entry.notes || entry.description || 'Payment cleared'}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="px-5 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
          >
            Back to Invoices &amp; Collections
          </Button>
        </div>
      </Card>
    </div>
  );
}
