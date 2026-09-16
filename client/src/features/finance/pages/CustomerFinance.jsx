import { useState } from 'react';
import { Users, Receipt, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditCustomerView from '../../customers/components/Customer_&_Accounts/EditCustomerView';
import CustomerFinanceStats from '../components/CustomerFinanceLedger/CustomerFinanceStats';
import CustomerFinanceLedgerTable from '../components/CustomerFinanceLedger/CustomerFinanceLedgerTable';
import CustomerFinanceDetailView from '../components/CustomerFinanceLedger/CustomerFinanceDetailView';
import CustomerFinanceRecordPaymentView from '../components/CustomerFinanceLedger/CustomerFinanceRecordPaymentView';
import CollectionPayoutsStats from '../components/CollectionPayouts/CollectionPayoutsStats';
import CollectionPayoutsTable from '../components/CollectionPayouts/CollectionPayoutsTable';
import CollectionPayoutsReceiptView from '../components/CollectionPayouts/CollectionPayoutsReceiptView';
import ReceivablesAgingStats from '../components/ReceivablesAging/ReceivablesAgingStats';
import ReceivablesAgingTable from '../components/ReceivablesAging/ReceivablesAgingTable';
import ReceivablesAgingDetailView from '../components/ReceivablesAging/ReceivablesAgingDetailView';

export default function CustomerFinance() {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'collections' | 'aging'
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'detail' | 'payment' | 'edit' | 'agingDetail' | 'receipt'
  const [viewCustomer, setViewCustomer] = useState(null);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [agingCustomer, setAgingCustomer] = useState(null);
  const [collectionReceipt, setCollectionReceipt] = useState(null);

  if (currentView === 'detail' && viewCustomer) {
    return (
      <CustomerFinanceDetailView
        customer={viewCustomer}
        onBack={() => {
          setViewCustomer(null);
          setCurrentView('main');
        }}
        onRecordPayment={(cust) => {
          setPaymentCustomer(cust);
          setCurrentView('payment');
        }}
      />
    );
  }

  if (currentView === 'payment' && paymentCustomer) {
    return (
      <CustomerFinanceRecordPaymentView
        customer={paymentCustomer}
        onBack={() => {
          setPaymentCustomer(null);
          setCurrentView('main');
        }}
      />
    );
  }

  if (currentView === 'edit' && editCustomer) {
    return (
      <EditCustomerView
        customer={editCustomer}
        onBack={() => {
          setEditCustomer(null);
          setCurrentView('main');
        }}
      />
    );
  }

  if (currentView === 'agingDetail' && agingCustomer?.customer) {
    return (
      <ReceivablesAgingDetailView
        customer={agingCustomer.customer}
        buckets={agingCustomer.buckets}
        onBack={() => {
          setAgingCustomer(null);
          setCurrentView('main');
        }}
        onRecordPayment={(cust) => {
          setPaymentCustomer(cust);
          setCurrentView('payment');
        }}
      />
    );
  }

  if (currentView === 'receipt' && collectionReceipt?.customer && collectionReceipt?.entry) {
    return (
      <CollectionPayoutsReceiptView
        customer={collectionReceipt.customer}
        entry={collectionReceipt.entry}
        onBack={() => {
          setCollectionReceipt(null);
          setCurrentView('main');
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center justify-between h-auto py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer border ${
            activeTab === 'accounts'
              ? 'bg-[#008f5b] hover:bg-[#008f5b] border-[#006e46] shadow-lg shadow-emerald-700/25 ring-4 ring-emerald-300/60 ring-offset-2 scale-[1.01]'
              : 'bg-[#00a86b] hover:bg-[#009660] border-[#00925d] shadow-sm opacity-95 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
              <Users className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-left font-extrabold tracking-wide text-xs">Customer Accounts</span>
          </div>
          {activeTab === 'accounts' && (
            <span className="p-1 rounded-full bg-white/25 text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => setActiveTab('collections')}
          className={`flex items-center justify-between h-auto py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer border ${
            activeTab === 'collections'
              ? 'bg-[#1d4ed8] hover:bg-[#1d4ed8] border-[#1e40af] shadow-lg shadow-blue-700/25 ring-4 ring-blue-300/60 ring-offset-2 scale-[1.01]'
              : 'bg-[#2563eb] hover:bg-[#1d4ed8] border-[#1d4ed8] shadow-sm opacity-95 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
              <Receipt className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-left font-extrabold tracking-wide text-xs">Invoices &amp; Collections</span>
          </div>
          {activeTab === 'collections' && (
            <span className="p-1 rounded-full bg-white/25 text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => setActiveTab('aging')}
          className={`flex items-center justify-between h-auto py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer border ${
            activeTab === 'aging'
              ? 'bg-[#b45309] hover:bg-[#b45309] border-[#92400e] shadow-lg shadow-amber-700/25 ring-4 ring-amber-300/60 ring-offset-2 scale-[1.01]'
              : 'bg-[#d97706] hover:bg-[#b45309] border-[#b45309] shadow-sm opacity-95 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
              <Clock className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-left font-extrabold tracking-wide text-xs">Receivables Aging</span>
          </div>
          {activeTab === 'aging' && (
            <span className="p-1 rounded-full bg-white/25 text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </Button>
      </div>

      {activeTab === 'accounts' && (
        <div className="space-y-2.5">
          <CustomerFinanceStats />
          <CustomerFinanceLedgerTable
            onViewDetail={(cust) => {
              setViewCustomer(cust);
              setCurrentView('detail');
            }}
            onRecordPayment={(cust) => {
              setPaymentCustomer(cust);
              setCurrentView('payment');
            }}
            onEditCustomer={(cust) => {
              setEditCustomer(cust);
              setCurrentView('edit');
            }}
          />
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-2.5">
          <CollectionPayoutsStats />
          <CollectionPayoutsTable
            onViewReceipt={(cust, entry) => {
              setCollectionReceipt({ customer: cust, entry });
              setCurrentView('receipt');
            }}
            onRecordPayment={(cust) => {
              setPaymentCustomer(cust);
              setCurrentView('payment');
            }}
            onEditCustomer={(cust) => {
              setEditCustomer(cust);
              setCurrentView('edit');
            }}
          />
        </div>
      )}

      {activeTab === 'aging' && (
        <div className="space-y-2.5">
          <ReceivablesAgingStats />
          <ReceivablesAgingTable
            onViewDetail={(cust, buckets) => {
              setAgingCustomer({ customer: cust, buckets });
              setCurrentView('agingDetail');
            }}
            onRecordPayment={(cust) => {
              setPaymentCustomer(cust);
              setCurrentView('payment');
            }}
            onEditCustomer={(cust) => {
              setEditCustomer(cust);
              setCurrentView('edit');
            }}
          />
        </div>
      )}
    </div>
  );
}
