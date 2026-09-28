import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStaffContext } from './StaffContext';
import api from '@/services/api';

const PayrollContext = createContext();

export function PayrollProvider({ children }) {
  const { staffList = [] } = useStaffContext();

  const [payrollRecords, setPayrollRecords] = useState([]);

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
    const numAmt = Number(amount) || 0;
    const newRecord = {
      id: nextId,
      staffId,
      amount: numAmt,
      monthYear: monthYear || new Date().toISOString().slice(0, 7),
      paymentMethod,
      disbursedAt: new Date().toISOString(),
      remarks,
      status: 'Paid',
    };

    setPayrollRecords((prev) => [newRecord, ...prev]);

    // Sync to backend database as a Salary expense
    if (numAmt > 0) {
      const staffMember = staffList.find((s) => String(s.id || s._id) === String(staffId));
      api.finance.createExpense({
        scope: 'FARM',
        category: 'SALARIES',
        title: `Salary Payout: ${staffMember?.name || `Staff #${staffId}`}`,
        amount: numAmt,
        amountRupees: numAmt,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: String(paymentMethod).toUpperCase() === 'ONLINE' ? 'ONLINE' : 'CASH',
        notes: remarks || `Salary disbursement for ${monthYear || 'monthly'}`,
        authorizedBy: 'Admin',
      }).catch((e) => console.warn('Salary disbursement backend expense sync notice:', e.message));
    }

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
