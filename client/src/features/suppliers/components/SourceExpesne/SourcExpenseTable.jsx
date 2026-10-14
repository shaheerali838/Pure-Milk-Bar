import React, { useState, useMemo } from 'react';
import { Search, Eye, Edit2, Trash2, Filter, Receipt, Calendar, FileText } from 'lucide-react';
import { useSourcExpenseContext, CATEGORY_OPTIONS } from '@/context/SourcExpenseContext';

// Color map for badges based on categories
const CATEGORY_STYLES = {
  'Milk Collection Logistics': 'bg-blue-50 text-blue-700 border-blue-200',
  'Collection Route Fuel': 'bg-sky-50 text-sky-700 border-sky-200',
  'Transit Vehicle Maintenance': 'bg-purple-50 text-purple-700 border-purple-200',
  'Chilling & Lab Testing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Transit Can Sanitization': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Supplier Loading Handling': 'bg-amber-50 text-amber-700 border-amber-200',
  'Weighing & Commission': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Other Sourcing Costs': 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function SourcExpenseTable({ onView, onEdit }) {
  const { expenses, deleteExpense } = useSourcExpenseContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter expenses by search term (description or voucher #) and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.voucherNo && item.voucherNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.loggedBy && item.loggedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const handleDelete = (item) => {
    if (
      window.confirm(
        `Are you sure you want to delete expense "${item.description}" (${item.voucherNo}) of Rs. ${Number(item.amount).toLocaleString()}?`
      )
    ) {
      deleteExpense(item.id);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search and Category Filter Toolbar */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search description, voucher #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>

        {/* Right: Category Filter Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline font-medium">Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-64 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="all">All Sourcing Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Description</th>
                <th className="py-3 px-3.5 text-right">Amount</th>
                <th className="py-3 px-3.5">Payment Mode</th>
                <th className="py-3 px-3.5">Voucher #</th>
                <th className="py-3 px-3.5">Logged By</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-semibold text-xs text-slate-600">No sourcing expenses found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your search query or category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const badgeStyle =
                    CATEGORY_STYLES[expense.category] ||
                    'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <tr
                      key={expense.id}
                      onClick={() => onView(expense)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Date */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                        {expense.date}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle}`}
                        >
                          {expense.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3.5 max-w-[280px]">
                        <p className="font-medium text-slate-800 line-clamp-1 group-hover:text-[#4f39f6] transition-colors">
                          {expense.description}
                        </p>
                        {expense.costAttribution && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {expense.costAttribution}
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-right font-bold text-slate-900 font-mono">
                        Rs. {Number(expense.amount).toLocaleString()}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {expense.paymentMode || 'Cash on Hand'}
                        </span>
                      </td>

                      {/* Voucher # */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {expense.voucherNo || expense.id}
                        </span>
                      </td>

                      {/* Logged By */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 text-[11px]">
                        {expense.loggedBy || 'Admin'}
                      </td>

                      {/* Actions */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-2.5 px-3.5 whitespace-nowrap text-center"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="View Voucher Detail"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(expense);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Edit Expense"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(expense);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Expense"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(expense);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with quick count */}
        <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Showing {filteredExpenses.length} of {expenses.length} sourcing records</span>
          <span>
            Filtered Total: <strong className="text-slate-800 font-mono">Rs. {filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
