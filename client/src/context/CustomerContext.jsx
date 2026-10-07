import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService.js';

const CustomerContext = createContext();

export const getCustomerDueBalance = (c) => {
  if (!c) return 0;

  // Direct explicit balances from database
  if (c.currentBalance !== undefined && c.currentBalance !== null && !isNaN(Number(c.currentBalance))) {
    return Math.max(0, Number(c.currentBalance));
  }
  if (c.khataBalance !== undefined && c.khataBalance !== null && !isNaN(Number(c.khataBalance))) {
    return Math.max(0, Number(c.khataBalance));
  }

  // Fallback to opening balance only if explicit balance field is not present
  const openingBal = Number(c.openingBalance) || 0;
  const openingMethod = String(c.openingPaymentMethod || '').toUpperCase();
  const isAdvance = openingMethod.includes('ADVANCE') || openingMethod === 'CASH' || openingMethod === 'ONLINE';
  if (openingBal > 0 && !isAdvance) {
    return openingBal;
  }

  return 0;
};

export const getCustomerSubscription = (customer) => {
  const standing = customer?.standingOrder || {};
  const formatItems = (items) => (items || [])
    .filter((item) => Number(item.qty || item.quantity) > 0)
    .map((item) => `${Number(item.qty || item.quantity)} ${item.unit || 'L'} ${item.name || 'Product'}`)
    .join(' + ');

  const morning = formatItems(customer?.morningItems || standing.morningItems);
  const evening = formatItems(customer?.eveningItems || standing.eveningItems);
  const summary = [
    morning ? `Morning: ${morning}` : '',
    evening ? `Evening: ${evening}` : '',
  ].filter(Boolean).join(' | ');

  return summary || customer?.subscription || '';
};

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
      const data = await customerService.getCustomers({ limit: 1000 });
      const list = Array.isArray(data) ? data : data?.customers || [];
      // Normalize _id to id if needed
      const normalized = list.map((c) => {
        const computedDue = getCustomerDueBalance(c);
        const parsedFee = c.deliveryFee !== undefined && c.deliveryFee !== null && c.deliveryFee !== ''
          ? Number(c.deliveryFee)
          : (c.standingOrder?.deliveryFee !== undefined && c.standingOrder?.deliveryFee !== null && c.standingOrder?.deliveryFee !== '' ? Number(c.standingOrder.deliveryFee) : null);
        return {
          ...c,
          id: c._id || c.id,
          subscription: getCustomerSubscription(c),
          deliveryFee: parsedFee,
          morningMilkQty: Number(c.morningMilkQty || c.standingOrder?.morningMilkQty || 0),
          eveningMilkQty: Number(c.eveningMilkQty || c.standingOrder?.eveningMilkQty || 0),
          morningItems: c.morningItems || c.standingOrder?.morningItems || [],
          eveningItems: c.eveningItems || c.standingOrder?.eveningItems || [],
          autoAssignRider: Boolean(c.autoAssignRider ?? c.standingOrder?.autoAssignRider),
          preferredRiderId: c.preferredRiderId || c.standingOrder?.preferredRiderId || null,
          standingOrder: c.standingOrder || {
            morningMilkQty: Number(c.morningMilkQty || 0),
            eveningMilkQty: Number(c.eveningMilkQty || 0),
            morningItems: c.morningItems || [],
            eveningItems: c.eveningItems || [],
            autoAssignRider: Boolean(c.autoAssignRider),
            preferredRiderId: c.preferredRiderId || null,
            deliveryFee: parsedFee,
          },
          khataBalance: computedDue,
          currentBalance: computedDue,
          openingBalance: Number(c.openingBalance) || 0,
        };
      });
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
      const parsedFee = newCust.deliveryFee !== '' && newCust.deliveryFee !== null && newCust.deliveryFee !== undefined && !isNaN(Number(newCust.deliveryFee))
        ? Number(newCust.deliveryFee)
        : null;

      const payload = {
        name: newCust.name,
        phone: newCust.phone,
        secondaryPhone: newCust.secondaryPhone || '',
        cnicNumber: newCust.cnicNumber || '',
        address: newCust.address || '',
        area: newCust.area || '',
        shift: newCust.shift || 'Morning',
        referenceName: newCust.referenceName || '',
        subscription: getCustomerSubscription(newCust),
        creditLimit: Number(newCust.creditLimit) || 10000,
        deliveryFee: parsedFee,
        morningMilkQty: Number(newCust.morningMilkQty) || 0,
        eveningMilkQty: Number(newCust.eveningMilkQty) || 0,
        morningItems: newCust.morningItems || [],
        eveningItems: newCust.eveningItems || [],
        standingOrder: newCust.standingOrder || {
          morningMilkQty: Number(newCust.morningMilkQty) || 0,
          eveningMilkQty: Number(newCust.eveningMilkQty) || 0,
          morningItems: newCust.morningItems || [],
          eveningItems: newCust.eveningItems || [],
          deliveryFee: parsedFee,
        },
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
        deliveryFee: parsedFee,
        morningMilkQty: Number(created.morningMilkQty ?? payload.morningMilkQty),
        eveningMilkQty: Number(created.eveningMilkQty ?? payload.eveningMilkQty),
        morningItems: created.morningItems || payload.morningItems,
        eveningItems: created.eveningItems || payload.eveningItems,
        subscription: getCustomerSubscription({
          ...created,
          morningItems: created.morningItems || payload.morningItems,
          eveningItems: created.eveningItems || payload.eveningItems,
          subscription: created.subscription || payload.subscription,
        }),
        autoAssignRider: Boolean(created.autoAssignRider ?? payload.autoAssignRider),
        preferredRiderId: created.preferredRiderId || payload.preferredRiderId,
        standingOrder: created.standingOrder || payload.standingOrder,
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
    const parsedFee = updatedCust.deliveryFee !== '' && updatedCust.deliveryFee !== null && updatedCust.deliveryFee !== undefined
      ? (isNaN(Number(updatedCust.deliveryFee)) ? null : Number(updatedCust.deliveryFee))
      : null;

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
              deliveryFee: updatedCust.deliveryFee !== undefined ? parsedFee : c.deliveryFee,
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
            deliveryFee: updatedCust.deliveryFee !== undefined ? parsedFee : undefined,
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
    (acc, c) => acc + getCustomerDueBalance(c),
    0
  );
  const activeAccountsCount = customers.filter(
    (c) => (c.status || '').toLowerCase() === 'active'
  ).length;
  const withKhataBalCount = customers.filter(
    (c) => getCustomerDueBalance(c) > 0
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
