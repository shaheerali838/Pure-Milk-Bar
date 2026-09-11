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
    const customerId = Date.now();
    const initialBalance = Number(newCust.khataBalance) || 0;
    const today = new Date().toISOString().split('T')[0];

    const customerToAdd = {
      id: customerId,
      status: 'Active',
      paymentMode: newCust.paymentMode === 'EasyPaisa' || newCust.paymentMode === 'JazzCash' ? 'Online Payment' : newCust.paymentMode || 'Khata',
      creditLimit: 10000,
      khataBalance: initialBalance,
      openingBalance: initialBalance,
      createdAt: today,
      ...newCust,
    };

    setCustomers((prev) => [customerToAdd, ...prev]);
  };

  const updateCustomer = (updatedCust) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? { ...c, ...updatedCust } : c))
    );
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
        rawCustomers: customers,
        allCustomersCount: customers.length,
        activeAccountsCount,
        withKhataBalCount,
        totalKhataReceivable,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        addCustomer,
        updateCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  return useContext(CustomerContext);
}
