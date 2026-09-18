import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Truck,
  Zap,
  FlaskConical,
  Store,
  Users,
  Calendar,
  Filter,
  X,
  CreditCard,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
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

const INITIAL_EXPENSES = [
  {
    id: 'EXP-SRC-101',
    date: '2026-09-17',
    category: 'Logistics & Transport',
    description: 'Milk collection van diesel (Route 1 - Green Meadows)',
    routeCenter: 'Green Meadows Center',
    payee: 'PSO Petrol Pump (Shell Station)',
    paymentMethod: 'Cash',
    amount: 14500,
    loggedBy: 'Farhan Ali (Driver)',
  },
  {
    id: 'EXP-SRC-102',
    date: '2026-09-16',
    category: 'Chiller & Preservation',
    description: 'Backup generator diesel (45 Liters) during 4h load shedding',
    routeCenter: 'North Valley Chilling Unit',
    payee: 'Attock Petroleum',
    paymentMethod: 'Cash',
    amount: 12800,
    loggedBy: 'Imran Khan (Incharge)',
  },
  {
    id: 'EXP-SRC-103',
    date: '2026-09-15',
    category: 'Quality Testing & Lab',
    description: 'Gerber butyrometer sulfuric acid & alcohol testing solution',
    routeCenter: 'Central Procurement Lab',
    payee: 'BioLab Scientific Chemicals',
    paymentMethod: 'Bank Transfer',
    amount: 8500,
    loggedBy: 'Dr. Bilal Qureshi',
  },
  {
    id: 'EXP-SRC-104',
    date: '2026-09-14',
    category: 'Center Facilities',
    description: 'Monthly collection center warehouse rent & water filtration',
    routeCenter: 'Highland Farms Center',
    payee: 'Haji Aslam (Landlord)',
    paymentMethod: 'JazzCash',
    amount: 35000,
    loggedBy: 'Accounts Dept',
  },
  {
    id: 'EXP-SRC-105',
    date: '2026-09-13',
    category: 'Logistics & Transport',
    description: 'Purchase of 6 food-grade stainless steel milk cans (40L each)',
    routeCenter: 'Riverside Dairy Route',
    payee: 'Gujranwala Steel Fabrication',
    paymentMethod: 'Bank Transfer',
    amount: 42000,
    loggedBy: 'Procurement Officer',
  },
  {
    id: 'EXP-SRC-106',
    date: '2026-09-12',
    category: 'Field Staff & Labor',
    description: 'Daily milk loading & unloading labor stipend (Morning shift)',
    routeCenter: 'Central Intake Bay',
    payee: 'Casual Staff (4 Persons)',
    paymentMethod: 'Cash',
    amount: 6000,
    loggedBy: 'Shift Supervisor',
  },
  {
    id: 'EXP-SRC-107',
    date: '2026-09-11',
    category: 'Chiller & Preservation',
    description: 'Chiller Freon gas top-up & compressor routine maintenance',
    routeCenter: 'Green Meadows Center',
    payee: 'CoolTech HVAC Solutions',
    paymentMethod: 'Bank Transfer',
    amount: 18500,
    loggedBy: 'Maintenance Tech',
  },
];

const CATEGORIES = [
  'All Categories',
  'Logistics & Transport',
  'Chiller & Preservation',
  'Quality Testing & Lab',
  'Center Facilities',
  'Field Staff & Labor',
];

