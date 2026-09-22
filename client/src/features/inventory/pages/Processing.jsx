import React from 'react';
import { Card } from '@/components/ui/card';

export default function Processing() {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-display text-xl font-bold text-slate-800">Dahi & Milk Processing</h3>
        <p className="text-sm text-slate-500">Processing operations, batch tracking and quality control</p>
      </div>

      <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">Dairy processing and batch management module.</p>
      </Card>
    </div>
  );
}
