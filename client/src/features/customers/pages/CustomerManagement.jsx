import React, { useState } from 'react';
import CustomerStatsCards from '../components/Customer_&_Accounts/CustomerStatsCards';
import CustomerFilters from '../components/Customer_&_Accounts/CustomerFilters';
import CustomerTable from '../components/Customer_&_Accounts/CustomerTable';
import AddNewCustomerView from '../components/Customer_&_Accounts/AddNewCustomerView';
import CustomerDetailsView from '../components/Customer_&_Accounts/CustomerDetailsView';
import EditCustomerView from '../components/Customer_&_Accounts/EditCustomerView';

export default function CustomerManagement() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'add' | 'view' | 'edit'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  if (currentView === 'add') {
    return <AddNewCustomerView onBack={() => setCurrentView('list')} />;
  }

  if (currentView === 'view' && selectedCustomer) {
    return (
      <CustomerDetailsView
        customer={selectedCustomer}
        onBack={() => {
          setSelectedCustomer(null);
          setCurrentView('list');
        }}
        onEdit={(cust) => {
          setSelectedCustomer(cust);
          setCurrentView('edit');
        }}
      />
    );
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

  return (
    <div className="space-y-2.5">
      <CustomerHeader onOpenAddModal={() => setCurrentView('add')} />
      <CustomerStatsCards />
      <CustomerFilters />
      <CustomerTable
        onViewCustomer={(cust) => {
          setSelectedCustomer(cust);
          setCurrentView('view');
        }}
        onEditCustomer={(cust) => {
          setSelectedCustomer(cust);
          setCurrentView('edit');
        }}
      />
    </div>
  );
}

