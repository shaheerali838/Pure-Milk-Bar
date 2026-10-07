import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerContext } from '../../../context/CustomerContext';
import { useLedgerContext } from '../../../context/LedgerContext';
import { exportTableToCSV } from '@/utils/csvExport';
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
  const { customers } = useCustomerContext();
  const { getLedgerForCustomer, fetchCustomerLedger, settleKhata, ledgers } = useLedgerContext();

  const urlCustomerId = searchParams.get('customerId');
  const [selectedCustomerId, setSelectedCustomerId] = useState(urlCustomerId || '');
  const [selectedMonth, setSelectedMonth] = useState('');

  const [currentSubView, setCurrentSubView] = useState('ledger'); // 'ledger' | 'buy' | 'addDebit' | 'recordPayment' | 'viewTransaction' | 'viewCustomer' | 'howToFinish'
  const [prefillPayAmount, setPrefillPayAmount] = useState(null);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync selected customer from URL or fallback to first customer
  useEffect(() => {
    if (urlCustomerId && customers.some((c) => String(c.id || c._id) === String(urlCustomerId))) {
      setSelectedCustomerId(String(urlCustomerId));
    } else if ((!selectedCustomerId || !customers.some((c) => String(c.id || c._id) === String(selectedCustomerId))) && customers.length > 0) {
      setSelectedCustomerId(String(customers[0].id || customers[0]._id));
    }
  }, [customers, urlCustomerId]);

  // Fetch live statement from backend whenever selected customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerLedger(selectedCustomerId);
    }
  }, [selectedCustomerId, fetchCustomerLedger]);

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    setSearchParams({ customerId: id });
    if (id) fetchCustomerLedger(id);
  };

  const currentCustomer = customers.find((c) => String(c.id || c._id) === String(selectedCustomerId)) || null;

  const rawEntries = selectedCustomerId ? (getLedgerForCustomer(selectedCustomerId) || []) : [];

  // Filter entries if month matches or show all
  const activeEntries = (selectedMonth && selectedMonth !== 'all')
    ? rawEntries.filter((entry) => {
        const dStr = typeof entry.date === 'string' ? entry.date : '';
        return dStr.startsWith(selectedMonth);
      })
    : rawEntries;

  // Accurately compute Opening Balance & Advance Deposit from all-time history
  let openingBalance = 0;
  const openingEntry = rawEntries.find((e) => e.isOpening || e.type === 'OPENING');
  const isAdvanceOpening =
    openingEntry?.credit > 0 ||
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

  const purchaseEntries = rawEntries.filter((e) => !e.isOpening && e.type !== 'OPENING' && !/opening/i.test(e.description || ''));
  const totalCharged = purchaseEntries.reduce((acc, e) => {
    return acc + Number(e.debit || e.orderTotal || (e.items?.length > 0 ? e.items.reduce((s, it) => s + Number(it.subtotal || 0), 0) : 0));
  }, 0);
  const chargedCount = purchaseEntries.length;

  const paymentEntries = rawEntries.filter((e) => !e.isOpening && e.type !== 'OPENING' && !/opening/i.test(e.description || '') && Number(e.credit) > 0);
  const totalPayments = paymentEntries.reduce((acc, e) => acc + (Number(e.credit) || 0), 0);
  const paidCount = paymentEntries.length;

  const effectiveDebits = totalCharged + (!isAdvanceOpening ? openingBalance : 0);
  const totalPaid = totalPayments + (isAdvanceOpening ? openingBalance : 0);

  const closingBalance = Math.max(0, effectiveDebits - totalPaid);
  const remainingAdvance = Math.max(0, totalPaid - effectiveDebits);

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
      'Debit / Charged (Rs)',
      'Credit / Paid (Rs)',
      'Running Balance (Rs)',
      'Payment Method',
      'Notes',
    ];
    const rows = activeEntries.map((e) => [
      e.id || e._id || '-',
      e.date || '-',
      e.type || 'ENTRY',
      e.description || 'Ledger statement entry',
      `Rs. ${Number(e.debit || 0).toLocaleString()}`,
      `Rs. ${Number(e.credit || 0).toLocaleString()}`,
      `Rs. ${Number(e.runningBalance || 0).toLocaleString()}`,
      e.method || '-',
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
        ['Total Charged (Period)', `Rs. ${Number(totalCharged || 0).toLocaleString()}`],
        ['Total Paid (Period)', `Rs. ${Number(totalPaid || 0).toLocaleString()}`],
        ['Current Outstanding Khata Balance', `Rs. ${Number(closingBalance || 0).toLocaleString()}`],
        ['Statement Month Filter', selectedMonth || 'All Time History'],
      ],
      headers,
      rows,
      summaryRows: [
        ['SUMMARY TOTALS', '', '', '', `Rs. ${Number(totalCharged || 0).toLocaleString()}`, `Rs. ${Number(totalPaid || 0).toLocaleString()}`, `Closing: Rs. ${Number(closingBalance || 0).toLocaleString()}`, '', `Entries: ${activeEntries.length}`],
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
        selectedCustomerId={selectedCustomerId}
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
            navigate('/customer');
          }
        }}
      />

      {currentCustomer && (
        <LedgerCustomerProfileCard
          customer={currentCustomer}
          currentBalance={closingBalance}
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
        ledgerEntries={activeEntries}
        totalCharged={totalCharged}
        totalPaid={totalPaid}
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

