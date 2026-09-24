import React from 'react';
import { Download, CheckCircle2, Calendar, Clock, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/common/Typography';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';

export default function DailyClosingHeader({
  period = 'today',
  onPeriodChange,
  status = 'open',
  onExportCsv,
  onOpenConfirmDialog,
  selectedDate,
  onDateChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) {
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const formattedRange = startDate && endDate
    ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : formattedDate;

  const { user } = useAuth();
  const canCloseDay = user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;

  return (
    <div className="space-y-2 pb-4 border-b border-slate-200/80">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Typography variant="h3" className="font-bold text-slate-900 tracking-tight">
              Day End Summary
            </Typography>
            <Badge
              variant={status === 'closed' ? 'green' : 'amber'}
              className="text-[11px] font-bold px-2.5 py-0.5"
            >
              {status === 'closed' ? 'Closed & Reconciled' : 'Open for Entries'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">
                {period === 'custom' ? formattedRange : formattedDate}
              </span>
            </div>
          </div>
          <Typography variant="bodySmall" color="muted">
            Review today's milk and money before closing the day
          </Typography>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Tabs
            value={period}
            onValueChange={onPeriodChange}
            className="w-auto"
          >
            <TabsList variant="pills" className="bg-slate-100 border border-slate-200">
              <TabsTrigger value="today" variant="pills" className="text-xs font-semibold">
                Today
              </TabsTrigger>
              <TabsTrigger value="weekly" variant="pills" className="text-xs font-semibold">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" variant="pills" className="text-xs font-semibold">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="custom" variant="pills" className="text-xs font-semibold">
                Custom Range
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="cursor-pointer font-semibold text-xs text-slate-700"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Export CSV
          </Button>

          {canCloseDay && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onOpenConfirmDialog}
              className="cursor-pointer font-bold text-xs bg-[#00a86b] hover:bg-[#008f5b] text-white shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Confirm Daily Closing
            </Button>
          )}
        </div>
      </div>

      {period === 'custom' ? (
        <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Select Custom Range:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="start-date" className="text-[11px] font-semibold text-slate-500 uppercase">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-auto h-8 text-xs font-semibold bg-white border-slate-300 py-1 px-2 rounded-lg"
              />
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

            <div className="flex items-center gap-1.5">
              <Label htmlFor="end-date" className="text-[11px] font-semibold text-slate-500 uppercase">
                To
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate || ''}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-auto h-8 text-xs font-semibold bg-white border-slate-300 py-1 px-2 rounded-lg"
              />
            </div>
          </div>
        </div>
      ) : (
        period === 'today' && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <Label htmlFor="selected-day" className="text-slate-500 font-medium">
              Closing Date:
            </Label>
            <Input
              id="selected-day"
              type="date"
              value={selectedDate || ''}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-auto h-7 text-xs font-semibold bg-slate-50 border-slate-200 py-0.5 px-2 rounded-md"
            />
          </div>
        )
      )}
    </div>
  );
}
