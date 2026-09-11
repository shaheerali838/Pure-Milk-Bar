import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../../context/CustomerContext';
import { useLedgerContext } from '../../../context/LedgerContext';
import LedgerHeader from '../components/CustomerKhataLedger/LedgerHeader';
import LedgerCustomerSelector from '../components/CustomerKhataLedger/LedgerCustomerSelector';
import LedgerStatsCards from '../components/CustomerKhataLedger/LedgerStatsCards';
import LedgerTable from '../components/CustomerKhataLedger/LedgerTable';
import AddDebitModal from '../components/CustomerKhataLedger/AddDebitModal';
import RecordPaymentModal from '../components/CustomerKhataLedger/RecordPaymentModal';
import ViewTransactionModal from '../components/CustomerKhataLedger/ViewTransactionModal';
import HowToFinishModal from '../components/CustomerKhataLedger/HowToFinishModal';
import ViewCustomerModal from '../components/Customer_&_Accounts/ViewCustomerModal';

export default function CustomerKhataLedger() {
  const { customers } = useCustomerContext();
  const { getLedgerForCustomer, settleKhata } = useLedgerContext();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [isAddDebitOpen, setIsAddDebitOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isHowToFinishOpen, setIsHowToFinishOpen] = useState(false);
  const [viewTransaction, setViewTransaction] = useState(null);
  const [viewCustomerProfile, setViewCustomerProfile] = useState(null);

  // Auto-select first customer if none is selected
  useEffect(() => {
    if ((!selectedCustomerId || !customers.some((c) => String(c.id) === String(selectedCustomerId))) && customers.length > 0) {
      setSelectedCustomerId(String(customers[0].id));
    }
  }, [customers, selectedCustomerId]);

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

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <LedgerHeader
        onHowToFinish={() => setIsHowToFinishOpen(true)}
        onPrint={handlePrint}
      />

      {/* Customer Selector & Quick Action Buttons */}
      <LedgerCustomerSelector
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={(id) => setSelectedCustomerId(id)}
        selectedMonth={selectedMonth}
        onChangeMonth={(m) => setSelectedMonth(m)}
        onViewCustomerDetails={() => setViewCustomerProfile(currentCustomer)}
        onOpenAddDebit={() => setIsAddDebitOpen(true)}
        onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
        onSettleKhata={handleSettleKhata}
      />

      {/* 4 Summary Stats Cards */}
      <LedgerStatsCards
        openingBalance={openingBalance}
        openingDate={openingDate}
        totalCharged={totalCharged}
        chargedCount={chargedCount}
        totalPaid={totalPaid}
        paidCount={paidCount}
        currentBalance={closingBalance}
      />

      {/* Ledger Table with Horizontal Scroll Support */}
      <LedgerTable
        customer={currentCustomer}
        ledgerEntries={activeEntries}
        totalCharged={totalCharged}
        totalPaid={totalPaid}
        closingBalance={closingBalance}
        onViewCustomerProfile={() => setViewCustomerProfile(currentCustomer)}
        onViewTransaction={(txn) => setViewTransaction(txn)}
      />

      {/* Add Debit Modal */}
      <AddDebitModal
        customer={currentCustomer}
        isOpen={isAddDebitOpen}
        onClose={() => setIsAddDebitOpen(false)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        customer={currentCustomer}
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
      />

      {/* View Transaction Modal */}
      <ViewTransactionModal
        transaction={viewTransaction}
        customer={currentCustomer}
        isOpen={!!viewTransaction}
        onClose={() => setViewTransaction(null)}
      />

      {/* Customer Profile View Modal */}
      <ViewCustomerModal
        customer={viewCustomerProfile}
        isOpen={!!viewCustomerProfile}
        onClose={() => setViewCustomerProfile(null)}
      />

      {/* How to Finish Khata Guide Modal */}
      <HowToFinishModal
        isOpen={isHowToFinishOpen}
        onClose={() => setIsHowToFinishOpen(false)}
      />
    </div>
  );
}
