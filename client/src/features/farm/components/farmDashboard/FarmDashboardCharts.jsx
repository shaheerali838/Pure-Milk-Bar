import React from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function FarmDashboardCharts({ trendData, animalBarData, expensesByCategory }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Grid Row 1: Area Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Farm Production Trend (7 Days) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col h-85">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Farm Production Trend (7 Days)</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/farm/milking')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Log Shift
              </button>
              <button
                type="button"
                onClick={() => navigate('/farm/animals')}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <span>Register</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEvening" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} L`} width={45} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val, name) => [`${val} L`, name === 'morning' ? 'Morning Yield' : 'Evening Yield']}
                />
                <Area type="monotone" dataKey="morning" stackId="1" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorMorning)" />
                <Area type="monotone" dataKey="evening" stackId="1" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEvening)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Lactation Yield by Animal */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col h-85">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Current Lactation Yield by Animal</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/farm/animals')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" /> Add Animal
              </button>
              <button
                type="button"
                onClick={() => navigate('/farm/animals')}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                View Herd <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={animalBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} L`} width={45} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  formatter={(val, name) => [`${val} L`, name === 'morning' ? 'Morning Yield' : 'Evening Yield']}
                />
                <Bar dataKey="morning" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="evening" stackId="a" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Expenses & Financial P&L */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Farm Expenses */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-85">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Farm Expenses</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/farm/expenses')}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" /> Add
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/farm/expenses')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {expensesByCategory.list.map(([name, amount], i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="truncate max-w-35">{name}</span>
                  </div>
                  <span className="font-mono text-slate-900">Rs. {amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold">
            <span className="text-slate-700">Total Farm Expenses:</span>
            <span className="text-emerald-700 font-mono font-black">Rs. {expensesByCategory.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Farm Financial Performance (P&L Trend) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col h-85">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Farm Financial Performance (P&L Trend)</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/farm/pl')}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
            >
              Full P&L <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 w-full mt-2 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} Rs`} width={55} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                  labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                  formatter={(val, name) => [
                    `Rs. ${val.toLocaleString()}`,
                    name === 'revenue' ? 'Revenue Contrib:' : name === 'cost' ? 'Farm Cost:' : 'Net Profit:',
                  ]}
                />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cost" name="cost" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="profit" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
