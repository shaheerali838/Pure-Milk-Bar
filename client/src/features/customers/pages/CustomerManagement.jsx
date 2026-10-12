import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomerHeader from '../components/Customer_&_Accounts/CustomerHeader';
import CustomerStatsCards from '../components/Customer_&_Accounts/CustomerStatsCards';
import CustomerFilters from '../components/Customer_&_Accounts/CustomerFilters';
import CustomerTable from '../components/Customer_&_Accounts/CustomerTable';
import AddNewCustomerView from '../components/Customer_&_Accounts/AddNewCustomerView';
import EditCustomerView from '../components/Customer_&_Accounts/EditCustomerView';
import CustomerAdvancePaymentsView from '../components/Customer_&_Accounts/CustomerAdvancePaymentsView';
import DateHeader from '@/components/common/DateHeader';
import { useGlobalDate } from '@/context/GlobalDateContext';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { globalDate, setGlobalDate, setToday } = useGlobalDate();

  // Strict "Starts with Today" initialization
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    if (typeof setToday === 'function') {
      setToday();
    }
  }, [location.pathname]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (typeof setGlobalDate === 'function') {
      setGlobalDate(newDate);
    }
  };

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
    <div className="space-y-2.5">
      <DateHeader date={selectedDate} setDate={handleDateChange} />
      <CustomerHeader onOpenAddModal={() => setCurrentView('add')} />
      <CustomerStatsCards onOpenAdvanceDetails={() => setCurrentView('advance')} />
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

