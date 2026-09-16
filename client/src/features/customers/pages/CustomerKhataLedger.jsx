import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCustomerContext } from '../../../context/CustomerContext';
import { useLedgerContext } from '../../../context/LedgerContext';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { customers } = useCustomerContext();
  const { getLedgerForCustomer, settleKhata } = useLedgerContext();

  const urlCustomerId = searchParams.get('customerId');
  const [selectedCustomerId, setSelectedCustomerId] = useState(urlCustomerId || '');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [currentSubView, setCurrentSubView] = useState('ledger'); // 'ledger' | 'buy' | 'addDebit' | 'recordPayment' | 'viewTransaction' | 'viewCustomer' | 'howToFinish'
  const [viewTransaction, setViewTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync selected customer from URL or fallback to first customer
  useEffect(() => {
    if (urlCustomerId && customers.some((c) => String(c.id) === String(urlCustomerId))) {
      setSelectedCustomerId(String(urlCustomerId));
    } else if ((!selectedCustomerId || !customers.some((c) => String(c.id) === String(selectedCustomerId))) && customers.length > 0) {
      setSelectedCustomerId(String(customers[0].id));
    }
  }, [customers, urlCustomerId]);

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    setSearchParams({ customerId: id });
  };

  const currentCustomer = customers.find((c) => String(c.id) === String(selectedCustomerId)) || null;

  const rawEntries = selectedCustomerId ? getLedgerForCustomer(selectedCustomerId) : [];

  // Filter entries if month matches or show all
  const filteredEntries = rawEntries.filter((entry) => {
    if (!selectedMonth || !entry.date) return true;
    return entry.date.startsWith(selectedMonth);
  });

  const activeEntries = filteredEntries.length > 0 ? filteredEntries : rawEntries;

  const openingEntry = activeEntries.find((e) => e.type === 'OPENING') || activeEntries[0];
  const openingBalance = openingEntry ? openingEntry.runningBalance : (currentCustomer ? currentCustomer.openingBalance || 0 : 0);
  const openingDate = openingEntry ? openingEntry.date : '';

  const debitEntries = activeEntries.filter((e) => Number(e.debit) > 0);
  const totalCharged = debitEntries.reduce((acc, e) => acc + (Number(e.debit) || 0), 0);
  const chargedCount = debitEntries.length;

  const creditEntries = activeEntries.filter((e) => Number(e.credit) > 0);
  const totalPaid = creditEntries.reduce((acc, e) => acc + (Number(e.credit) || 0), 0);
  const paidCount = creditEntries.length;

  const closingBalance =
    currentCustomer !== null ? currentCustomer.khataBalance : 0;

  const handleSettleKhata = () => {
    if (!selectedCustomerId || !currentCustomer) return;
    if (confirm(`Are you sure you want to clear and settle all outstanding Khata dues for ${currentCustomer.name}?`)) {
      settleKhata(selectedCustomerId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (currentSubView === 'buy' && currentCustomer) {
    return <BuyProductView customer={currentCustomer} onBack={() => setCurrentSubView('ledger')} />;
  }

  if (currentSubView === 'addDebit' && currentCustomer) {
    return <AddDebitView customer={currentCustomer} onBack={() => setCurrentSubView('ledger')} />;
  }

  if (currentSubView === 'recordPayment' && currentCustomer) {
    return <RecordPaymentView customer={currentCustomer} onBack={() => setCurrentSubView('ledger')} />;
  }

  if (currentSubView === 'viewTransaction' && viewTransaction) {
    return (
      <ViewTransactionView
        transaction={viewTransaction}
        customer={currentCustomer}
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
    <div className="space-y-2.5">
      <LedgerHeader
        onHowToFinish={() => setCurrentSubView('howToFinish')}
        onPrint={handlePrint}
      />

      <LedgerCustomerSelector
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={handleSelectCustomer}
        selectedMonth={selectedMonth}
        onChangeMonth={(m) => setSelectedMonth(m)}
        onViewCustomerDetails={() => setCurrentSubView('viewCustomer')}
        onOpenBuyModal={() => setCurrentSubView('buy')}
        onOpenAddDebit={() => setCurrentSubView('addDebit')}
        onOpenRecordPayment={() => setCurrentSubView('recordPayment')}
        onSettleKhata={handleSettleKhata}
      />

      {currentCustomer && (
        <LedgerCustomerProfileCard
          customer={currentCustomer}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}

      <LedgerStatsCards
        openingBalance={openingBalance}
        openingDate={openingDate}
        totalCharged={totalCharged}
        chargedCount={chargedCount}
        totalPaid={totalPaid}
        paidCount={paidCount}
        currentBalance={closingBalance}
      />

      <LedgerTable
        customer={currentCustomer}
        ledgerEntries={activeEntries}
        totalCharged={totalCharged}
        totalPaid={totalPaid}
        closingBalance={closingBalance}
        onViewCustomerProfile={() => setCurrentSubView('viewCustomer')}
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

