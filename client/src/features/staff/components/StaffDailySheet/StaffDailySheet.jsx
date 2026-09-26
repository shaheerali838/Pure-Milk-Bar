import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  Lock,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Sun,
  Sunset,
  Moon,
  Edit3,
  Check,
  Briefcase,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { exportTableToCSV } from '@/utils/csvExport';

export default function StaffDailySheet() {
  const {
    staffList = [],
    dailySheets,
    updateDailySheetEntry,
    getStaffStatusOnDate,
    markAttendance,
  } = useStaffPayrollContext();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLocked, setIsLocked] = useState(false);
  const [shiftFilter, setShiftFilter] = useState('all');
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [tempEditData, setTempEditData] = useState({});

  // Date metadata
  const parseSafeDate = (dStr) => {
    if (dStr && /^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      const [y, m, d] = dStr.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const currentDateObj = parseSafeDate(date);
  const formattedDate = currentDateObj.toLocaleDateString('default', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const isToday = date === new Date().toISOString().split('T')[0];

  const handlePrevDay = () => {
    const cur = parseSafeDate(date);
    cur.setDate(cur.getDate() - 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    const cur = parseSafeDate(date);
    cur.setDate(cur.getDate() + 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
  };

  const quickDateStrip = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = parseSafeDate(date);
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    return {
      dateStr,
      dayNum: d.getDate(),
      weekday: d.toLocaleDateString('default', { weekday: 'short' }),
      isCurrent: dateStr === date,
    };
  });

  // Day sheet records for this date
  const dayEntries = dailySheets[date] || {};

  // Aggregate Data for Daily Sheet
  const sheetRows = useMemo(() => {
    return staffList.map((staff, index) => {
      const entry = dayEntries[staff.id] || {};
      const status = getStaffStatusOnDate(staff.id, date);
      const scheduledHours = 8; // Standard shift hours
      const actualHours =
        entry.hours !== undefined
          ? parseFloat(entry.hours)
          : status === 'present'
          ? 8
          : 0;

      const assignment =
        entry.assignment !== undefined
          ? entry.assignment
          : staff.route && staff.route.toLowerCase() !== 'n/a'
          ? staff.route
          : `${staff.role} Duties`;

      const notes = entry.notes || '';
      const dailySalary = staff.dailySalary || Math.round((staff.monthlySalary || 0) / 30);
      const payableToday = status === 'absent' ? 0 : dailySalary;

      return {
        index: index + 1,
        staffId: staff.id,
        name: staff.name,
        role: staff.role,
        shift: entry.shift || staff.shift || 'Morning',
        status,
        scheduledHours,
        actualHours,
        dailySalary,
        payableToday,
        assignment,
        notes,
      };
    });
  }, [staffList, dayEntries, date, getStaffStatusOnDate]);

  // Filter rows by Shift
  const filteredRows = useMemo(() => {
    if (shiftFilter === 'all') return sheetRows;
    return sheetRows.filter((r) => r.shift.toLowerCase() === shiftFilter.toLowerCase());
  }, [sheetRows, shiftFilter]);

  // Totals
  const totals = useMemo(() => {
    let totalScheduledStaff = sheetRows.length;
    let presentStaff = 0;
    let leaveStaff = 0;
    let absentStaff = 0;
    let totalHoursLogged = 0;
    let totalDailyWagePayout = 0;

    sheetRows.forEach((r) => {
      if (r.status === 'present') presentStaff++;
      else if (r.status === 'leave') leaveStaff++;
      else if (r.status === 'absent') absentStaff++;

      totalHoursLogged += r.actualHours;
      totalDailyWagePayout += r.payableToday;
    });

    return {
      totalScheduledStaff,
      presentStaff,
      leaveStaff,
      absentStaff,
      totalHoursLogged,
      totalDailyWagePayout,
    };
  }, [sheetRows]);

  // Shift Totals
  const shiftSummaries = useMemo(() => {
    const shifts = {
      Morning: { staffCount: 0, hours: 0, wages: 0 },
      Evening: { staffCount: 0, hours: 0, wages: 0 },
      Night: { staffCount: 0, hours: 0, wages: 0 },
    };

    sheetRows.forEach((r) => {
      const s = r.shift || 'Morning';
      if (!shifts[s]) shifts[s] = { staffCount: 0, hours: 0, wages: 0 };
      shifts[s].staffCount += 1;
      shifts[s].hours += r.actualHours;
      shifts[s].wages += r.payableToday;
    });

    return shifts;
  }, [sheetRows]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler (Procurement Sheet style)
  const handleDownloadCSV = () => {
    const headers = [
      '#',
      'Staff ID',
      'Staff Name',
      'Role',
      'Shift',
      'Duty Status',
      'Scheduled Hours',
      'Actual Hours Worked',
      'Daily Wage (PKR)',
      'Assignment / Route',
      'Notes',
    ];

    const csvRows = filteredRows.map((r) => [
      r.index,
      r.staffId,
      r.name,
      r.role,
      r.shift,
      r.status ? r.status.toUpperCase() : 'PRESENT',
      r.scheduledHours,
      r.actualHours,
      `Rs. ${Number(r.payableToday || 0).toLocaleString()}`,
      r.assignment || '-',
      r.notes || '-',
    ]);

    exportTableToCSV({
      filename: `Staff_Daily_Sheet_${date}`,
      title: 'Daily Staff Attendance, Duty & Wages Master Sheet',
      metadata: [
        ['Sheet Date', date],
        ['Shift Filter', shiftFilter.toUpperCase()],
        ['Total Scheduled Staff', totals.totalScheduledStaff],
        ['Present On Duty', totals.presentStaff],
        ['On Leave / Absent', totals.leaveStaff + totals.absentStaff],
        ['Total Hours Worked', `${totals.totalHoursLogged} Hours`],
        ['Total Daily Wage Payout', `Rs. ${Number(totals.totalDailyWagePayout || 0).toLocaleString()}`],
      ],
      headers,
      rows: csvRows,
      summaryRows: [
        ['DAILY TOTALS', '', '', '', '', `${totals.presentStaff} Present / ${totals.totalScheduledStaff} Total`, '', `${totals.totalHoursLogged} hrs`, `Rs. ${Number(totals.totalDailyWagePayout || 0).toLocaleString()}`, '', `Roster: ${csvRows.length}`],
      ],
    });
  };

  // Start Editing Row
  const startEditing = (row) => {
    if (isLocked) {
      alert('This sheet is locked. Please unlock it to make adjustments.');
      return;
    }
    setEditingStaffId(row.staffId);
    setTempEditData({
      hours: row.actualHours,
      assignment: row.assignment,
      notes: row.notes,
      shift: row.shift,
    });
  };

  // Save Editing Row
  const saveEditing = (staffId) => {
    updateDailySheetEntry(date, staffId, tempEditData);
    setEditingStaffId(null);
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('delivery') || r.includes('rider')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('farm') || r.includes('milk')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (r.includes('security')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (r.includes('cashier')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (r.includes('manager')) return 'bg-purple-50 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* 1. Header Bar (Exact Procurement Sheet Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            Daily Staff Operations &amp; Shift Sheet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Date: <strong className="text-slate-800">{formattedDate}</strong>
            {isToday && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Today
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Date Stepper & Picker */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              className="px-2.5 h-[38px] rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Previous Day"
            >
              &larr; Prev
            </button>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 h-[38px] text-xs font-semibold text-slate-700 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-none outline-none bg-transparent cursor-pointer font-bold text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="px-2.5 h-[38px] rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Next Day"
            >
              Next &rarr;
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="px-3 h-[38px] rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Today
              </button>
            )}
          </div>

          {/* Download CSV Button */}
          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-[38px] rounded-full text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </Button>

          {/* Print Sheet Button */}
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 px-3.5 h-[38px] rounded-full text-xs font-semibold border-slate-200 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </Button>

          {/* Lock Daily Sheet Button */}
          <Button
            onClick={() => setIsLocked(!isLocked)}
            className="flex items-center gap-2 px-4 h-[38px] rounded-full text-white text-xs font-semibold shadow-xs cursor-pointer transition"
            style={{ backgroundColor: isLocked ? '#059669' : '#d97706' }}
          >
            {isLocked ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Day Locked
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Lock Daily Sheet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick 7-Day Clickable Strip */}
      <div className="bg-slate-100/80 p-2 rounded-2xl border border-slate-200 flex items-center justify-between gap-1 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase px-2 shrink-0">
          Jump to Day:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {quickDateStrip.map((item) => (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => setDate(item.dateStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                item.isCurrent
                  ? 'bg-[#d97706] text-white shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span className="text-[10px] uppercase opacity-80">{item.weekday}</span>
              <span className="font-mono">{item.dayNum}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary KPI Ribbon (Exact AnimalStatsCards Signature Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Total Staff Scheduled */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #3b82f6' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#3b82f615' }}
            >
              <Users style={{ width: 16, height: 16, color: '#3b82f6' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-blue-700 bg-blue-50 border border-blue-200">
              Roster
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {totals.totalScheduledStaff}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Total Scheduled
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Employees on roster
            </p>
          </div>
        </div>

        {/* 2. Total Hours Logged */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #f59e0b' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#f59e0b15' }}
            >
              <Clock style={{ width: 16, height: 16, color: '#f59e0b' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200">
              Duty Hours
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-amber-800 leading-tight tracking-tight mb-0.5 tabular font-mono">
              {totals.totalHoursLogged} hrs
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Shift Hours Logged
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Total productive duty
            </p>
          </div>
        </div>

        {/* 3. Present On Duty */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #009966' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#00996615' }}
            >
              <CheckCircle2 style={{ width: 16, height: 16, color: '#009966' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
              Active
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
              {totals.presentStaff}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Present On Duty
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Active working today
            </p>
          </div>
        </div>

        {/* 4. On Leave & Absent */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #ef4444' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#ef444415' }}
            >
              <Users style={{ width: 16, height: 16, color: '#ef4444' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-rose-700 bg-rose-50 border border-rose-200">
              Off-Duty
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular font-mono">
              {totals.leaveStaff}L / {totals.absentStaff}A
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Leave &amp; Off Duty
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Excused &amp; unexcused
            </p>
          </div>
        </div>

        {/* 5. Total Daily Wage Payout */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200 col-span-1 sm:col-span-2 lg:col-span-1"
          style={{ borderTop: '4px solid #10b981' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#10b98115' }}
            >
              <DollarSign style={{ width: 16, height: 16, color: '#10b981' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
              Payout
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-800 leading-tight tracking-tight mb-0.5 tabular font-mono truncate">
              Rs. {totals.totalDailyWagePayout.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Daily Wage Payout
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Total payable today
            </p>
          </div>
        </div>
      </div>

      {/* 3. Shift-Wise Distribution Cards (Like Route-Wise Summaries in Procurement Sheet) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Shift-Wise Allocation &amp; Wage Disbursement
          </h3>
          <span className="text-xs text-slate-400 font-medium">3 Daily Dairy Shifts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Morning Shift */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Morning Shift</span>
                <span className="text-[10px] text-slate-500">05:00 AM - 01:00 PM</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <strong className="text-amber-900 block font-black">
                {shiftSummaries.Morning?.staffCount || 0} Staff
              </strong>
              <span className="text-[10px] text-slate-500">
                Rs. {(shiftSummaries.Morning?.wages || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Evening Shift */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Sunset className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Evening Shift</span>
                <span className="text-[10px] text-slate-500">01:00 PM - 09:00 PM</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <strong className="text-blue-900 block font-black">
                {shiftSummaries.Evening?.staffCount || 0} Staff
              </strong>
              <span className="text-[10px] text-slate-500">
                Rs. {(shiftSummaries.Evening?.wages || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Night Shift */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Night Shift</span>
                <span className="text-[10px] text-slate-500">09:00 PM - 05:00 AM</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <strong className="text-indigo-900 block font-black">
                {shiftSummaries.Night?.staffCount || 0} Staff
              </strong>
              <span className="text-[10px] text-slate-500">
                Rs. {(shiftSummaries.Night?.wages || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Master Daily Shift Operations Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter Shift:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-lg">
              {['all', 'Morning', 'Evening', 'Night'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShiftFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    shiftFilter === s
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === 'all' ? 'All Shifts' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredRows.length}</strong> staff entries
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Staff ID</th>
                <th className="py-2.5 px-3">Staff Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Shift</th>
                <th className="py-2.5 px-3">Assigned Route / Station</th>
                <th className="py-2.5 px-3 text-center">Duty Status</th>
                <th className="py-2.5 px-3 text-center">Sched. Hrs</th>
                <th className="py-2.5 px-3 text-center">Actual Worked</th>
                <th className="py-2.5 px-3 text-right">Daily Wage (PKR)</th>
                <th className="py-2.5 px-3">Duty Notes</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No staff records found for this shift.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isEditing = editingStaffId === row.staffId;
                  const isPres = row.status === 'present';
                  const isLeave = row.status === 'leave';

                  return (
                    <tr
                      key={row.staffId}
                      className={`hover:bg-amber-50/30 transition ${
                        isEditing ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {row.index}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {row.staffId}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{row.name}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(row.role)}`}>
                          {row.role}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <select
                            value={tempEditData.shift || row.shift}
                            onChange={(e) =>
                              setTempEditData({ ...tempEditData, shift: e.target.value })
                            }
                            className="text-xs bg-white border border-slate-300 rounded px-1.5 py-1 outline-none cursor-pointer"
                          >
                            <option value="Morning">Morning</option>
                            <option value="Evening">Evening</option>
                            <option value="Night">Night</option>
                          </select>
                        ) : (
                          <span className="text-slate-700 font-semibold">{row.shift}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempEditData.assignment || ''}
                            onChange={(e) =>
                              setTempEditData({ ...tempEditData, assignment: e.target.value })
                            }
                            placeholder="Station / Route"
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none w-36"
                          />
                        ) : (
                          <span className="text-slate-800 flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {row.assignment}
                          </span>
                        )}
                      </td>

                      {/* Duty Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPres
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isLeave
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isPres ? 'Present' : isLeave ? 'On Leave' : 'Absent'}
                        </span>
                      </td>

                      {/* Scheduled Hours */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {row.scheduledHours}h
                      </td>

                      {/* Actual Hours Worked */}
                      <td className="py-2.5 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            value={tempEditData.hours ?? row.actualHours}
                            onChange={(e) =>
                              setTempEditData({
                                ...tempEditData,
                                hours: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-16 text-center text-xs bg-white border border-slate-300 rounded px-1 py-1 font-mono font-bold outline-none"
                          />
                        ) : (
                          <span className="font-mono font-black text-slate-900">
                            {row.actualHours}h
                          </span>
                        )}
                      </td>

                      {/* Daily Wage */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        Rs. {row.payableToday.toLocaleString()}
                      </td>

                      {/* Duty Notes */}
                      <td className="py-2.5 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempEditData.notes || ''}
                            onChange={(e) =>
                              setTempEditData({ ...tempEditData, notes: e.target.value })
                            }
                            placeholder="Duty notes..."
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none w-32"
                          />
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            {row.notes || '—'}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => saveEditing(row.staffId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => startEditing(row)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-bold transition cursor-pointer disabled:opacity-30"
                            title="Edit shift hours or duty notes"
                          >
                            <Edit3 className="w-3 h-3 text-slate-400" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Totals Summary Row */}
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-slate-900 text-xs">
                  <td colSpan={6} className="py-3 px-3 uppercase tracking-wider">
                    Total Daily Operations ({filteredRows.length} Staff)
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-700 font-mono">
                    {totals.presentStaff} Present
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    {filteredRows.reduce((a, b) => a + b.scheduledHours, 0)}h
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-amber-900">
                    {filteredRows.reduce((a, b) => a + b.actualHours, 0)}h
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-800">
                    Rs. {filteredRows.reduce((a, b) => a + b.payableToday, 0).toLocaleString()}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
