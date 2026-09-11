import React, { useState } from "react";
import { Receipt, Plus, Search } from "lucide-react";

const expenses = [
  { id: "EXP-001", category: "Feed & Fodder", description: "Green fodder - 500 kg",    amount: 12500, date: "2026-09-10", vendor: "Ali Agro Feeds",    paid: true },
  { id: "EXP-002", category: "Veterinary",    description: "Vaccination - 20 animals", amount: 8000,  date: "2026-09-10", vendor: "Dr. Zia Clinic",    paid: true },
  { id: "EXP-003", category: "Labor",         description: "Farm worker wages (Sep)",   amount: 35000, date: "2026-09-09", vendor: "Staff Payroll",     paid: false },
  { id: "EXP-004", category: "Utilities",     description: "Electricity bill - Sep",    amount: 6200,  date: "2026-09-08", vendor: "WAPDA",             paid: true },
  { id: "EXP-005", category: "Feed & Fodder", description: "Concentrates - 200 kg",    amount: 9600,  date: "2026-09-07", vendor: "Punjab Feed Store",  paid: false },
  { id: "EXP-006", category: "Equipment",     description: "Milk pump repair",          amount: 3500,  date: "2026-09-06", vendor: "Sohail Mechanics",  paid: true },
];

const catStyle = {
  "Feed & Fodder": "bg-emerald-100 text-emerald-700",
  "Veterinary":    "bg-blue-100 text-blue-700",
  "Labor":         "bg-purple-100 text-purple-700",
  "Utilities":     "bg-amber-100 text-amber-700",
  "Equipment":     "bg-red-100 text-red-700",
};

const fmt = n => "Rs. " + n.toLocaleString();

export default function FarmExpenses() {
  const [search, setSearch] = useState("");
  const filtered = expenses.filter(e => e.category.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()));
  const paid    = expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-0.5">Farm Expenses</h3>
          <p className="text-sm text-slate-500">
            Paid: <strong className="text-emerald-600">{fmt(paid)}</strong>
            &nbsp;|&nbsp;
            Pending: <strong className="text-red-600">{fmt(pending)}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 h-[34px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search category..." value={search} onChange={e => setSearch(e.target.value)} className="border-none outline-none bg-transparent text-[13px] text-slate-700 w-[160px]" />
          </div>
          <button className="flex items-center gap-1.5 px-4 h-[34px] rounded-full text-white text-[13px] font-semibold" style={{ background: "#4f39f6" }}>
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Expense ID", "Category", "Description", "Vendor", "Amount", "Date", "Status"].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800">
                    <Receipt className="w-3 h-3" style={{ color: "#4f39f6" }} />{e.id}
                  </span>
                </td>
                <td className="px-3.5 py-2.5">
                  <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold " + (catStyle[e.category] || "bg-slate-100 text-slate-600")}>
                    {e.category}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-slate-700">{e.description}</td>
                <td className="px-3.5 py-2.5 text-slate-500">{e.vendor}</td>
                <td className="px-3.5 py-2.5 font-bold text-slate-900">{fmt(e.amount)}</td>
                <td className="px-3.5 py-2.5 text-slate-600">{e.date}</td>
                <td className="px-3.5 py-2.5">
                  <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold " + (e.paid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {e.paid ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
