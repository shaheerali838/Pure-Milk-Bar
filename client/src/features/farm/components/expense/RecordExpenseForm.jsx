import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Receipt } from 'lucide-react';
import { useExpense } from '../../../../context/ExpenseContext';

const EXPENSE_CATEGORIES = [
  "Feed & Fodder (Silage, Wanda, Vanda)",
  "Seed, Fertilizer & Crop Inputs",
  "Veterinary, Medicine & AI Services",
  "Fuel & Transportation",
  "Machinery Maintenance & Repairs",
  "Electricity & Utilities",
  "Salaries, Wages & Labour",
  "Kitchen, Mess & Staff Meals",
  "Shed Maintenance & Cleaning",
  "Dairy/Milking Supplies & Chemicals",
  "Hardware & Tools",
  "Livestock Purchase",
  "Other / Miscellaneous"
];

export default function RecordExpenseForm({ expenseId, onClose }) {
  const { addExpense, editExpense, expenses } = useExpense();

  const editingRecord = expenseId ? expenses.find(e => e.id === expenseId) : null;

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    receiptRef: '',
    authorizedBy: ''
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        category: editingRecord.category || '',
        description: editingRecord.description || '',
        amount: editingRecord.amount || '',
        date: editingRecord.date || new Date().toISOString().split('T')[0],
        paymentMethod: editingRecord.paymentMethod || 'Cash',
        receiptRef: editingRecord.receiptRef || '',
        authorizedBy: editingRecord.authorizedBy || ''
      });
    }
  }, [editingRecord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      editExpense(editingRecord.id, formData);
    } else {
      addExpense(formData);
    }
    if (onClose) onClose();
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 animate-in fade-in duration-200">
      <div className="bg-white flex flex-col h-full">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {editingRecord ? 'Edit Farm Expense' : 'Record Farm Expense'}
            </h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
          <form id="record-expense-form" onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Expense Category <span className="text-rose-500">*</span></label>
                <div className="relative z-[100]">
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })} required>
                    <SelectTrigger className="h-11 bg-white border-slate-300 focus:ring-emerald-500 rounded-xl text-slate-900 font-medium">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="z-[110] border-slate-200 shadow-lg bg-white">
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 py-2.5 text-slate-900 font-medium">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Amount (PKR) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                  <Input
                    type="number"
                    required
                    min="1"
                    className="h-11 pl-12 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-lg font-bold text-slate-900"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Date <span className="text-rose-500">*</span></label>
                <Input
                  type="date"
                  required
                  className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-slate-900 font-medium"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Description <span className="text-rose-500">*</span></label>
                <Input
                  placeholder="E.g., Bought 20 bags of wanda..."
                  required
                  className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-slate-900 font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Payment Method</label>
                <div className="relative z-[50]">
                  <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}>
                    <SelectTrigger className="h-11 bg-white border-slate-300 focus:ring-emerald-500 rounded-xl text-slate-900 font-medium">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="z-[60] border-slate-200 shadow-lg bg-white">
                      <SelectItem value="Cash" className="text-slate-900 font-medium">Cash</SelectItem>
                      <SelectItem value="Bank Transfer" className="text-slate-900 font-medium">Bank Transfer</SelectItem>
                      <SelectItem value="Credit / Khata" className="text-slate-900 font-medium">Credit / Khata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Receipt / Voucher Ref # <span className="text-slate-400 font-medium lowercase">(optional)</span></label>
                <Input
                  placeholder="Optional reference"
                  className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-slate-900 font-medium"
                  value={formData.receiptRef}
                  onChange={(e) => setFormData({ ...formData, receiptRef: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Authorized / Recorded By <span className="text-slate-400 font-medium lowercase">(optional)</span></label>
                <Input
                  placeholder="e.g. Allah Ditta"
                  className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-slate-900 font-medium"
                  value={formData.authorizedBy}
                  onChange={(e) => setFormData({ ...formData, authorizedBy: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" form="record-expense-form" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer">
            {editingRecord ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </div>
    </div>
  );
}
