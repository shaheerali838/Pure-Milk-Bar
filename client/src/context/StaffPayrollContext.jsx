import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import adminService from '../services/adminService.js';

const StaffPayrollContext = createContext(null);

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
  // 1. Staff List (Synced strictly with MongoDB database API)
  const [staffList, setStaffList] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Attendance Map: { [dateString 'YYYY-MM-DD']: { [staffId]: 'present' | 'absent' | 'leave' } }
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // 3. Daily Sheets Map: { [dateString 'YYYY-MM-DD']: { [staffId]: { shift, hours, assignment, notes } } }
  const [dailySheets, setDailySheets] = useState({});

  // Fetch real staff list from backend
  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getStaff();
      const list = Array.isArray(data) ? data : data?.staff || [];
      const normalized = list.map((m) => {
        const monthly = Number(m.monthlySalary || m.salary) || 0;
        return {
          ...m,
          id: m._id || m.id,
          image: m.image || null,
          monthlySalary: monthly,
          dailySalary: Number(m.dailySalary) || Math.round(monthly / 30),
          status: m.status || (m.active !== false ? 'Active' : 'Inactive'),
          salaryStatus: m.salaryStatus || 'Pending',
          salaryPaidMonth: m.salaryPaidMonth || null,
          salaryPaidDate: m.salaryPaidDate || null,
          joinedDate: m.joinedDate || (m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          attendanceMap: m.attendanceMap || {},
        };
      });
      setStaffList(normalized);

      // Hydrate attendanceRecords from each staff member's attendanceMap
      const hydratedRecords = {};
      normalized.forEach((staff) => {
        const sId = String(staff.id);
        const sMongoId = staff._id ? String(staff._id) : null;
        const sCode = staff.staffCode ? String(staff.staffCode) : null;
        const map = staff.attendanceMap || {};
        Object.entries(map).forEach(([dKey, status]) => {
          if (!hydratedRecords[dKey]) hydratedRecords[dKey] = {};
          hydratedRecords[dKey][sId] = status;
          if (sMongoId) hydratedRecords[dKey][sMongoId] = status;
          if (sCode) hydratedRecords[dKey][sCode] = status;
        });
      });
      setAttendanceRecords(hydratedRecords);
    } catch (err) {
      console.warn('Live staff fetch notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch real salary payments history directly from MongoDB backend database
  const fetchSalaries = useCallback(async () => {
    try {
      const res = await adminService.getStaffSalaries({ limit: 1000 });
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.salaries)
        ? res.salaries
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (Array.isArray(list)) {
        const normalized = list.map((s) => ({
          ...s,
          id: s._id || s.id,
          paymentDate: s.paymentDate ? String(s.paymentDate).slice(0, 10) : s.date,
          date: s.date || (s.paymentDate ? String(s.paymentDate).slice(0, 10) : ''),
        }));
        setSalaryPayments(normalized);
      }
    } catch (err) {
      console.warn('Live salary fetch notice:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchSalaries();

    const handleSync = () => {
      fetchStaff();
      fetchSalaries();
    };
    window.addEventListener('salary:updated', handleSync);
    window.addEventListener('expense:updated', handleSync);
    return () => {
      window.removeEventListener('salary:updated', handleSync);
      window.removeEventListener('expense:updated', handleSync);
    };
  }, [fetchStaff, fetchSalaries]);
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
  const addStaff = async (data) => {
    const monthlySalary = parseFloat(data.monthlySalary) || 0;
    const dailySalary =
      data.dailySalary !== undefined && data.dailySalary !== null
        ? parseFloat(data.dailySalary)
        : Math.round(monthlySalary / 30);

    const payload = {
      ...data,
      staffCode: (data.staffCode || data.id || '').trim() || undefined,
      name: data.name?.trim() || 'New Staff',
      role: data.role || 'Farm Worker',
      shift: data.shift || 'Morning',
      mobile: data.mobile?.trim() || data.phone?.trim() || '',
      cnic: data.cnic ? String(data.cnic).trim() : '',
      image: data.image || null,
      monthlySalary,
      dailySalary,
      route: data.route?.trim() || (data.role?.toLowerCase().includes('delivery') ? 'Unassigned' : 'N/A'),
      status: data.status || 'Active',
      joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
      address: data.address?.trim() || '',
      emergencyContact: data.emergencyContact?.trim() || '',
      notes: data.notes?.trim() || '',
    };

    const created = await adminService.createStaff(payload);

    const createdStaffDoc = created?.data || created?.staff || (created && typeof created === 'object' ? created : null);
    const assignedId = createdStaffDoc?._id || createdStaffDoc?.id || createdStaffDoc?.staffCode || data.id?.trim() || generateStaffId();

    const newStaff = {
      ...payload,
      ...(createdStaffDoc || {}),
      id: assignedId,
      _id: createdStaffDoc?._id || assignedId,
      createdAt: createdStaffDoc?.createdAt || new Date().toISOString(),
    };

    setStaffList((prev) => [newStaff, ...prev]);
    return newStaff;
  };

  // Update existing staff member
  const updateStaff = async (id, updatedFields) => {
    try {
      await adminService.updateStaff(id, updatedFields);
    } catch (err) {
      console.warn('Update staff API notice:', err.message);
    }

    setStaffList((prev) =>
      prev.map((staff) => {
        if (String(staff.id) !== String(id) && String(staff._id) !== String(id)) return staff;
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
  const deleteStaff = async (id) => {
    try {
      await adminService.deleteStaff(id);
    } catch (err) {
      console.warn('Delete staff API notice:', err.message);
    }
    setStaffList((prev) => prev.filter((staff) => String(staff.id) !== String(id) && String(staff._id) !== String(id)));
  };

  // Mark single staff member attendance for a specific date
  // status: 'present' | 'absent' | 'leave'
  const markAttendance = async (staffId, date, status) => {
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

    const targetStaff = staffList.find((s) => String(s.id) === idKey || String(s._id) === idKey || String(s.staffCode) === idKey);
    const todayStr = formatDateKey(new Date());
    let newStatus = targetStaff?.status || 'Active';

    if (dateKey === todayStr) {
      if (status === 'leave') newStatus = 'On Leave';
      else if (status === 'absent') newStatus = 'Inactive';
      else if (status === 'present') newStatus = 'Active';
    }

    const updatedMap = { ...(targetStaff?.attendanceMap || {}), [dateKey]: status };

    setStaffList((prev) =>
      prev.map((staff) => {
        if (String(staff.id) !== idKey && String(staff._id) !== idKey && String(staff.staffCode) !== idKey) return staff;
        return {
          ...staff,
          ...(dateKey === todayStr && { status: newStatus }),
          attendanceMap: updatedMap,
        };
      })
    );

    // Sync status and attendanceMap to MongoDB backend API
    try {
      const dbId = targetStaff?._id || targetStaff?.id || staffId;
      const payload = { attendanceMap: updatedMap };
      if (dateKey === todayStr) {
        payload.status = newStatus;
      }
      await adminService.updateStaff(dbId, payload);
    } catch (err) {
      console.warn('Sync markAttendance error:', err.message);
    }
  };

  // Batch mark all staff for a specific date
  const markAllAttendance = async (date, status) => {
    const dateKey = formatDateKey(date);
    const todayStr = formatDateKey(new Date());

    setAttendanceRecords((prev) => {
      const dayMap = {};
      staffList.forEach((s) => {
        dayMap[String(s.id)] = status;
        if (s._id) dayMap[String(s._id)] = status;
        if (s.staffCode) dayMap[String(s.staffCode)] = status;
      });
      return {
        ...prev,
        [dateKey]: dayMap,
      };
    });

    let newStatus = 'Active';
    if (status === 'leave') newStatus = 'On Leave';
    else if (status === 'absent') newStatus = 'Inactive';
    else if (status === 'present') newStatus = 'Active';

    setStaffList((prev) =>
      prev.map((staff) => {
        const updatedMap = { ...(staff.attendanceMap || {}), [dateKey]: status };
        return {
          ...staff,
          ...(dateKey === todayStr && { status: newStatus }),
          attendanceMap: updatedMap,
        };
      })
    );

    try {
      await Promise.all(
        staffList.map((s) => {
          const dbId = s._id || s.id;
          const updatedMap = { ...(s.attendanceMap || {}), [dateKey]: status };
          const payload = { attendanceMap: updatedMap };
          if (dateKey === todayStr) payload.status = newStatus;
          return adminService.updateStaff(dbId, payload);
        })
      );
    } catch (err) {
      console.warn('Sync markAllAttendance error:', err.message);
    }
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
    const staff = staffList.find((s) => String(s.id) === idKey || String(s._id) === idKey || String(s.staffCode) === idKey);
    if (staff && staff.attendanceMap && staff.attendanceMap[dateKey] !== undefined) {
      return staff.attendanceMap[dateKey];
    }
    // Also check integer day number key if stored like { 26: 'present' }
    if (staff && staff.attendanceMap) {
      const parts = dateKey.split('-');
      const dayNum = parseInt(parts[2], 10);
      if (staff.attendanceMap[dayNum] !== undefined) {
        return staff.attendanceMap[dayNum];
      }
      if (staff.attendanceMap[String(dayNum)] !== undefined) {
        return staff.attendanceMap[String(dayNum)];
      }
    }
    // Default fallback based on staff.status if viewing today
    const todayStr = formatDateKey(new Date());
    if (dateKey === todayStr && staff) {
      if (staff.status === 'On Leave') return 'leave';
      if (staff.status === 'Inactive' || staff.status === 'Off Duty') return 'absent';
      return 'present';
    }
    
    // Future days should not be marked as present by default
    if (dateKey > todayStr) {
      return '-';
    }

    return 'present'; // Default for past days if not explicitly marked
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

  // Helper: check if salary is paid for current month
  const isStaffSalaryPaid = useCallback((staffId) => {
    const sId = String(staffId);
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonthISO = new Date().toISOString().slice(0, 7); // e.g. "2026-10"

    // Check staff object state
    const staff = staffList.find((s) => String(s.id) === sId || String(s._id) === sId);
    if (staff && staff.salaryStatus === 'Paid') {
      if (!staff.salaryPaidMonth || staff.salaryPaidMonth === currentMonthStr) {
        return true;
      }
    }

    // Check salary payments history
    return salaryPayments.some((p) => {
      const matchStaff = String(p.staffId) === sId || (staff && p.staffName && staff.name && p.staffName.toLowerCase().trim() === staff.name.toLowerCase().trim());
      if (!matchStaff) return false;
      const pDate = p.paymentDate || p.date || '';
      return p.monthYear === currentMonthStr || pDate.startsWith(currentMonthISO);
    });
  }, [staffList, salaryPayments]);

  // Aggregated KPI Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.slice(0, 7);
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
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

    // CRITICAL: Calculate actual PAID/DISBURSED salaries for this month directly from salaryPayments!
    const totalPaidSalaries = salaryPayments.reduce((acc, p) => {
      const pMonth = p.monthYear || '';
      const pDate = String(p.paymentDate || p.date || '');
      const isCurrentMonth = pMonth === currentMonthStr || pDate.startsWith(currentMonthPrefix);
      if (isCurrentMonth && (p.status === 'Paid' || !p.status)) {
        return acc + (Number(p.amountPaid !== undefined ? p.amountPaid : p.amount) || 0);
      }
      return acc;
    }, 0);

    const paidStaffCount = staffList.filter((s) => isStaffSalaryPaid(s.id || s._id)).length;
    const pendingStaffCount = Math.max(0, totalStaff - paidStaffCount);

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
      totalPaidSalaries,
      paidStaffCount,
      pendingStaffCount,
      totalDailyPayroll,
    };
  }, [staffList, attendanceRecords, salaryPayments, isStaffSalaryPaid]);

  // Record Salary Payment (Deductions, State Update, and History Tracking)
  const recordSalaryPayment = async ({
    staffId,
    staffName,
    role,
    paymentDate,
    absentDays = 0,
    deduction = 0,
    amount = 0,
    amountPaid,
    status = 'Paid',
    monthYear,
    paymentMethod = 'CASH',
    notes = '',
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonthStr = monthYear || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const pDate = paymentDate || today;
    const finalAmount = Number(amountPaid !== undefined ? amountPaid : amount) || 0;
    const idKey = String(staffId);

    // Strictly enforce: Only allow paying salary ONCE per staff per month ("only one time i pay the salery in staff")
    if (isStaffSalaryPaid(idKey)) {
      throw new Error(`Salary has already been paid for this staff member for ${currentMonthStr}. Salary can only be paid once per month.`);
    }

    // 1. Sync live to MongoDB Database API
    const serverRes = await adminService.payStaffSalary({
      staffId: idKey,
      amount: finalAmount,
      amountPaid: finalAmount,
      paymentDate: pDate,
      absentDays: Number(absentDays) || 0,
      deduction: Number(deduction) || 0,
      monthYear: currentMonthStr,
      paymentMethod: paymentMethod ? String(paymentMethod).toUpperCase() : 'CASH',
      notes: notes || '',
    });

    const paymentRecord = {
      ...(serverRes?.payment || {}),
      id: serverRes?.payment?._id || serverRes?.payment?.id || `SAL-${Date.now()}`,
      staffId: idKey,
      staffName: staffName || serverRes?.payment?.staffName || 'Staff Member',
      role: role || serverRes?.payment?.role || 'Farm Worker',
      paymentDate: serverRes?.payment?.paymentDate ? String(serverRes.payment.paymentDate).slice(0, 10) : pDate,
      date: serverRes?.payment?.date || pDate,
      absentDays: Number(absentDays) || 0,
      deduction: Number(deduction) || 0,
      amount: finalAmount,
      amountPaid: finalAmount,
      status: 'Paid',
      monthYear: currentMonthStr,
      paymentMethod: paymentMethod ? String(paymentMethod).toUpperCase() : 'CASH',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    // 2. Update salary payments in state
    setSalaryPayments((prev) => [paymentRecord, ...prev.filter((p) => String(p.id) !== String(paymentRecord.id))]);

    // 3. Update staff list state to reflect Paid status for this month
    setStaffList((prev) =>
      prev.map((s) => {
        if (String(s.id) === idKey || String(s._id) === idKey) {
          return {
            ...s,
            salaryStatus: 'Paid',
            salaryPaidDate: pDate,
            salaryPaidMonth: currentMonthStr,
            lastSalaryPayment: paymentRecord,
          };
        }
        return s;
      })
    );

    // 4. Re-fetch both staff and salaries from backend
    fetchStaff();
    fetchSalaries();

    window.dispatchEvent(new CustomEvent('expense:updated'));
    window.dispatchEvent(new CustomEvent('salary:updated'));

    return paymentRecord;
  };

  // Delete salary payment record from database
  const deleteSalaryPayment = async (paymentId) => {
    setSalaryPayments((prev) => prev.filter((p) => String(p.id || p._id) !== String(paymentId)));
    try {
      await adminService.deleteSalaryPayment(paymentId);
    } catch (err) {
      console.warn('Delete salary payment error:', err.message);
    }
    await Promise.allSettled([fetchStaff(), fetchSalaries()]);
    window.dispatchEvent(new CustomEvent('expense:updated'));
    window.dispatchEvent(new CustomEvent('salary:updated'));
  };

  // Helper: Count absent days from existing attendance state
  const getStaffAbsentDays = (staff) => {
    if (!staff) return 0;
    const sId = String(staff.id || staff._id);

    // 1. Check staff.attendanceMap directly (filter for status === 'absent' or 'Absent')
    if (staff.attendanceMap && typeof staff.attendanceMap === 'object') {
      const absentCount = Object.values(staff.attendanceMap).filter(
        (st) => String(st).trim().toLowerCase() === 'absent'
      ).length;
      if (absentCount > 0) return absentCount;
    }

    // 2. Check getStaffMonthlyAttendance
    const monthlyStats = getStaffMonthlyAttendance(sId);
    if (monthlyStats && Number(monthlyStats.absentCount) > 0) {
      return Number(monthlyStats.absentCount);
    }

    // 3. Check attendanceRecords state
    let countFromRecords = 0;
    Object.values(attendanceRecords).forEach((dayMap) => {
      if (dayMap && (
        String(dayMap[sId]).toLowerCase() === 'absent' ||
        (staff._id && String(dayMap[String(staff._id)]).toLowerCase() === 'absent')
      )) {
        countFromRecords++;
      }
    });
    if (countFromRecords > 0) return countFromRecords;

    if (staff.absentDays !== undefined && staff.absentDays !== null) {
      return Number(staff.absentDays) || 0;
    }

    return 0;
  };

  const value = {
    staffList,
    salaryPayments,
    attendanceRecords,
    dailySheets,
    addStaff,
    updateStaff,
    deleteStaff,
    markAttendance,
    markAllAttendance,
    getStaffStatusOnDate,
    getStaffMonthlyAttendance,
    getStaffAbsentDays,
    isStaffSalaryPaid,
    recordSalaryPayment,
    paySalary: recordSalaryPayment,
    deleteSalaryPayment,
    refreshSalaries: fetchSalaries,
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
