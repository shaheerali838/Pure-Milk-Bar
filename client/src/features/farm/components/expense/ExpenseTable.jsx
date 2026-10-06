import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../../../../context/ExpenseContext';
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExpenseTable({
  expenses: propExpenses,
  searchQuery = '',
  categoryFilter = 'All',
  onEditExpense,
}) {
  const { expenses: globalExpenses = [], deleteExpense } = useExpense();
  const navigate = useNavigate();

  const baseExpenses = propExpenses || globalExpenses;

  // Apply search and category filter if not already filtered
  const filteredExpenses = baseExpenses.filter((expense) => {
    // 1. Category Filter (only if propExpenses wasn't already passed filtered)
    if (!propExpenses && categoryFilter && categoryFilter !== 'All') {
      const expCat = (expense.category || '').toLowerCase();
      const filterCat = categoryFilter.toLowerCase();
      const firstWord = filterCat.split(' ')[0];
      const matchesCategory =
        expCat === filterCat ||
        expCat.includes(filterCat) ||
        expCat.startsWith(firstWord);
      if (!matchesCategory) return false;
    }

    // 2. Search Query Filter (only if propExpenses wasn't already passed filtered)
    if (!propExpenses && searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const desc = (expense.description || '').toLowerCase();
      const cat = (expense.category || '').toLowerCase();
      const ref = (expense.receiptRef || '').toLowerCase();
      const auth = (expense.authorizedBy || '').toLowerCase();
      const amt = String(expense.amount || '');

      const matchesSearch =
        desc.includes(q) ||
        cat.includes(q) ||
        ref.includes(q) ||
        auth.includes(q) ||
        amt.includes(q);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const handleDelete = async (e, expense) => {
    e.stopPropagation();
    const expId = expense._id || expense.id;
    const catName = expense.category || 'Expense';
    const amtStr = Number(expense.amount || 0).toLocaleString();
    const isSalary = String(catName).toLowerCase().includes('salar') || String(expense.title || '').toLowerCase().includes('salary');

    const msg = isSalary
      ? `Are you sure you want to delete this staff salary expense (Rs. ${amtStr})? This will also delete the salary disbursement record and reset the staff payment status.`
      : `Are you sure you want to delete this expense (${catName}: Rs. ${amtStr})?`;

    if (window.confirm(msg)) {
      try {
        await deleteExpense(expId);
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[11px] uppercase text-slate-500 bg-slate-50/50 border-y border-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Animal</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Ref #</th>
            <th className="px-4 py-3 font-semibold text-right">Amount</th>
            <th className="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <FileText className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">No farm operating expenses found for this selection.</p>
                </div>
              </td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => {
              const expenseId = expense.id || expense._id;
              return (
                <tr
                  key={expenseId}
                  onClick={() => navigate(`/farm/expenses/detail/${expenseId}`)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs font-medium">
                    {expense.date ? new Date(expense.date).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {String(expense.category || 'General').split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium text-xs">
                    {expense.animalName || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-[220px] truncate text-xs" title={expense.description || expense.title || ''}>
                    {expense.description || expense.title || '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {expense.receiptRef || expense.voucherNumber || '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono text-xs">
                    Rs. {Number(expense.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); navigate(`/farm/expenses/detail/${expenseId}`); }}
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onEditExpense(expenseId); }}
                        title="Edit expense"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        onClick={(e) => handleDelete(e, expense)}
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
