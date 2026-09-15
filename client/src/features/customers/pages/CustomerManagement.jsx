import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/Customer_&_Accounts/CustomerHeader';
import CustomerStatsCards from '../components/Customer_&_Accounts/CustomerStatsCards';
import CustomerFilters from '../components/Customer_&_Accounts/CustomerFilters';
import CustomerTable from '../components/Customer_&_Accounts/CustomerTable';
import AddNewCustomerView from '../components/Customer_&_Accounts/AddNewCustomerView';
import EditCustomerView from '../components/Customer_&_Accounts/EditCustomerView';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'add' | 'edit'
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

  return (
    <div className="space-y-2.5">
      <CustomerHeader onOpenAddModal={() => setCurrentView('add')} />
      <CustomerStatsCards />
      <CustomerFilters />
      <CustomerTable
        onViewCustomer={(cust) => {
          navigate(`/customer-khata-ledger?customerId=${cust.id}`);
        }}
        onEditCustomer={(cust) => {
          setSelectedCustomer(cust);
          setCurrentView('edit');
        }}
      />
    </div>
  );
}

