import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useExpense } from '../../../context/ExpenseContext';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function ExpenseDetailPage() {
  const { expenses, deleteExpense } = useExpense();
  const navigate = useNavigate();
  const { id } = useParams();

  const expense = expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-700">Expense not found</h2>
        <Button variant="outline" onClick={() => navigate('/farm/expenses')} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteExpense(expense.id);
    navigate('/farm/expenses');
  };

  const handleEditClick = () => {
    navigate(`/farm/expenses/edit/${expense.id}`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/farm/expenses')} className="p-2 h-auto rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Details</h1>
            <p className="text-sm text-slate-500 mt-1">
              Reference: {expense.receiptRef || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                <p className="text-lg font-medium text-slate-900">{new Date(expense.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                  {expense.category}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Method</p>
                <p className="text-lg text-slate-700">{expense.paymentMethod || 'Cash'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-3xl font-bold text-slate-900">Rs. {Number(expense.amount).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-base text-slate-700 leading-relaxed">{expense.description}</p>
              </div>

              {expense.authorizedBy && (
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Authorized By</p>
                  <p className="text-base text-slate-700">{expense.authorizedBy}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-8 border-t border-slate-100 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/farm/expenses')}
              className="flex items-center space-x-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="h-11 px-6 bg-rose-500 hover:bg-rose-600 shadow-sm transition-all">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all h-11 px-8" onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
