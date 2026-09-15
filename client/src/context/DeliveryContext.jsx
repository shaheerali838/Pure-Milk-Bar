import React, { createContext, useContext, useState, useEffect } from 'react';

const DeliveryContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_deliveries';

const defaultDeliveries = [];

export function DeliveryProvider({ children }) {
  const [deliveries, setDeliveries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return defaultDeliveries;
    } catch (err) {
      console.error('Failed to load deliveries from localStorage:', err);
      return defaultDeliveries;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
    } catch (err) {
      console.error('Failed to save deliveries to localStorage:', err);
    }
  }, [deliveries]);

  const addDelivery = (data) => {
    const nextNumericId =
      deliveries.length > 0
        ? Math.max(...deliveries.map((d) => Number(d.id) || 0)) + 1
        : 1;

    const runCode = `RUN-${String(nextNumericId).padStart(4, '0')}`;
    const todayISO = new Date().toISOString().split('T')[0];

    const newDelivery = {
      id: nextNumericId,
      runCode,
      date: data.date || todayISO,
      shift: data.shift || 'MORNING',
      route: data.route ? data.route.trim() : '',
      riderNameSnapshot: data.riderNameSnapshot ? data.riderNameSnapshot.trim() : '',
      staffType: data.staffType || 'MOTORCYCLE_RIDER',
      customerId: data.customerId,
      customerName: data.customerName ? data.customerName.trim() : '',
      deliveryAddress: data.deliveryAddress ? data.deliveryAddress.trim() : '',
      itemDescription: data.itemDescription ? data.itemDescription.trim() : 'Fresh Milk',
      qtyLiters: Number(data.qtyLiters) || 1,
      paymentMode: data.paymentMode || 'CASH',
      codAmountToCollect:
        data.paymentMode === 'CASH' || data.paymentMode === 'ONLINE'
          ? Number(data.codAmountToCollect) || 0
          : 0,
      status: 'PENDING',
      deliveredAt: null,
      bottlesReturned: Number(data.bottlesReturned) || 0,
      createdAt: new Date().toISOString(),
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    return newDelivery;
  };

  const updateDelivery = (id, data) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...data } : d))
    );
  };

  const updateDeliveryStatus = (id, status) => {
    const isDelivered = status === 'DELIVERED';
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              deliveredAt: isDelivered ? new Date().toISOString() : null,
            }
          : d
      )
    );
  };

  const deleteDelivery = (id) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        addDelivery,
        updateDelivery,
        updateDeliveryStatus,
        deleteDelivery,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDeliveryContext() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDeliveryContext must be used within a DeliveryProvider');
  }
  return context;
}
