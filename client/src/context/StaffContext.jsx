import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import adminService from '@/services/adminService';

const StaffContext = createContext();
const STORAGE_KEY_STAFF = 'pure_milk_bar_staff';

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
          absentDays: absent,
          presentDays: m.presentDays !== undefined ? m.presentDays : Math.max(0, 30 - absent),
          attendanceMap: m.attendanceMap && Object.keys(m.attendanceMap).length > 0
            ? m.attendanceMap
            : generateDefaultAttendanceMap(absent),
        };
      });
      setStaffList(normalized);
    } catch (err) {
      console.warn('Failed to fetch staff from API, using fallback:', err.message);
      try {
        const saved = localStorage.getItem(STORAGE_KEY_STAFF);
        if (saved) setStaffList(JSON.parse(saved));
      } catch (_) {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    try {
      if (staffList.length > 0) {
        localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffList));
      }
    } catch (_) {}
  }, [staffList]);

  // Add Staff Member
  const addStaff = async (data) => {
    try {
      const absentDays = Number(data.absentDays) || 0;
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
        absentDays: absentDays,
        presentDays: Math.max(0, 30 - absentDays),
        attendanceMap: data.attendanceMap || generateDefaultAttendanceMap(absentDays),
      };

      setStaffList((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Failed to create staff via API, saving locally:', err);
      const nextNum = staffList.length + 1;
      const staffId = `STF-${String(nextNum).padStart(3, '0')}`;
      const absentDays = Number(data.absentDays) || 0;
      const localMember = {
        id: staffId,
        ...data,
        dailySalary: Math.round((Number(data.monthlySalary) || 0) / 30),
        absentDays,
        presentDays: Math.max(0, 30 - absentDays),
        attendanceMap: data.attendanceMap || generateDefaultAttendanceMap(absentDays),
      };
      setStaffList((prev) => [localMember, ...prev]);
      return localMember;
    }
  };

  // Update Staff Member
  const updateStaff = async (id, data) => {
    try {
      await adminService.updateStaff(id, data);
    } catch (err) {
      console.warn('API update failed, applying local update:', err.message);
    }

    setStaffList((prev) =>
      prev.map((member) => {
        if (String(member.id) === String(id) || String(member._id) === String(id)) {
          const nextSalary = data.monthlySalary !== undefined ? Number(data.monthlySalary) : Number(member.monthlySalary || 0);
          const nextAbsent = data.absentDays !== undefined
            ? Math.max(0, Math.min(30, Number(data.absentDays)))
            : (member.absentDays !== undefined ? member.absentDays : 0);
          return {
            ...member,
            ...data,
            monthlySalary: nextSalary,
            dailySalary: Math.round(nextSalary / 30),
            absentDays: nextAbsent,
            presentDays: Math.max(0, 30 - nextAbsent),
          };
        }
        return member;
      })
    );
  };

  // Delete Staff Member
  const deleteStaff = async (id) => {
    try {
      await adminService.deleteStaff(id);
    } catch (err) {
      console.warn('API delete failed, applying local delete:', err.message);
    }
    setStaffList((prev) => prev.filter((m) => (m._id || m.id) !== id && m.id !== id));
  };

  // Toggle Staff Duty Status
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

  // Set Attendance for specific staff
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

  // Metrics
  const metrics = useMemo(() => {
    const totalStaff = staffList.length;
    const monthlySalaries = staffList.reduce(
      (sum, s) => sum + (Number(s.monthlySalary || s.salary) || 0),
      0
    );
    const activeStaffCount = staffList.filter(
      (s) => s.status !== 'Inactive' && s.status !== 'Off Duty' && s.active !== false
    ).length;
    const inactiveStaffCount = staffList.length - activeStaffCount;

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
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAFF);
      const staffList = saved ? JSON.parse(saved) : [];
      const totalStaff = staffList.length;
      const totalFarmWorkers = staffList.filter((s) => (s.role || '').toLowerCase().includes('farm')).length;
      return {
        staffList,
        metrics: { totalStaff, totalFarmWorkers, activeStaffCount: 0, inactiveStaffCount: 0 },
        addStaff: () => {},
        updateStaff: () => {},
        deleteStaff: () => {},
        toggleStaffStatus: () => {},
        setStaffAttendance: () => {},
        toggleDayAttendance: () => {},
        setDayAttendance: () => {},
        markAllAttendance: () => {},
        markStaffToday: () => {},
        markEntireStaffToday: () => {},
      };
    } catch {
      return { staffList: [], metrics: { totalStaff: 0, totalFarmWorkers: 0, activeStaffCount: 0, inactiveStaffCount: 0 }, addStaff: () => {}, updateStaff: () => {}, deleteStaff: () => {} };
    }
  }
  return context;
}

export default StaffContext;
