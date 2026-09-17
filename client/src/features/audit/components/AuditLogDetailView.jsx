import React from 'react';
import { ArrowLeft, Shield, Clock, User, Layers, FileText, CheckCircle2, Globe, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function AuditLogDetailView({ event, onBack }) {
  if (!event) return null;

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        weekday: 'short',
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

  const getActionBadge = (action) => {
    switch (action) {
      case 'Create':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Create Action
          </span>
        );
      case 'Update':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Update Action
          </span>
        );
      case 'Delete':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Delete Action
          </span>
        );
      case 'Day Close':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Day Close Action
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {action || 'Action'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top Header Bar with Back button & Event ID */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="cursor-pointer font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Audit Log
          </Button>
          <div>
            <Typography variant="h3" className="font-bold text-slate-900 tracking-tight text-lg sm:text-xl">
              Audit Event Record — {event.id}
            </Typography>
            <Typography variant="caption" color="muted">
              Logged on {formatTimestamp(event.timestamp)}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getActionBadge(event.action)}
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Module: {event.module || 'System'}
          </span>
        </div>
      </div>

      {/* Main Detail Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        {/* User Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-lg shadow-2xs shrink-0">
              {event.user ? event.user.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <Typography variant="body" className="font-bold text-slate-900 text-base">
                {event.user || 'System Operator'}
              </Typography>
              <Typography variant="caption" color="muted" className="text-xs">
                Authorized Operator • {event.module} Module
              </Typography>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Event Timestamp
            </span>
            <span className="font-mono font-bold text-slate-800 tabular">
              {formatTimestamp(event.timestamp)}
            </span>
          </div>
        </div>

        {/* Event Activity Summary Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-emerald-600" />
            Event Activity Summary
          </div>
          <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed font-mono">
            {event.detail || 'No additional activity detail provided.'}
          </p>
        </div>

        {/* Structured Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Box 1: Technical & Audit Parameters */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-xs">
              <Key className="w-4 h-4 text-blue-600" />
              Event Properties
            </div>
            <div className="space-y-2 divide-y divide-slate-200/60 text-slate-700">
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Record ID:</span>
                <span className="font-mono font-bold text-slate-900">{event.id}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Target Module:</span>
                <span className="font-bold text-slate-800">{event.module || 'System'}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Action Classification:</span>
                <span className="font-bold text-slate-800">{event.action}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Execution Actor:</span>
                <span className="font-semibold text-slate-800">{event.user || 'System'}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Network & Origin Details */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-xs">
              <Globe className="w-4 h-4 text-purple-600" />
              Origin &amp; Security Context
            </div>
            <div className="space-y-2 divide-y divide-slate-200/60 text-slate-700">
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">IP Address:</span>
                <span className="font-mono text-slate-400">
                  {event.ipAddress && event.ipAddress !== '—' ? event.ipAddress : '— (Not tracked)'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Session Status:</span>
                <span className="text-slate-400">Not tracked</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Security Check:</span>
                <span className="text-slate-400">Not tracked</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Integrity:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Logged &amp; Stored
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
