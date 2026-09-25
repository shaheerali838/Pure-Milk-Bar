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

const STORAGE_KEY = 'pmb_farm_expenses_v1';

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (_) {
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(false);

    // Save to localStorage on every expense update
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        } catch (_) {}
    }, [expenses]);

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

            if (list.length > 0) {
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

                setExpenses(prev => {
                    const serverIds = new Set(normalized.map(e => String(e._id || e.id)));
                    const localOnly = prev.filter(e => e.id && String(e.id).startsWith('EXP-') && !serverIds.has(String(e.id)));
                    const merged = [...localOnly, ...normalized];
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                    } catch (_) {}
                    return merged;
                });
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

        setExpenses(prev => {
            const updated = [newExpense, ...prev];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (_) {}
            return updated;
        });

        // Sync to backend database
        try {
            const res = await api.finance.createExpense({
                scope: 'FARM',
                category: expense.category || 'FARM_OPERATION',
                title: expense.description || expense.category || 'Farm Expense',
                amount: Number(expense.amount) || 0,
                amountRupees: Number(expense.amount) || 0,
                date: expense.date || new Date().toISOString().split('T')[0],
                description: expense.description || expense.category || '',
                notes: expense.description || '',
                paymentMethod: expense.paymentMethod || 'Cash',
                receiptRef: expense.receiptRef || '',
                authorizedBy: expense.authorizedBy || 'Admin',
            });

            const created = res?.data?.expense || res?.data || res?.expense || res;
            if (created && (created._id || created.id)) {
                const realId = created._id || created.id;
                setExpenses(prev => {
                    const updated = prev.map(item => item.id === tempId ? {
                        ...item,
                        _id: realId,
                        id: realId,
                        amount: Number(created.amountRupees ?? created.amount ?? item.amount)
                    } : item);
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    } catch (_) {}
                    return updated;
                });
            }
        } catch (e) {
            console.error('Expense API backend sync error:', e);
        }
    };

    const editExpense = async (id, updatedExpense) => {
        setExpenses(prev => {
            const updated = prev.map(exp => ((exp._id || exp.id) === id || exp.id === id ? { ...updatedExpense, id, _id: id } : exp));
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (_) {}
            return updated;
        });
        try {
            await api.finance.updateExpense(id, {
                amountRupees: Number(updatedExpense.amount),
                title: updatedExpense.description || updatedExpense.category,
                category: updatedExpense.category,
                notes: updatedExpense.description || updatedExpense.notes,
                authorizedBy: updatedExpense.authorizedBy,
            });
        } catch (e) {
            console.warn('Expense edit API sync skipped:', e.message);
        }
    };

    const deleteExpense = async (id) => {
        setExpenses(prev => {
            const updated = prev.filter(exp => (exp._id || exp.id) !== id && exp.id !== id);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (_) {}
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
