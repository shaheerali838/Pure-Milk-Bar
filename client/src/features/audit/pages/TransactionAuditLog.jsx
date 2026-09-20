import React, { useState } from 'react';
import { ShieldCheck, History } from 'lucide-react';
import { useAuditContext } from '@/context/AuditContext';
import { Typography } from '@/components/common/Typography';
import AuditLogStats from '../components/AuditLogStats';
import AuditLogTable from '../components/AuditLogTable';
import AuditLogDetailView from '../components/AuditLogDetailView';

export default function TransactionAuditLog() {
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'detail'
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { auditEvents = [] } = useAuditContext();

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    setCurrentView('list');
  };

  if (currentView === 'detail' && selectedEvent) {
    return (
      <div className="space-y-4 pb-8">
        <AuditLogDetailView
          event={selectedEvent}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <Typography variant="h3" className="font-bold text-slate-900 tracking-tight text-xl font-display">
              Transaction Audit Log
            </Typography>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Trail
            </span>
          </div>
          <Typography variant="bodySmall" color="muted" className="text-xs text-slate-500">
            Immutable log of operations, inventory additions, payments, and staff registrations
          </Typography>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <AuditLogStats />

      {/* Searchable and Filterable Audit Table */}
      <AuditLogTable
        events={auditEvents}
        onViewDetail={handleViewDetail}
      />
    </div>
  );
}
