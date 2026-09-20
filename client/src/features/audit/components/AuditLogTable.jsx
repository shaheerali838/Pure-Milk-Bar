import React, { useState, useMemo } from 'react';
import { Search, Eye, Filter, Shield, User, ArrowRight, X, RotateCcw, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/common/Typography';
import { useStaffContext } from '@/context/StaffContext';

export default function AuditLogTable({
  events = [],
  onViewDetail,
}) {
  const { staffList = [] } = useStaffContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');

  // Period / Date filter: 'today' | 'weekly' | 'monthly' | 'custom' | 'all'
  const [period, setPeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Extract distinct actual users STRICTLY from users created inside Staff & Payroll
  const distinctUsers = useMemo(() => {
    const userSet = new Set();
    staffList.forEach((s) => {
      const name = (s.name || '').trim();
      if (name) {
        userSet.add(name);
      }
    });

    return Array.from(userSet).sort((a, b) => a.localeCompare(b));
  }, [staffList]);

  // Filtered list with strict date, user, action, and search matching
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

    return events.filter((e) => {
      // 1. Date / Period filter (Today by default)
      if (period !== 'all') {
        if (!e.timestamp) return false;
        const evtTime = new Date(e.timestamp).getTime();
        if (isNaN(evtTime)) return false;

        if (period === 'today') {
          if (evtTime < startOfToday.getTime() || evtTime > endOfToday.getTime()) {
            return false;
          }
        } else if (period === 'weekly') {
          if (evtTime < sevenDaysAgo.getTime() || evtTime > endOfToday.getTime()) {
            return false;
          }
        } else if (period === 'monthly') {
          if (evtTime < thirtyDaysAgo.getTime() || evtTime > endOfToday.getTime()) {
            return false;
          }
        } else if (period === 'custom') {
          if (customStartDate) {
            const start = new Date(`${customStartDate}T00:00:00`).getTime();
            if (!isNaN(start) && evtTime < start) {
              return false;
            }
          }
          if (customEndDate) {
            const end = new Date(`${customEndDate}T23:59:59.999`).getTime();
            if (!isNaN(end) && evtTime > end) {
              return false;
            }
          }
        }
      }

      // 2. Action Filter (Strict matching — no default fallback to 'Create')
      if (actionFilter && actionFilter !== 'ALL' && actionFilter !== 'All Actions') {
        const rawAction = (e.action || '').trim().toLowerCase();
        const targetAct = actionFilter.trim().toLowerCase();
        if (rawAction !== targetAct) {
          return false;
        }
      }

      // 3. User Filter (Matching selected staff member)
      if (userFilter && userFilter !== 'ALL' && userFilter !== 'All Users') {
        const eventUser = (e.user || '').trim().toLowerCase();
        const eventDetail = (e.detail || '').trim().toLowerCase();
        const targetUser = userFilter.trim().toLowerCase();
        const matchesUser = eventUser === targetUser || eventDetail.includes(targetUser);
        if (!matchesUser) {
          return false;
        }
      }

      // 4. Search term matching ID, user, module, action, and detail
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          (e.id && e.id.toLowerCase().includes(term)) ||
          (e.user && e.user.toLowerCase().includes(term)) ||
          (e.action && e.action.toLowerCase().includes(term)) ||
          (e.module && e.module.toLowerCase().includes(term)) ||
          (e.detail && e.detail.toLowerCase().includes(term));
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchTerm, actionFilter, userFilter, period, customStartDate, customEndDate]);

  const hasActiveFilters =
    searchTerm !== '' ||
    (actionFilter !== 'ALL' && actionFilter !== 'All Actions') ||
    (userFilter !== 'ALL' && userFilter !== 'All Users') ||
    period !== 'today' ||
    customStartDate !== '' ||
    customEndDate !== '';

  const handleResetFilters = () => {
    setSearchTerm('');
    setActionFilter('ALL');
    setUserFilter('ALL');
    setPeriod('today');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'Create':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Create
          </span>
        );
      case 'Update':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Update
          </span>
        );
      case 'Delete':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Delete
          </span>
        );
      case 'Day Close':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Day Close
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {action || 'Event'}
          </span>
        );
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return String(ts);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Period Selector Tabs and Search/Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-1 border-b border-slate-100">
          {/* Period Tabs: Today (default), Weekly, Monthly, Custom, All */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tabs
              value={period}
              onValueChange={setPeriod}
              className="w-auto"
            >
              <TabsList variant="pills" className="bg-slate-100/90 border border-slate-200/80 p-0.5 h-8.5">
                <TabsTrigger value="today" variant="pills" className="text-xs font-semibold px-3 py-1">
                  <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="weekly" variant="pills" className="text-xs font-semibold px-3 py-1">
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" variant="pills" className="text-xs font-semibold px-3 py-1">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="custom" variant="pills" className="text-xs font-semibold px-3 py-1">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Custom Range
                </TabsTrigger>
                <TabsTrigger value="all" variant="pills" className="text-xs font-semibold px-3 py-1">
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Scope Indicator Badge */}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {period === 'today' && 'Today only'}
              {period === 'weekly' && 'Last 7 Days'}
              {period === 'monthly' && 'Last 30 Days'}
              {period === 'custom' && (customStartDate || customEndDate ? `${customStartDate || 'Start'} → ${customEndDate || 'Now'}` : 'Pick custom dates')}
              {period === 'all' && 'All Historical Logs'}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{filteredEvents.length}</strong> {period === 'today' ? "today's" : ''} records
          </div>
        </div>

        {/* Custom Date Range Picker when Custom tab is selected */}
        {period === 'custom' && (
          <div className="p-3 bg-blue-50/50 border border-blue-200/70 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Filter by Custom Date Range:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="audit-start-date" className="text-[10px] font-bold text-slate-500 uppercase">
                  From
                </Label>
                <Input
                  id="audit-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-auto h-8 text-xs font-semibold bg-white border-slate-300 py-1 px-2.5 rounded-lg focus:ring-blue-500"
                />
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

              <div className="flex items-center gap-1.5">
                <Label htmlFor="audit-end-date" className="text-[10px] font-bold text-slate-500 uppercase">
                  To
                </Label>
                <Input
                  id="audit-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-auto h-8 text-xs font-semibold bg-white border-slate-300 py-1 px-2.5 rounded-lg focus:ring-blue-500"
                />
              </div>

              {(customStartDate || customEndDate) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-white"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Search and Action/User Dropdowns */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search events, users, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs font-medium bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs font-semibold bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
                <SelectItem value="Update">Update</SelectItem>
                <SelectItem value="Delete">Delete</SelectItem>
                <SelectItem value="Day Close">Day Close</SelectItem>
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[155px] h-9 text-xs font-semibold bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Users</SelectItem>
                {distinctUsers.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2.5 rounded-xl text-xs font-bold text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                title="Reset all date, search and dropdown filters back to Today default"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset (Today)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200/80">
              <TableHead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-3 pl-4">
                Timestamp &amp; ID
              </TableHead>
              <TableHead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-3">
                Operator / User
              </TableHead>
              <TableHead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-3">
                Action Type
              </TableHead>
              <TableHead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-3">
                Module
              </TableHead>
              <TableHead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-3">
                Event Activity Detail
              </TableHead>
              <TableHead className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-3 pr-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 text-xs">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <TableRow
                  key={evt.id}
                  onClick={() => onViewDetail && onViewDetail(evt)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <TableCell className="py-3 pl-4">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[11px] font-bold text-slate-900 block">
                        {evt.id}
                      </span>
                      <span className="text-[10px] text-slate-400 block tabular">
                        {formatTimestamp(evt.timestamp)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {evt.user ? evt.user.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        {evt.user || 'System'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    {getActionBadge(evt.action)}
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] border border-slate-200">
                      {evt.module || 'System'}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 max-w-xs sm:max-w-md">
                    <p className="text-xs text-slate-700 truncate font-medium">
                      {evt.detail || '—'}
                    </p>
                  </TableCell>

                  <TableCell className="py-3 pr-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetail) onViewDetail(evt);
                      }}
                      className="h-7 px-2 text-slate-400 group-hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <Typography variant="bodySmall" className="font-bold text-slate-700">
                      {hasActiveFilters ? 'No Matching Audit Records Found' : 'No Audit Records Recorded Yet'}
                    </Typography>
                    <Typography variant="caption" color="muted" className="max-w-sm">
                      {hasActiveFilters
                        ? `No events found for ${period === 'today' ? "Today" : period === 'weekly' ? 'the past 7 days' : period === 'monthly' ? 'the past 30 days' : period === 'custom' ? 'the selected date range' : 'all time'} with active filters.`
                        : 'Activity across POS sales, staff updates, cattle registrations, and expenses will appear here automatically.'}
                    </Typography>
                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-bold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset (Show Today)
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> audit records
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          Immutable System Audit Trail
        </span>
      </div>
    </div>
  );
}
