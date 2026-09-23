import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import adminService from '@/services/adminService';

const StaffContext = createContext();

export const generateDefaultAttendanceMap = (absentDays = 0, totalDays = 30) => {
  const map = {};
  const clampedAbsent = Math.max(0, Math.min(totalDays, Number(absentDays) || 0));
  const todayNum = Math.min(totalDays, Math.max(1, new Date().getDate()));

  for (let d = 1; d <= totalDays; d++) {
    map[d] = 'present';
  }

  if (clampedAbsent > 0) {
    let marked = 0;
    map[todayNum] = 'absent';
    marked++;
    for (let d = totalDays; d >= 1 && marked < clampedAbsent; d--) {
      if (d !== todayNum) {
        map[d] = 'absent';
        marked++;
      }
    }
  }

  return map;
};

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
      const normalized = list.map((m) => {
        const absent = Number(m.absentDays) || 0;
        return {
          ...m,
          id: m._id || m.id,
          dailySalary: Math.round((Number(m.monthlySalary || m.salary) || 0) / 30),
          absentDays: absent,
          presentDays: m.presentDays !== undefined ? Number(m.presentDays) : Math.max(0, 30 - absent),
          attendanceMap: m.attendanceMap && Object.keys(m.attendanceMap).length > 0
            ? m.attendanceMap
            : generateDefaultAttendanceMap(absent),
        };
      });
      setStaffList(normalized);
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(normalized));
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


  // 1. Add New Staff Member
  const addStaff = async (data) => {
    const nextNum = staffList.length + 1;
    const staffId = `STF-${String(nextNum).padStart(3, '0')}`;
    const absentDays = Number(data.absentDays) || 0;
    const monthlySalary = Number(data.monthlySalary || data.salary) || 0;

    const payload = {
      name: (data.name || '').trim(),
      role: data.role || 'Farm Work Man',
      mobile: (data.mobile || data.phone || '').trim(),
      email: (data.email || '').trim(),
      shift: data.shift || 'Morning',
      monthlySalary,
      cnic: (data.cnic || '').trim(),
      route: (data.route || '').trim() || 'Not Assigned',
      status: data.status || 'Active',
    };

    let backendStaff = null;
    try {
      backendStaff = await adminService.createStaff(payload);
    } catch (err) {
      console.warn('Backend API createStaff error, saving locally:', err.message);
    }

    const newMember = {
      ...payload,
      id: backendStaff?._id || backendStaff?.id || staffId,
      dailySalary: Math.round(monthlySalary / 30),
      active: data.status ? data.status === 'Active' : true,
      absentDays: absentDays,
      presentDays: Math.max(0, 30 - absentDays),
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      notes: (data.notes || '').trim(),
      attendanceMap: data.attendanceMap || generateDefaultAttendanceMap(absentDays),
    };

    const updated = [newMember, ...staffList];
    setStaffList(updated);
    return newMember;
  };

  // 2. Update Existing Staff Member
  const updateStaff = async (id, data) => {
    try {
      await adminService.updateStaff(id, data);
    } catch (err) {
      console.warn('Backend API updateStaff error, updating locally:', err.message);
    }

    setStaffList((prev) =>
      prev.map((member) => {
        const isMatch =
          String(member.id) === String(id) ||
          String(member._id) === String(id) ||
          (data.name && member.name && member.name.toLowerCase().trim() === data.name.toLowerCase().trim());

        if (isMatch) {
          const nextSalary = data.monthlySalary !== undefined ? Number(data.monthlySalary) : Number(member.monthlySalary || 0);
          const nextAbsent = data.absentDays !== undefined
            ? Math.max(0, Math.min(30, Number(data.absentDays)))
            : (member.absentDays !== undefined ? member.absentDays : (member.status === 'Inactive' ? 1 : 0));

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
            ...(data.status !== undefined && {
              status: data.status,
              active: data.status === 'Active',
            }),
            ...(data.attendanceMap !== undefined && { attendanceMap: data.attendanceMap }),
            absentDays: nextAbsent,
            presentDays: Math.max(0, 30 - nextAbsent),
          };
        }
        return member;
      })
    );
  };

  // 3. Delete Staff Member
  const deleteStaff = async (id) => {
    try {
      await adminService.deleteStaff(id);
    } catch (err) {
      console.warn('Backend API deleteStaff error, deleting locally:', err.message);
    }
    setStaffList((prev) => prev.filter((m) => String(m._id || m.id) !== String(id)));
  };

  // 4. Toggle Staff Duty Status (Active / Present vs Inactive / Absent)
  const toggleStaffStatus = (id) => {
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const currentIsActive =
            member.status !== 'Inactive' &&
            member.status !== 'Off Duty' &&
            member.active !== false;
          const nextStatus = currentIsActive ? 'Inactive' : 'Active';
          const nextAbsent = currentIsActive ? Math.max(1, member.absentDays || 1) : 0;
          const currentMap = member.attendanceMap && Object.keys(member.attendanceMap).length > 0
            ? { ...member.attendanceMap }
            : generateDefaultAttendanceMap(nextAbsent);
          const todayNum = Math.min(30, Math.max(1, new Date().getDate()));
          currentMap[todayNum] = nextStatus === 'Active' ? 'present' : 'absent';
          return {
            ...member,
            status: nextStatus,
            active: !currentIsActive,
            absentDays: nextAbsent,
            presentDays: Math.max(0, 30 - nextAbsent),
            attendanceMap: currentMap,
          };
        }
        return member;
      })
    );
  };

  // 5. Update Staff Attendance & Absent Days
  const setStaffAttendance = (id, { status, absentDays, attendanceMap }) => {
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const newStatus = status !== undefined ? status : member.status;
          let nextMap = attendanceMap;
          let nextAbsent = absentDays;

          if (nextMap) {
            nextAbsent = Object.values(nextMap).filter((v) => v === 'absent').length;
          } else {
            const currentMap = member.attendanceMap && Object.keys(member.attendanceMap).length > 0
              ? { ...member.attendanceMap }
              : generateDefaultAttendanceMap(member.absentDays || 0);

            const todayNum = Math.min(30, Math.max(1, new Date().getDate()));
            if (status === 'Active') {
              currentMap[todayNum] = 'present';
              if (absentDays === 0) {
                for (let d = 1; d <= 30; d++) currentMap[d] = 'present';
                nextAbsent = 0;
              } else if (absentDays !== undefined) {
                nextAbsent = Math.max(0, Math.min(30, Number(absentDays)));
              } else {
                nextAbsent = Object.values(currentMap).filter((v) => v === 'absent').length;
              }
            } else if (status === 'Inactive') {
              currentMap[todayNum] = 'absent';
              nextAbsent = Object.values(currentMap).filter((v) => v === 'absent').length;
              if (nextAbsent === 0) nextAbsent = 1;
            } else if (absentDays !== undefined) {
              nextAbsent = Math.max(0, Math.min(30, Number(absentDays)));
              for (let d = 1; d <= 30; d++) {
                currentMap[d] = d > 30 - nextAbsent ? 'absent' : 'present';
              }
            }
            nextMap = currentMap;
          }

          nextAbsent = Math.max(0, Math.min(30, Number(nextAbsent ?? 0)));

          return {
            ...member,
            status: newStatus,
            active: newStatus === 'Active',
            absentDays: nextAbsent,
            presentDays: Math.max(0, 30 - nextAbsent),
            attendanceMap: nextMap,
          };
        }
        return member;
      })
    );
  };

  // 6. Toggle Attendance for a specific day
  const toggleDayAttendance = (id, dayNum) => {
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const currentMap = member.attendanceMap && Object.keys(member.attendanceMap).length > 0
            ? { ...member.attendanceMap }
            : generateDefaultAttendanceMap(member.absentDays || 0);

          const currentVal = currentMap[dayNum] || 'present';
          let nextVal = 'present';
          if (currentVal === 'present') nextVal = 'leave';
          else if (currentVal === 'leave') nextVal = 'absent';
          else nextVal = 'present';

          currentMap[dayNum] = nextVal;

          const absentCount = Object.values(currentMap).filter((v) => v === 'absent').length;
          const leaveCount = Object.values(currentMap).filter((v) => v === 'leave').length;
          const presentCount = Object.values(currentMap).filter((v) => v === 'present').length;

          const todayNum = Math.min(30, Math.max(1, new Date().getDate()));
          const todayStatus = currentMap[todayNum] || 'present';
          const nextStatus = todayStatus === 'present' ? 'Active' : (todayStatus === 'leave' ? 'On Leave' : 'Inactive');

          return {
            ...member,
            attendanceMap: currentMap,
            absentDays: absentCount,
            leaveDays: leaveCount,
            presentDays: presentCount,
            status: nextStatus,
            active: todayStatus === 'present',
          };
        }
        return member;
      })
    );
  };

  // 7. Set specific attendance status for a day ('present' | 'leave' | 'absent')
  const setDayAttendance = (id, dayNum, statusToSet = 'present') => {
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const currentMap = member.attendanceMap && Object.keys(member.attendanceMap).length > 0
            ? { ...member.attendanceMap }
            : generateDefaultAttendanceMap(member.absentDays || 0);

          currentMap[dayNum] = statusToSet;

          const absentCount = Object.values(currentMap).filter((v) => v === 'absent').length;
          const leaveCount = Object.values(currentMap).filter((v) => v === 'leave').length;
          const presentCount = Object.values(currentMap).filter((v) => v === 'present').length;

          const todayNum = Math.min(30, Math.max(1, new Date().getDate()));
          const todayStatus = currentMap[todayNum] || 'present';
          const nextStatus = todayStatus === 'present' ? 'Active' : (todayStatus === 'leave' ? 'On Leave' : 'Inactive');

          return {
            ...member,
            attendanceMap: currentMap,
            absentDays: absentCount,
            leaveDays: leaveCount,
            presentDays: presentCount,
            status: nextStatus,
            active: todayStatus === 'present',
          };
        }
        return member;
      })
    );
  };

  // 8. Mark all days for a staff member
  const markAllAttendance = (id, statusToSet = 'present') => {
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const newMap = {};
          for (let d = 1; d <= 30; d++) {
            newMap[d] = statusToSet;
          }
          const absentCount = statusToSet === 'absent' ? 30 : 0;
          const leaveCount = statusToSet === 'leave' ? 30 : 0;
          const presentCount = statusToSet === 'present' ? 30 : 0;
          const nextStatus = statusToSet === 'present' ? 'Active' : (statusToSet === 'leave' ? 'On Leave' : 'Inactive');
          return {
            ...member,
            attendanceMap: newMap,
            absentDays: absentCount,
            leaveDays: leaveCount,
            presentDays: presentCount,
            status: nextStatus,
            active: statusToSet === 'present',
          };
        }
        return member;
      })
    );
  };

  // 9. Mark staff today
  const markStaffToday = (id, statusToSet = 'present') => {
    const todayNum = Math.min(30, Math.max(1, new Date().getDate()));
    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const currentMap = member.attendanceMap && Object.keys(member.attendanceMap).length > 0
            ? { ...member.attendanceMap }
            : generateDefaultAttendanceMap(member.absentDays || 0);

          currentMap[todayNum] = statusToSet;
          const absentCount = Object.values(currentMap).filter((v) => v === 'absent').length;
          const leaveCount = Object.values(currentMap).filter((v) => v === 'leave').length;
          const presentCount = Object.values(currentMap).filter((v) => v === 'present').length;
          const nextStatus = statusToSet === 'present' ? 'Active' : (statusToSet === 'leave' ? 'On Leave' : 'Inactive');

          return {
            ...member,
            attendanceMap: currentMap,
            absentDays: absentCount,
            leaveDays: leaveCount,
            presentDays: presentCount,
            status: nextStatus,
            active: statusToSet === 'present',
          };
        }
        return member;
      })
    );
  };

  // 10. Mark entire staff today
  const markEntireStaffToday = (statusToSet = 'present') => {
    const todayNum = Math.min(30, Math.max(1, new Date().getDate()));
    setStaffList((prev) =>
      prev.map((member) => {
        const currentMap = member.attendanceMap && Object.keys(member.attendanceMap).length > 0
          ? { ...member.attendanceMap }
          : generateDefaultAttendanceMap(member.absentDays || 0);

        currentMap[todayNum] = statusToSet;
        const absentCount = Object.values(currentMap).filter((v) => v === 'absent').length;
        const leaveCount = Object.values(currentMap).filter((v) => v === 'leave').length;
        const presentCount = Object.values(currentMap).filter((v) => v === 'present').length;
        const nextStatus = statusToSet === 'present' ? 'Active' : (statusToSet === 'leave' ? 'On Leave' : 'Inactive');

        return {
          ...member,
          attendanceMap: currentMap,
          absentDays: absentCount,
          leaveDays: leaveCount,
          presentDays: presentCount,
          status: nextStatus,
          active: statusToSet === 'present',
        };
      })
    );
  };

  // 11. Computed Metrics for Dashboard Cards
  const metrics = useMemo(() => {
    const totalStaff = staffList.length;
    const monthlySalaries = staffList.reduce(
      (sum, member) => sum + (Number(member.monthlySalary || member.salary) || 0),
      0
    );

    const activeStaffCount = staffList.filter(
      (s) => s.status !== 'Inactive' && s.status !== 'Off Duty' && s.active !== false
    ).length;
    const inactiveStaffCount = staffList.length - activeStaffCount;

    const totalDeliveryMen = staffList.filter((s) => {
      const role = (s.role || '').toLowerCase();
      return role.includes('delivery') || role.includes('rider');
    }).length;

    const totalFarmWorkers = staffList.filter((s) => {
      const role = (s.role || '').toLowerCase();
      return role.includes('farm') || role.includes('milker') || role.includes('herd') || role.includes('work');
    }).length;

    const totalSecurityGuards = staffList.filter((s) => {
      const role = (s.role || '').toLowerCase();
      return role.includes('guard') || role.includes('security');
    }).length;

    return {
      totalStaff,
      monthlySalaries,
      activeStaffCount,
      inactiveStaffCount,
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
        toggleStaffStatus,
        setStaffAttendance,
        toggleDayAttendance,
        setDayAttendance,
        markAllAttendance,
        markStaffToday,
        markEntireStaffToday,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaffContext() {
  const context = useContext(StaffContext);
  if (!context) {
    return {
      staffList: [],
      metrics: { totalStaff: 0, totalFarmWorkers: 0, activeStaffCount: 0, inactiveStaffCount: 0 },
      addStaff: () => {},
      updateStaff: () => {},
      toggleStaffStatus: () => {},
      setStaffAttendance: () => {},
      toggleDayAttendance: () => {},
      markAllAttendance: () => {},
      markStaffToday: () => {},
      markEntireStaffToday: () => {},
      deleteStaff: () => {},
    };
  }
  return context;
}

export { StaffContext };
export default StaffProvider;
