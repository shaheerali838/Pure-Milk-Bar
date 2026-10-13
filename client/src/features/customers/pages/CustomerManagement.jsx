import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
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

  useEffect(() => {
    if (actionParam === 'add') {
      setCurrentView('add');
    }
  }, [actionParam]);

  const handleBackToList = () => {
    if (searchParams.has('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
    setSelectedCustomer(null);
    setCurrentView('list');
  };

  if (currentView === 'add') {
    return <AddNewCustomerView onBack={handleBackToList} />;
  }

  if (currentView === 'edit' && selectedCustomer) {
    return (
      <EditCustomerView
        customer={selectedCustomer}
        onBack={handleBackToList}
      />
    );
  }

  if (currentView === 'advance') {
    return (
      <CustomerAdvancePaymentsView
        onBack={handleBackToList}
        onOpenAddCustomer={() => setCurrentView('add')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <DateHeader date={selectedDate} setDate={handleDateChange} />
      <CustomerHeader onOpenAddModal={() => setCurrentView('add')} />
      <CustomerStatsCards onOpenAdvanceDetails={() => setCurrentView('advance')} />

      {/* Customer Directory Table Section with Clean Controls */}
      <div className="space-y-3 pt-2">
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
    </div>
  );
}
