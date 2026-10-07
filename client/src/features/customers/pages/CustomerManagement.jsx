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
    <div className="compact-stack flex flex-col">
      <CustomerHeader onOpenAddModal={() => setCurrentView('add')} />
      <CustomerStatsCards onOpenAdvanceDetails={() => setCurrentView('advance')} />
      <CustomerFilters />
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
  );
}

