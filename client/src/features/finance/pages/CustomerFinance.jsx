import { useState } from 'react';
import { Users, Receipt, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditCustomerModal from '../../customers/components/Customer_&_Accounts/EditCustomerModal';
import CustomerFinanceStats from '../components/CustomerFinanceLedger/CustomerFinanceStats';
import CustomerFinanceLedgerTable from '../components/CustomerFinanceLedger/CustomerFinanceLedgerTable';
import CustomerFinanceDetailModal from '../components/CustomerFinanceLedger/CustomerFinanceDetailModal';
import RecordPaymentModal from '../components/CustomerFinanceLedger/RecordPaymentModal';
import CollectionPayoutsStats from '../components/CollectionPayouts/CollectionPayoutsStats';
import CollectionPayoutsTable from '../components/CollectionPayouts/CollectionPayoutsTable';
import CollectionPayoutsReceiptModal from '../components/CollectionPayouts/CollectionPayoutsReceiptModal';
import ReceivablesAgingStats from '../components/ReceivablesAging/ReceivablesAgingStats';
import ReceivablesAgingTable from '../components/ReceivablesAging/ReceivablesAgingTable';
import ReceivablesAgingDetailModal from '../components/ReceivablesAging/ReceivablesAgingDetailModal';

export default function CustomerFinance() {
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'collections' | 'aging'
  const [viewCustomer, setViewCustomer] = useState(null);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [agingCustomer, setAgingCustomer] = useState(null);
  const [collectionReceipt, setCollectionReceipt] = useState(null);

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
            Customer Financial Ledgers &amp; Recoveries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer Khata balances, invoice settlements, collections, and aging analysis
          </p>
        </div>
      </div>

      {/* Top 3 Standalone Colored Buttons (All Colored by Default) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Button 1: Customer Accounts (Always Green) */}
        <Button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center justify-between h-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer border ${
            activeTab === 'accounts'
              ? 'bg-[#008f5b] hover:bg-[#008f5b] border-[#006e46] shadow-lg shadow-emerald-700/25 ring-4 ring-emerald-300/60 ring-offset-2 scale-[1.01]'
              : 'bg-[#00a86b] hover:bg-[#009660] border-[#00925d] shadow-sm opacity-95 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
              <Users className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-left font-extrabold tracking-wide">Customer Accounts</span>
          </div>
          {activeTab === 'accounts' && (
            <span className="p-1 rounded-full bg-white/25 text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </Button>

        {/* Button 2: Invoices & Collections (Always Blue) */}
        <Button
          type="button"
          onClick={() => setActiveTab('collections')}
          className={`flex items-center justify-between h-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer border ${
            activeTab === 'collections'
              ? 'bg-[#1d4ed8] hover:bg-[#1d4ed8] border-[#1e40af] shadow-lg shadow-blue-700/25 ring-4 ring-blue-300/60 ring-offset-2 scale-[1.01]'
              : 'bg-[#2563eb] hover:bg-[#1d4ed8] border-[#1d4ed8] shadow-sm opacity-95 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
              <Receipt className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-left font-extrabold tracking-wide">Invoices &amp; Collections</span>
          </div>
          {activeTab === 'collections' && (
            <span className="p-1 rounded-full bg-white/25 text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </Button>

        {/* Button 3: Receivables Aging (Always Amber/Gold) */}
        <Button
          type="button"
          onClick={() => setActiveTab('aging')}
          className={`flex items-center justify-between h-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all cursor-pointer border ${
            activeTab === 'aging'
              ? 'bg-[#b45309] hover:bg-[#b45309] border-[#92400e] shadow-lg shadow-amber-700/25 ring-4 ring-amber-300/60 ring-offset-2 scale-[1.01]'
              : 'bg-[#d97706] hover:bg-[#b45309] border-[#b45309] shadow-sm opacity-95 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20 text-white shadow-xs">
              <Clock className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-left font-extrabold tracking-wide">Receivables Aging</span>
          </div>
          {activeTab === 'aging' && (
            <span className="p-1 rounded-full bg-white/25 text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          )}
        </Button>
      </div>

      {/* Tab 1: Customer Accounts */}
      {activeTab === 'accounts' && (
        <div className="space-y-2.5">
          <CustomerFinanceStats />
          <CustomerFinanceLedgerTable
            onViewDetail={(cust) => setViewCustomer(cust)}
            onRecordPayment={(cust) => setPaymentCustomer(cust)}
            onEditCustomer={(cust) => setEditCustomer(cust)}
          />
        </div>
      )}

      {/* Tab 2: Invoices & Collections */}
      {activeTab === 'collections' && (
        <div className="space-y-2.5">
          <CollectionPayoutsStats />
          <CollectionPayoutsTable
            onViewReceipt={(cust, entry) => setCollectionReceipt({ customer: cust, entry })}
            onRecordPayment={(cust) => setPaymentCustomer(cust)}
            onEditCustomer={(cust) => setEditCustomer(cust)}
          />
        </div>
      )}

      {/* Tab 3: Receivables Aging */}
      {activeTab === 'aging' && (
        <div className="space-y-2.5">
          <ReceivablesAgingStats />
          <ReceivablesAgingTable
            onViewDetail={(cust, buckets) => setAgingCustomer({ customer: cust, buckets })}
            onRecordPayment={(cust) => setPaymentCustomer(cust)}
            onEditCustomer={(cust) => setEditCustomer(cust)}
          />
        </div>
      )}

      {/* Modals */}
      {/* Eye Icon -> Only Customer Details & Ledger */}
      <CustomerFinanceDetailModal
        customer={viewCustomer}
        isOpen={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
      />

      {/* Payment Icon -> Only Record Payment in PKR */}
      <RecordPaymentModal
        customer={paymentCustomer}
        isOpen={!!paymentCustomer}
        onClose={() => setPaymentCustomer(null)}
      />

      {/* Pencil Icon -> Only Edit Customer Profile */}
      <EditCustomerModal
        customer={editCustomer}
        isOpen={!!editCustomer}
        onClose={() => setEditCustomer(null)}
      />

      {/* Aging Details Modal */}
      <ReceivablesAgingDetailModal
        customer={agingCustomer?.customer}
        buckets={agingCustomer?.buckets}
        isOpen={!!agingCustomer}
        onClose={() => setAgingCustomer(null)}
      />

      {/* Payment Receipt Modal */}
      <CollectionPayoutsReceiptModal
        customer={collectionReceipt?.customer}
        entry={collectionReceipt?.entry}
        isOpen={!!collectionReceipt}
        onClose={() => setCollectionReceipt(null)}
      />
    </div>
  );
}

