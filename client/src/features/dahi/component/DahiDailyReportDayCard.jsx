import React from 'react';
import { Calendar, Droplets, Banknote, Layers, CheckCircle2 } from 'lucide-react';
import { getLocalDate } from '@/utils/dateUtils';

export default function DahiDailyReportDayCard({ day }) {
  if (!day) return null;

  const todayStr = getLocalDate();
  const isToday = day.date === todayStr;
  const totalDayConverted = (Number(day.farmToDahi) || 0) + (Number(day.supplierToDahi) || 0);
  const dahiOutput = Number(day.dahiOutput) || 0;
  const dahiSalesRev = Number(day.dahiSalesRev) || 0;
  const dahiSalesQty = Number(day.dahiSalesQty) || 0;
  const dahiFarmRev = Number(day.dahiFarmRev) || 0;
  const dahiSupplierRev = Number(day.dahiSupplierRev) || 0;
  const batchesList = Array.isArray(day.batchesList) ? day.batchesList : [];
  const saleItems = Array.isArray(day.saleItems) ? day.saleItems : [];

  const displayDateStr = day.date ? new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Unknown Date';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* 1. Day Card Header */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-sm">{displayDateStr}</span>
          {isToday && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Today (Live)
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">Produced:</span>
            <strong className="font-bold font-mono text-indigo-700">
              {dahiOutput.toFixed(1)} kg
            </strong>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-medium text-slate-400">POS Sales:</span>
            <strong className="font-bold font-mono text-emerald-700">
              Rs. {dahiSalesRev.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
              Farm: Rs. {dahiFarmRev.toLocaleString()}
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
              Sup: Rs. {dahiSupplierRev.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
        {/* Column 1: Sourcing Conversion */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Droplets className="w-3.5 h-3.5 text-indigo-600" />
              Milk Sourcing for Dahi
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {totalDayConverted.toFixed(1)} L Total Used
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Farm Milk Used</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {(Number(day.farmToDahi) || 0).toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supplier Milk Used</span>
              <span className="font-mono font-bold text-blue-700 text-sm">
                {(Number(day.supplierToDahi) || 0).toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-700 font-semibold">Dahi Output Produced</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">
                {dahiOutput.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: POS Dahi Sales & Segregation */}
        <div className="p-4 space-y-3 bg-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              POS Dahi Sales &amp; Segregation
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {saleItems.length} Sales Items
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Dahi Sold</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {dahiSalesQty.toFixed(1)} kg
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Dahi Revenue</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                Rs. {dahiSalesRev.toLocaleString()}
              </span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-emerald-100 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-700 font-medium">Farm P&amp;L Allocation:</span>
                <strong className="font-mono text-emerald-800">Rs. {dahiFarmRev.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Supplier P&amp;L Allocation:</span>
                <strong className="font-mono text-blue-800">Rs. {dahiSupplierRev.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Conversion Batches */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Conversion Batches
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {batchesList.length} Batches
            </span>
          </div>

          {batchesList.length > 0 ? (
            <div className="max-h-28 overflow-y-auto space-y-1.5">
              {batchesList.map((b, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{b.batchNumber || b.product || 'Dahi Batch'}</span>
                    <span className="text-[10px] text-slate-400">
                      Source: {b.source || 'Farm'} &bull; In: {b.milkUsed || b.milkUsedVal || 0}L
                    </span>
                  </div>
                  <span className="font-mono font-bold text-indigo-700">
                    {b.output || b.outputVal || 0} kg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic pt-2">0 Batches recorded for this date.</p>
          )}
        </div>
      </div>

      {/* 3. Footer Bar */}
      <div className="bg-slate-900 px-4 py-2 text-white text-[11px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-slate-400">
          Value-Addition Efficiency:{' '}
          <strong className="text-white ml-1 font-mono">
            {dahiOutput > 0 ? Math.round(dahiSalesRev / dahiOutput) : 320} Rs/kg realized
          </strong>
        </span>
        <span className="text-indigo-400 font-bold tracking-wide flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> SEGREGATED REVENUE ROUTED TO FARM &amp; SUPPLIER P&amp;L
        </span>
      </div>
    </div>
  );
}
