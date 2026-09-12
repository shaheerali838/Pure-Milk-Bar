import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useExpense } from '../components/expense/ExpenseContext';

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

export default function RecordFarmExpensePage() {
  const { addExpense, editExpense, expenses } = useExpense();
  const navigate = useNavigate();
  const { id } = useParams();

  const editingRecord = id ? expenses.find(e => e.id === id) : null;

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
    navigate('/farm/expenses');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/farm/expenses')} className="mr-2 h-8 w-8 p-0 rounded-full hover:bg-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {editingRecord ? 'Edit Farm Expense' : 'Record Farm Expense'}
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Expense Category <span className="text-rose-500">*</span></label>
                <div className="relative z-[100]">
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})} required>
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
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Description <span className="text-rose-500">*</span></label>
                <Input 
                  placeholder="E.g., Bought 20 bags of wanda..."
                  required
                  className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-slate-900 font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Payment Method</label>
                <div className="relative z-[50]">
                  <Select value={formData.paymentMethod} onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
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
                  onChange={(e) => setFormData({...formData, receiptRef: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Authorized / Recorded By <span className="text-slate-400 font-medium lowercase">(optional)</span></label>
                <Input 
                  placeholder="e.g. Allah Ditta"
                  className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-500 rounded-xl text-slate-900 font-medium"
                  value={formData.authorizedBy}
                  onChange={(e) => setFormData({...formData, authorizedBy: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => navigate('/farm/expenses')} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100 h-11 px-6 rounded-xl font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#007a5e] hover:bg-[#00634c] text-white font-bold shadow-sm transition-all active:scale-95 h-11 px-8 rounded-xl">
                {editingRecord ? 'Update Expense' : 'Save Expense'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
