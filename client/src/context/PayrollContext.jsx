import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStaffContext } from './StaffContext';

const PayrollContext = createContext();

const STORAGE_KEY_PAYROLL = 'pure_milk_bar_payroll';

export function PayrollProvider({ children }) {
  const { staffList = [] } = useStaffContext();

  const [payrollRecords, setPayrollRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYROLL);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading payroll records from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PAYROLL, JSON.stringify(payrollRecords));
    } catch (e) {
      console.error('Error saving payroll records to localStorage:', e);
    }
  }, [payrollRecords]);

  // Calculate salary slip breakdown for any staff member
  const calculateWageSlip = (staffMember, daysPresent = 30) => {
    if (!staffMember) return null;
    const baseMonthlySalary = Number(staffMember.monthlySalary || 0);
    const dailyRate = Math.round(baseMonthlySalary / 30);
    const calculatedPay = Math.round(dailyRate * daysPresent);

    return {
      staffId: staffMember.id,
      name: staffMember.name,
      role: staffMember.role,
      cnic: staffMember.cnic || '—',
      baseMonthlySalary,
      dailyRate,
      daysPresent,
      grossAmount: calculatedPay,
      allowances: 0,
      deductions: 0,
      netSalary: calculatedPay,
      status: 'Ready for Processing',
    };
  };

  // Record a salary payout
  const recordSalaryDisbursement = ({ staffId, amount, monthYear, paymentMethod = 'Cash', remarks = '' }) => {
    const nextId = `PAY-${Date.now()}`;
    const newRecord = {
      id: nextId,
      staffId,
      amount: Number(amount) || 0,
      monthYear: monthYear || new Date().toISOString().slice(0, 7),
      paymentMethod,
      disbursedAt: new Date().toISOString(),
      remarks,
      status: 'Paid',
    };

    setPayrollRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  // Metrics
  const totalMonthlyPayrollObligation = staffList.reduce(
    (acc, s) => acc + (Number(s.monthlySalary) || 0),
    0
  );
  const totalDisbursedAllTime = payrollRecords.reduce(
    (acc, r) => acc + (Number(r.amount) || 0),
    0
  );

  const metrics = {
    totalMonthlyPayrollObligation,
    totalDisbursedAllTime,
    staffCount: staffList.length,
    disbursementsCount: payrollRecords.length,
  };

  return (
    <PayrollContext.Provider
      value={{
        payrollRecords,
        metrics,
        calculateWageSlip,
        recordSalaryDisbursement,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayrollContext() {
  const context = useContext(PayrollContext);
  if (!context) {
    return {
      payrollRecords: [],
      metrics: { totalMonthlyPayrollObligation: 0, totalDisbursedAllTime: 0, staffCount: 0, disbursementsCount: 0 },
      calculateWageSlip: () => null,
      recordSalaryDisbursement: () => {},
    };
  }
  return context;
}

export default PayrollProvider;
