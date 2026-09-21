import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useStaffContext } from './StaffContext';

const DeliveryStaffContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_delivery_staff';

const isDeliveryRole = (role = '') => {
  const r = (role || '').toLowerCase().trim();
  if (!r) return false;
  // Strictly exclude non-delivery roles
  if (
    r.includes('farm') ||
    r.includes('security') ||
    r.includes('cashier') ||
    r.includes('accountant') ||
    r.includes('manager') ||
    r.includes('owner')
  ) {
    return false;
  }
  return (
    r.includes('delivery') ||
    r.includes('rider') ||
    r.includes('driver') ||
    r.includes('courier') ||
    r.includes('fleet') ||
    r.includes('walking boy')
  );
};

const isAssignedArea = (route = '') => {
  if (!route || typeof route !== 'string') return false;
  const r = route.trim().toLowerCase();
  return (
    r !== '' &&
    r !== 'not assigned' &&
    r !== 'unassigned' &&
    r !== 'none' &&
    r !== '-' &&
    r !== '—' &&
    r !== 'null' &&
    r !== 'undefined' &&
    r !== 'farm facility / general' &&
    r !== 'general delivery area'
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

  // Combined staff list: ONLY delivery staff who have an assigned area/route ("arr Assigned")
  // Excludes any other staff (Farm workers, Cashiers, etc.) and unassigned staff
  const staffList = useMemo(() => {
    const deliveryStaffFromMain = globalStaffList
      .filter((s) => {
        // 1. Must be a delivery role (not other staff)
        if (!isDeliveryRole(s.role)) return false;

        // Check if route is assigned in main staff or local metadata
        const matchedLocal = deliveryStaffList.find(
          (d) =>
            String(d.id) === String(s.id) ||
            (d.name && s.name && d.name.toLowerCase().trim() === s.name.toLowerCase().trim())
        );

        // 2. Must have an assigned route/area - NOT 'Not Assigned'
        return isAssignedArea(s.route) || isAssignedArea(matchedLocal?.route);
      })
      .map((s) => {
        const matchedLocal = deliveryStaffList.find(
          (d) =>
            String(d.id) === String(s.id) ||
            (d.name && s.name && d.name.toLowerCase().trim() === s.name.toLowerCase().trim())
        );

        const assignedRoute = isAssignedArea(s.route)
          ? s.route.trim()
          : isAssignedArea(matchedLocal?.route)
          ? matchedLocal.route.trim()
          : '';

        const isWalking =
          (s.role || '').toLowerCase().includes('walk') || matchedLocal?.type === 'WALKING';

        return {
          id: s.id,
          name: s.name,
          phone: s.mobile || s.phone || matchedLocal?.phone || '',
          type: isWalking ? 'WALKING' : matchedLocal?.type || 'RIDER',
          vehicle: matchedLocal?.vehicle || (isWalking ? 'On Foot' : 'Motorbike'),
          route: assignedRoute,
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

    // Also include any delivery staff registered only in local delivery storage (if not in main),
    // strictly ensuring they are delivery staff AND have an assigned route/area
    const extraLocal = deliveryStaffList.filter((d) => {
      const inMain = deliveryStaffFromMain.some(
        (m) =>
          String(m.id) === String(d.id) ||
          (m.name && d.name && m.name.toLowerCase().trim() === d.name.toLowerCase().trim())
      );
      if (inMain) return false;

      // Must be delivery role
      if (d.role && !isDeliveryRole(d.role)) return false;

      // Must have an assigned route/area
      return isAssignedArea(d.route);
    });

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
        route: (data.route || '').trim(),
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
        const exists = prev.some(
          (s) =>
            String(s.id) === String(id) ||
            (target?.name && s.name && s.name.toLowerCase().trim() === target.name.toLowerCase().trim())
        );
        if (exists) {
          return prev.map((s) =>
            String(s.id) === String(id) ||
            (target?.name && s.name && s.name.toLowerCase().trim() === target.name.toLowerCase().trim())
              ? { ...s, active: newActive }
              : s
          );
        } else if (target) {
          return [{ ...target, active: newActive }, ...prev];
        }
        return prev;
      });

      if (staffContext?.updateStaff && target) {
        staffContext.updateStaff(id, {
          name: target.name,
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
