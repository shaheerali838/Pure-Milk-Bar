import React, { useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Download,
  Filter,
  CreditCard,
  Building,
  Wallet,
  Plus,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exportTableToCSV } from '@/utils/csvExport';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';

export default function RiderSalariesDetailView({
  staffList = [],
  salaries = [],
  selectedMonth: initialMonth,
  onBack,
  onPaySalary,
}) {
  let staffPayrollCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    staffPayrollCtx = useStaffPayrollContext();
  } catch (_) {}

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(initialMonth || currentMonthStr);
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStaffId, setExpandedStaffId] = useState(null);

  // Generate available months list (past 12 months)
  const availableMonths = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    availableMonths.push({ value: mStr, label });
  }

  // Aggregate staff salary records for the selected month or all months
  const staffSalaryData = staffList.map((staff) => {
    const baseSalary = Number(staff.baseSalary || staff.salary || staff.monthlySalary) || 25000;

    let matchingRecords = [];
    if (selectedMonth === 'ALL') {
      matchingRecords = salaries.filter((s) => String(s.staffId) === String(staff.id));
    } else {
      matchingRecords = salaries.filter(
        (s) => String(s.staffId) === String(staff.id) && s.month === selectedMonth
      );
    }

    const totalPaid = matchingRecords.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);

    // Dynamic Attendance calculations
    const targetMonthForAttendance = selectedMonth === 'ALL' ? currentMonthStr : selectedMonth;
    const attendance = staffPayrollCtx?.getStaffMonthlyAttendance
      ? staffPayrollCtx.getStaffMonthlyAttendance(staff.id, targetMonthForAttendance)
      : null;

    const daysInMonth = attendance?.daysInMonth || 30;
    const presentCount = attendance ? attendance.presentCount : Math.max(0, 30 - (Number(staff.absentDays) || 0));
    const absentCount = attendance ? attendance.absentCount : (Number(staff.absentDays) || 0);
    const leaveCount = attendance ? attendance.leaveCount : 0;
    const dailyRate = Math.round(baseSalary / daysInMonth);
    const attendanceDeduction = absentCount * dailyRate;
    const netEarnedSalary = Math.max(0, baseSalary - attendanceDeduction);
    const remainingBalance = Math.max(0, netEarnedSalary - totalPaid);

    const absentDaysList = attendance?.days
      ? attendance.days.filter((d) => d.status === 'absent' || d.status === 'leave')
      : [];

    let status = 'UNPAID';
    if (totalPaid >= netEarnedSalary && netEarnedSalary > 0) {
      status = 'PAID';
    } else if (totalPaid > 0) {
      status = 'PARTIAL';
    }

    const allPayments = matchingRecords.flatMap((r) =>
      (r.payments || []).map((p) => ({
        ...p,
        month: r.month,
        staffId: staff.id,
        staffName: staff.name,
        staffRole: staff.type === 'RIDER' ? 'Delivery Rider' : 'Walking Staff',
        baseSalary,
        netEarnedSalary,
      }))
    );

    return {
      staff,
      baseSalary,
      totalPaid,
      remainingBalance,
      status,
      paymentsCount: allPayments.length,
      allPayments,
      record: matchingRecords[0] || null,
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

  // Filtered staff list
  const filteredStaffData = staffSalaryData.filter((item) => {
    const matchesStaff = selectedStaff === 'ALL' || String(item.staff.id) === String(selectedStaff);

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (item.staff.name && item.staff.name.toLowerCase().includes(term)) ||
      (item.staff.phone && item.staff.phone.includes(term)) ||
      (item.staff.route && item.staff.route.toLowerCase().includes(term));

    return matchesStaff && matchesStatus && matchesSearch;
  });

  // Flatten all itemized payment transactions
  const allItemizedTransactions = filteredStaffData
    .flatMap((item) => item.allPayments)
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Compute summary KPI aggregates
  const totalSalariesDisbursed = filteredStaffData.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalBaseObligation = filteredStaffData.reduce((sum, s) => sum + s.baseSalary, 0);
  const totalDeductions = filteredStaffData.reduce((sum, s) => sum + s.attendanceDeduction, 0);
  const totalNetEarned = filteredStaffData.reduce((sum, s) => sum + s.netEarnedSalary, 0);
  const totalRemainingDue = filteredStaffData.reduce((sum, s) => sum + s.remainingBalance, 0);
  const totalStaffPaidCount = filteredStaffData.filter((s) => s.totalPaid > 0).length;

  const handleExportCSV = () => {
    const headers = [
      'Payment Date',
      'Staff / Rider Name',
      'Role / Type',
      'Salary Month',
      'Amount Paid (PKR)',
      'Base Salary (PKR)',
      'Absent Days',
      'Absent Cut (PKR)',
      'Net Earned (PKR)',
      'Payment Mode',
      'Notes & Remarks',
    ];
    const rows = allItemizedTransactions.map((p) => {
      const parentStaff = staffSalaryData.find((s) => String(s.staff.id) === String(p.staffId));
      return [
        p.date || '-',
        p.staffName || '-',
        p.staffRole || 'Rider',
        p.month || selectedMonth,
        Number(p.amount || 0),
        Number(p.baseSalary || 0),
        parentStaff ? parentStaff.absentCount : 0,
        parentStaff ? parentStaff.attendanceDeduction : 0,
        parentStaff ? parentStaff.netEarnedSalary : Number(p.baseSalary || 0),
        p.paymentMode || 'CASH',
        p.notes || 'Salary payment disbursed',
      ];
    });

    exportTableToCSV({
      filename: `Rider_Salaries_Payroll_Report_${selectedMonth}_${todayLocal}`,
      title: 'Delivery Staff & Rider Payroll Statement',
      metadata: [
        ['Payroll Period', selectedMonth.toUpperCase()],
        ['Total Disbursed', `Rs. ${totalSalariesDisbursed.toLocaleString()}`],
        ['Total Net Earned', `Rs. ${totalNetEarned.toLocaleString()}`],
        ['Total Absent Deductions', `Rs. ${totalDeductions.toLocaleString()}`],
        ['Remaining Balance Due', `Rs. ${totalRemainingDue.toLocaleString()}`],
        ['Staff Paid Count', `${totalStaffPaidCount} of ${filteredStaffData.length}`],
      ],
      headers,
      rows,
      summaryRows: [
        ['TOTAL DISBURSED', '', '', selectedMonth, `Rs. ${totalSalariesDisbursed.toLocaleString()}`, `Rs. ${totalBaseObligation.toLocaleString()}`, '', `Rs. ${totalDeductions.toLocaleString()}`, `Rs. ${totalNetEarned.toLocaleString()}`, '', `Payouts: ${allItemizedTransactions.length}`],
      ],
    });
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-200 pb-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Rider & Delivery Finance"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Rider Salaries &amp; Payroll Disbursals</span>
              <Badge variant="blue" className="text-[10px] uppercase font-bold">
                {selectedMonth === 'ALL' ? 'All Months' : selectedMonth}
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Complete ledger of rider salaries paid, attendance-based deductions, and remaining dues
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 px-3 text-xs font-semibold text-blue-800 hover:text-blue-950 border-blue-300 bg-blue-50 hover:bg-blue-100 shadow-2xs cursor-pointer gap-1.5 rounded-lg"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Card className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            TOTAL DISBURSED
          </span>
          <span className="text-lg sm:text-xl font-black text-blue-950 block font-mono tabular">
            Rs. {totalSalariesDisbursed.toLocaleString()}
          </span>
          <span className="text-[10px] text-blue-600 font-medium">
            {allItemizedTransactions.length} payment vouchers
          </span>
        </Card>

        <Card className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            STAFF PAID
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-950 block font-mono tabular">
            {totalStaffPaidCount} / {filteredStaffData.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            Active drivers compensated
          </span>
        </Card>

        <Card className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            ABSENT CUTS
          </span>
          <span className="text-lg sm:text-xl font-black text-rose-950 block font-mono tabular">
            - Rs. {totalDeductions.toLocaleString()}
          </span>
          <span className="text-[10px] text-rose-600 font-medium">
            Per-day attendance cut
          </span>
        </Card>

        <Card className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl shadow-2xs space-y-0.5">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            NET EARNED SALARY
          </span>
          <span className="text-lg sm:text-xl font-black text-indigo-950 block font-mono tabular">
            Rs. {totalNetEarned.toLocaleString()}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium">
            After absent deductions
          </span>
        </Card>

        <Card className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl shadow-2xs space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            REMAINING DUE
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-950 block font-mono tabular">
            Rs. {totalRemainingDue.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-600 font-medium">
            Pending liability
          </span>
        </Card>
      </div>

      {/* Per-Person Salary Breakdown Strip */}
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
            Per-Rider Salary Breakdown:
          </span>
          {selectedStaff !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedStaff('ALL')}
              className="text-[10px] text-blue-300 hover:text-white underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {staffSalaryData.map((sb) => {
            const isSelected = selectedStaff === String(sb.staff.id);
            return (
              <button
                type="button"
                key={sb.staff.id}
                onClick={() => setSelectedStaff(isSelected ? 'ALL' : String(sb.staff.id))}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs transition cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-300'
                    : 'bg-slate-800/90 border-slate-700 hover:bg-slate-700/80 text-slate-200'
                }`}
                title={`Click to filter by ${sb.staff.name}`}
              >
                <div className="flex items-center gap-1 font-bold font-display">
                  <User className="w-3 h-3 text-blue-300" />
                  <span>{sb.staff.name}:</span>
                </div>
                <span
                  className={`font-mono font-black tabular ${
                    sb.status === 'PAID'
                      ? 'text-emerald-400'
                      : sb.status === 'PARTIAL'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  Rs. {sb.totalPaid.toLocaleString()} / Rs. {sb.netEarnedSalary.toLocaleString()}
                </span>
                {sb.absentCount > 0 && (
                  <span className="text-[9px] font-bold text-rose-400">
                    (-{sb.absentCount}A)
                  </span>
                )}
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                    sb.status === 'PAID'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : sb.status === 'PARTIAL'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {sb.status}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v)}>
              <SelectTrigger className="h-8 text-xs bg-white">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Months</SelectItem>
                {availableMonths.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PAID')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                statusFilter === 'PAID'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fully Paid
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PARTIAL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                statusFilter === 'PARTIAL'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Partial
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNPAID')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                statusFilter === 'UNPAID'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unpaid
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={selectedStaff} onValueChange={(v) => setSelectedStaff(v)}>
              <SelectTrigger className="h-8 text-xs bg-white">
                <SelectValue placeholder="All Staff / Riders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Staff / Riders</SelectItem>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                    {s.name} ({s.type === 'RIDER' ? 'Rider' : 'Staff'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search staff / notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-2.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Staff Salary Cards & Itemized Table */}
      <div className="grid grid-cols-1 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Rider Salary Status &amp; Balances ({selectedMonth === 'ALL' ? 'All Months' : selectedMonth})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredStaffData.length} staff listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse min-w-[850px]">
              <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">STAFF / RIDER</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">ROLE &amp; ROUTE</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">BASE SALARY</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">ATTENDANCE &amp; CUTS</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">NET EARNED</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">AMOUNT PAID</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">REMAINING DUE</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">STATUS</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredStaffData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="px-3.5 py-10 text-center text-slate-400 font-medium">
                      <User className="w-8 h-8 text-slate-300 mx-auto mb-1.5 stroke-[1.5]" />
                      <p className="font-semibold text-slate-600 font-display text-xs">
                        No staff matching the selected filters
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaffData.map((item) => {
                    const isExpanded = expandedStaffId === item.staff.id;
                    return (
                      <React.Fragment key={item.staff.id}>
                        <TableRow className="hover:bg-blue-50/30 transition-colors">
                          <TableCell className="px-3.5 py-2.5 font-bold text-slate-900 font-display whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{item.staff.name}</span>
                            </div>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap text-xs">
                            <span className="font-semibold text-slate-800">
                              {item.staff.type === 'RIDER' ? 'Delivery Rider' : 'Walking Staff'}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              Route: {item.staff.route || 'General Area'}
                            </span>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-800 tabular whitespace-nowrap">
                            Rs. {item.baseSalary.toLocaleString()}
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-xs whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="font-bold text-emerald-700">{item.presentCount}P</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className={`font-bold ${item.absentCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                  {item.absentCount}A
                                </span>
                                {item.attendanceDeduction > 0 && (
                                  <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1 rounded border border-rose-100">
                                    -Rs. {item.attendanceDeduction.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {item.absentCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedStaffId(isExpanded ? null : item.staff.id)}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer underline"
                                >
                                  <span>{isExpanded ? 'Hide Dates' : 'Why Cut? (View Dates)'}</span>
                                  {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                </button>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-right font-mono font-bold text-blue-900 tabular whitespace-nowrap">
                            Rs. {item.netEarnedSalary.toLocaleString()}
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-right font-mono font-black text-emerald-700 tabular whitespace-nowrap">
                            Rs. {item.totalPaid.toLocaleString()}
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-right font-mono font-black text-rose-700 tabular whitespace-nowrap">
                            Rs. {item.remainingBalance.toLocaleString()}
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                                item.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : item.status === 'PARTIAL'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </TableCell>

                          <TableCell className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (onPaySalary) {
                                  onPaySalary(
                                    item.staff,
                                    item.baseSalary,
                                    item.remainingBalance,
                                    item.record
                                  );
                                }
                              }}
                              className={`h-7 px-2.5 text-xs font-bold cursor-pointer rounded-lg shadow-2xs ${
                                item.status === 'PAID'
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {item.status === 'PAID' ? 'Add Bonus / Pay' : 'Disburse Salary'}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Absent Breakdown Details */}
                        {isExpanded && item.absentDaysList.length > 0 && (
                          <TableRow className="bg-rose-50/40">
                            <TableCell colSpan={9} className="py-2.5 px-4 border-y border-rose-100">
                              <div className="space-y-1 text-xs">
                                <span className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>
                                    Itemized Absents for {item.staff.name} in {selectedMonth} &bull; Daily Wage Rate: Rs. {item.dailyRate} / day
                                  </span>
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  {item.absentDaysList.map((d, i) => (
                                    <span
                                      key={i}
                                      className="bg-white border border-rose-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono shadow-2xs"
                                    >
                                      <strong className="text-slate-900">{d.dateString}</strong> ({d.weekday}): <span className="text-rose-600 font-bold uppercase">{d.status}</span> (-Rs. {item.dailyRate})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
              {filteredStaffData.length > 0 && (
                <TableFooter className="border-t-2 border-slate-200 bg-slate-50/90 font-bold text-xs text-slate-900">
                  <TableRow>
                    <TableCell colSpan={2} className="px-3.5 py-2 uppercase font-black text-slate-800">
                      Total ({filteredStaffData.length} Staff)
                    </TableCell>
                    <TableCell className="px-3.5 py-2 text-right font-mono font-bold tabular">
                      Rs. {totalBaseObligation.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3.5 py-2 text-rose-600 font-mono font-bold tabular">
                      - Rs. {totalDeductions.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3.5 py-2 text-right font-mono font-bold text-blue-900 tabular">
                      Rs. {totalNetEarned.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3.5 py-2 text-right font-mono font-black text-emerald-700 tabular">
                      Rs. {totalSalariesDisbursed.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3.5 py-2 text-right font-mono font-black text-rose-700 tabular">
                      Rs. {totalRemainingDue.toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </div>

        {/* Itemized Payment History Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Itemized Salary Payment Receipts ({allItemizedTransactions.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time payment vouchers
            </span>
          </div>

          <div className="overflow-x-auto max-h-72">
            <Table className="w-full text-left border-collapse min-w-[850px]">
              <TableHeader className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                <TableRow className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-50">
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">DATE</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">STAFF MEMBER</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">SALARY MONTH</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-right text-slate-400 font-bold">AMOUNT PAID</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-center text-slate-400 font-bold">PAYMENT MODE</TableHead>
                  <TableHead className="px-3.5 py-2 h-auto text-slate-400 font-bold">NOTES / REMARKS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs text-slate-700">
                {allItemizedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-3.5 py-8 text-center text-slate-400 font-medium">
                      No payment vouchers recorded for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  allItemizedTransactions.map((tx, idx) => (
                    <TableRow key={tx.id || idx} className="hover:bg-blue-50/20 transition-colors">
                      <TableCell className="px-3.5 py-2 font-mono text-slate-800 font-semibold tabular whitespace-nowrap">
                        {tx.date || '-'}
                      </TableCell>
                      <TableCell className="px-3.5 py-2 font-bold text-slate-900 font-display whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>{tx.staffName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3.5 py-2 font-semibold text-slate-700 whitespace-nowrap">
                        <Badge variant="blue" className="text-[10px]">
                          {tx.month || selectedMonth}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3.5 py-2 text-right font-mono font-black text-emerald-700 tabular whitespace-nowrap">
                        Rs. {Number(tx.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3.5 py-2 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {tx.paymentMode || 'CASH'}
                        </span>
                      </TableCell>
                      <TableCell className="px-3.5 py-2 text-slate-500 max-w-[220px] truncate">
                        {tx.notes || 'Monthly salary payment cleared'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
