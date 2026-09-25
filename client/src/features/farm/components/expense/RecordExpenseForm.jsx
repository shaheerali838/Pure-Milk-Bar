import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Receipt } from 'lucide-react';
import { useExpense } from '../../../../context/ExpenseContext';
import { useAnimalContext } from '../../../../context/AnimalContext';

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
  const { animals = [] } = useAnimalContext();

  const editingRecord = expenseId ? expenses.find(e => e.id === expenseId) : null;

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    receiptRef: '',
    authorizedBy: '',
    animalName: ''
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
        authorizedBy: editingRecord.authorizedBy || '',
        animalName: editingRecord.animalName || ''
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
          <form id="record-expense-form" onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Expense Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                >
                  <option value="" disabled>Select a category</option>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Amount (PKR) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">Rs.</span>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full h-[40px] pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs tabular-nums"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Date *</label>
                <input
                  type="date"
                  required
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Description *</label>
                <input
                  type="text"
                  placeholder="Enter details"
                  required
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit / Khata">Credit / Khata</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Animal Name / Tag <span className="text-slate-400 font-medium lowercase">(optional)</span></label>
                <select
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
                  value={formData.animalName}
                  onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
                >
                  <option value="">Select an Animal (Optional)</option>
                  {animals.map(animal => (
                    <option key={animal.id} value={animal.tag}>
                      {animal.tag} {animal.name && animal.name !== animal.tag ? `- ${animal.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Receipt / Voucher Ref # <span className="text-slate-400 font-medium lowercase">(optional)</span></label>
                <input
                  type="text"
                  placeholder="Optional reference"
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs"
                  value={formData.receiptRef}
                  onChange={(e) => setFormData({ ...formData, receiptRef: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">Authorized / Recorded By <span className="text-slate-400 font-medium lowercase">(optional)</span></label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full h-[40px] px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs"
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
