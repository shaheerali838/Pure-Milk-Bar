import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '@/services/customerService';

const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Fetch live customer records from backend
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomers();
      const list = Array.isArray(data) ? data : data?.customers || [];
      // Normalize _id to id if needed
      const normalized = list.map((c) => ({
        ...c,
        id: c._id || c.id,
        deliveryFee: Number(c.deliveryFee) || 0,
        khataBalance: Number(c.currentBalance !== undefined ? c.currentBalance : (c.khataBalance || 0)),
        currentBalance: Number(c.currentBalance !== undefined ? c.currentBalance : (c.khataBalance || 0)),
        openingBalance: Number(c.openingBalance) || 0,
      }));
      setCustomers(normalized);
    } catch (err) {
      console.error('Failed to fetch live customers from API:', err);
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = async (newCust) => {
    try {
      const payload = {
        name: newCust.name,
        phone: newCust.phone,
        secondaryPhone: newCust.secondaryPhone || '',
        cnicNumber: newCust.cnicNumber || '',
        address: newCust.address || '',
        area: newCust.area || '',
        shift: newCust.shift || 'Morning',
        referenceName: newCust.referenceName || '',
        subscription: newCust.subscription || '2 L Cow Milk',
        creditLimit: Number(newCust.creditLimit) || 10000,
        deliveryFee: Number(newCust.deliveryFee) || 0,
        openingBalance: Number(newCust.openingBalance) || 0,
        openingPaymentMethod: newCust.openingPaymentMethod || 'CASH',
        paymentMode:
          newCust.paymentMode === 'EasyPaisa' || newCust.paymentMode === 'JazzCash'
            ? 'Online Payment'
            : newCust.paymentMode || 'Khata',
        status: newCust.status || 'Active',
        image: newCust.image || null,
      };

      const created = await customerService.createCustomer(payload);
      const normalized = {
        ...created,
        id: created._id || created.id || Date.now(),
        deliveryFee: Number(created.deliveryFee || newCust.deliveryFee) || 0,
        image: created.image || newCust.image || null,
      };
      setCustomers((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Failed to create customer via API:', err);
      throw err;
    }
  };

  const updateCustomer = async (updatedCust, skipBackend = false) => {
    const id = updatedCust._id || updatedCust.id;
    // Immediate React state update for responsive UI
    setCustomers((prev) =>
      prev.map((c) =>
        String(c._id || c.id) === String(id)
          ? {
              ...c,
              ...updatedCust,
              khataBalance: Number(
                updatedCust.khataBalance ?? updatedCust.currentBalance ?? c.khataBalance ?? 0
              ),
              currentBalance: Number(
                updatedCust.currentBalance ?? updatedCust.khataBalance ?? c.currentBalance ?? 0
              ),
              deliveryFee:
                updatedCust.deliveryFee !== undefined
                  ? Number(updatedCust.deliveryFee) || 0
                  : c.deliveryFee,
            }
          : c
      )
    );

    if (!skipBackend) {
      const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
      if (isObjectId(String(id))) {
        try {
          await customerService.updateCustomer(id, {
            ...updatedCust,
            deliveryFee:
              updatedCust.deliveryFee !== undefined ? Number(updatedCust.deliveryFee) || 0 : undefined,
          });
        } catch (err) {
          console.warn('Backend customer update failed:', err.message);
        }
      }
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await customerService.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error('Failed to delete customer via API:', err);
      throw err;
    }
  };

  const updateCreditLimitBatch = async (newLimit) => {
    if (!newLimit || isNaN(newLimit)) return;
    try {
      const promises = customers.map((c) =>
        customerService.updateCreditLimit(c._id || c.id, Number(newLimit))
      );
      await Promise.allSettled(promises);
      setCustomers((prev) =>
        prev.map((c) => ({
          ...c,
          creditLimit: Number(newLimit),
        }))
      );
    } catch (err) {
      console.error('Failed to batch update credit limits:', err);
    }
  };

  const totalKhataReceivable = customers.reduce(
    (acc, c) => acc + (Number(c.khataBalance || c.currentBalance) || 0),
    0
  );
  const activeAccountsCount = customers.filter(
    (c) => (c.status || '').toLowerCase() === 'active'
  ).length;
  const withKhataBalCount = customers.filter(
    (c) => Number(c.khataBalance || c.currentBalance) > 0
  ).length;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.area && c.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.onlineAccount && c.onlineAccount.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'All Status' ||
      (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <CustomerContext.Provider
      value={{
        customers: filteredCustomers,
        rawCustomers: customers,
        isLoading,
        error,
        refreshCustomers: fetchCustomers,
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
        deleteCustomer,
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

export default CustomerContext;
