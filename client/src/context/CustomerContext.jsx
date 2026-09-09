import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_customers';

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load customers from localStorage:', err);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (err) {
      console.error('Failed to save customers to localStorage:', err);
    }
  }, [customers]);

  const addCustomer = (newCust) => {
    const customerToAdd = {
      id: Date.now(),
      status: 'Active',
      paymentMode: 'Khata',
      creditLimit: 10000,
      khataBalance: 0,
      ...newCust,
    };
    setCustomers((prev) => [customerToAdd, ...prev]);
  };

  const totalKhataReceivable = customers.reduce((acc, c) => acc + (Number(c.khataBalance) || 0), 0);
  const activeAccountsCount = customers.filter((c) => c.status === 'Active').length;
  const withKhataBalCount = customers.filter((c) => Number(c.khataBalance) > 0).length;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.area && c.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.onlineAccount && c.onlineAccount.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'All Status' || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <CustomerContext.Provider
      value={{
        customers: filteredCustomers,
        allCustomersCount: customers.length,
        activeAccountsCount,
        withKhataBalCount,
        totalKhataReceivable,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        addCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  return useContext(CustomerContext);
}
