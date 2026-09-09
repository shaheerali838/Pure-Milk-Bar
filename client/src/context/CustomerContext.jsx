import React, { createContext, useContext, useState } from 'react';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

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
