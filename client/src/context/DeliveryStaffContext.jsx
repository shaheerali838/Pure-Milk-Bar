import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useStaffContext } from './StaffContext';

const DeliveryStaffContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_delivery_staff';

const isDeliveryRole = (role = '') => {
  const r = (role || '').toLowerCase();
  return (
    r.includes('delivery') ||
    r.includes('rider') ||
    r.includes('driver') ||
    r.includes('courier') ||
    r.includes('fleet') ||
    r.includes('boy') ||
    r.includes('van') ||
    r.includes('walk') ||
    r.includes('distribut') ||
    r.includes('loader') ||
    r.includes('milkman')
  );
};

export function DeliveryStaffProvider({ children }) {
  const staffContext = useStaffContext();
  const globalStaffList = staffContext?.staffList || [];

  const [deliveryStaffList, setDeliveryStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (err) {
      console.error('Failed to load delivery staff from localStorage:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveryStaffList));
    } catch (err) {
      console.error('Failed to save delivery staff to localStorage:', err);
    }
  }, [deliveryStaffList]);

  // Combined staff list: combines Staff & Payroll delivery staff + delivery-specific entries
  const staffList = useMemo(() => {
    const deliveryStaffFromMain = globalStaffList
      .filter((s) => isDeliveryRole(s.role))
      .map((s) => {
        // Check if there is extra delivery metadata (e.g. vehicle, type) saved in deliveryStaffList
        const matchedLocal = deliveryStaffList.find(
          (d) =>
            String(d.id) === String(s.id) ||
            (d.name && s.name && d.name.toLowerCase().trim() === s.name.toLowerCase().trim())
        );

        const isWalking =
          (s.role || '').toLowerCase().includes('walk') || matchedLocal?.type === 'WALKING';

        return {
          id: s.id,
          name: s.name,
          phone: s.mobile || s.phone || matchedLocal?.phone || '',
          type: isWalking ? 'WALKING' : matchedLocal?.type || 'RIDER',
          vehicle: matchedLocal?.vehicle || (isWalking ? 'On Foot' : 'Motorbike'),
          route:
            s.route && s.route !== 'Not Assigned'
              ? s.route
              : matchedLocal?.route || 'General Delivery Area',
          active: s.status
            ? s.status === 'Active'
            : matchedLocal?.active !== undefined
            ? matchedLocal.active
            : true,
          createdAt: s.joinedDate || matchedLocal?.createdAt || new Date().toISOString(),
          monthlySalary: Number(s.monthlySalary) || Number(matchedLocal?.monthlySalary) || 0,
          role: s.role || (isWalking ? 'Walking Delivery Boy' : 'Delivery Man / Milk Rider'),
          cnic: s.cnic || matchedLocal?.cnic || '',
          shift: s.shift || matchedLocal?.shift || 'Morning',
          notes: s.notes || matchedLocal?.notes || '',
        };
      });

    // Also include any delivery staff registered only in local delivery storage (if not in main)
    const extraLocal = deliveryStaffList.filter(
      (d) =>
        !deliveryStaffFromMain.some(
          (m) =>
            String(m.id) === String(d.id) ||
            (m.name && d.name && m.name.toLowerCase().trim() === d.name.toLowerCase().trim())
        )
    );

    return [...deliveryStaffFromMain, ...extraLocal];
  }, [globalStaffList, deliveryStaffList]);

  const addStaff = useCallback(
    (data) => {
      const nextNum = staffList.length + 1;
      const nextId = `RDR-${String(nextNum).padStart(3, '0')}`;

      const newStaff = {
        id: nextId,
        name: data.name ? data.name.trim() : '',
        phone: (data.phone || data.mobile || '').trim(),
        type: data.type || 'RIDER',
        vehicle:
          data.vehicle ? data.vehicle.trim() : data.type === 'WALKING' ? 'On Foot' : 'Motorbike',
        route: data.route ? data.route.trim() : 'General Delivery Area',
        active: data.active !== undefined ? data.active : true,
        createdAt: new Date().toISOString(),
        monthlySalary: Number(data.monthlySalary) || 0,
        role:
          data.role ||
          (data.type === 'WALKING' ? 'Walking Delivery Boy' : 'Delivery Man / Milk Rider'),
      };

      setDeliveryStaffList((prev) => [newStaff, ...prev]);

      // Also propagate to global StaffContext if available
      if (staffContext?.addStaff) {
        staffContext.addStaff({
          name: newStaff.name,
          role: newStaff.role,
          mobile: newStaff.phone,
          shift: data.shift || 'Morning',
          monthlySalary: newStaff.monthlySalary,
          route: newStaff.route,
          status: newStaff.active ? 'Active' : 'Inactive',
          notes: data.vehicle ? `Vehicle: ${data.vehicle}` : '',
        });
      }

      return newStaff;
    },
    [staffList.length, staffContext]
  );

  const updateStaff = useCallback(
    (id, data) => {
      setDeliveryStaffList((prev) =>
        prev.map((s) => (String(s.id) === String(id) ? { ...s, ...data } : s))
      );

      if (staffContext?.updateStaff) {
        staffContext.updateStaff(id, {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.phone !== undefined && { mobile: data.phone }),
          ...(data.mobile !== undefined && { mobile: data.mobile }),
          ...(data.route !== undefined && { route: data.route }),
          ...(data.active !== undefined && { status: data.active ? 'Active' : 'Inactive' }),
          ...(data.monthlySalary !== undefined && {
            monthlySalary: Number(data.monthlySalary) || 0,
          }),
        });
      }
    },
    [staffContext]
  );

  const toggleStaffActive = useCallback(
    (id) => {
      const target = staffList.find((s) => String(s.id) === String(id));
      const newActive = target ? !target.active : true;

      setDeliveryStaffList((prev) => {
        const exists = prev.some((s) => String(s.id) === String(id));
        if (exists) {
          return prev.map((s) =>
            String(s.id) === String(id) ? { ...s, active: newActive } : s
          );
        } else if (target) {
          return [{ ...target, active: newActive }, ...prev];
        }
        return prev;
      });

      if (staffContext?.updateStaff && target) {
        staffContext.updateStaff(id, {
          status: newActive ? 'Active' : 'Inactive',
        });
      }
    },
    [staffList, staffContext]
  );

  const deleteStaff = useCallback(
    (id) => {
      setDeliveryStaffList((prev) => prev.filter((s) => String(s.id) !== String(id)));

      if (staffContext?.deleteStaff) {
        staffContext.deleteStaff(id);
      }
    },
    [staffContext]
  );

  return (
    <DeliveryStaffContext.Provider
      value={{
        staffList,
        addStaff,
        updateStaff,
        toggleStaffActive,
        deleteStaff,
      }}
    >
      {children}
    </DeliveryStaffContext.Provider>
  );
}

export function useDeliveryStaffContext() {
  const context = useContext(DeliveryStaffContext);
  if (!context) {
    throw new Error('useDeliveryStaffContext must be used within a DeliveryStaffProvider');
  }
  return context;
}

export { DeliveryStaffContext };
export default DeliveryStaffProvider;
