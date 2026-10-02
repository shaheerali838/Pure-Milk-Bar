import React from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { useDeliveryContext } from '../../../../context/DeliveryContext';

export default function CollectionPayoutsStats() {
  const { totalKhataReceivable, rawCustomers, customers } = useCustomerContext();
  const { getLedgerForCustomer, getAllCustomersAggregates } = useLedgerContext();
  const { deliveries = [] } = useDeliveryContext() || {};

  const now = new Date();
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayUTC = now.toISOString().split('T')[0];

  const isDateToday = (d) => {
    if (!d) return false;
    const str = typeof d === 'string' ? d.split('T')[0] : String(d).slice(0, 10);
    return str === todayLocal || str === todayUTC;
  };

  const customerList = (rawCustomers && rawCustomers.length > 0) ? rawCustomers : (customers || []);

  const aggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : null;
  const effectiveTotalDue = (aggregates && aggregates.totalAllDue > 0)
    ? aggregates.totalAllDue
    : totalKhataReceivable;

  // Flat collection rows & verification
  let totalRecoveredToday = 0;
  let totalRecoveredAllTime = 0;
  let pendingBankTransfers = 0;
  let collectionsRecorded = 0;

  customerList.forEach((customer) => {
    const custId = customer._id || customer.id;
    const entries = getLedgerForCustomer(custId) || [];
    entries.forEach((entry) => {
      const credit = Number(entry.credit) || 0;
      const isOpeningAdvance =
        entry.isOpening ||
        entry.type === 'OPENING' ||
        /opening/i.test(entry.description || '') ||
        /advance deposit/i.test(entry.description || '');

      if (credit > 0 && !isOpeningAdvance) {
        collectionsRecorded += 1;
        totalRecoveredAllTime += credit;
        if (isDateToday(entry.date) || isDateToday(entry.createdAt)) {
          totalRecoveredToday += credit;
        }
        const methodUpper = String(entry.method || entry.paymentMethod || '').toUpperCase();
        const isPendingMethod =
          methodUpper.includes('BANK') ||
          methodUpper.includes('CHEQUE') ||
          methodUpper.includes('TRANSFER') ||
          entry.status === 'PENDING' ||
          entry.paymentStatus === 'Pending';

        if (isPendingMethod) {
          pendingBankTransfers += credit;
        }
      }
    });
  });

  // Pending COD collections from active/pending delivery runs
  const pendingRiderCod = (deliveries || [])
    .filter((d) => (d.status === 'PENDING' || d.status === 'OUT_FOR_DELIVERY') && (Number(d.codAmountToCollect) > 0 || Number(d.amountDue) > 0))
    .reduce((sum, d) => sum + (Number(d.codAmountToCollect || d.amountDue) || 0), 0);

  const pendingClearance = pendingBankTransfers + pendingRiderCod;

  const statCards = [
    {
      label: "Total Recovered Today",
      value: `Rs. ${totalRecoveredToday.toLocaleString()}`,
      sub: totalRecoveredToday > 0 ? "Direct Khata cash & online today" : `All-time: Rs. ${totalRecoveredAllTime.toLocaleString()}`,
      icon: DollarSign,
      color: "#009966",
      badge: "Today's Recovery",
    },
    {
      label: "Outstanding Khata Dues",
      value: `Rs. ${Number(effectiveTotalDue).toLocaleString()}`,
      sub: "Receivables from customers",
      icon: CreditCard,
      color: "#e11d48",
      badge: "Pending",
    },
    {
      label: "Pending Clearance",
      value: `Rs. ${pendingClearance.toLocaleString()}`,
      sub: pendingClearance > 0
        ? (pendingRiderCod > 0 ? `Rs. ${pendingRiderCod.toLocaleString()} Rider COD + Bank` : "Bank transfers & unverified vouchers")
        : "All collections & vouchers cleared",
      icon: Clock,
      color: "#f59e0b",
      badge: "Verification",
    },
    {
      label: "Collections Recorded",
      value: `${collectionsRecorded}`,
      sub: "Receipt transactions total",
      icon: CheckCircle2,
      color: "#155dfc",
      badge: "Receipts",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {statCards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: `${color}15` }}
            >
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <span className="text-[10px] font-bold px-3 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200">
              {badge}
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {value}
            </p>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[11px] font-medium text-slate-400">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
