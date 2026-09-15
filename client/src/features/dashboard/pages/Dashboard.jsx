import React from 'react';
import { ExecationOperation } from '../components/businesOperation/ExecationOperation';
import CommandCenterBanner from '../components/CommandCenterBanner';
import ReceivablesRecoveriesStats from '../components/ReceivablesRecoveriesStats';
import QuickStatsRow from '../components/QuickStatsRow';
import TopReceivablesCard from '../components/TopReceivablesCard';
import RecentRecoveriesTable from '../components/RecentRecoveriesTable';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* 1. Command Center Header Banner */}
      <CommandCenterBanner />

      {/* 2. Execution Module Switcher Bar */}
      <ExecationOperation />

      {/* 3. Real KPIs Row (Receivables, Today's Recoveries, Milk Deliveries) */}
      <ReceivablesRecoveriesStats />

      {/* 4. Quick Stats Row (Honest empty states for Farm, Supplier, POS, Expenses) */}
      <QuickStatsRow />

      {/* 5. Real-Data Split Panels: Recent Recoveries & Top Receivables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentRecoveriesTable />
        <TopReceivablesCard />
      </div>
    </div>
  );
}
