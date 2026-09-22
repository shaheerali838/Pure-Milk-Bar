import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Filter,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStaffContext, generateDefaultAttendanceMap } from '@/context/StaffContext';

export default function StaffAttendanceSheet({ staff }) {
  const { toggleDayAttendance, setDayAttendance, markAllAttendance, setStaffAttendance } = useStaffContext();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'present' | 'leave' | 'absent'

  if (!staff) return null;

  // Month information
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth(); // 0-11
  const todayDayNum = Math.min(30, Math.max(1, today.getDate()));
  const monthName = today.toLocaleString('default', { month: 'short' });
  const fullMonthName = today.toLocaleString('default', { month: 'long' });

  // Compute daily wage
  const monthlySalary = Number(staff.monthlySalary) || 0;
  const dailySalary = staff.dailySalary || Math.round(monthlySalary / 30);

  // Attendance map: 30 days
  const attendanceMap = useMemo(() => {
    if (staff.attendanceMap && Object.keys(staff.attendanceMap).length > 0) {
      return staff.attendanceMap;
    }
    return generateDefaultAttendanceMap(staff.absentDays || 0, 30);
  }, [staff.attendanceMap, staff.absentDays]);

  // Days list 1 to 30 with dates and day of week
  const daysList = useMemo(() => {
    const list = [];
    for (let d = 1; d <= 30; d++) {
      const dateObj = new Date(currentYear, currentMonthIndex, d);
      const weekday = dateObj.toLocaleString('default', { weekday: 'long' });
      const weekdayShort = dateObj.toLocaleString('default', { weekday: 'short' });
      const isToday = d === todayDayNum;
      const status = attendanceMap[d] || 'present';

      list.push({
        dayNum: d,
        dateFormatted: `${d < 10 ? '0' : ''}${d} ${monthName}`,
        weekday,
        weekdayShort,
        isToday,
        status,
      });
    }
    return list;
  }, [attendanceMap, currentYear, currentMonthIndex, monthName, todayDayNum]);

  // Counts
  const presentCount = daysList.filter((d) => d.status === 'present').length;
  const leaveCount = daysList.filter((d) => d.status === 'leave').length;
  const absentCount = daysList.filter((d) => d.status === 'absent').length;
  const attendancePercentage = Math.round((presentCount / 30) * 100);
  const totalAbsentDeduction = absentCount * dailySalary;
  const netTakeHome = Math.max(0, monthlySalary - totalAbsentDeduction);

  // Filtered days
  const filteredDays = daysList.filter((d) => {
    if (filterMode === 'present') return d.status === 'present';
    if (filterMode === 'leave') return d.status === 'leave';
    if (filterMode === 'absent') return d.status === 'absent';
    return true;
  });

  const handleToggle = (dayNum) => {
    toggleDayAttendance(staff.id, dayNum);
  };

  const handleSetStatus = (dayNum, status) => {
    if (setDayAttendance) {
      setDayAttendance(staff.id, dayNum, status);
    } else {
      toggleDayAttendance(staff.id, dayNum);
    }
  };

  const handleMarkToday = (status) => {
    const updatedMap = { ...attendanceMap, [todayDayNum]: status };
    const nextAbsent = Object.values(updatedMap).filter((v) => v === 'absent').length;
    setStaffAttendance(staff.id, {
      status: status === 'present' ? 'Active' : (status === 'leave' ? 'On Leave' : 'Inactive'),
      absentDays: nextAbsent,
      attendanceMap: updatedMap,
    });
  };

  const handleMarkAll = (status) => {
    markAllAttendance(staff.id, status);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & KPI Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 font-display flex items-center gap-2">
              <span>{fullMonthName} {currentYear} Attendance Register</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                {presentCount} / 30 Days Present
              </span>
            </h3>
          </div>
          
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll('present')}
            className="h-8 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 cursor-pointer"
            title="Mark all 30 days present"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Mark All Present
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll('leave')}
            className="h-8 px-3 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 cursor-pointer"
            title="Mark all 30 days on leave"
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            Mark All Leave
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleMarkAll('absent')}
            className="h-8 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 cursor-pointer"
            title="Mark all 30 days absent"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Mark All Absent
          </Button>

          {/* Today Quick Toggle */}
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => handleMarkToday('present')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                attendanceMap[todayDayNum] === 'present'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Today Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkToday('leave')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                attendanceMap[todayDayNum] === 'leave'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Today Leave
            </button>
            <button
              type="button"
              onClick={() => handleMarkToday('absent')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                attendanceMap[todayDayNum] === 'absent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Today Absent
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip (Signature AnimalStatsCards Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Days Present */}
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono">
              {attendancePercentage}%
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-emerald-700 leading-tight tracking-tight mb-0.5 tabular">
              {presentCount} <span className="text-xs font-normal text-slate-500">/ 30</span>
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Days Present
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Turnout achieved
            </p>
          </div>
        </div>

        {/* On Leave */}
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
              Excused
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-amber-800 leading-tight tracking-tight mb-0.5 tabular">
              {leaveCount} Days
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              On Leave
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Approved leaves
            </p>
          </div>
        </div>

        {/* Days Absent */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #ef4444' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#ef444415' }}
            >
              <XCircle style={{ width: 16, height: 16, color: '#ef4444' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-rose-700 bg-rose-50 border border-rose-200">
              Cut
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-rose-600 leading-tight tracking-tight mb-0.5 tabular">
              {absentCount} Days
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Days Absent
            </p>
            <p className="text-[11px] text-rose-600 font-medium truncate">
              -Rs. {totalAbsentDeduction.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Daily Wage Rate */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #3b82f6' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#3b82f615' }}
            >
              <DollarSign style={{ width: 16, height: 16, color: '#3b82f6' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-blue-700 bg-blue-50 border border-blue-200">
              Wage
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-blue-700 leading-tight tracking-tight mb-0.5 tabular">
              Rs. {dailySalary.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Daily Wage Rate
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Per working shift
            </p>
          </div>
        </div>

        {/* Net Monthly Payable */}
        <div
          className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all duration-200"
          style={{ borderTop: '4px solid #10b981' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ background: '#10b98115' }}
            >
              <TrendingUp style={{ width: 16, height: 16, color: '#10b981' }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
              Net
            </span>
          </div>
          <div>
            <p className="font-display text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular truncate">
              Rs. {netTakeHome.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-700 font-display">
              Net Payable
            </p>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              Disbursable pay
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 30 Days (30)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('present')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'present'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-white/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present ({presentCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('leave')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'leave'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-700 hover:bg-white/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            On Leave ({leaveCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('absent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'absent'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-700 hover:bg-white/60'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            Absent ({absentCount})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filteredDays.length}</strong> of 30 days
        </span>
      </div>

      {/* Master 30-Day Attendance Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Day #</th>
                <th className="py-2.5 px-4">Date &amp; Month</th>
                <th className="py-2.5 px-4">Day of Week</th>
                <th className="py-2.5 px-4">Shift Schedule</th>
                <th className="py-2.5 px-4 text-center">Duty Status</th>
                <th className="py-2.5 px-4">Day Wage Earning</th>
                <th className="py-2.5 px-4 text-right">Quick Set Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDays.map((item) => {
                const isPresent = item.status === 'present';
                const isLeave = item.status === 'leave';
                const isAbsent = item.status === 'absent';

                return (
                  <tr
                    key={item.dayNum}
                    className={`transition-colors duration-150 ${
                      item.isToday
                        ? 'bg-blue-50/40 hover:bg-blue-50/70 font-semibold'
                        : isPresent
                        ? 'hover:bg-emerald-50/30'
                        : isLeave
                        ? 'hover:bg-amber-50/30 bg-amber-50/10'
                        : 'hover:bg-rose-50/30 bg-rose-50/10'
                    }`}
                  >
                    {/* Day Number */}
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>Day {item.dayNum < 10 ? `0${item.dayNum}` : item.dayNum}</span>
                        {item.isToday && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-4 font-semibold text-slate-800 font-mono">
                      {item.dateFormatted}
                    </td>

                    {/* Weekday */}
                    <td className="py-2.5 px-4 text-slate-600">
                      {item.weekday}
                    </td>

                    {/* Shift */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{staff.shift || 'Morning'} (8h)</span>
                      </div>
                    </td>

                    {/* Duty Status (Interactive Badge - click to cycle) */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(item.dayNum)}
                        title={`Day ${item.dayNum}: Click to cycle Present → Leave → Absent`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer shadow-2xs ${
                          isPresent
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                            : isLeave
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : isLeave ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        )}
                        <span>
                          {isPresent ? 'Present (Paid)' : isLeave ? 'On Leave (Excused)' : 'Absent (Deducted)'}
                        </span>
                      </button>
                    </td>

                    {/* Daily Wage Earning */}
                    <td className="py-2.5 px-4 font-mono">
                      {isPresent ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-bold">
                          <span>Rs. {dailySalary.toLocaleString()}</span>
                          <span className="text-[10px] font-normal text-emerald-600">earned</span>
                        </div>
                      ) : isLeave ? (
                        <div className="flex items-center gap-1 text-amber-700 font-bold">
                          <span>Rs. {dailySalary.toLocaleString()}</span>
                          <span className="text-[10px] font-normal text-amber-600">approved leave</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-600 font-bold">
                          <span className="line-through opacity-70">Rs. {dailySalary.toLocaleString()}</span>
                          <span className="text-[10px] font-extrabold text-rose-700">(-Rs. {dailySalary.toLocaleString()})</span>
                        </div>
                      )}
                    </td>

                    {/* Quick Set Status: 3-Pill Switcher */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSetStatus(item.dayNum, 'present')}
                          className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                            isPresent ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                          }`}
                          title="Set Present"
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(item.dayNum, 'leave')}
                          className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                            isLeave ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                          }`}
                          title="Set On Leave"
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(item.dayNum, 'absent')}
                          className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                            isAbsent ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                          }`}
                          title="Set Absent"
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong>P</strong> = Present • <strong>L</strong> = On Leave (Excused) • <strong>A</strong> = Absent (Deducted daily wage).
            </span>
          </span>
          <span className="font-bold text-slate-700">
            Total Net Salary: <strong className="text-emerald-700 font-mono">Rs. {netTakeHome.toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
