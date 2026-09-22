import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, ArrowRight } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { useNavigate } from 'react-router-dom';

export default function SupplierDashboardCharts({
  onLogIntake,
  onAddSupplier,
  onAddExpense,
}) {
  const { intakeLogs } = useIntakeContext();
  const { expenses, totalSourcingCosts } = useSourcExpenseContext();
  const navigate = useNavigate();

  // 1. Volume Trend (Last 7 Days)
  const volumeTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map((dateStr) => {
      const dayLogs = (intakeLogs || []).filter((log) => log.date === dateStr);
      const liters = dayLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
      return {
        date: new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        liters,
      };
    });
  }, [intakeLogs]);

  // 2. Supplier Breakdown
  const supplierBreakdown = useMemo(() => {
    const breakdown = {};
    (intakeLogs || []).forEach((log) => {
      const name = log.supplierName || 'Unknown';
      breakdown[name] = (breakdown[name] || 0) + (parseFloat(log.quantity) || 0);
    });
    return Object.keys(breakdown)
      .map((name) => ({ name, liters: breakdown[name] }))
      .sort((a, b) => b.liters - a.liters)
      .slice(0, 5); // Top 5
  }, [intakeLogs]);

  // 3. Sourcing P&L Performance (Last 7 Days)
  const plTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const fixedResaleRate = 260; // Assuming 260 Rs/L average resale

    return last7Days.map((dateStr) => {
      const dayLogs = (intakeLogs || []).filter((log) => log.date === dateStr);
      const volume = dayLogs.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
      const cost = dayLogs.reduce((sum, item) => sum + (parseFloat(item.totalCost) || 0), 0);
      const revenue = volume * fixedResaleRate;
      const margin = revenue - cost;

      return {
        date: new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        revenue,
        cost,
        margin,
      };
    });
  }, [intakeLogs]);

  // 4. Latest Expenses list (Top 5)
  const topExpenses = useMemo(() => {
    return [...(expenses || [])]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses]);

  return (
    <>
      {/* Top 2 Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
        {/* Graph 1: Procurement Volume Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Procurement Volume Trend (7 Days)
              </h3>
              <p className="text-xs text-slate-500">
                Daily milk intake from external dairy farms
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLogIntake}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Log Intake</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/supplier/intake')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} Liters`, 'Intake Volume']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Area type="monotone" dataKey="liters" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" dot={{ r: 3, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Supplier Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Supplier Intake Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Liters supplied by active suppliers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddSupplier}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add Vendor</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/supplier/directory')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <span>Directory</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} Liters`, 'Total Supplied']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="liters" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Expenses and P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-2">
        {/* Left: Procurement Expenses List */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Procurement Expenses
                </h3>
                <p className="text-[11px] text-slate-500">
                  Collection logistics, lab testing & handling costs
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onAddExpense}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => navigate('/supplier/expenses')}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {topExpenses.length > 0 ? (
                topExpenses.map((exp) => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="font-medium text-slate-700 line-clamp-1">{exp.category}</span>
                    </div>
                    <span className="font-bold text-slate-900 tabular font-mono">
                      Rs. {exp.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-400 py-4">
                  No expenses recorded.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
            <span className="text-xs font-semibold text-slate-500">
              Total Supplier Expenses:
            </span>
            <span className="text-sm font-bold text-blue-600 tabular font-display">
              Rs. {(totalSourcingCosts || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Supplier Sourcing P&L Performance Graph */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Supplier Sourcing P&L Performance
              </h3>
              <p className="text-xs text-slate-500">
                Procured milk sales revenue vs. supplier acquisition costs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/supplier/pl')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <span>Full P&L</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="h-[210px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plTrend} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `Rs. ${val.toLocaleString()}`,
                    name === 'revenue' ? 'Sales Revenue' : name === 'cost' ? 'Supplier Cost' : 'Gross Margin',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} name="revenue" />
                <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} name="cost" />
                <Line type="monotone" dataKey="margin" stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="margin" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
