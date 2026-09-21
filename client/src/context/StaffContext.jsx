import React, { createContext, useContext, useState, useEffect } from 'react';

const StaffContext = createContext();

const STORAGE_KEY_STAFF = 'pure_milk_bar_staff';

export function StaffProvider({ children }) {
  // 1. Staff List State strictly synced with LocalStorage (NO dummy data)
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAFF);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error('Error loading staff from localStorage:', error);
    }
    return []; // Start empty if no records in localStorage
  });

  // Sync with LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffList));
    } catch (error) {
      console.error('Error saving staff to localStorage:', error);
    }
  }, [staffList]);

  // 2. Add New Staff Member
  const addStaff = (data) => {
    const nextNum = staffList.length + 1;
    const staffId = `STF-${String(nextNum).padStart(3, '0')}`;

    const newMember = {
      id: staffId,
      name: (data.name || '').trim(),
      role: data.role || 'Farm Work Man',
      mobile: (data.mobile || '').trim(),
      email: (data.email || '').trim(),
      shift: data.shift || 'Morning',
      monthlySalary: Number(data.monthlySalary) || 0,
      dailySalary: Math.round((Number(data.monthlySalary) || 0) / 30),
      cnic: (data.cnic || '').trim(),
      route: (data.route || '').trim() || 'Not Assigned',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      notes: (data.notes || '').trim(),
    };

    const updated = [newMember, ...staffList];
    setStaffList(updated);
    return newMember;
  };

  // 3. Update Existing Staff Member
  const updateStaff = (id, data) => {
    const updated = staffList.map((member) => {
      const isMatch =
        String(member.id) === String(id) ||
        (data.name && member.name && member.name.toLowerCase().trim() === data.name.toLowerCase().trim());

      if (isMatch) {
        const nextSalary = data.monthlySalary !== undefined ? Number(data.monthlySalary) : Number(member.monthlySalary || 0);
        return {
          ...member,
          ...data,
          ...(data.name !== undefined && { name: (data.name || member.name).trim() }),
          ...(data.role !== undefined && { role: data.role ?? member.role }),
          ...(data.mobile !== undefined && { mobile: (data.mobile ?? member.mobile).trim() }),
          ...(data.email !== undefined && { email: (data.email ?? member.email).trim() }),
          ...(data.shift !== undefined && { shift: data.shift ?? member.shift }),
          ...(data.monthlySalary !== undefined && {
            monthlySalary: nextSalary,
            dailySalary: Math.round(nextSalary / 30),
          }),
          ...(data.cnic !== undefined && { cnic: (data.cnic ?? member.cnic).trim() }),
          ...(data.route !== undefined && { route: (data.route ?? member.route).trim() || 'Not Assigned' }),
          ...(data.status !== undefined && { status: data.status }),
        };
      }
      return member;
    });

    setStaffList(updated);
  };

  // 4. Toggle Staff Duty Status
  const toggleStaffStatus = (id) => {
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id)) {
          const currentIsActive =
            member.status !== 'Inactive' &&
            member.status !== 'Off Duty' &&
            member.active !== false;
          return {
            ...member,
            status: currentIsActive ? 'Inactive' : 'Active',
            active: !currentIsActive,
          };
        }
        return member;
      })
    );
  };

  // 5. Delete Staff Member
  const deleteStaff = (id) => {
    const updated = staffList.filter((member) => member.id !== id);
    setStaffList(updated);
  };

  // 6. Computed Metrics for Dashboard Cards
  const totalStaff = staffList.length;
  const monthlySalaries = staffList.reduce(
    (sum, member) => sum + (Number(member.monthlySalary) || 0),
    0
  );

  const totalDeliveryMen = staffList.filter((s) => {
    const role = (s.role || '').toLowerCase();
    return role.includes('delivery') || role.includes('rider');
  }).length;

  const totalFarmWorkers = staffList.filter((s) => {
    const role = (s.role || '').toLowerCase();
    return role.includes('farm');
  }).length;

  const totalSecurityGuards = staffList.filter((s) => {
    const role = (s.role || '').toLowerCase();
    return role.includes('security');
  }).length;

  const metrics = {
    totalStaff,
    monthlySalaries,
    totalDeliveryMen,
    totalFarmWorkers,
    totalSecurityGuards,
  };

  return (
    <StaffContext.Provider
      value={{
        staffList,
        addStaff,
        updateStaff,
        toggleStaffStatus,
        deleteStaff,
        metrics,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  if (!context) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAFF);
      const staffList = saved ? JSON.parse(saved) : [];
      const totalStaff = staffList.length;
      const totalFarmWorkers = staffList.filter((s) => (s.role || '').toLowerCase().includes('farm')).length;
      return {
        staffList,
        metrics: { totalStaff, totalFarmWorkers },
        addStaff: () => {},
        updateStaff: () => {},
        deleteStaff: () => {},
      };
    } catch {
      return { staffList: [], metrics: { totalStaff: 0, totalFarmWorkers: 0 } };
    }
  }
  return context;
}

export { StaffContext };
export default StaffProvider;
