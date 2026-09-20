import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();
const STORAGE_KEY = 'pure_milk_bar_customers';

const DEFAULT_CUSTOMERS = [
  {
    id: 1,
    name: 'Haji Muhammad Aslam',
    phone: '0300-1234567',
    secondaryPhone: '0321-7654321',
    onlineAccount: '0300-1234567',
    cnicNumber: '35201-1234567-1',
    idType: 'CNIC',
    verificationStatus: 'Verified',
    address: 'House #12, Street 4, Block B, Model Town, Lahore',
    area: 'Model Town',
    shift: 'Morning',
    referenceName: 'Malik Tariq (Dairy Partner)',
    subscription: '2 L Cow Milk',
    creditLimit: 15000,
    khataBalance: 3200,
    openingBalance: 1000,
    paymentMode: 'Khata',
    status: 'Active',
    createdAt: '2026-08-01',
  },
  {
    id: 2,
    name: 'Chaudhry Rashid Gujjar',
    phone: '0301-9876543',
    secondaryPhone: '',
    onlineAccount: '0301-9876543',
    cnicNumber: '35202-9876543-3',
    idType: 'CNIC',
    verificationStatus: 'Verified',
    address: 'Kothi #88, Cavalry Ground, Lahore Cantt',
    area: 'Cavalry Ground',
    shift: 'Evening',
    referenceName: 'Direct Walk-in Regular',
    subscription: '3 L Buffalo Milk',
    creditLimit: 20000,
    khataBalance: 5800,
    openingBalance: 2000,
    paymentMode: 'Khata',
    status: 'Active',
    createdAt: '2026-08-10',
  },
  {
    id: 3,
    name: 'Dr. Tariq Mehmood',
    phone: '0333-5554433',
    secondaryPhone: '0345-1122334',
    onlineAccount: '0333-5554433',
    cnicNumber: '35201-5554433-5',
    idType: 'CNIC',
    verificationStatus: 'Verified',
    address: 'Apartment 4B, Gulberg Heights, Gulberg III, Lahore',
    area: 'Gulberg III',
    shift: 'Morning',
    referenceName: 'Dr. Farooq (Clinic)',
    subscription: '1.5 L Cow Milk',
    creditLimit: 10000,
    khataBalance: 0,
    openingBalance: 0,
    paymentMode: 'Online Payment',
    status: 'Active',
    createdAt: '2026-08-15',
  },
  {
    id: 4,
    name: 'Mian Bilal Ahsan',
    phone: '0322-4433221',
    secondaryPhone: '',
    onlineAccount: '0322-4433221',
    cnicNumber: '35200-4433221-7',
    idType: 'CNIC',
    verificationStatus: 'Verified',
    address: 'House #45, Sector F, DHA Phase 5, Lahore',
    area: 'DHA Phase 5',
    shift: 'Morning',
    referenceName: 'Sheikh Imran',
    subscription: '4 L Mixed Milk',
    creditLimit: 25000,
    khataBalance: 12400,
    openingBalance: 5000,
    paymentMode: 'Khata',
    status: 'Active',
    createdAt: '2026-08-20',
  },
];

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_CUSTOMERS;
    } catch (err) {
      console.error('Failed to load customers from localStorage:', err);
      return DEFAULT_CUSTOMERS;
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

  const updateCreditLimitBatch = (newLimit) => {
    if (!newLimit || isNaN(newLimit)) return;
    setCustomers((prev) =>
      prev.map((c) => ({
        ...c,
        creditLimit: Number(newLimit),
      }))
    );
  };

  return (
    <CustomerContext.Provider
      value={{
        customers: filteredCustomers,
        rawCustomers: customers,
        setCustomers,
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
        updateCreditLimitBatch,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  return useContext(CustomerContext);
}
