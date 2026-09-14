import React from 'react';
import { Card } from '@/components/ui/card';

export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold text-slate-800">Products & Pricing</h3>
        <p className="text-sm text-slate-500">Catalog of dairy products, unit rates, and pricing rules</p>
      </div>

      <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">Product inventory and pricing management module.</p>
      </Card>
    </div>
  );
}
