import React from 'react';
import { Card } from '@/components/ui/card';

export default function Pos() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold text-slate-800">Counter POS & Sales</h3>
        <p className="text-sm text-slate-500">Point of sale and counter transactions</p>
      </div>

      <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">POS and sales system module.</p>
      </Card>
    </div>
  );
}
