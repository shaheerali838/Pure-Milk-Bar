import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ExpenseContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_farm_expenses_v1';

export function useExpense() {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
}

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // Filter out any legacy dummy data with id 1 or Allah Ditta
                    return parsed.filter((exp) => exp.id !== '1' && exp.authorizedBy !== 'Allah Ditta');
                }
            }
            return [];
        } catch (err) {
            console.error('Failed to load expenses from localStorage:', err);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        } catch (err) {
            console.error('Failed to save expenses to localStorage:', err);
        }
    }, [expenses]);

    const addExpense = (expense) => {
        const newExpense = { ...expense, id: Date.now().toString() };
        setExpenses(prev => [newExpense, ...prev]);
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
