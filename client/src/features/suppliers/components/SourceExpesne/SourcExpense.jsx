import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSourcExpenseContext } from '@/context/SourcExpenseContext';
import SourcExpenseCards from './SourcExpenseCards';
import SourcExpenseTable from './SourcExpenseTable';
import RecordExpenseForm from './RecordExpenseForm';
import ExpenseVoucherDetail from './ExpenseVoucherDetail';

export default function SourcExpense() {
  const { deleteExpense } = useSourcExpenseContext();

  // Full-space view modes matching Animal module (AnimalAdd & AnimalDetail)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  // 1. Full-space Add Sourcing Expense View
  if (isAddOpen) {
    return (
      <RecordExpenseForm
        onBack={() => setIsAddOpen(false)}
        onSuccess={() => setIsAddOpen(false)}
      />
    );
  }

  // 2. Full-space Edit Sourcing Expense View
  if (editingExpense) {
    return (
      <RecordExpenseForm
        editingExpense={editingExpense}
        onBack={() => setEditingExpense(null)}
        onSuccess={() => setEditingExpense(null)}
      />
    );
  }

  // 3. Full-space Expense Voucher Detail View
  if (selectedExpenseId) {
    return (
      <ExpenseVoucherDetail
        expenseId={selectedExpenseId}
        onBack={() => setSelectedExpenseId(null)}
        onClose={() => setSelectedExpenseId(null)}
        onEdit={(expense) => {
          setSelectedExpenseId(null);
          setEditingExpense(expense);
        }}
        onDelete={(id) => {
          deleteExpense(id);
          setSelectedExpenseId(null);
        }}
      />
    );
  }

  // Default: Main Dashboard / Table View
  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* 1. Page Header with Title and 'Record Sourcing Expense' Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            Supplier Operating Expenses
          </h2>
          
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 h-[40px] rounded-full text-white text-xs font-semibold shadow-sm transition-all hover:brightness-110 active:translate-y-0 cursor-pointer"
            style={{ backgroundColor: '#4f39f6' }}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Record Sourcing Expense</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <SourcExpenseCards />

      {/* 3. Search, Filter and Expenses Table */}
      <SourcExpenseTable
        onView={(expense) => setSelectedExpenseId(expense.id)}
        onEdit={(expense) => setEditingExpense(expense)}
      />
    </div>
  );
}
