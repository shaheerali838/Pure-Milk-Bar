import React, { useMemo } from 'react';
import { Calendar, Activity, ArrowRight, Droplets, DollarSign } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { usePOSContext } from '@/context/POSContext';

export default function SupplierDailyReport() {
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { salesHistory = [] } = usePOSContext() || {};

  const aggregatedByDate = useMemo(() => {
    const dates = {};
    const initDate = (d) => {
      if (!dates[d]) {
        dates[d] = {
          date: d,
          supplierIntake: 0,
          supplierMilkSalesQty: 0,
          supplierMilkSalesRev: 0,
        };
      }
    };

    // Supplier Intake
    intakeLogs.forEach(log => {
      const d = log.date || new Date().toISOString().split('T')[0];
      initDate(d);
      dates[d].supplierIntake += (parseFloat(log.quantity || log.quantityLiters) || 0);
    });

    // POS Sales (Supplier Milk)
    salesHistory.forEach(sale => {
      let d = new Date().toISOString().split('T')[0];
      try {
         if (sale.timestamp) {
           d = new Date(sale.timestamp).toISOString().split('T')[0];
         }
      } catch(e) {}
      
      initDate(d);
      
      (sale.items || []).forEach(item => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const source = (item.source || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const sub = Number(item.subtotal) || (qty * (Number(item.price) || 0));

        if ((name.includes('milk') || cat.includes('milk')) && source.includes('supplier')) {
          dates[d].supplierMilkSalesQty += qty;
          dates[d].supplierMilkSalesRev += sub;
        }
      });
    });

    return Object.values(dates).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [intakeLogs, salesHistory]);

  if (aggregatedByDate.length === 0) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <Activity className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-800">No Supplier Data Found</h3>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Once you record supplier intakes or supplier milk POS sales, the daily report will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Supplier Daily Report
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          Daily overview of Supplier Intakes and direct liquid milk POS sales.
        </p>
      </div>

      <div className="space-y-4">
        {aggregatedByDate.map((day) => (
          <div key={day.date} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-sm">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-medium text-slate-400">Supplier Revenue:</span>
                  <strong className="font-bold font-mono text-blue-700">Rs. {day.supplierMilkSalesRev.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/70 text-xs">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  Supplier Intakes
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Liquid Intake</span>
                    <span className="font-mono font-bold text-blue-700">{day.supplierIntake.toFixed(1)} L</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 bg-blue-50/20">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[10px] mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  Supplier Milk Sales
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Liquid Milk Sold</span>
                    <span className="font-mono font-bold text-slate-700">{day.supplierMilkSalesQty.toFixed(1)} L</span>
                  </div>
                  <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                    <span className="text-blue-700 font-bold">Sales Revenue</span>
                    <span className="font-mono font-bold text-blue-800">Rs. {day.supplierMilkSalesRev.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
