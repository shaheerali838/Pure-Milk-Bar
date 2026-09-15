import { DollarSign, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Card } from '@/components/ui/card';

export default function CollectionPayoutsStats() {
  const { totalKhataReceivable, rawCustomers } = useCustomerContext();
  const { ledgers } = useLedgerContext();

  const today = new Date().toISOString().split('T')[0];

  // Flat collection rows
  let totalRecoveredToday = 0;
  let pendingClearance = 0;
  let collectionsRecorded = 0;

  (rawCustomers || []).forEach((customer) => {
    const entries = ledgers[String(customer.id)] || [];
    entries.forEach((entry) => {
      const credit = Number(entry.credit) || 0;
      if (credit > 0) {
        collectionsRecorded += 1;
        if (entry.date === today) {
          totalRecoveredToday += credit;
        }
        if (entry.method === 'Bank' || entry.method === 'Bank Transfer') {
          pendingClearance += credit;
        }
      }
    });
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5">
      {/* Total Recovered Today */}
      <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL RECOVERED TODAY
          </span>
          <div className="text-xl font-black text-emerald-600 leading-tight mt-0.5 tabular">
            Rs. {totalRecoveredToday.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Direct Khata cash &amp; online
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
      </Card>

      {/* Outstanding Khata Dues */}
      <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            OUTSTANDING KHATA DUES
          </span>
          <div className="text-xl font-black text-rose-600 leading-tight mt-0.5 tabular">
            Rs. {totalKhataReceivable.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Receivables from customers
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
      </Card>

      {/* Pending Clearance */}
      <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            PENDING CLEARANCE
          </span>
          <div className="text-xl font-black text-amber-600 leading-tight mt-0.5 tabular">
            Rs. {pendingClearance.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Unconfirmed vouchers
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      </Card>

      {/* Collections Recorded */}
      <Card className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            COLLECTIONS RECORDED
          </span>
          <div className="text-xl font-black text-blue-600 leading-tight mt-0.5 tabular">
            {collectionsRecorded}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Receipt transactions
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </Card>
    </div>
  );
}

