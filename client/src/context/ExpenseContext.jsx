import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/services/api';

const ExpenseContext = createContext();

export function useExpense() {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
}

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState([]);
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
                amount: Number(exp.amount) || 0,
                date: exp.date ? exp.date.split('T')[0] : new Date().toISOString().split('T')[0],
                description: exp.description || exp.notes || '',
                authorizedBy: exp.authorizedBy || 'Admin',
            }));
            setExpenses(normalized);
        } catch (err) {
            console.warn('Failed to load farm expenses from database API:', err.message);
            setExpenses([]);
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
        setExpenses(prev => [newExpense, ...prev]);

        // Sync to backend database
        try {
            await api.finance.createExpense({
                scope: 'FARM',
                category: expense.category || 'FARM_OPERATION',
                amount: Number(expense.amount) || 0,
                date: expense.date || new Date().toISOString().split('T')[0],
                description: expense.description || expense.category || '',
                paymentMethod: ['CASH', 'ONLINE', 'BANK_TRANSFER'].includes(String(expense.paymentMethod).toUpperCase())
                    ? String(expense.paymentMethod).toUpperCase()
                    : 'CASH',
                authorizedBy: expense.authorizedBy || 'Admin',
            });
        } catch (e) {
            console.warn('Expense API backend sync skipped:', e.message);
        }
    };

    const editExpense = (id, updatedExpense) => {
        setExpenses(prev => prev.map(exp => (exp.id === id ? { ...updatedExpense, id } : exp)));
    };

    const deleteExpense = (id) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
    };

    const totals = useMemo(() => {
        let totalFarmExpense = 0;
        let feedSeedFarming = 0;
        let fuelTransportRepairs = 0;
        let salariesKitchenMess = 0;

        expenses.forEach(exp => {
            const amt = Number(exp.amount) || 0;
            totalFarmExpense += amt;
            
            const cat = exp.category || '';

            if (
                cat.includes('Feed') ||
                cat.includes('Seed') ||
                cat.includes('Veterinary') ||
                cat.includes('Livestock') ||
                cat.includes('Dairy')
            ) {
                feedSeedFarming += amt;
            } else if (
                cat.includes('Fuel') ||
                cat.includes('Machinery') ||
                cat.includes('Electricity') ||
                cat.includes('Shed') ||
                cat.includes('Hardware')
            ) {
                fuelTransportRepairs += amt;
            } else if (
                cat.includes('Salaries') ||
                cat.includes('Kitchen')
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
