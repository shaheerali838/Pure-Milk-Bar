import { Users, CreditCard, DollarSign, Wallet } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerFinanceStats() {
  const { allCustomersCount, totalKhataReceivable, withKhataBalCount, rawCustomers } = useCustomerContext();
  const { getLedgerForCustomer } = useLedgerContext();

  // Sum all credit amounts across every customer's ledger
  const totalCollected = (rawCustomers || []).reduce((acc, cust) => {
    const entries = getLedgerForCustomer(cust.id) || [];
    return acc + entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  }, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2.5">
      {/* Total Customers */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL CUSTOMERS
          </span>
          <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
            {allCustomersCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {withKhataBalCount} customers with active debt
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Total Outstanding Credit */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL OUTSTANDING CREDIT
          </span>
          <div className="text-xl font-black text-rose-600 leading-tight mt-0.5">
            Rs. {totalKhataReceivable.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Active Khata balance pending
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
      </div>

      {/* Total Collected */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL COLLECTED
          </span>
          <div className="text-xl font-black text-emerald-600 leading-tight mt-0.5">
            Rs. {totalCollected.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Ledger payment inflows
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* Accounts in Credit */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            ACCOUNTS IN CREDIT
          </span>
          <div className="text-xl font-black text-amber-600 leading-tight mt-0.5">
            {withKhataBalCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Unpaid balances pending
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
