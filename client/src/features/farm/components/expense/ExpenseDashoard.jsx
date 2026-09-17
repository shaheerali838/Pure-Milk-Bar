import React, { useState } from "react";
import ExpenseFarmCardOverFlow from "./ExpenseFarmCardOverFlow";
import ExpenseFilterHeader from "./ExpenseFilterHeader";
import ExpenseTable from "./ExpenseTable";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExpenseDashboard() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    return (
        <div className=" bg-slate-50">
            <div className=" space-y-2">
                <div className="flex justify-between items-center py-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Operating Expenses</h1>
                    <div className="items-center w-full sm:w-auto">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-white w-full sm:w-auto font-medium"
                            onClick={() => navigate('/farm/expenses/new')}
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
                    />
                </div>
            </div>
        </div>
    );
}