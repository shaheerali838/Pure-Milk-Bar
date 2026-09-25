import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/services/api';

const ExpenseContext = createContext();

export function useExpense() {
    const context = useContext(ExpenseContext);
    if (!context) {
        return {
            expenses: [],
            addExpense: () => {},
            editExpense: () => {},
            deleteExpense: () => {},
            totals: { totalFarmExpense: 0, feedSeedFarming: 0, fuelTransportRepairs: 0, salariesKitchenMess: 0 },
        };
    }
    return context;
}

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState(() => {
        try {
            const saved = localStorage.getItem('farm_expenses_cache');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch live farm expenses from database API
    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.finance.getExpenses({ scope: 'FARM' });
            const list = Array.isArray(res)
                ? res
                : Array.isArray(res?.data?.expenses)
                ? res.data.expenses
                : Array.isArray(res?.expenses)
                ? res.expenses
                : Array.isArray(res?.data)
                ? res.data
                : [];
            const normalized = list.map((exp) => ({
                ...exp,
                id: exp._id || exp.id || `EXP-${Date.now()}`,
                category: exp.category || 'General Expense',
                amount: Number(exp.amountRupees || exp.amount) || 0,
                date: exp.date ? exp.date.split('T')[0] : new Date().toISOString().split('T')[0],
                description: exp.title || exp.description || exp.notes || '',
                authorizedBy: exp.authorizedBy || 'Admin',
            }));
            if (normalized.length > 0) {
                setExpenses(normalized);
                localStorage.setItem('farm_expenses_cache', JSON.stringify(normalized));
            }
        } catch (err) {
            console.warn('Failed to load farm expenses from database API:', err.message);
            // DO NOT clear state here, rely on localStorage cache
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = async (expense) => {
        const newExpense = {
            ...expense,
            id: expense.id || `EXP-${Date.now()}`,
            date: expense.date || new Date().toISOString().split('T')[0],
            amount: Number(expense.amount) || 0,
        };
        setExpenses(prev => {
            const updated = [newExpense, ...prev];
            localStorage.setItem('farm_expenses_cache', JSON.stringify(updated));
            return updated;
        });

        // Map to allowed backend categories
        const allowedCats = ['UTILITIES', 'SALARIES', 'MAINTENANCE', 'FEED', 'PACKAGING', 'RENT', 'TRANSPORT', 'MISC'];
        let mappedCategory = String(expense.category || 'MISC').toUpperCase();
        if (!allowedCats.includes(mappedCategory)) {
            if (mappedCategory.includes('FEED') || mappedCategory.includes('SEED')) mappedCategory = 'FEED';
            else if (mappedCategory.includes('FUEL') || mappedCategory.includes('TRANSPORT')) mappedCategory = 'TRANSPORT';
            else if (mappedCategory.includes('SALAR') || mappedCategory.includes('KITCHEN')) mappedCategory = 'SALARIES';
            else mappedCategory = 'MISC';
        }

        const mappedPaymentMethod = ['CASH', 'ONLINE', 'CHEQUE'].includes(String(expense.paymentMethod).toUpperCase())
            ? String(expense.paymentMethod).toUpperCase()
            : 'CASH';

        // Sync to backend database
        try {
            await api.finance.createExpense({
                scope: 'FARM',
                category: mappedCategory,
                amountRupees: Number(expense.amount) || 0,
                title: expense.description || expense.category || 'Farm Expense',
                date: expense.date || new Date().toISOString().split('T')[0],
                notes: expense.description || '',
                paymentMethod: mappedPaymentMethod,
                authorizedBy: expense.authorizedBy || 'Admin',
            });
        } catch (e) {
            console.warn('Expense API backend sync skipped:', e.message);
        }
    };

    const editExpense = async (id, updatedExpense) => {
        setExpenses(prev => {
            const updated = prev.map(exp => ((exp._id || exp.id) === id || exp.id === id ? { ...updatedExpense, id } : exp));
            localStorage.setItem('farm_expenses_cache', JSON.stringify(updated));
            return updated;
        });
        try {
            await api.finance.updateExpense(id, {
                amountRupees: Number(updatedExpense.amount),
                category: updatedExpense.category,
                notes: updatedExpense.description || updatedExpense.notes,
            });
        } catch (e) {
            console.warn('Expense edit API sync skipped:', e.message);
        }
    };

    const deleteExpense = async (id) => {
        setExpenses(prev => {
            const updated = prev.filter(exp => (exp._id || exp.id) !== id && exp.id !== id);
            localStorage.setItem('farm_expenses_cache', JSON.stringify(updated));
            return updated;
        });
        try {
            await api.finance.deleteExpense(id);
        } catch (e) {
            console.warn('Expense delete API sync skipped:', e.message);
        }
    };

    const totals = useMemo(() => {
        let totalFarmExpense = 0;
        let feedSeedFarming = 0;
        let fuelTransportRepairs = 0;
        let salariesKitchenMess = 0;

        expenses.forEach(exp => {
            const amt = Number(exp.amount) || 0;
            totalFarmExpense += amt;
            
            const cat = String(exp.category || '').toUpperCase();

            if (
                cat.includes('FEED') ||
                cat.includes('SEED') ||
                cat.includes('VETERINARY') ||
                cat.includes('LIVESTOCK') ||
                cat.includes('DAIRY')
            ) {
                feedSeedFarming += amt;
            } else if (
                cat.includes('FUEL') ||
                cat.includes('MACHINERY') ||
                cat.includes('ELECTRICITY') ||
                cat.includes('SHED') ||
                cat.includes('HARDWARE') ||
                cat.includes('TRANSPORT') ||
                cat.includes('MAINTENANCE') ||
                cat.includes('UTILITIES')
            ) {
                fuelTransportRepairs += amt;
            } else if (
                cat.includes('SALAR') ||
                cat.includes('KITCHEN')
            ) {
                salariesKitchenMess += amt;
            }
        });

        return {
            totalFarmExpense,
            feedSeedFarming,
            fuelTransportRepairs,
            salariesKitchenMess
        };
    }, [expenses]);

    const value = {
        expenses,
        addExpense,
        editExpense,
        deleteExpense,
        totals
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
}
