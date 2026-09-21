import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddDebitModal({ customer, isOpen, onClose }) {
  const { addLedgerEntry } = useLedgerContext();
  const [formData, setFormData] = useState({
    description: 'Milk Delivery - Daily',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  if (!isOpen || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    addLedgerEntry(customer.id, {
      description: formData.description || 'Manual Charge',
      debit: Number(formData.amount),
      credit: 0,
      date: formData.date,
      method: 'Manual Debit',
      notes: formData.notes,
    });

    setFormData({
      description: 'Milk Delivery - Daily',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 font-display">Add Manual Debit Charge</h3>
              <p className="text-[10px] text-slate-400">Charge {customer.name}'s Khata</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <Input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter value"
              className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg focus-visible:border-rose-500 focus-visible:ring-0 text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (Rs.) *</label>
              <Input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter value"
                className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg focus-visible:border-rose-500 focus-visible:ring-0 text-slate-800 font-bold tabular"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg focus-visible:border-rose-500 focus-visible:ring-0 text-slate-800 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional remarks..."
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 text-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-3 py-1 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer text-xs border-0 shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-4 py-1 h-7 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition shadow-xs cursor-pointer text-xs"
            >
              Add Debit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

