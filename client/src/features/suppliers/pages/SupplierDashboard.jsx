import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Droplets,
  Receipt,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Eye,
  X,
  Calendar,
  Percent,
  ChevronRight,
  Tag,
  FileText,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

// 7-day Volume Trend Data
const INITIAL_VOLUME_TREND = [
  { date: '18 Aug', liters: 42 },
  { date: '19 Aug', liters: 40 },
  { date: '20 Aug', liters: 48 },
  { date: '21 Aug', liters: 52 },
  { date: '22 Aug', liters: 50 },
  { date: '23 Aug', liters: 49 },
  { date: '24 Aug', liters: 50 },
];

// Supplier Breakdown Data
const INITIAL_VENDOR_BREAKDOWN = [
  { name: 'Supplier 1 (Ahmad Farms)', liters: 2400 },
  { name: 'Supplier 2 (Chaudhry Dairy)', liters: 1600 },
  { name: 'Supplier 3 (Al-Madina Milk)', liters: 1200 },
  { name: 'Supplier 4 (Shahid Brothers)', liters: 600 },
];

// Sourcing P&L Performance Data
const SOURCING_PL_TREND = [
  { date: '18 Aug', revenue: 8400, cost: 6300, margin: 2100 },
  { date: '19 Aug', revenue: 8000, cost: 6000, margin: 2000 },
  { date: '20 Aug', revenue: 9600, cost: 7200, margin: 2400 },
  { date: '21 Aug', revenue: 10400, cost: 7800, margin: 2600 },
  { date: '22 Aug', revenue: 10000, cost: 7500, margin: 2500 },
  { date: '23 Aug', revenue: 9800, cost: 7350, margin: 2450 },
  { date: '24 Aug', revenue: 10000, cost: 7500, margin: 2500 },
];

// Today's Intake Table Initial Rows
const INITIAL_TODAY_INTAKE = [
  {
    id: 'INT-001',
    supplier: 'Ahmad Farms',
    shift: 'Morning',
    volume: 30,
    rate: 230,
    totalCost: 6900,
    fat: 4.8,
    lr: 29.0,
    paymentStatus: 'Paid',
    destination: 'Usman Milk',
    time: '06:45 AM',
  },
  {
    id: 'INT-002',
    supplier: 'Chaudhry Dairy',
    shift: 'Morning',
    volume: 20,
    rate: 225,
    totalCost: 4500,
    fat: 4.5,
    lr: 28.0,
    paymentStatus: 'Pending',
    destination: 'Usman Milk',
    time: '07:15 AM',
  },
];

// Initial Expenses
const INITIAL_EXPENSES = [
  { id: 1, title: 'Milk Collection Logistics', amount: 1800 },
  { id: 2, title: 'Chilling & Testing', amount: 850 },
  { id: 3, title: 'Transit Can Sanitization', amount: 400 },
  { id: 4, title: 'Milk Collection Logistics', amount: 950 },
  { id: 5, title: 'Supplier Loading Handling', amount: 1200 },
];

