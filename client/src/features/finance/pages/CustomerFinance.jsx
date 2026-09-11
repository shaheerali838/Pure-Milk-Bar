import { useState } from 'react';
import { Plus, Users, Receipt, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import AddCustomerModal from '../../customers/components/Customer_&_Accounts/AddCustomerModal';
import EditCustomerModal from '../../customers/components/Customer_&_Accounts/EditCustomerModal';
import CustomerFinanceStats from '../components/CustomerFinanceLedger/CustomerFinanceStats';
import CustomerFinanceLedgerTable from '../components/CustomerFinanceLedger/CustomerFinanceLedgerTable';
import CustomerFinanceDetailModal from '../components/CustomerFinanceLedger/CustomerFinanceDetailModal';
import CollectionPayoutsStats from '../components/CollectionPayouts/CollectionPayoutsStats';
import CollectionPayoutsTable from '../components/CollectionPayouts/CollectionPayoutsTable';
import CollectionPayoutsReceiptModal from '../components/CollectionPayouts/CollectionPayoutsReceiptModal';
import ReceivablesAgingStats from '../components/ReceivablesAging/ReceivablesAgingStats';
import ReceivablesAgingTable from '../components/ReceivablesAging/ReceivablesAgingTable';
import ReceivablesAgingDetailModal from '../components/ReceivablesAging/ReceivablesAgingDetailModal';

export default function CustomerFinance() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [agingCustomer, setAgingCustomer] = useState(null);
  const [collectionReceipt, setCollectionReceipt] = useState(null);

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Customer Financial Ledgers &amp; Recoveries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer Khata balances, invoice settlements, collections, and aging analysis
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00a86b] hover:bg-[#00925d] text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Customer
        </button>
      </div>

      <Tabs defaultValue="accounts" className="space-y-3">
        {/* Top 3 High-Visibility Tabs */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <TabsList className="grid grid-cols-3 w-full bg-slate-100 p-1 rounded-lg gap-1.5 h-auto">
            {/* Tab 1: Customer Accounts */}
            <TabsTrigger
              value="accounts"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-bold transition-all data-[state=active]:bg-[#00a86b] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Customer Accounts</span>
            </TabsTrigger>

            {/* Tab 2: Invoices & Collections */}
            <TabsTrigger
              value="collections"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-bold transition-all data-[state=active]:bg-[#2563eb] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>Invoices &amp; Collections</span>
            </TabsTrigger>

            {/* Tab 3: Receivables Aging */}
            <TabsTrigger
              value="aging"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-bold transition-all data-[state=active]:bg-[#d97706] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Receivables Aging</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Customer Accounts */}
        <TabsContent value="accounts" className="space-y-2.5 mt-0">
          <CustomerFinanceStats />
          <CustomerFinanceLedgerTable
            onViewDetail={(cust) => setViewCustomer(cust)}
          />
        </TabsContent>

        {/* Tab 2: Invoices & Collections */}
        <TabsContent value="collections" className="space-y-2.5 mt-0">
          <CollectionPayoutsStats />
          <CollectionPayoutsTable
            onViewReceipt={(cust, entry) => setCollectionReceipt({ customer: cust, entry })}
          />
        </TabsContent>

        {/* Tab 3: Receivables Aging */}
        <TabsContent value="aging" className="space-y-2.5 mt-0">
          <ReceivablesAgingStats />
          <ReceivablesAgingTable
            onViewDetail={(cust, buckets) => setAgingCustomer({ customer: cust, buckets })}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <CustomerFinanceDetailModal
        customer={viewCustomer}
        isOpen={!!viewCustomer}
        onClose={() => setViewCustomer(null)}
        onEdit={(c) => {
          setViewCustomer(null);
          setEditCustomer(c);
        }}
      />
      <ReceivablesAgingDetailModal
        customer={agingCustomer?.customer}
        buckets={agingCustomer?.buckets}
        isOpen={!!agingCustomer}
        onClose={() => setAgingCustomer(null)}
      />
      <CollectionPayoutsReceiptModal
        customer={collectionReceipt?.customer}
        entry={collectionReceipt?.entry}
        isOpen={!!collectionReceipt}
        onClose={() => setCollectionReceipt(null)}
      />
      <EditCustomerModal customer={editCustomer} isOpen={!!editCustomer} onClose={() => setEditCustomer(null)} />
    </div>
  );
}
