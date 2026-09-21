import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../../../../context/ExpenseContext';
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExpenseTable({ searchQuery = '', categoryFilter = 'All', onEditExpense }) {
  const { expenses = [], deleteExpense } = useExpense();
  const navigate = useNavigate();

  const filteredExpenses = expenses.filter((expense) => {
    // 1. Category Filter
    let matchesCategory = true;
    if (categoryFilter && categoryFilter !== 'All') {
      const expCat = (expense.category || '').toLowerCase();
      const filterCat = categoryFilter.toLowerCase();
      const firstWord = filterCat.split(' ')[0];
      matchesCategory =
        expCat === filterCat ||
        expCat.includes(filterCat) ||
        expCat.startsWith(firstWord);
    }

    // 2. Search Query Filter
    let matchesSearch = true;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const desc = (expense.description || '').toLowerCase();
      const cat = (expense.category || '').toLowerCase();
      const ref = (expense.receiptRef || '').toLowerCase();
      const auth = (expense.authorizedBy || '').toLowerCase();
      const amt = String(expense.amount || '');

      matchesSearch =
        desc.includes(q) ||
        cat.includes(q) ||
        ref.includes(q) ||
        auth.includes(q) ||
        amt.includes(q);
    }

    return matchesCategory && matchesSearch;
  });

  return (
    <div className=" overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[11px] uppercase text-slate-500 bg-slate-50/50 border-y border-slate-200">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Ref #</th>
            <th className="px-4 py-3 font-semibold text-right">Amount</th>
            <th className="px-4 py-3 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <FileText className="w-4 h-4 text-slate-300" />
                  <p>No expenses found matching the selected filter.</p>
                </div>
              </td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => (
              <tr
                key={expense.id}
                onClick={() => navigate(`/farm/expenses/detail/${expense.id}`)}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {expense.category.split(' ')[0]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={expense.description}>
                  {expense.description}
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                  {expense.receiptRef || '-'}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {Number(expense.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                      onClick={(e) => { e.stopPropagation(); navigate(`/farm/expenses/detail/${expense.id}`); }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full"
                      onClick={(e) => { e.stopPropagation(); onEditExpense(expense.id); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full"
                      onClick={(e) => { e.stopPropagation(); deleteExpense(expense.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
