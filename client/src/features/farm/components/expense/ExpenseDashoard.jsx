import React, { useState, useMemo } from "react";
import ExpenseFarmCardOverFlow from "./ExpenseFarmCardOverFlow";
import ExpenseFilterHeader from "./ExpenseFilterHeader";
import ExpenseTable from "./ExpenseTable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordExpenseForm from "./RecordExpenseForm";
import { useExpense } from "@/context/ExpenseContext";

export default function ExpenseDashboard() {
    const { expenses = [] } = useExpense();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'this_week' | 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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

    // Filter expenses by scope ('FARM'), date, category, and search query
    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Start of current week (Monday)
        const day = now.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        const mondayStr = monday.toISOString().split('T')[0];

        return expenses.filter((exp) => {
            // Strictly farm scope
            const scope = String(exp.scope || exp.expenseEntity || 'FARM').toUpperCase();
            if (scope !== 'FARM') return false;

            // 1. Date Filter
            const expDate = exp.date ? String(exp.date).slice(0, 10) : '';
            if (dateFilter === 'today') {
                if (expDate !== todayStr) return false;
            } else if (dateFilter === 'this_week') {
                if (expDate < mondayStr || expDate > todayStr) return false;
            } else if (dateFilter === 'custom') {
                if (startDate && expDate < startDate) return false;
                if (endDate && expDate > endDate) return false;
            }

            // 2. Category Filter
            if (categoryFilter && categoryFilter !== 'All') {
                const expCat = (exp.category || '').toLowerCase();
                const filterCat = categoryFilter.toLowerCase();
                const firstWord = filterCat.split(' ')[0];
                const matchesCategory =
                    expCat === filterCat ||
                    expCat.includes(filterCat) ||
                    expCat.startsWith(firstWord);
                if (!matchesCategory) return false;
            }

            // 3. Search Query Filter
            if (searchQuery && searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const desc = (exp.description || '').toLowerCase();
                const cat = (exp.category || '').toLowerCase();
                const ref = (exp.receiptRef || exp.voucherNumber || '').toLowerCase();
                const auth = (exp.authorizedBy || '').toLowerCase();
                const amt = String(exp.amount || '');

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
    }, [expenses, dateFilter, startDate, endDate, categoryFilter, searchQuery]);

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
        <div className="bg-slate-50">
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Operating Expenses</h1>
                        <p className="text-xs text-slate-500 font-medium">Track farm inputs, feed, utilities, salaries and maintenance costs</p>
                    </div>
                    <div className="items-center w-full sm:w-auto">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white w-full sm:w-auto font-bold shadow-xs cursor-pointer"
                            onClick={() => handleOpenExpenseForm()}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Record Farm Expense
                        </Button>
                    </div>
                </div>

                {/* Dynamic Overflow Summary Cards matching the selected period */}
                <ExpenseFarmCardOverFlow expenses={filteredExpenses} />

                {/* Filter Header with Search, Date Range Tabs (Today, This Week, Custom, All) & Category */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                    <ExpenseFilterHeader 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                    />
                </div>

                {/* Filtered Expenses Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                    <ExpenseTable 
                        expenses={filteredExpenses}
                        onEditExpense={handleOpenExpenseForm}
                    />
                </div>
            </div>
        </div>
    );
}