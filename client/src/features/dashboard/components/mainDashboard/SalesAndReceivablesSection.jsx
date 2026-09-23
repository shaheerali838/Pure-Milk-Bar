import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ShoppingBag,
  CreditCard,
  Wallet,
  ArrowRight,
  TrendingUp,
  Receipt,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useExpense } from '@/context/ExpenseContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SalesAndReceivablesSection() {
  const navigate = useNavigate();
  const { salesHistory = [] } = usePOSContext();
  const { rawCustomers = [], customers = [] } = useCustomerContext();
  const { expenses = [], totals: expenseTotals = {} } = useExpense();
  const { totals: intakeTotals = {} } = useIntakeContext();

  // 1. CHART 1: SALES — CASH VS CREDIT (Bar Chart)
  const salesCashCreditData = useMemo(() => {
    // Collect distinct dates from actual salesHistory
    const dateMap = {};

    salesHistory.forEach((s) => {
      let dayKey = '';
      if (s.timestamp) {
        const d = new Date(s.timestamp);
        if (!isNaN(d.getTime())) {
          dayKey = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        }
      } else if (s.formattedDate) {
        dayKey = s.formattedDate;
      }
      if (!dayKey) dayKey = 'Today';

      if (!dateMap[dayKey]) {
        dateMap[dayKey] = { day: dayKey, cash: 0, credit: 0 };
      }

      const amt = Number(s.netPayable) || 0;
      if (s.paymentMethod === 'khata' || s.paymentMethod === 'credit') {
        dateMap[dayKey].credit += amt;
      } else {
        dateMap[dayKey].cash += amt;
      }
    });

    const entries = Object.values(dateMap);
    if (entries.length > 0) {
      return entries.slice(-6);
    }

    // When no sales exist yet in database, show real 0s across past 6 days
    const fallbackDays = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      fallbackDays.push({
        day: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        cash: 0,
        credit: 0,
      });
    }
    return fallbackDays;
  }, [salesHistory]);

  // 2. CHART 2: EXPENSES — SHOP VS FARM (Line Chart)
  const expensesShopFarmData = useMemo(() => {
    const dateMap = {};

    expenses.forEach((exp) => {
      let dayKey = '';
      if (exp.date) {
        const d = new Date(exp.date);
        if (!isNaN(d.getTime())) {
          dayKey = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        } else {
          dayKey = exp.date;
        }
      }
      if (!dayKey) dayKey = 'Recent';

      if (!dateMap[dayKey]) {
        dateMap[dayKey] = { day: dayKey, farm: 0, shop: 0 };
      }

      const amt = Number(exp.amount) || 0;
      const cat = (exp.category || '').toLowerCase();
      if (cat.includes('feed') || cat.includes('farm') || cat.includes('seed') || cat.includes('chara')) {
        dateMap[dayKey].farm += amt;
      } else {
        dateMap[dayKey].shop += amt;
      }
    });

    const entries = Object.values(dateMap);
    if (entries.length > 0) {
      return entries.slice(-6);
    }

    // If no expenses logged, show real 0s across past 6 days
    const fallbackDays = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      fallbackDays.push({
        day: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        farm: 0,
        shop: 0,
      });
    }
    return fallbackDays;
  }, [expenses]);

  // 3. RECENT SALES TABLE (Real sales records only)
  const recentSales = useMemo(() => {
    return salesHistory.slice(0, 5).map((s) => {
      const customerName =
        s.activeCustomer?.name ||
        s.walkinName ||
        (s.saleCategory === 'delivery' ? 'Home Delivery' : 'Walk-in Counter');

      return {
        invoice: s.invoiceId || `INV-${(s.id || '').toString().slice(-4)}`,
        customer: customerName,
        time: s.formattedTime || (s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
        total: Number(s.netPayable) || 0,
        method: s.paymentMethod ? s.paymentMethod.toUpperCase() : 'CASH',
        balance: s.activeCustomer?.khataBalance || 0,
        rawSale: s,
      };
    });
  }, [salesHistory]);

  // 4. TOP RECEIVABLES (Customers with highest outstanding balances)
  const topReceivables = useMemo(() => {
    const list = rawCustomers.length > 0 ? rawCustomers : customers;
    return [...list]
      .filter((c) => Number(c.khataBalance) > 0)
      .sort((a, b) => Number(b.khataBalance) - Number(a.khataBalance))
      .slice(0, 5)
      .map((c) => {
        const balance = Number(c.khataBalance) || 0;
        const limit = Number(c.creditLimit) || 15000;
        const pct = Math.min(100, Math.round((balance / limit) * 100));
        return {
          ...c,
          balance,
          limit,
          pct,
        };
      });
  }, [rawCustomers, customers]);

  return (
    <div className="space-y-4">
      {/* 1. TOP 2 CHARTS: Sales (Cash vs Credit) & Expenses (Shop vs Farm) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Sales — Cash vs Credit (Bar Chart) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#009966]" />
                <span>Sales — Cash vs. Credit Inflows</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Comparison of upfront liquid cash receipts vs. customer khata receivables
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              POS Ledger
            </span>
          </div>

          <div className="h-57.5 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesCashCreditData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `Rs. ${val.toLocaleString()}`,
                    name === 'cash' ? 'Cash / Online' : 'Khata Credit',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  formatter={(val) => (
                    <span className="text-[11px] font-semibold text-slate-600">
                      {val === 'cash' ? 'Cash & Instant' : 'Khata Credit'}
                    </span>
                  )}
                />
                <Bar dataKey="cash" fill="#009966" radius={[6, 6, 0, 0]} name="cash" />
                <Bar dataKey="credit" fill="#f59e0b" radius={[6, 6, 0, 0]} name="credit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expenses — Shop vs Farm (Line Chart) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                <span>Expenses — Shop vs. Farm Operations</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Operating expenditures trend comparing cattle upkeep with retail counter costs
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Overheads
            </span>
          </div>

          <div className="h-57.5 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expensesShopFarmData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `Rs. ${val.toLocaleString()}`,
                    name === 'farm' ? 'Farm & Livestock' : 'Retail Shop & Utilities',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  formatter={(val) => (
                    <span className="text-[11px] font-semibold text-slate-600">
                      {val === 'farm' ? 'Farm Expenses' : 'Shop Expenses'}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="farm"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  name="farm"
                />
                <Line
                  type="monotone"
                  dataKey="shop"
                  stroke="#9333ea"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#9333ea' }}
                  name="shop"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. BOTTOM ROW: Recent Sales Table (8 cols) + Top Receivables List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recent Sales Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Recent Sales Transactions
                </h3>
              </div>
              <Link
                to="/pos"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>POS Counter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentSales.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <Receipt className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Sales Recorded Yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Completed sales from POS Counter and Deliveries will appear here automatically.
                </p>
                <Link
                  to="/pos"
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <span>Open POS Counter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Invoice</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentSales.map((sale, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                          {sale.invoice}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {sale.customer}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {sale.time}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              sale.method === 'KHATA'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : sale.method === 'ONLINE'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {sale.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 tabular font-mono">
                          Rs. {sale.total.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/pos')}
                            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                          >
                            View &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Receivables List (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Top Receivables
                </h3>
              </div>
              <Link
                to="/customer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 mt-3">
              {topReceivables.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  All customer accounts are clear with zero pending dues!
                </div>
              ) : (
                topReceivables.map((cust) => (
                  <div key={cust.id} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {cust.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-amber-900 font-mono tabular shrink-0">
                        Rs. {cust.balance.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-0.5">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            cust.pct > 80
                              ? 'bg-rose-500'
                              : cust.pct > 50
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.max(5, cust.pct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Limit: Rs. {cust.limit.toLocaleString()}</span>
                        <span className="font-semibold text-slate-600">{cust.pct}% used</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Aging Khata Health</span>
            <span className="font-bold text-amber-700">Follow-up Recommended</span>
          </div>
        </div>
      </div>
    </div>
  );
}
