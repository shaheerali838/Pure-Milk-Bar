import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/Customer_&_Accounts/CustomerHeader';
import CustomerStatsCards from '../components/Customer_&_Accounts/CustomerStatsCards';
import CustomerFilters from '../components/Customer_&_Accounts/CustomerFilters';
import CustomerTable from '../components/Customer_&_Accounts/CustomerTable';
import AddNewCustomerView from '../components/Customer_&_Accounts/AddNewCustomerView';
import EditCustomerView from '../components/Customer_&_Accounts/EditCustomerView';
import CustomerAdvancePaymentsView from '../components/Customer_&_Accounts/CustomerAdvancePaymentsView';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'add' | 'edit' | 'advance'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  if (currentView === 'add') {
    return <AddNewCustomerView onBack={() => setCurrentView('list')} />;
  }

  if (currentView === 'edit' && selectedCustomer) {
    return (
      <EditCustomerView
        customer={selectedCustomer}
        onBack={() => {
          setSelectedCustomer(null);
          setCurrentView('list');
        }}
      />
    );
  }

  if (currentView === 'advance') {
    return (
      <CustomerAdvancePaymentsView
        onBack={() => setCurrentView('list')}
        onOpenAddCustomer={() => setCurrentView('add')}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50/50 pb-10 space-y-4">
      <CustomerHeader onOpenAddModal={() => setCurrentView('add')} />
      <CustomerStatsCards onOpenAdvanceDetails={() => setCurrentView('advance')} />

      {/* Dynamic Bottom Register: Customer Register & Directory */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Customer Register &amp; Accounts Directory
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Active Directory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Directory of all registered customers, contact numbers, assigned routes, and live Khata balances
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CustomerFilters />
          </div>
        </div>

        <CustomerTable
          onViewCustomer={(cust) => {
            const custId = cust?._id || cust?.id;
            if (custId) {
              navigate(`/customer-hub/khata-ledger?customerId=${custId}`);
            }
          }}
          onEditCustomer={(cust) => {
            setSelectedCustomer(cust);
            setCurrentView('edit');
          }}
        />
      </div>
    </div>
  );
}
