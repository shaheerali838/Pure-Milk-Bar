import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers, Truck, Store, Filter } from 'lucide-react';

const CHANNELS = [
  'All Channels',
  'Doorstep Delivery',
  'POS & Farm Gate',
  'Bulk Wholesale',
];

const CATEGORY_COLORS = {
  'Raw Milk': '#155dfc',
  'Farm Dahi': '#009689',
  'Lassi & Fresh Dairy': '#8b5cf6',
};

const EXPENSE_PIE_COLORS = [
  '#009966', // Feed
  '#0284c7', // Concentrates
  '#8b5cf6', // Veterinary
  '#f59e0b', // Labor
  '#f43f5e', // Energy
  '#64748b', // Maintenance
  '#d97706', // Transport/Other
];

export default function SellingRevenue({
  sales = [],
  expenses = [],
  categoryBreakdown = [],
}) {
  const [selectedChannel, setSelectedChannel] = useState('All Channels');

  const fmt = (n) => 'Rs. ' + Math.round(Number(n) || 0).toLocaleString();

  // 1. Interactivity & Simple Logic: Filter sales array based on selected channel
  const filteredSales = useMemo(() => {
    if (selectedChannel === 'All Channels') {
      return sales;
    }
    if (selectedChannel === 'Doorstep Delivery') {
      return sales.filter(
        (s) =>
          s.saleCategory === 'delivery' ||
          s.fulfillmentMode === 'doorstep' ||
          (s.channel && s.channel.toLowerCase().includes('delivery'))
      );
    }
    if (selectedChannel === 'POS & Farm Gate') {
      return sales.filter(
        (s) =>
          s.saleCategory === 'walkin' ||
          s.fulfillmentMode === 'counter' ||
          (s.channel && s.channel.toLowerCase().includes('pos'))
      );
    }
    if (selectedChannel === 'Bulk Wholesale') {
      return sales.filter(
        (s) =>
          s.saleCategory === 'wholesale' ||
          (s.items || []).some((i) => (Number(i.quantity) || 0) >= 20) ||
          (s.channel && s.channel.toLowerCase().includes('wholesale'))
      );
    }
    return sales;
  }, [sales, selectedChannel]);

  // Channel Metrics
  const channelRevenue = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.netPayable || s.subtotal) || 0), 0);
  }, [filteredSales]);

  const channelOrdersCount = filteredSales.length;
  const avgOrderValue = channelOrdersCount > 0 ? Math.round(channelRevenue / channelOrdersCount) : 0;

  // 2. Aggregate Horizontal Bar Chart Data (Revenue by Product Category) dynamically from filtered sales
  const barChartData = useMemo(() => {
    const catMap = {
      'Raw Milk': { revenue: 0, volume: 0 },
      'Farm Dahi': { revenue: 0, volume: 0 },
      'Lassi & Fresh Dairy': { revenue: 0, volume: 0 },
    };

    filteredSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        const lineTotal = Number(item.subtotal) || (qty * (Number(item.price) || 0));

        if (cat.includes('milk') || name.includes('milk') || name.includes('doodh')) {
          catMap['Raw Milk'].revenue += lineTotal;
          catMap['Raw Milk'].volume += qty;
        } else if (cat.includes('dahi') || name.includes('dahi') || name.includes('yogurt')) {
          catMap['Farm Dahi'].revenue += lineTotal;
          catMap['Farm Dahi'].volume += qty;
        } else if (cat.includes('lassi') || name.includes('lassi')) {
          catMap['Lassi & Fresh Dairy'].revenue += lineTotal;
          catMap['Lassi & Fresh Dairy'].volume += qty;
        }
      });
    });

    return Object.keys(catMap).map((key) => ({
      category: key,
      revenue: Math.round(catMap[key].revenue),
      volume: Number(catMap[key].volume.toFixed(1)),
      color: CATEGORY_COLORS[key] || '#155dfc',
    }));
  }, [filteredSales]);

  // 3. Aggregate Pie Chart Data (Farm Expense Distribution) dynamically from expenses
  const pieChartData = useMemo(() => {
    if (categoryBreakdown && categoryBreakdown.length > 0) {
      return categoryBreakdown.map((c, idx) => ({
        name: c.name,
        value: Math.round(Number(c.amount) || 0),
        color: c.color || EXPENSE_PIE_COLORS[idx % EXPENSE_PIE_COLORS.length],
        percentage: c.percentage,
      })).filter((c) => c.value > 0);
    }

    // Fallback aggregation from expenses array
    const catBuckets = {};
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other / Miscellaneous';
      const amt = Number(exp.amount) || 0;
      catBuckets[cat] = (catBuckets[cat] || 0) + amt;
    });

    const totalExp = Object.values(catBuckets).reduce((s, a) => s + a, 0);

    return Object.keys(catBuckets).map((key, idx) => ({
      name: key,
      value: Math.round(catBuckets[key]),
      color: EXPENSE_PIE_COLORS[idx % EXPENSE_PIE_COLORS.length],
      percentage: totalExp > 0 ? ((catBuckets[key] / totalExp) * 100).toFixed(1) : 0,
    })).filter((c) => c.value > 0);
  }, [categoryBreakdown, expenses]);

  const totalExpensesAmount = useMemo(() => {
    return pieChartData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [pieChartData]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto p-0.5">
          {CHANNELS.map((ch) => {
            const isActive = selectedChannel === ch;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 px-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Channel Revenue:</span>
            <span className="font-black text-emerald-600 tabular">{fmt(channelRevenue)}</span>
          </div>
          <div className="w-1 h-3 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Orders:</span>
            <span className="font-bold text-slate-800 tabular">{channelOrdersCount}</span>
          </div>
          <div className="w-1 h-3 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">AOV:</span>
            <span className="font-bold text-slate-800 tabular">{fmt(avgOrderValue)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Revenue by Product Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Filtered: <span className="font-semibold text-slate-700">{selectedChannel}</span>
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              Horizontal Distribution
            </span>
          </div>

          <div className="w-full h-[280px]">
            {barChartData.every((b) => b.revenue === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <p>No revenue recorded for {selectedChannel} in this timeframe.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={barChartData}
                  margin={{ top: 10, right: 30, left: 45, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={110}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                            <p className="font-bold">{item.category}</p>
                            <p className="text-emerald-400 font-black text-sm mt-0.5">
                              {fmt(item.revenue)}
                            </p>
                            {item.volume > 0 && (
                              <p className="text-[10px] text-slate-300">
                                Volume: {item.volume} units / L
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={20}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span>Dynamic product mix aggregated across transactions</span>
            <span className="font-semibold text-slate-800 tabular">Total: {fmt(channelRevenue)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
                <PieIcon className="w-4 h-4 text-rose-600" />
                Farm Expense Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pillar-wise breakdown of total farm operational spend
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
              Expense Allocation
            </span>
          </div>

          <div className="w-full h-[280px]">
            {pieChartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <p>No expense data recorded in this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                            <p className="font-bold">{item.name}</p>
                            <p className="text-rose-400 font-black text-sm mt-0.5">
                              {fmt(item.value)}
                            </p>
                            <p className="text-[10px] text-slate-300">
                              Share: {item.percentage}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
            <span>Aggregated from ExpenseContext records</span>
            <span className="font-semibold text-rose-600 tabular">Total: {fmt(totalExpensesAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
