import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerContext } from '../../../context/CustomerContext';
import { useLedgerContext } from '../../../context/LedgerContext';
import { exportTableToCSV } from '@/utils/csvExport';
import { recalculateCustomerStatementChronological } from '@/utils/khataAdvanceHelper';
import LedgerHeader from '../components/CustomerKhataLedger/LedgerHeader';
import LedgerCustomerSelector from '../components/CustomerKhataLedger/LedgerCustomerSelector';
import LedgerCustomerProfileCard from '../components/CustomerKhataLedger/LedgerCustomerProfileCard';
import LedgerStatsCards from '../components/CustomerKhataLedger/LedgerStatsCards';
import LedgerTable from '../components/CustomerKhataLedger/LedgerTable';
import BuyProductView from '../components/CustomerKhataLedger/BuyProductView';
import AddDebitView from '../components/CustomerKhataLedger/AddDebitView';
import RecordPaymentView from '../components/CustomerKhataLedger/RecordPaymentView';
import ViewTransactionView from '../components/CustomerKhataLedger/ViewTransactionView';
import HowToFinishView from '../components/CustomerKhataLedger/HowToFinishView';
import CustomerDetailsView from '../components/Customer_&_Accounts/CustomerDetailsView';
import EditCustomerModal from '../components/Customer_&_Accounts/EditCustomerModal';