export default function SourceExpense() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Expense Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Logistics & Transport',
    description: '',
    routeCenter: 'Green Meadows Center',
    payee: '',
    paymentMethod: 'Cash',
    amount: '',
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const newExp = {
      id: `EXP-SRC-${100 + expenses.length + 1}`,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      routeCenter: formData.routeCenter,
      payee: formData.payee || 'Direct Supplier',
      paymentMethod: formData.paymentMethod,
      amount: parseFloat(formData.amount) || 0,
      loggedBy: 'Logged in User',
    };

    setExpenses([newExp, ...expenses]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Logistics & Transport',
      description: '',
      routeCenter: 'Green Meadows Center',
      payee: '',
      paymentMethod: 'Cash',
      amount: '',
    });
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.id.toLowerCase().includes(search.toLowerCase()) ||
      exp.payee.toLowerCase().includes(search.toLowerCase()) ||
      exp.routeCenter.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === 'All Categories' || exp.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const transportTotal = expenses
    .filter((e) => e.category === 'Logistics & Transport')
    .reduce((sum, e) => sum + e.amount, 0);
  const chillerTotal = expenses
    .filter((e) => e.category === 'Chiller & Preservation')
    .reduce((sum, e) => sum + e.amount, 0);
  const testingTotal = expenses
    .filter((e) => e.category === 'Quality Testing & Lab')
    .reduce((sum, e) => sum + e.amount, 0);

  // Based on monthly ~74,000L volume
  const overheadPerLiter = (totalExpense / 74200).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#4f39f6]" />
            Sourcing & Operational Expenses
          </h2>
          <p className="text-sm text-slate-500">
            Track procurement operational overheads, milk chilling electricity, transport vans, testing kits, and field labor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 h-[40px] rounded-full text-white text-sm font-semibold shadow-sm transition-all hover:brightness-110 active:translate-y-0"
            style={{ backgroundColor: '#4f39f6' }}
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Sourcing Cost
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            Rs. {totalExpense.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{expenses.length} recorded items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Transport & Cans
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            Rs. {transportTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {((transportTotal / (totalExpense || 1)) * 100).toFixed(0)}% of total cost
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Chilling & Power
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            Rs. {chillerTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {((chillerTotal / (totalExpense || 1)) * 100).toFixed(0)}% of total cost
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" /> Testing & Lab
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 tabular font-display">
            Rs. {testingTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Consumables & reagents</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
            Sourcing Cost / Liter
          </p>
          <p className="text-2xl font-bold text-purple-700 mt-1 tabular font-display">
            Rs. {overheadPerLiter}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Overhead per liter intake</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-full px-4 h-[40px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search expense description, payee, route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[38px] px-3.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Expense ID & Date
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Category
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Description
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Route / Center
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Supplier / Payee
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  Method
                </TableHead>
                <TableHead className="py-3 px-4 text-slate-500 font-bold uppercase text-[11px] tracking-wider text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    No sourcing expenses match your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((exp) => (
                  <TableRow
                    key={exp.id}
                    className="hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    <TableCell className="py-3.5 px-4">
                      <div>
                        <span className="font-mono font-bold text-purple-700 text-xs">
                          {exp.id}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">{exp.date}</div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold border-0 ${
                          exp.category.includes('Transport')
                            ? 'bg-blue-50 text-blue-700'
                            : exp.category.includes('Chiller')
                            ? 'bg-amber-50 text-amber-700'
                            : exp.category.includes('Lab')
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {exp.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 font-medium text-slate-800">
                      {exp.description}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-slate-600 text-xs">
                      {exp.routeCenter}
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-slate-700 text-xs">
                      {exp.payee}
                    </TableCell>

                    <TableCell className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {exp.paymentMethod}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 px-4 text-right font-bold text-slate-900 tabular">
                      Rs. {exp.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#4f39f6]" />
                Record Sourcing Expense
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white outline-none"
                >
                  <option value="Logistics & Transport">Logistics & Transport</option>
                  <option value="Chiller & Preservation">Chiller & Preservation</option>
                  <option value="Quality Testing & Lab">Quality Testing & Lab</option>
                  <option value="Center Facilities">Center Facilities</option>
                  <option value="Field Staff & Labor">Field Staff & Labor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chiller generator diesel 40 Liters"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Route / Center
                  </label>
                  <select
                    value={formData.routeCenter}
                    onChange={(e) => setFormData({ ...formData, routeCenter: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="Green Meadows Center">Green Meadows Center</option>
                    <option value="North Valley Chilling Unit">North Valley Chilling Unit</option>
                    <option value="Central Procurement Lab">Central Procurement Lab</option>
                    <option value="Highland Farms Center">Highland Farms Center</option>
                    <option value="Riverside Dairy Route">Riverside Dairy Route</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="e.g. 12500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Supplier / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shell Petrol Pump"
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                    className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full h-[40px] px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full h-[38px] px-4 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full h-[38px] px-5 text-xs font-semibold text-white"
                  style={{ backgroundColor: '#4f39f6' }}
                >
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
