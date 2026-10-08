import React, { useState } from 'react';
import { Banknote, CheckCircle2, Clock, XCircle, Users, Calendar, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';

export default function RiderSalaryPayrollTable({
  staffList = [],
  selectedMonth = '2026-10',
  onPaySalary,
}) {
  const { getSalaryRecord } = useRiderSalaryContext();
  let staffPayrollCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    staffPayrollCtx = useStaffPayrollContext();
  } catch (_) {}

  const [expandedStaffId, setExpandedStaffId] = useState(null);

  const payrollData = staffList.map((staff) => {
    const record = getSalaryRecord(staff.id, selectedMonth);
    const baseSalary = record ? Number(record.baseSalary) : (Number(staff.salary || staff.baseSalary || staff.monthlySalary) || 25000);
    const paidAmount = record ? Number(record.paidAmount) : 0;

    // Attendance calculation
    const attendance = staffPayrollCtx?.getStaffMonthlyAttendance
      ? staffPayrollCtx.getStaffMonthlyAttendance(staff.id, selectedMonth)
      : null;

    const daysInMonth = attendance?.daysInMonth || 30;
    const presentCount = attendance ? attendance.presentCount : Math.max(0, 30 - (Number(staff.absentDays) || 0));
    const absentCount = attendance ? attendance.absentCount : (Number(staff.absentDays) || 0);
    const leaveCount = attendance ? attendance.leaveCount : 0;
    const dailyRate = Math.round(baseSalary / daysInMonth);
    const attendanceDeduction = absentCount * dailyRate;
    const netEarnedSalary = Math.max(0, baseSalary - attendanceDeduction);
    const remainingBalance = Math.max(0, netEarnedSalary - paidAmount);

    const absentDaysList = attendance?.days
      ? attendance.days.filter((d) => d.status === 'absent' || d.status === 'leave')
      : [];

    let status = 'UNPAID';
    if (paidAmount >= netEarnedSalary && netEarnedSalary > 0) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }

    return {
      staff,
      record,
      baseSalary,
      paidAmount,
      remainingBalance,
      status,
      presentCount,
      absentCount,
      leaveCount,
      dailyRate,
      attendanceDeduction,
      netEarnedSalary,
      daysInMonth,
      absentDaysList,
    };
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="green" className="text-[10px] px-2 py-0.5">Paid in Full</Badge>;
      case 'PARTIAL':
        return <Badge variant="amber" className="text-[10px] px-2 py-0.5">Partially Paid</Badge>;
      default:
        return <Badge variant="rose" className="text-[10px] px-2 py-0.5">Unpaid</Badge>;
    }
  };

  const totalBasePayroll = payrollData.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalDeductions = payrollData.reduce((sum, p) => sum + p.attendanceDeduction, 0);
  const totalNetEarned = payrollData.reduce((sum, p) => sum + p.netEarnedSalary, 0);
  const totalPaid = payrollData.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = payrollData.reduce((sum, p) => sum + p.remainingBalance, 0);

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="min-w-[160px] py-1.5 text-xs">Staff Member & Role</TableHead>
              <TableHead className="min-w-[110px] py-1.5 text-xs">Assigned Route</TableHead>
              <TableHead className="min-w-[100px] py-1.5 text-xs">Base Salary</TableHead>
              <TableHead className="min-w-[140px] py-1.5 text-xs">Attendance &amp; Deductions</TableHead>
              <TableHead className="min-w-[100px] py-1.5 text-xs">Net Earned</TableHead>
              <TableHead className="min-w-[100px] py-1.5 text-xs">Paid So Far</TableHead>
              <TableHead className="min-w-[100px] py-1.5 text-xs">Net Due</TableHead>
              <TableHead className="w-[100px] py-1.5 text-xs">Status</TableHead>
              <TableHead className="w-[90px] text-right py-1.5 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {payrollData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-1.5 py-4">
                    <Users className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600 font-display">
                      No staff members registered
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm">
                      Add riders or walking staff to manage their monthly salary payouts.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payrollData.map(
                ({
                  staff,
                  record,
                  baseSalary,
                  paidAmount,
                  remainingBalance,
                  status,
                  presentCount,
                  absentCount,
                  dailyRate,
                  attendanceDeduction,
                  netEarnedSalary,
                  daysInMonth,
                  absentDaysList,
                }) => {
                  const isExpanded = expandedStaffId === staff.id;
                  return (
                    <React.Fragment key={staff.id}>
                      <TableRow className="hover:bg-slate-50/70 transition-colors">
                        <TableCell className="align-top py-2">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-slate-900 font-display">
                              {staff.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {staff.type === 'RIDER' ? 'Delivery Rider' : 'Walking Delivery Man'} &bull; {staff.phone || 'No phone'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-2 text-xs text-slate-700">
                          {staff.route || 'General Area'}
                        </TableCell>

                        <TableCell className="align-top py-2 font-semibold text-slate-700 tabular text-xs">
                          Rs. {baseSalary.toLocaleString()}
                        </TableCell>

                        <TableCell className="align-top py-2 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-emerald-700 font-mono">
                                {presentCount}P
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className={`text-[11px] font-bold font-mono ${absentCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                {absentCount}A
                              </span>
                              {attendanceDeduction > 0 && (
                                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">
                                  -Rs. {attendanceDeduction.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {absentCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedStaffId(isExpanded ? null : staff.id)}
                                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer underline"
                              >
                                <span>{isExpanded ? 'Hide Absents' : `${absentCount} absents (Why?)`}</span>
                                {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                              </button>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="align-top py-2 font-bold text-blue-900 tabular text-xs">
                          Rs. {netEarnedSalary.toLocaleString()}
                        </TableCell>

                        <TableCell className="align-top py-2 font-bold text-emerald-700 tabular text-xs">
                          Rs. {paidAmount.toLocaleString()}
                        </TableCell>

                        <TableCell className="align-top py-2 font-bold text-rose-700 tabular text-xs">
                          Rs. {remainingBalance.toLocaleString()}
                        </TableCell>

                        <TableCell className="align-top py-2">
                          {getStatusBadge(status)}
                        </TableCell>

                        <TableCell className="align-top py-2 text-right">
                          <Button
                            type="button"
                            variant={status === 'PAID' ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => onPaySalary(staff, baseSalary, remainingBalance, record)}
                            className={`h-6.5 px-2.5 text-[11px] font-bold cursor-pointer ${
                              status === 'PAID'
                                ? 'text-slate-700 hover:bg-slate-100'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            <Banknote className="w-3 h-3 mr-1" />
                            {status === 'PAID' ? 'View Slip' : 'Pay Salary'}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Absent Dates Ledger */}
                      {isExpanded && absentDaysList.length > 0 && (
                        <TableRow className="bg-rose-50/40">
                          <TableCell colSpan={9} className="py-2 px-3 border-y border-rose-100">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-rose-800 flex items-center gap-1 text-[11px]">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                {staff.name} Absent Dates (Daily Rate: Rs. {dailyRate}):
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {absentDaysList.map((d, i) => (
                                  <span
                                    key={i}
                                    className="bg-white border border-rose-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono shadow-2xs"
                                  >
                                    <strong className="text-slate-900">{d.dateString}</strong> ({d.weekday}): <span className="text-rose-600 font-bold uppercase">{d.status}</span> (-Rs. {dailyRate})
                                  </span>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                }
              )
            )}
          </TableBody>
        </Table>
      </div>

      {payrollData.length > 0 && (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-display font-semibold">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Monthly Payroll Totals ({selectedMonth})</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Base:</span>
              <span className="font-bold text-white tabular">
                Rs. {totalBasePayroll.toLocaleString()}
              </span>
            </div>

            {totalDeductions > 0 && (
              <div>
                <span className="text-slate-400 mr-1.5 text-[11px]">Absent Deductions:</span>
                <span className="font-bold text-rose-400 tabular">
                  - Rs. {totalDeductions.toLocaleString()}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Net Earned:</span>
              <span className="font-bold text-blue-300 tabular">
                Rs. {totalNetEarned.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Paid:</span>
              <span className="font-bold text-emerald-400 tabular">
                Rs. {totalPaid.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Remaining Due:</span>
              <span className="font-bold text-amber-400 tabular">
                Rs. {totalPending.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