export default function CustomerKhataLedger() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customers = [] } = useCustomerContext();
  const { getLedgerForCustomer, fetchCustomerLedger, settleKhata, ledgers } = useLedgerContext();

  const urlCustomerId = searchParams.get('customerId');
  const [selectedCustomerId, setSelectedCustomerId] = useState(urlCustomerId || '');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [currentSubView, setCurrentSubView] = useState('ledger'); // 'ledger' | 'buy' | 'addDebit' | 'recordPayment' | 'viewTransaction' | 'viewCustomer' | 'howToFinish'
  const [prefillPayAmount, setPrefillPayAmount] = useState(null);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Match current customer by id, _id, code, or name
  const currentCustomer = React.useMemo(() => {
    if (!customers || customers.length === 0) return null;
    const targetId = selectedCustomerId || urlCustomerId;
    if (targetId) {
      const targetLower = String(targetId).trim().toLowerCase();
      const match = customers.find(
        (c) =>
          String(c.id || c._id) === String(targetId) ||
          String(c._id) === String(targetId) ||
          String(c.id) === String(targetId) ||
          String(c.code || '').toLowerCase() === targetLower ||
          String(c.name || '').toLowerCase() === targetLower
      );
      if (match) return match;
    }
    return customers[0] || null;
  }, [customers, selectedCustomerId, urlCustomerId]);

  const effectiveCustomerId = currentCustomer ? String(currentCustomer._id || currentCustomer.id) : selectedCustomerId;

  // Sync selected customer from URL when searchParams change
  useEffect(() => {
    if (urlCustomerId && customers.length > 0) {
      const targetLower = String(urlCustomerId).trim().toLowerCase();
      const match = customers.find(
        (c) =>
          String(c.id || c._id) === String(urlCustomerId) ||
          String(c._id) === String(urlCustomerId) ||
          String(c.id) === String(urlCustomerId) ||
          String(c.code || '').toLowerCase() === targetLower ||
          String(c.name || '').toLowerCase() === targetLower
      );
      if (match) {
        setSelectedCustomerId(String(match._id || match.id));
      }
    } else if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(String(customers[0]._id || customers[0].id));
    }
  }, [customers, urlCustomerId]);

  // Fetch live statement from backend whenever effective customer changes
  useEffect(() => {
    if (effectiveCustomerId) {
      fetchCustomerLedger(effectiveCustomerId);
    }
  }, [effectiveCustomerId, fetchCustomerLedger]);

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    setSearchParams({ customerId: id });
    if (id) fetchCustomerLedger(id);
  };

  const rawEntries = effectiveCustomerId ? (getLedgerForCustomer(effectiveCustomerId) || []) : [];

  // Filter entries if month matches or show all
  const activeEntries = (selectedMonth && selectedMonth !== 'all')
    ? rawEntries.filter((entry) => {
        const dStr = typeof entry.date === 'string' ? entry.date : '';
        return dStr.startsWith(selectedMonth);
      })
    : rawEntries;

  // Recalculate full chronological ledger & stats
  const { entries: recalculatedEntries, summary: chronologicalSummary, rowMap } = React.useMemo(() => {
    return recalculateCustomerStatementChronological(activeEntries, currentCustomer || {});
  }, [activeEntries, currentCustomer]);

  // Accurately compute Opening Balance & Advance Deposit
  let openingBalance = 0;
  const openingEntry = rawEntries.find((e) => e.isOpening || e.type === 'OPENING');
  const isAdvanceOpening =
    (openingEntry && Number(openingEntry.advanceReceived) > 0) ||
    String(currentCustomer?.openingPaymentMethod || '').toUpperCase().includes('ADVANCE') ||
    currentCustomer?.openingPaymentMethod === 'CASH' ||
    currentCustomer?.openingPaymentMethod === 'ONLINE' ||
    /advance/i.test(openingEntry?.description || '') ||
    /advance/i.test(openingEntry?.fulfillmentType || '');

  if (openingEntry) {
    const rawVal = Number(
      openingEntry.credit ||
      openingEntry.debit ||
      openingEntry.orderTotal ||
      openingEntry.paidAmount ||
      openingEntry.remainingAmount ||
      currentCustomer?.openingBalance ||
      0
    );
    openingBalance = rawVal;
  } else if (currentCustomer && Number(currentCustomer.openingBalance || 0) > 0) {
    openingBalance = Number(currentCustomer.openingBalance);
  }

  const openingDate = openingEntry
    ? openingEntry.date
    : currentCustomer?.createdAt
    ? String(currentCustomer.createdAt).slice(0, 10)
    : '';

  const purchaseEntries = activeEntries.filter((e) => !e.isOpening && e.type !== 'OPENING' && !/opening/i.test(e.description || ''));
  const chargedCount = purchaseEntries.length;

  const paymentEntries = activeEntries.filter((e) => !e.isOpening && e.type !== 'OPENING' && !/opening/i.test(e.description || '') && Number(e.credit) > 0);
  const paidCount = paymentEntries.length;

  const totalCharged = chronologicalSummary.totalDebits || 0;
  const totalPaid = chronologicalSummary.totalCredits || 0;
  const totalAdvanceUsed = chronologicalSummary.totalAdvanceUsed || 0;
  const remainingAdvance = chronologicalSummary.advanceRemaining !== undefined ? chronologicalSummary.advanceRemaining : Number(currentCustomer?.advanceBalance || 0);
  const closingBalance = chronologicalSummary.closingDueBalance !== undefined ? chronologicalSummary.closingDueBalance : Number(currentCustomer?.khataBalance ?? currentCustomer?.currentBalance ?? 0);

  const handleSettleKhata = () => {
    if (!selectedCustomerId || !currentCustomer) return;
    if (confirm(`Are you sure you want to clear and settle all outstanding Khata dues for ${currentCustomer.name}?`)) {
      settleKhata(selectedCustomerId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!currentCustomer) return;
    const headers = [
      'Txn ID',
      'Date',
      'Type',
      'Description',
      'Total Bill / Debit (Rs)',
      'Advance Used (Rs)',
      'Advance Left (Rs)',
      'Paid / Credit (Rs)',
      'Khata Due Added (Rs)',
      'Khata Balance (Rs)',
      'Payment Method',
      'Notes',
    ];
    const rows = recalculatedEntries.map((e) => [
      e.id || e._id || '-',
      e.date || '-',
      e.type || 'ENTRY',
      e.description || 'Ledger statement entry',
      `Rs. ${Number(e.orderTotal || e.debit || 0).toLocaleString()}`,
      Number(e.advanceUsed || 0) > 0 ? `Rs. ${Number(e.advanceUsed).toLocaleString()}` : '-',
      `Rs. ${Number(e.advanceBalanceAfter || 0).toLocaleString()}`,
      `Rs. ${Number(e.credit || e.paidAmount || 0).toLocaleString()}`,
      Number(e.khataAmount || 0) > 0 ? `Rs. ${Number(e.khataAmount).toLocaleString()}` : 'Rs. 0',
      `Rs. ${Number(e.runningKhataBalance !== undefined ? e.runningKhataBalance : (e.runningBalance || 0)).toLocaleString()}`,
      e.paymentMethod || e.method || '-',
      e.notes || '-',
    ]);

    exportTableToCSV({
      filename: `Khata_Statement_${currentCustomer.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${selectedMonth || 'all'}`,
      title: `Customer Khata Statement — ${currentCustomer.name}`,
      metadata: [
        ['Customer Name', currentCustomer.name],
        ['Phone Number', currentCustomer.phone || '-'],
        ['Area / Address', currentCustomer.area || currentCustomer.address || '-'],
        ['Credit Limit', `Rs. ${Number(currentCustomer.creditLimit || 0).toLocaleString()}`],
        ['Opening Balance', `Rs. ${Number(openingBalance || 0).toLocaleString()}`],
        ['Total Debits (Period)', `Rs. ${Number(totalCharged || 0).toLocaleString()}`],
        ['Total Credits (Period)', `Rs. ${Number(totalPaid || 0).toLocaleString()}`],
        ['Total Advance Used', `Rs. ${Number(totalAdvanceUsed || 0).toLocaleString()}`],
        ['Advance Remaining', `Rs. ${Number(remainingAdvance || 0).toLocaleString()}`],
        ['Current Outstanding Khata Balance', `Rs. ${Number(closingBalance || 0).toLocaleString()}`],
        ['Statement Month Filter', selectedMonth || 'All Time History'],
      ],
      headers,
      rows,
      summaryRows: [
        [
          'SUMMARY TOTALS',
          '',
          '',
          '',
          `Debits: Rs. ${Number(totalCharged || 0).toLocaleString()}`,
          `Adv Used: Rs. ${Number(totalAdvanceUsed || 0).toLocaleString()}`,
          `Adv Left: Rs. ${Number(remainingAdvance || 0).toLocaleString()}`,
          `Credits: Rs. ${Number(totalPaid || 0).toLocaleString()}`,
          '',
          `Closing Due: Rs. ${Number(closingBalance || 0).toLocaleString()}`,
          '',
          `Entries: ${recalculatedEntries.length}`,
        ],
      ],
    });
  };

  if (currentSubView === 'buy' && currentCustomer) {
    return <BuyProductView customer={currentCustomer} onBack={() => setCurrentSubView('ledger')} />;
  }

  if (currentSubView === 'addDebit' && currentCustomer) {
    return <AddDebitView customer={currentCustomer} onBack={() => setCurrentSubView('ledger')} />;
  }

  if (currentSubView === 'recordPayment' && currentCustomer) {
    return (
      <RecordPaymentView
        customer={{ ...currentCustomer, khataBalance: closingBalance }}
        prefillAmount={prefillPayAmount}
        onBack={() => {
          setPrefillPayAmount(null);
          setCurrentSubView('ledger');
        }}
      />
    );
  }

  if (currentSubView === 'viewTransaction' && viewTransaction) {
    return (
      <ViewTransactionView
        transaction={viewTransaction}
        customer={currentCustomer ? { ...currentCustomer, currentBalance: closingBalance } : null}
        onBack={() => {
          setViewTransaction(null);
          setCurrentSubView('ledger');
        }}
      />
    );
  }

  if (currentSubView === 'viewCustomer' && currentCustomer) {
    return <CustomerDetailsView customer={currentCustomer} onBack={() => setCurrentSubView('ledger')} />;
  }

  if (currentSubView === 'howToFinish') {
    return <HowToFinishView onBack={() => setCurrentSubView('ledger')} />;
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-10 space-y-4">
      <LedgerHeader
        onHowToFinish={() => setCurrentSubView('howToFinish')}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
      />

      {/* Credit Limit Notification Alert Banner */}
      {currentCustomer && Number(currentCustomer.creditLimit || 0) > 0 && closingBalance >= Number(currentCustomer.creditLimit) && (
        <div className="p-3 bg-gradient-to-r from-rose-50 via-rose-100/70 to-rose-50 border-2 border-rose-400/90 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-rose-950 uppercase tracking-tight font-display flex items-center gap-1.5">
                  <span>Credit Limit Reached / Exceeded!</span>
                </h4>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-200 text-rose-900 uppercase tracking-wide border border-rose-300">
                  Limit Notice
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 leading-tight">
                <span className="font-bold">{currentCustomer.name}</span> has reached or exceeded their assigned credit limit of{' '}
                <span className="font-black font-mono">PKR {Number(currentCustomer.creditLimit).toLocaleString()}</span>. Current outstanding dues are{' '}
                <span className="font-black font-mono text-rose-950 underline">PKR {Number(closingBalance).toLocaleString()}</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentSubView('recordPayment')}
              className="h-8 px-3.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Dues / Payment</span>
            </Button>
          </div>
        </div>
      )}

      <LedgerCustomerSelector
        customers={customers}
        selectedCustomerId={effectiveCustomerId}
        onSelectCustomer={handleSelectCustomer}
        selectedMonth={selectedMonth}
        onChangeMonth={(m) => setSelectedMonth(m)}
        onOpenBuyModal={() => setCurrentSubView('buy')}
        onOpenAddDebit={() => setCurrentSubView('addDebit')}
        onOpenRecordPayment={() => setCurrentSubView('recordPayment')}
        onSettleKhata={handleSettleKhata}
        onBack={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/customer-hub/customers');
          }
        }}
      />

      {currentCustomer && (
        <LedgerCustomerProfileCard
          customer={currentCustomer}
          currentBalance={closingBalance}
          advanceBalance={remainingAdvance}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}

      <LedgerStatsCards
        openingBalance={openingBalance}
        openingDate={openingDate}
        isAdvanceOpening={isAdvanceOpening}
        totalCharged={totalCharged}
        chargedCount={chargedCount}
        totalPaid={totalPaid}
        paidCount={paidCount}
        currentBalance={closingBalance}
        remainingAdvance={remainingAdvance}
      />

      <LedgerTable
        customer={currentCustomer}
        ledgerEntries={recalculatedEntries}
        totalCharged={totalCharged}
        totalPaid={totalPaid}
        totalAdvanceUsed={totalAdvanceUsed}
        advanceRemaining={remainingAdvance}
        closingBalance={closingBalance}
        onViewCustomerProfile={() => setCurrentSubView('viewCustomer')}
        onPayBalance={() => {
          setPrefillPayAmount(null);
          setCurrentSubView('recordPayment');
        }}
        onViewTransaction={(txn) => {
          setViewTransaction(txn);
          setCurrentSubView('viewTransaction');
        }}
      />

      {currentCustomer && (
        <EditCustomerModal
          customer={currentCustomer}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

