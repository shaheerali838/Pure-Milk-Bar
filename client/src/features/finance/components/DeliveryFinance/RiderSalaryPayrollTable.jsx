import React from 'react';
import { DollarSign, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
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

export default function RiderSalaryPayrollTable({
  staffList = [],
  selectedMonth = '2026-09',
  onPaySalary,
}) {
  const { getSalaryRecord } = useRiderSalaryContext();

  const payrollData = staffList.map((staff) => {
    const record = getSalaryRecord(staff.id, selectedMonth);
    const baseSalary = record ? Number(record.baseSalary) : 25000;
    const paidAmount = record ? Number(record.paidAmount) : 0;
    const remainingBalance = Math.max(0, baseSalary - paidAmount);

    let status = 'UNPAID';
    if (paidAmount >= baseSalary) {
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

  const totalPayroll = payrollData.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalPaid = payrollData.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = payrollData.reduce((sum, p) => sum + p.remainingBalance, 0);

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="min-w-[170px] py-1.5 text-xs">Staff Member & Role</TableHead>
              <TableHead className="min-w-[120px] py-1.5 text-xs">Assigned Route</TableHead>
              <TableHead className="min-w-[110px] py-1.5 text-xs">Monthly Salary</TableHead>
              <TableHead className="min-w-[110px] py-1.5 text-xs">Paid So Far</TableHead>
              <TableHead className="min-w-[110px] py-1.5 text-xs">Remaining Due</TableHead>
              <TableHead className="w-[120px] py-1.5 text-xs">Salary Status</TableHead>
              <TableHead className="w-[100px] text-right py-1.5 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {payrollData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center">
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
                }) => (
                  <TableRow
                    key={staff.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Staff Name & Role */}
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

                    {/* Route */}
                    <TableCell className="align-top py-2 text-xs text-slate-700">
                      {staff.route || 'General Delivery Area'}
                    </TableCell>

                    {/* Base Salary */}
                    <TableCell className="align-top py-2 font-bold text-slate-900 tabular text-xs">
                      Rs. {baseSalary.toLocaleString()}
                    </TableCell>

                    {/* Paid Amount */}
                    <TableCell className="align-top py-2 font-bold text-emerald-700 tabular text-xs">
                      Rs. {paidAmount.toLocaleString()}
                    </TableCell>

                    {/* Remaining Due */}
                    <TableCell className="align-top py-2 font-bold text-rose-700 tabular text-xs">
                      Rs. {remainingBalance.toLocaleString()}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-top py-2">
                      {getStatusBadge(status)}
                    </TableCell>

                    {/* Pay Button */}
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
                        <DollarSign className="w-3 h-3 mr-1" />
                        {status === 'PAID' ? 'View Payment' : 'Pay Salary'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      {payrollData.length > 0 && (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 font-display font-semibold">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Monthly Payroll Totals ({selectedMonth})</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Total Salary Obligation:</span>
              <span className="font-bold text-white tabular">
                Rs. {totalPayroll.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Total Paid:</span>
              <span className="font-bold text-emerald-400 tabular">
                Rs. {totalPaid.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 mr-1.5 text-[11px]">Pending Unpaid:</span>
              <span className="font-bold text-rose-400 tabular">
                Rs. {totalPending.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
