import React, { useState } from "react";
import ExpenseFarmCardOverFlow from "./ExpenseFarmCardOverFlow";
import ExpenseFilterHeader from "./ExpenseFilterHeader";
import ExpenseTable from "./ExpenseTable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordExpenseForm from "./RecordExpenseForm";

export default function ExpenseDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);

    const handleOpenExpenseForm = (expenseId = null) => {
        setEditingExpenseId(expenseId);
        setIsExpenseFormOpen(true);
    };

    const handleCloseExpenseForm = () => {
        setEditingExpenseId(null);
        setIsExpenseFormOpen(false);
    };

    // Full-space form view — replaces the dashboard when open
    if (isExpenseFormOpen) {
        return (
            <RecordExpenseForm
                expenseId={editingExpenseId}
                onClose={handleCloseExpenseForm}
            />
        );
    }

    return (
        <div className=" bg-slate-50">
            <div className=" space-y-2">
                <div className="flex justify-between items-center py-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Operating Expenses</h1>
                    <div className="items-center w-full sm:w-auto">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-white w-full sm:w-auto font-medium"
                            onClick={() => handleOpenExpenseForm()}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Record Farm Expense
                        </Button>
                    </div>
                </div>

                <ExpenseFarmCardOverFlow />
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <ExpenseFilterHeader 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                    />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <ExpenseTable 
                        searchQuery={searchQuery}
                        categoryFilter={categoryFilter}
                        onEditExpense={handleOpenExpenseForm}
                    />
                </div>
            </div>

        </div>
    );
}