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
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch live farm expenses from database API
    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.finance.getExpenses({ scope: 'FARM', limit: 1000 }, { skipCache: true });
            const list = Array.isArray(res)
                ? res
                : Array.isArray(res?.data?.expenses)
                ? res.data.expenses
                : Array.isArray(res?.expenses)
                ? res.expenses
                : Array.isArray(res?.data)
                ? res.data
                : [];
            if (Array.isArray(list)) {
                const normalized = list.map((exp) => ({
                    ...exp,
                    _id: exp._id || exp.id,
                    id: exp._id || exp.id || `EXP-${Date.now()}`,
                    category: exp.category || 'General Expense',
                    amount: Number(exp.amountRupees ?? exp.amount) || 0,
                    date: exp.date ? String(exp.date).split('T')[0] : new Date().toISOString().split('T')[0],
                    description: exp.description || exp.notes || exp.title || '',
                    authorizedBy: exp.authorizedBy || 'Admin',
                }));

                setExpenses(normalized);
            }
        } catch (err) {
            console.warn('Failed to load farm expenses from database API:', err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = async (expense) => {
        const tempId = expense.id || `EXP-${Date.now()}`;
        const newExpense = {
            ...expense,
            id: tempId,
            date: expense.date || new Date().toISOString().split('T')[0],
            amount: Number(expense.amount) || 0,
        };
        setExpenses(prev => [newExpense, ...prev]);

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
            const res = await api.finance.createExpense({
                scope: 'FARM',
                category: mappedCategory,
                title: expense.description || expense.category || 'Farm Expense',
                amount: Number(expense.amount) || 0,
                amountRupees: Number(expense.amount) || 0,
                date: expense.date || new Date().toISOString().split('T')[0],
                description: expense.description || expense.category || '',
                notes: expense.description || '',
                paymentMethod: mappedPaymentMethod,
                receiptRef: expense.receiptRef || '',
                authorizedBy: expense.authorizedBy || 'Admin',
            });

            const created = res?.data?.expense || res?.data || res?.expense || res;
            if (created && (created._id || created.id)) {
                const realId = created._id || created.id;
                setExpenses(prev => prev.map(item => item.id === tempId ? {
                    ...item,
                    _id: realId,
                    id: realId,
                    amount: Number(created.amountRupees ?? created.amount ?? item.amount)
                } : item));
            }
        } catch (e) {
            console.error('Expense API backend sync error:', e);
            throw e;
        }
    };

    const editExpense = async (id, updatedExpense) => {
        setExpenses(prev => prev.map(exp => ((exp._id || exp.id) === id || exp.id === id ? { ...updatedExpense, id, _id: id } : exp)));
        try {
            await api.finance.updateExpense(id, {
                amountRupees: Number(updatedExpense.amount),
                title: updatedExpense.description || updatedExpense.category,
                category: updatedExpense.category,
                notes: updatedExpense.description || updatedExpense.notes,
                authorizedBy: updatedExpense.authorizedBy,
            });
        } catch (e) {
            console.warn('Expense edit API sync error:', e.message);
            throw e;
        }
    };

    const deleteExpense = async (id) => {
        setExpenses(prev => prev.filter(exp => (exp._id || exp.id) !== id && exp.id !== id));
        try {
            await api.finance.deleteExpense(id);
        } catch (e) {
            console.warn('Expense delete API sync error:', e.message);
            throw e;
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
