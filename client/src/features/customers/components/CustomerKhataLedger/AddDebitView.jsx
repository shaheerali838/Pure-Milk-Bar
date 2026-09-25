import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function AddDebitView({ customer, onBack }) {
  const { addLedgerEntry } = useLedgerContext();
  const [formData, setFormData] = useState({
    description: 'Milk Delivery - Daily',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  if (!customer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    await addLedgerEntry(customer._id || customer.id, {
      description: formData.description || 'Manual Charge',
      debit: Number(formData.amount),
      credit: 0,
      date: formData.date,
      method: 'Manual Debit',
      paymentMethod: 'Khata Credit',
      notes: formData.notes,
      orderTotal: Number(formData.amount),
      paidAmount: 0,
      remainingAmount: Number(formData.amount),
      fulfillmentType: 'Manual Khata Debit',
    });

    onBack();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <PlusCircle className="w-4.5 h-4.5 text-rose-600" />
            Add Manual Debit Charge &bull; {customer.name}
          </h1>
          <p className="text-xs text-slate-500">
            Record a custom manual charge or missed delivery to customer's Khata
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Description / Reason <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter value"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white cursor-pointer font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Debit Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter value"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-bold tabular"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Notes / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter value"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="px-4 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-6 py-1.5 h-8 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm &amp; Add Debit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