export default function SupplierDashboard() {
  const navigate = useNavigate();

  // Dynamic state
  const [intakeLogs, setIntakeLogs] = useState(INITIAL_TODAY_INTAKE);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [vendors, setVendors] = useState(INITIAL_VENDOR_BREAKDOWN);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [viewDetailItem, setViewDetailItem] = useState(null);

  // Form states
  const [newLog, setNewLog] = useState({
    supplier: 'Ahmad Farms',
    shift: 'Morning',
    volume: '',
    rate: '230',
    fat: '4.8',
    lr: '29.0',
    paymentStatus: 'Paid',
    destination: 'Usman Milk',
  });

  const [newVendor, setNewVendor] = useState({
    name: '',
    initialLiters: '',
  });

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
  });

  // Calculate live KPI numbers
  const todayTotalVolume = intakeLogs.reduce((sum, item) => sum + item.volume, 0);
  const todayTotalCost = intakeLogs.reduce((sum, item) => sum + item.totalCost, 0);
  const totalExpensesAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Handlers
  const handleAddIntake = (e) => {
    e.preventDefault();
    const vol = parseFloat(newLog.volume) || 0;
    const rate = parseFloat(newLog.rate) || 228;
    const cost = vol * rate;

    const entry = {
      id: `INT-00${intakeLogs.length + 1}`,
      supplier: newLog.supplier,
      shift: newLog.shift,
      volume: vol,
      rate: rate,
      totalCost: cost,
      fat: parseFloat(newLog.fat) || 4.5,
      lr: parseFloat(newLog.lr) || 28.0,
      paymentStatus: newLog.paymentStatus,
      destination: newLog.destination,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIntakeLogs([entry, ...intakeLogs]);
    setIsLogModalOpen(false);
    setNewLog({
      supplier: 'Ahmad Farms',
      shift: 'Morning',
      volume: '',
      rate: '230',
      fat: '4.8',
      lr: '29.0',
      paymentStatus: 'Paid',
      destination: 'Usman Milk',
    });
  };

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!newVendor.name) return;

    setVendors([
      ...vendors,
      {
        name: newVendor.name,
        liters: parseFloat(newVendor.initialLiters) || 800,
      },
    ]);
    setIsVendorModalOpen(false);
    setNewVendor({ name: '', initialLiters: '' });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    setExpenses([
      ...expenses,
      {
        id: expenses.length + 1,
        title: newExpense.title,
        amount: parseFloat(newExpense.amount) || 0,
      },
    ]);
    setIsExpenseModalOpen(false);
    setNewExpense({ title: '', amount: '' });
  };

  return (
    <div className="space-y-6">
      {/* 1. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Suppliers Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ACTIVE SUPPLIERS
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[26px] font-bold text-slate-900 tracking-tight font-display">
              {vendors.length} Vendors
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">3 Active · 1 Inactive</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              + 2 Added today
            </span>
          </div>
        </div>

        {/* Today's Procurement Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TODAY'S PROCUREMENT
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[26px] font-bold text-slate-900 tracking-tight font-display">
              {todayTotalVolume.toFixed(1)} Liters
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Cost: Rs. {todayTotalCost.toLocaleString()} · {intakeLogs.length} Batches
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-3 h-3" /> 4.5%
            </span>
          </div>
        </div>

        {/* Avg Purchase Rate Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              AVG PURCHASE RATE
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[26px] font-bold text-slate-900 tracking-tight font-display">
              Rs. 228.0 / L
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Rate Band: Rs. 220 - Rs. 235</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Competitive
            </span>
          </div>
        </div>

        {/* Supplier Payables Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SUPPLIER PAYABLES
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-[26px] font-bold text-slate-900 tracking-tight font-display">
              Rs. 9,600
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Verified accounts balance</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>
      </div>

      {/* 2. Row 2: Two Big Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Procurement Volume Trend (7 Days) */}
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
                onClick={() => setIsLogModalOpen(true)}
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
              <AreaChart data={INITIAL_VOLUME_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 60]} />
                <Tooltip
                  formatter={(val) => [`${val} Liters`, 'Intake Volume']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Area type="monotone" dataKey="liters" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" dot={{ r: 3, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Supplier Intake Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Supplier Intake Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Liters supplied by each active vendor
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVendorModalOpen(true)}
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
              <BarChart data={vendors} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={0}
                  angle={-5}
                  textAnchor="end"
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} Liters`, 'Total Supplied']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="liters" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={58} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Row 3: Left Expenses List + Right Sourcing P&L Performance Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Procurement Expenses */}
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
                  onClick={() => setIsExpenseModalOpen(true)}
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
              {expenses.map((exp) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span className="font-medium text-slate-700">{exp.title}</span>
                  </div>
                  <span className="font-bold text-slate-900 tabular font-mono">
                    Rs. {exp.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
            <span className="text-xs font-semibold text-slate-500">
              Total Supplier Expenses:
            </span>
            <span className="text-sm font-bold text-blue-600 tabular font-display">
              Rs. {totalExpensesAmount.toLocaleString()}
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
                Procured milk sales revenue vs. vendor acquisition costs
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
              <LineChart data={SOURCING_PL_TREND} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [
                    `Rs. ${val.toLocaleString()}`,
                    name === 'revenue' ? 'Sales Revenue' : name === 'cost' ? 'Vendor Cost' : 'Gross Margin',
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

      {/* 4. Row 4: Today's Procurement Intake Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 font-display text-sm sm:text-base">
              Today's Procurement Intake (24-Aug-2026)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 h-[34px] rounded-full text-white text-xs font-semibold shadow-xs"
              style={{ backgroundColor: '#009966' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Intake</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/supplier/intake')}
              className="px-3.5 h-[34px] rounded-full text-xs font-semibold border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              View All Logs
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  SUPPLIER NAME
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  SHIFT
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  VOLUME (L)
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  RATE / LITER
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  TOTAL COST
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  FAT% / LR
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  PAYMENT STATUS
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  DESTINATION
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {intakeLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/60 transition-colors duration-150">
                  <TableCell className="py-3.5 px-4 font-bold text-slate-900 font-display">
                    {log.supplier}
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {log.shift}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 font-bold text-slate-800 tabular">
                    {log.volume} L
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-slate-700 font-medium tabular">
                    Rs. {log.rate}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 font-bold text-slate-900 tabular">
                    Rs. {log.totalCost.toLocaleString()}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-slate-600 font-medium text-xs tabular">
                    Fat: {log.fat}% · LR: {log.lr}
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {log.paymentStatus}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-slate-700 font-medium">
                    {log.destination}
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setViewDetailItem(log)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL 1: Log Intake Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                Log Daily Milk Intake
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIntake} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Supplier / Farm *
                </label>
                <select
                  value={newLog.supplier}
                  onChange={(e) => setNewLog({ ...newLog, supplier: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white outline-none"
                >
                  <option value="Ahmad Farms">Ahmad Farms</option>
                  <option value="Chaudhry Dairy">Chaudhry Dairy</option>
                  <option value="Al-Madina Milk">Al-Madina Milk</option>
                  <option value="Shahid Brothers">Shahid Brothers</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Shift *
                  </label>
                  <select
                    value={newLog.shift}
                    onChange={(e) => setNewLog({ ...newLog, shift: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Evening">Evening Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Volume (Liters) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 25"
                    value={newLog.volume}
                    onChange={(e) => setNewLog({ ...newLog, volume: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Rate (Rs./L)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={newLog.rate}
                    onChange={(e) => setNewLog({ ...newLog, rate: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fat %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.fat}
                    onChange={(e) => setNewLog({ ...newLog, fat: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    LR (Reading)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newLog.lr}
                    onChange={(e) => setNewLog({ ...newLog, lr: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newLog.paymentStatus}
                    onChange={(e) => setNewLog({ ...newLog, paymentStatus: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={newLog.destination}
                    onChange={(e) => setNewLog({ ...newLog, destination: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLogModalOpen(false)}
                  className="rounded-full h-[38px] px-4 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full h-[38px] px-5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Intake
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Add New Vendor
              </h3>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Vendor / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supplier 5 (Bilal Agro)"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Approx. Monthly Volume (L)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={newVendor.initialLiters}
                  onChange={(e) => setNewVendor({ ...newVendor, initialLiters: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="rounded-full h-[38px] px-4 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full h-[38px] px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Vendor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                Add Procurement Expense
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milk Can Disinfection Wash"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 750"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-full h-[38px] px-4 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full h-[38px] px-5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700"
                >
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: View Intake Details Modal */}
      {viewDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400">{viewDetailItem.id}</span>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {viewDetailItem.supplier}
                </h3>
              </div>
              <button
                onClick={() => setViewDetailItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs py-2">
              <div className="flex justify-between text-slate-600">
                <span>Shift & Time:</span>
                <span className="font-semibold text-slate-900">
                  {viewDetailItem.shift} · {viewDetailItem.time}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quantity (Liters):</span>
                <span className="font-bold text-slate-900 tabular">{viewDetailItem.volume} L</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rate per Liter:</span>
                <span className="font-bold text-slate-900 tabular">Rs. {viewDetailItem.rate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fat% & Lactometer:</span>
                <span className="font-semibold text-blue-600">
                  {viewDetailItem.fat}% Fat · {viewDetailItem.lr} LR
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Destination Center:</span>
                <span className="font-semibold text-slate-900">{viewDetailItem.destination}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-600">{viewDetailItem.paymentStatus}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-600 font-display">
                  Rs. {viewDetailItem.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <Button
                onClick={() => setViewDetailItem(null)}
                className="w-full rounded-full h-[38px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800"
              >
                Close Slip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
