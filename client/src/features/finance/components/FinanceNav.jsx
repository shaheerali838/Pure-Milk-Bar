import React from 'react';
import {
  ArrowLeft,
  Users,
  Bike,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinanceNav({ activeTab, onTabChange }) {
  if (activeTab === 'overview') {
    return null;
  }

  const isCustomer = activeTab === 'customer';
  const isFarm = activeTab === 'report-farm';
  const isSupplier = activeTab === 'report-supplier';
  const isDahi = activeTab === 'report-dahi';

  return (
    <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <Wallet className="w-3.5 h-3.5 text-slate-400" />
          <span>Finance Hub</span>
        </button>
        <span className="text-slate-300 text-xs">/</span>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
          {isCustomer ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Customer Finance</span>
            </>
          ) : isFarm ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Farm Daily Report</span>
            </>
          ) : isSupplier ? (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Supplier Daily Report</span>
            </>
          ) : isDahi ? (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Dahi Daily Report</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Rider &amp; Delivery Finance</span>
            </>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onTabChange('overview')}
        className="cursor-pointer h-7 px-2.5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 rounded-lg"
      >
        <ArrowLeft className="w-3 h-3" />
        <span>Back to Hub</span>
      </Button>
    </div>
  );
}
