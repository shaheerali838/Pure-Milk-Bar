import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Truck,
  DollarSign,
  Receipt,
  PiggyBank,
  Users,
} from 'lucide-react';
import { useStaffContext } from '@/context/StaffContext';

export default function MoneyInAndOutBlock({
  collections = {},
  creditGiven = 0,
  expenses = {},
  cash = {},
  profit = {},
}) {
  const formatRs = (val) => `Rs. ${Number(val || 0).toLocaleString('en-PK')}`;

  const counterCash = collections.counterCash || 0;
  const counterOnline = collections.counterOnline || 0;
  const codCash = collections.codCash || 0;
  const khataCash = collections.khataRecoveredCash || 0;
  const khataOnline = collections.khataRecoveredOnline || 0;
  const totalCollected = collections.totalCollected || (counterCash + counterOnline + codCash + khataCash + khataOnline);

  const { salaryPayments = [] } = useStaffContext();
  const todayISO = React.useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's staff salary disbursements
  const todaysStaffPayments = React.useMemo(() => {
    return (salaryPayments || []).filter((p) => {
      const pDate = p.date ? p.date.slice(0, 10) : '';
      return pDate === todayISO;
    });
  }, [salaryPayments, todayISO]);

  const todaysStaffCashTotal = React.useMemo(() => {
    return todaysStaffPayments
      .filter((p) => !p.paymentMethod || p.paymentMethod.toUpperCase() === 'CASH')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [todaysStaffPayments]);

  const todaysStaffTotal = React.useMemo(() => {
    return todaysStaffPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [todaysStaffPayments]);

  const expenseItems = expenses.items || [];
  const expenseCashTotal = expenses.cashTotal || 0;
  const expenseTotal = expenses.total || 0;

  const hasBackendWages = expenseItems.some((e) => e.key === 'wages' && Number(e.amount) > 0);
  const effectiveExpenseCashTotal = hasBackendWages ? expenseCashTotal : (expenseCashTotal + todaysStaffCashTotal);
  const effectiveExpenseTotal = hasBackendWages ? expenseTotal : (expenseTotal + todaysStaffTotal);

  const openingCash = cash.openingCash || 0;
  const cashIn = cash.cashIn || (counterCash + codCash + khataCash);
  const cashOut = cash.cashOut !== undefined ? (hasBackendWages ? cash.cashOut : cash.cashOut + todaysStaffCashTotal) : effectiveExpenseCashTotal;
  const expectedInDrawer = cash.expectedInDrawer !== undefined ? (hasBackendWages ? cash.expectedInDrawer : cash.expectedInDrawer - todaysStaffCashTotal) : (openingCash + cashIn - cashOut);

  const estimatedProfit = profit.estimatedProfit ?? 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all space-y-0">
      {/* Block Title Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Financial Collections & Daily Cash Flow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete money flow: Sales receipts, Digital collections, Customer ledger recovery vs Operating expenses
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
            Drawer Opening
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            {formatRs(openingCash)}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Money In vs Money Out */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
        {/* Left Column: Money Inflows */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              Money In (Collections)
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Total: {formatRs(totalCollected)}
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                1. POS Counter Cash Sales
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRs(counterCash)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                2. Digital Online (JazzCash / EasyPaisa / Bank)
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRs(counterOnline)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                3. Doorstep Delivery COD Cash
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRs(codCash)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                4. Customer Ledger Recovered (Cash)
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">+{formatRs(khataCash)}</span>
            </div>

            {khataOnline > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  5. Customer Ledger Recovered (Digital)
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">+{formatRs(khataOnline)}</span>
              </div>
            )}

            {creditGiven > 0 && (
              <div className="flex justify-between py-1 text-slate-500 italic">
                <span>Credit Given Today (Receivable)</span>
                <span>{formatRs(creditGiven)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Money Outflows (Expenses) */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              Money Out (Operating Expenses)
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              Total: {formatRs(effectiveExpenseTotal)}
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            {/* Distinct Staff Salary Payments Outflow */}
            {todaysStaffPayments.map((p, idx) => (
              <div
                key={`staff-pay-${p.id || idx}`}
                className="flex justify-between items-center py-1.5 px-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60"
              >
                <span className="text-purple-900 dark:text-purple-200 font-bold flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                  Cash Out: Staff Payment - {p.staffName} ({p.paymentMethod || 'CASH'})
                </span>
                <span className="font-black text-rose-700 dark:text-rose-400 font-mono text-xs">
                  - {formatRs(p.amount)}
                </span>
              </div>
            ))}

            {expenseItems
              .filter((exp) => !(hasBackendWages && todaysStaffPayments.length > 0 && exp.key === 'wages'))
              .map((exp, idx) => (
              <div key={exp.key || idx} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  {exp.label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {exp.amount > 0 ? formatRs(exp.amount) : 'Rs. 0'}
                </span>
              </div>
            ))}

            <div className="flex justify-between pt-1 text-xs text-slate-500">
              <span>Cash Paid from Drawer</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{formatRs(effectiveExpenseCashTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Strip (Dark High-Impact Bar) */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Opening Cash</span>
            <span className="text-sm sm:text-base font-bold text-slate-200">{formatRs(openingCash)}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cash Inflows</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">+{formatRs(cashIn)}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cash Expenses</span>
            <span className="text-sm sm:text-base font-bold text-rose-400">-{formatRs(cashOut)}</span>
          </div>

          <div>
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-bold block">Cash in Drawer</span>
            <span className="text-base sm:text-lg font-black text-emerald-300">{formatRs(expectedInDrawer)}</span>
          </div>
        </div>

        <div className="pt-2 sm:pt-0 sm:pl-4 sm:border-l border-slate-800 flex items-center justify-between sm:flex-col sm:items-end">
          <span className="text-xs text-slate-400">Estimated Profit:</span>
          <span className={`text-base sm:text-lg font-black ${estimatedProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
            {formatRs(estimatedProfit)}
          </span>
        </div>
      </div>
    </div>
  );
}
