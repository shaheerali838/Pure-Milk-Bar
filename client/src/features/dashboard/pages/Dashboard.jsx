import React from 'react';
import { ExecationOperation } from '../components/businesOperation/ExecationOperation';
import ReceivablesRecoveriesStats from '../components/ReceivablesRecoveriesStats';
import QuickStatsRow from '../components/QuickStatsRow';
import TopReceivablesCard from '../components/TopReceivablesCard';
import RecentRecoveriesTable from '../components/RecentRecoveriesTable';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <ExecationOperation />

      <ReceivablesRecoveriesStats />

      <QuickStatsRow />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentRecoveriesTable />
        <TopReceivablesCard />
      </div>
    </div>
  );
}
