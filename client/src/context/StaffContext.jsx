import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import adminService from '@/services/adminService';

const StaffContext = createContext();

export function StaffProvider({ children }) {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getStaff();
      const list = Array.isArray(data) ? data : data?.staff || [];
      const normalized = list.map((m) => ({
        ...m,
        id: m._id || m.id,
      }));
      setStaffList(normalized);
    } catch (err) {
      console.warn('Failed to fetch staff from API:', err.message);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const addStaff = async (data) => {
    try {
      const payload = {
        name: (data.name || '').trim(),
        role: data.role || 'Farm Work Man',
        mobile: (data.mobile || data.phone || '').trim(),
        email: (data.email || '').trim(),
        shift: data.shift || 'Morning',
        monthlySalary: Number(data.monthlySalary) || 0,
        cnic: (data.cnic || '').trim(),
        route: (data.route || '').trim() || 'Not Assigned',
        status: data.status || 'Active',
      };

      const created = await adminService.createStaff(payload);
      const normalized = {
        ...created,
        id: created._id || created.id || `STF-${Date.now()}`,
        dailySalary: Math.round((Number(payload.monthlySalary) || 0) / 30),
      };

      setStaffList((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Failed to create staff via API:', err);
      throw err;
    }
  };

  const updateStaff = async (id, data) => {
    try {
      await adminService.updateStaff(id, data);
      setStaffList((prev) =>
        prev.map((member) => ((member._id || member.id) === id ? { ...member, ...data } : member))
      );
    } catch (err) {
      console.error('Failed to update staff via API:', err);
      throw err;
    }
  };

  const deleteStaff = async (id) => {
    try {
      await adminService.deleteStaff(id);
      setStaffList((prev) => prev.filter((member) => (member._id || member.id) !== id));
    } catch (err) {
      console.error('Failed to delete staff via API:', err);
      throw err;
    }
  };

  // Dynamic live metrics derived from actual staff records
  const metrics = useMemo(() => {
    const totalStaff = staffList.length;
    const monthlySalaries = staffList.reduce(
      (sum, s) => sum + (Number(s.monthlySalary || s.salary) || 0),
      0
    );
    const totalDeliveryMen = staffList.filter((s) => {
      const r = (s.role || '').toLowerCase();
      return r.includes('delivery') || r.includes('rider');
    }).length;

    const totalFarmWorkers = staffList.filter((s) => {
      const r = (s.role || '').toLowerCase();
      return r.includes('farm') || r.includes('milker') || r.includes('herd') || r.includes('work');
    }).length;

    const totalSecurityGuards = staffList.filter((s) => {
      const r = (s.role || '').toLowerCase();
      return r.includes('guard') || r.includes('security');
    }).length;

    return {
      totalStaff,
      monthlySalaries,
      totalDeliveryMen,
      totalFarmWorkers,
      totalSecurityGuards,
    };
  }, [staffList]);

  return (
    <StaffContext.Provider
      value={{
        staffList,
        metrics,
        isLoading,
        error,
        refreshStaff: fetchStaff,
        addStaff,
        updateStaff,
        deleteStaff,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaffContext must be used within a StaffProvider');
  }
  return context;
}

export default StaffContext;
