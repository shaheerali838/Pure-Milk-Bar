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
        route: data.route ? data.route.trim() : 'Standard Delivery',
        riderNameSnapshot: data.riderNameSnapshot ? data.riderNameSnapshot.trim() : null,
        riderId: data.riderId || null,
        staffType: data.staffType || 'MOTORCYCLE_RIDER',
        customerName: data.customerName ? data.customerName.trim() : 'Walk-in / Guest Delivery',
        deliveryAddress: data.deliveryAddress ? data.deliveryAddress.trim() : '',
        itemDescription: data.itemDescription ? data.itemDescription.trim() : 'Dairy Delivery',
        qtyLiters: Number(data.qtyLiters) || 0,
        paymentMode: data.paymentMode || 'CASH',
        codAmountToCollect: Number(data.codAmountToCollect) || 0,
        items: Array.isArray(data.items) ? data.items : [],
        amountPaid: Number(data.amountPaid) || 0,
        amountDue: Number(data.amountDue) || 0,
        paymentStatus: data.paymentStatus || 'UNPAID',
        source: data.source || 'SCHEDULED_ROUTE',
        linkedOrderId: data.linkedOrderId || null,
        receiptNumber: data.receiptNumber || null,
        status: data.status || 'PENDING',
        bottlesReturned: Number(data.bottlesReturned) || 0,
      };

      // Only add customerId if it's a valid ID
      if (data.customerId) {
        payload.customerId = data.customerId;
      }

      const created = await deliveryService.createDelivery(payload);
      const deliveryDoc = created?.deliveryRun || created;
      const normalized = {
        ...deliveryDoc,
        id: deliveryDoc._id || deliveryDoc.id || Date.now(),
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
    try {
      await deliveryService.updateDelivery(id, data);
    } catch (err) {
      console.warn('Failed to update delivery on API:', err.message);
    }
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

  const deleteDelivery = async (id) => {
    setDeliveries((prev) => prev.filter((d) => (d._id || d.id) !== id && d.id !== id));
    try {
      await deliveryService.deleteDelivery(id);
    } catch (err) {
      console.warn('Failed to delete delivery on API:', err.message);
    }
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
