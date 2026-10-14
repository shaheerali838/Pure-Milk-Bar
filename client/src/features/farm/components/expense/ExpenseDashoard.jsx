import React, { useState, useMemo } from "react";
import ExpenseFarmCardOverFlow from "./ExpenseFarmCardOverFlow";
import ExpenseFilterHeader from "./ExpenseFilterHeader";
import ExpenseTable from "./ExpenseTable";
import { Plus, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecordExpenseForm from "./RecordExpenseForm";
import { useExpense } from "@/context/ExpenseContext";

const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const normalizeDateStr = (raw) => {
    if (!raw) return '';
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.includes('T')) return trimmed.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    }
    try {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch {}
    return String(raw).slice(0, 10);
};

const getWeekBoundaries = (dateObj = new Date()) => {
    const now = new Date(dateObj);
    const day = now.getDay(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: formatLocalDate(monday),
        end: formatLocalDate(sunday)
    };
};

const getMonthBoundaries = (dateObj = new Date()) => {
    const now = new Date(dateObj);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        start: formatLocalDate(monthStart),
        end: formatLocalDate(monthEnd)
    };
};

const DATE_FILTERS = [
    { id: 'today',      label: 'Today' },
    { id: 'this_week',  label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'custom',     label: 'Custom' },
    { id: 'all',        label: 'All Time' },
];

export default function ExpenseDashboard() {
    const { expenses = [] } = useExpense();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('today'); // 'today' | 'this_week' | 'this_month' | 'custom' | 'all'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);

    const todayFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

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
        const todayStr = formatLocalDate(now);
        const { start: mondayStr, end: sundayStr } = getWeekBoundaries(now);
        const { start: monthStartStr, end: monthEndStr } = getMonthBoundaries(now);

        return expenses.filter((exp) => {
            // Strictly farm scope
            const scope = String(exp.scope || exp.expenseEntity || 'FARM').toUpperCase();
            if (scope !== 'FARM') return false;

            // 1. Date Filter
            const rawDate = exp.date || exp.createdAt;
            const expDate = normalizeDateStr(rawDate);

            if (dateFilter === 'today') {
                if (expDate !== todayStr) return false;
            } else if (dateFilter === 'this_week' || dateFilter === 'week') {
                if (expDate < mondayStr || expDate > sundayStr) return false;
            } else if (dateFilter === 'this_month' || dateFilter === 'month') {
                if (expDate < monthStartStr || expDate > monthEndStr) return false;
            } else if (dateFilter === 'custom') {
                if (startDate && endDate) {
                    if (expDate < startDate || expDate > endDate) return false;
                } else if (startDate) {
                    if (expDate < startDate) return false;
                } else if (endDate) {
                    if (expDate > endDate) return false;
                }
            }

            // 2. Category Filter
            if (categoryFilter && categoryFilter !== 'All') {
                const expCat = (exp.category || '').toLowerCase();
                const filterCat = categoryFilter.toLowerCase();
                const firstWord = filterCat.split(' ')[0].replace(/[^a-z0-9]/g, '');
                const expFirstWord = expCat.split(' ')[0].replace(/[^a-z0-9]/g, '');

                const matchesCategory =
                    expCat === filterCat ||
                    expCat.includes(filterCat) ||
                    filterCat.includes(expCat) ||
                    (firstWord && expCat.includes(firstWord)) ||
                    (expFirstWord && filterCat.includes(expFirstWord));

                if (!matchesCategory) return false;
            }

            // 3. Search Query Filter
            if (searchQuery && searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const desc = (exp.description || exp.notes || exp.title || '').toLowerCase();
                const cat = (exp.category || '').toLowerCase();
                const ref = (exp.receiptRef || exp.voucherNumber || exp.receiptNumber || '').toLowerCase();
                const auth = (exp.authorizedBy || '').toLowerCase();
                const animal = (exp.animalName || '').toLowerCase();
                const amt = String(exp.amount || '');

                const matchesSearch =
                    desc.includes(q) ||
                    cat.includes(q) ||
                    ref.includes(q) ||
                    auth.includes(q) ||
                    animal.includes(q) ||
                    amt.includes(q);
                if (!matchesSearch) return false;
            }

            return true;
        });
    }, [expenses, dateFilter, startDate, endDate, categoryFilter, searchQuery]);

    const activeDateLabel = useMemo(() => {
        if (dateFilter === 'today') return 'Today';
        if (dateFilter === 'this_week' || dateFilter === 'week') return 'This Week';
        if (dateFilter === 'this_month' || dateFilter === 'month') return 'This Month';
        if (dateFilter === 'custom') {
            if (startDate && endDate) return `${startDate} to ${endDate}`;
            if (startDate) return `From ${startDate}`;
            if (endDate) return `Until ${endDate}`;
            return 'Custom Range';
        }
        return 'All Time';
    }, [dateFilter, startDate, endDate]);

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Operating Expenses</h1>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{todayFormatted}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Track farm inputs, feed, utilities, salaries and maintenance costs</p>
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

                {/* ── Date Filter Tabs (Today, This Week, This Month, Custom, All Time) ── */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {DATE_FILTERS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setDateFilter(id)}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                dateFilter === id
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                    <span className="text-[10.5px] text-slate-400 font-medium ml-1">
                        {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} ({activeDateLabel})
                    </span>
                </div>

                {/* Custom date range pickers */}
                {dateFilter === 'custom' && (
                    <div className="flex flex-wrap items-center gap-2.5 px-3 py-2 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-600">Custom Date:</span>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                            <span className="text-slate-400 font-medium">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                            <span className="text-slate-400 font-medium">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-800 font-semibold cursor-pointer text-xs"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                type="button"
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-medium ml-1"
                            >
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                )}

                {/* Dynamic Overflow Summary Cards matching the selected period */}
                <ExpenseFarmCardOverFlow expenses={filteredExpenses} periodLabel={activeDateLabel} />

                {/* Filter Header with Search & Category */}
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