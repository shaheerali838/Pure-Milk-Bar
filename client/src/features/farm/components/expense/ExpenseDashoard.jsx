import React from "react";
import ExpenseFarmCardOverFlow from "./ExpenseFarmCardOverFlow";
import ExpenseFilterHeader from "./ExpenseFilterHeader";
import ExpenseTable from "./ExpenseTable";

export default function ExpenseDashboard() {
    return(
        <div className="p-6 bg-slate-50 min-h-screen rounded-2xl">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Operating Expenses</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage daily farm expenditures across all categories.</p>
                </div>
                
                <ExpenseFarmCardOverFlow />
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <ExpenseFilterHeader />
                    <ExpenseTable />
                </div>
            </div>
        </div>
    )
}