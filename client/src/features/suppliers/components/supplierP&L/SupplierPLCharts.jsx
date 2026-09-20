import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Layers, TrendingUp } from 'lucide-react';

const DONUT_COLORS = [
  '#155dfc', // Supplier Cow
  '#4f39f6', // Supplier Buffalo
  '#0092b8', // Supplier Chilled
  '#d97706', // Route Fuel
  '#009966', // Chilling & Lab
  '#8b5cf6', // Handling & Sanitization
];

// Custom Bar Tooltip
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-800">
        <p className="font-bold text-slate-200 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px] py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white">
              Rs. {Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Donut Tooltip
const CustomDonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-800">
        <p className="font-bold text-slate-200">{data.name}</p>
        <p className="font-mono font-bold text-emerald-400 mt-0.5">
          Rs. {Number(data.value).toLocaleString()}
        </p>
        {data.payload.percent !== undefined && (
          <p className="text-[10px] text-slate-400">
            {Number(data.payload.percent).toFixed(1)}% of total allocation
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function SupplierPLCharts({ barData = [], donutData = [] }) {
  const totalCostAllocation = donutData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* 1. Left: Bar Chart ('Revenue by Sourced Milk Stream') */}
      <div className="lg:col-span-7 bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0092b8] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                Revenue by Sourced Milk Stream
              </h3>
              <p className="text-[11px] text-slate-500">
                Resale revenue realization vs. supplier procurement cost
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Resale vs Cost
          </span>
        </div>

        <div className="h-[240px] w-full">
          {barData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No revenue stream data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar
                  dataKey="resaleRevenue"
                  name="Resale Revenue"
                  fill="#0092b8"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="baseCost"
                  name="Sourced Cost"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Right: Donut Chart ('Procurement Cost Allocation') */}
      <div className="lg:col-span-5 bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
                  Procurement Cost Allocation
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total procurement spend breakdown
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Rs. {Number(totalCostAllocation).toLocaleString()}
            </span>
          </div>

          <div className="h-[185px] w-full relative">
            {donutData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No cost allocation data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Legend */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
          {donutData.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
              />
              <span className="text-slate-600 truncate">{item.name}:</span>
              <strong className="text-slate-900 font-mono ml-auto">
                {totalCostAllocation > 0 ? `${((item.value / totalCostAllocation) * 100).toFixed(0)}%` : '0%'}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
