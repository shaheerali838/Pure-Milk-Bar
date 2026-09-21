import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const StaffPayrollContext = createContext(null);

const STORAGE_KEYS = {
  STAFF_LIST: 'pure_milk_bar_staff',
  ATTENDANCE: 'puremilkbar_staff_attendance',
  DAILY_SHEETS: 'puremilkbar_staff_daily_sheets',
};

// Safe JSON parser for localStorage
const loadStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key) || (key === 'pure_milk_bar_staff' ? localStorage.getItem('puremilkbar_staff_list') : null);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
};

// Safe Date String Formatter (YYYY-MM-DD) avoiding timezone shifts
export const formatDateKey = (d) => {
  if (!d) return new Date().toISOString().split('T')[0];
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parts = d.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    d = new Date(d);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function StaffPayrollProvider({ children }) {
  // 1. Staff List (Starts empty as requested: no dummy data, pure user/localStorage management)
  const [staffList, setStaffList] = useState(() =>
    loadStorage(STORAGE_KEYS.STAFF_LIST, [])
  );

  // 2. Attendance Map: { [dateString 'YYYY-MM-DD']: { [staffId]: 'present' | 'absent' | 'leave' } }
  const [attendanceRecords, setAttendanceRecords] = useState(() =>
    loadStorage(STORAGE_KEYS.ATTENDANCE, {})
  );

  // 3. Daily Sheets Map: { [dateString 'YYYY-MM-DD']: { [staffId]: { shift, hours, assignment, notes } } }
  const [dailySheets, setDailySheets] = useState(() =>
    loadStorage(STORAGE_KEYS.DAILY_SHEETS, {})
  );

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(staffList));
    } catch (err) {
      console.error('Error saving staffList to localStorage:', err);
    }
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (err) {
      console.error('Error saving attendanceRecords to localStorage:', err);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_SHEETS, JSON.stringify(dailySheets));
    } catch (err) {
      console.error('Error saving dailySheets to localStorage:', err);
    }
  }, [dailySheets]);

  // Helper to generate next Staff ID like STF-001, STF-002
  const generateStaffId = () => {
    if (!staffList || staffList.length === 0) return 'STF-001';
    const numbers = staffList
      .map((s) => {
        const match = String(s.id).match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `STF-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Add a new staff member
  const addStaff = (data) => {
    const monthlySalary = parseFloat(data.monthlySalary) || 0;
    const dailySalary =
      data.dailySalary !== undefined && data.dailySalary !== null
        ? parseFloat(data.dailySalary)
        : Math.round(monthlySalary / 30);

    const newStaff = {
      id: data.id?.trim() || generateStaffId(),
      name: data.name?.trim() || 'New Staff',
      role: data.role || 'Farm Worker',
      shift: data.shift || 'Morning',
      mobile: data.mobile?.trim() || '',
      cnic: data.cnic?.trim() || '',
      monthlySalary,
      dailySalary,
      route: data.route?.trim() || (data.role?.toLowerCase().includes('delivery') ? 'Unassigned' : 'N/A'),
      status: data.status || 'Active', // 'Active' | 'Inactive' | 'On Leave'
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      address: data.address?.trim() || '',
      emergencyContact: data.emergencyContact?.trim() || '',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    setStaffList((prev) => [newStaff, ...prev]);
    return newStaff;
  };

  // Update existing staff member
  const updateStaff = (id, updatedFields) => {
    setStaffList((prev) =>
      prev.map((staff) => {
        if (String(staff.id) !== String(id)) return staff;
        const monthly =
          updatedFields.monthlySalary !== undefined
            ? parseFloat(updatedFields.monthlySalary) || 0
            : staff.monthlySalary;
        const daily =
          updatedFields.dailySalary !== undefined
            ? parseFloat(updatedFields.dailySalary) || 0
            : Math.round(monthly / 30);

        return {
          ...staff,
          ...updatedFields,
          monthlySalary: monthly,
          dailySalary: daily,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Delete staff member
  const deleteStaff = (id) => {
    setStaffList((prev) => prev.filter((staff) => String(staff.id) !== String(id)));
  };

  // Mark single staff member attendance for a specific date
  // status: 'present' | 'absent' | 'leave'
  const markAttendance = (staffId, date, status) => {
    const dateKey = formatDateKey(date);
    const idKey = String(staffId);
    setAttendanceRecords((prev) => {
      const dayMap = prev[dateKey] ? { ...prev[dateKey] } : {};
      dayMap[idKey] = status;
      dayMap[staffId] = status;
      return {
        ...prev,
        [dateKey]: dayMap,
      };
    });

    // Also update current active/status if marking today
    const todayStr = formatDateKey(new Date());
    if (dateKey === todayStr) {
      setStaffList((prev) =>
        prev.map((staff) => {
          if (String(staff.id) !== idKey) return staff;
          let newStatus = 'Active';
          if (status === 'leave') newStatus = 'On Leave';
          if (status === 'absent') newStatus = 'Inactive';
          return { ...staff, status: newStatus };
        })
      );
    }
  };

  // Batch mark all staff for a specific date
  const markAllAttendance = (date, status) => {
    const dateKey = formatDateKey(date);
    setAttendanceRecords((prev) => {
      const dayMap = {};
      staffList.forEach((s) => {
        dayMap[String(s.id)] = status;
        dayMap[s.id] = status;
      });
      return {
        ...prev,
        [dateKey]: dayMap,
      };
    });
  };

  // Get status for staff member on a specific date ('present' | 'absent' | 'leave')
  const getStaffStatusOnDate = (staffId, date) => {
    const dateKey = formatDateKey(date);
    const idKey = String(staffId);
    if (attendanceRecords[dateKey]) {
      if (attendanceRecords[dateKey][idKey] !== undefined) {
        return attendanceRecords[dateKey][idKey];
      }
      if (attendanceRecords[dateKey][staffId] !== undefined) {
        return attendanceRecords[dateKey][staffId];
      }
    }
    // Default fallback based on staff.status if viewing today
    const todayStr = formatDateKey(new Date());
    if (dateKey === todayStr) {
      const staff = staffList.find((s) => String(s.id) === idKey);
      if (!staff) return 'present';
      if (staff.status === 'On Leave') return 'leave';
      if (staff.status === 'Inactive' || staff.status === 'Off Duty') return 'absent';
      return 'present';
    }
    return 'present'; // Default
  };

  // Get attendance history for a staff member for a specific month (accurate days in month)
  const getStaffMonthlyAttendance = (staffId, targetDate = new Date()) => {
    let d;
    if (typeof targetDate === 'string') {
      const parts = targetDate.split('-').map(Number);
      d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    } else {
      d = new Date(targetDate);
    }
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    // Accurate number of days in this specific month (e.g. 31, 30, 28)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    let presentCount = 0;
    let leaveCount = 0;
    let absentCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const weekday = dateObj.toLocaleString('default', { weekday: 'short' });
      const status = getStaffStatusOnDate(staffId, dateString);

      if (status === 'present') presentCount++;
      else if (status === 'leave') leaveCount++;
      else if (status === 'absent') absentCount++;

      days.push({
        dayNumber: day,
        dateString,
        weekday,
        status,
      });
    }

    const staff = staffList.find((s) => String(s.id) === String(staffId));
    const monthlySalary = staff ? Number(staff.monthlySalary) || 0 : 0;
    const dailySalary = staff?.dailySalary || Math.round(monthlySalary / 30);
    const absentDeduction = absentCount * dailySalary;
    const netSalary = Math.max(0, monthlySalary - absentDeduction);

    return {
      days,
      daysInMonth,
      monthName: d.toLocaleString('default', { month: 'long' }),
      year,
      presentCount,
      leaveCount,
      absentCount,
      turnoutRate: Math.round((presentCount / daysInMonth) * 100),
      monthlySalary,
      dailySalary,
      absentDeduction,
      netSalary,
    };
  };

  // Update Daily Sheet record for a staff member
  const updateDailySheetEntry = (date, staffId, fields) => {
    const dateKey = formatDateKey(date);
    const idKey = String(staffId);
    setDailySheets((prev) => {
      const dayMap = prev[dateKey] ? { ...prev[dateKey] } : {};
      dayMap[idKey] = {
        ...(dayMap[idKey] || {}),
        ...fields,
      };
      return {
        ...prev,
        [dateKey]: dayMap,
      };
    });

    if (fields.status) {
      markAttendance(staffId, dateKey, fields.status);
    }
  };

  // Aggregated KPI Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalStaff = staffList.length;

    let presentToday = 0;
    let leaveToday = 0;
    let absentToday = 0;
    let totalMonthlyPayroll = 0;
    let totalDailyPayroll = 0;

    staffList.forEach((s) => {
      const status = getStaffStatusOnDate(s.id, todayStr);
      if (status === 'present') presentToday++;
      else if (status === 'leave') leaveToday++;
      else if (status === 'absent') absentToday++;

      const monthly = Number(s.monthlySalary) || 0;
      totalMonthlyPayroll += monthly;
      totalDailyPayroll += s.dailySalary || Math.round(monthly / 30);
    });

    const activeStaff = presentToday;
    const turnoutRate = totalStaff > 0 ? Math.round((presentToday / totalStaff) * 100) : 0;

    return {
      totalStaff,
      activeStaff,
      presentToday,
      leaveToday,
      absentToday,
      turnoutRate,
      totalMonthlyPayroll,
      totalDailyPayroll,
    };
  }, [staffList, attendanceRecords]);

  const value = {
    staffList,
    attendanceRecords,
    dailySheets,
    addStaff,
    updateStaff,
    deleteStaff,
    markAttendance,
    markAllAttendance,
    getStaffStatusOnDate,
    getStaffMonthlyAttendance,
    updateDailySheetEntry,
    metrics,
  };

  return (
    <StaffPayrollContext.Provider value={value}>
      {children}
    </StaffPayrollContext.Provider>
  );
}

export function useStaffPayrollContext() {
  const context = useContext(StaffPayrollContext);
  if (!context) {
    throw new Error('useStaffPayrollContext must be used within a StaffPayrollProvider');
  }
  return context;
}

export default StaffPayrollProvider;
