import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import deliveryService from '@/services/deliveryService';

const DeliveryContext = createContext();

export function DeliveryProvider({ children }) {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliveryService.getDeliveries();
      const list = Array.isArray(data) ? data : data?.deliveries || [];
      const normalized = list.map((d) => ({
        ...d,
        id: d._id || d.id,
      }));
      setDeliveries(normalized);
    } catch (err) {
      console.error('Failed to fetch deliveries from API:', err);
      setError(err.message || 'Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const addDelivery = async (data) => {
    try {
      const todayISO = new Date().toISOString().split('T')[0];
      const payload = {
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
        status: data.status || 'PENDING',
        bottlesReturned: Number(data.bottlesReturned) || 0,
      };

      const created = await deliveryService.createDelivery(payload);
      const normalized = {
        ...created,
        id: created._id || created.id || Date.now(),
      };
      setDeliveries((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Failed to create delivery via API:', err);
      throw err;
    }
  };

  const updateDelivery = async (id, data) => {
    setDeliveries((prev) =>
      prev.map((d) => ((d._id || d.id) === id ? { ...d, ...data } : d))
    );
  };

  const updateDeliveryStatus = async (id, status) => {
    try {
      await deliveryService.updateDeliveryStatus(id, status);
      const isDelivered = status === 'DELIVERED';
      setDeliveries((prev) =>
        prev.map((d) =>
          (d._id || d.id) === id
            ? {
                ...d,
                status,
                deliveredAt: isDelivered ? new Date().toISOString() : null,
              }
            : d
        )
      );
    } catch (err) {
      console.error('Failed to update delivery status:', err);
    }
  };

  const deleteDelivery = (id) => {
    setDeliveries((prev) => prev.filter((d) => (d._id || d.id) !== id));
  };

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        isLoading,
        error,
        refreshDeliveries: fetchDeliveries,
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

export default DeliveryContext;
