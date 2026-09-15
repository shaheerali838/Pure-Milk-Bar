import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calculator, ArrowRight } from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RecordPaymentModal({ customer, isOpen, onClose }) {
  const { addLedgerEntry } = useLedgerContext();

  const totalDue = Math.max(0, Number(customer?.khataBalance || 0));

  const [paymentType, setPaymentType] = useState('partial'); // 'partial' | 'full'
  const [formData, setFormData] = useState({
    description: 'Partial Payment Received',
    amount: '',
    method: 'Cash',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (isOpen && customer) {
      if (paymentType === 'full' && totalDue > 0) {
        setFormData((prev) => ({
          ...prev,
          amount: String(totalDue),
          description: 'Full Payment Received',
        }));
      } else if (paymentType === 'partial') {
        setFormData((prev) => ({
          ...prev,
          description: 'Partial Payment Received',
        }));
      }
    }
  }, [isOpen, customer, paymentType, totalDue]);

  if (!isOpen || !customer) return null;

  const enteredAmount = Number(formData.amount) || 0;
  const remainingBalance = Math.max(0, totalDue - enteredAmount);
  const isOverpaying = enteredAmount > totalDue && totalDue > 0;

  const handleTypeChange = (type) => {
    setPaymentType(type);
    if (type === 'full') {
      setFormData((prev) => ({
        ...prev,
        amount: totalDue > 0 ? String(totalDue) : prev.amount,
        description: 'Full Payment Received',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        description: 'Partial Payment Received',
      }));
    }
  };

  const handlePresetPercentage = (pct) => {
    if (totalDue <= 0) return;
    const calcAmount = Math.round((totalDue * pct) / 100);
    setFormData((prev) => ({
      ...prev,
      amount: String(calcAmount),
      description: pct === 100 ? 'Full Payment Received' : `Partial Payment (${pct}%) Received`,
    }));
    setPaymentType(pct === 100 ? 'full' : 'partial');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    const desc = formData.reference
      ? `${formData.description} - ${formData.method} (${formData.reference})`
      : `${formData.description} - ${formData.method}`;

    addLedgerEntry(customer.id, {
      description: desc,
      debit: 0,
      credit: Number(formData.amount),
      date: formData.date,
      method: formData.method,
      notes: formData.notes,
      paymentType: paymentType,
    });

    setFormData({
      description: 'Partial Payment Received',
      amount: '',
      method: 'Cash',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPaymentType('partial');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-2">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 font-display">Record Payment</h3>
              <p className="text-[10px] text-slate-400 leading-tight">
                {customer.name} • Due: <span className="font-bold text-slate-700 tabular">Rs. {totalDue.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-2.5 text-xs">
          {/* Payment Type Selection (Partial vs Full) */}
          <div>
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => handleTypeChange('partial')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md transition cursor-pointer text-center ${
                  paymentType === 'partial'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Partial Payment
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('full')}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md transition cursor-pointer text-center ${
                  paymentType === 'full'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Payment {totalDue > 0 ? `(Rs. ${totalDue.toLocaleString()})` : ''}
              </button>
            </div>

            {/* Quick Percentage Presets for Partial Payment */}
            {totalDue > 0 && paymentType === 'partial' && (
              <div className="flex items-center gap-1 mt-1.5 justify-between">
                <span className="text-[10px] font-medium text-slate-400">Quick:</span>
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePresetPercentage(pct)}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border border-slate-200 rounded text-[10px] font-semibold text-slate-600 transition cursor-pointer tabular"
                  >
                    {pct}% (Rs. {Math.round((totalDue * pct) / 100).toLocaleString()})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount and Payment Mode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Amount (Rs.) *</label>
              <Input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  if (paymentType === 'full' && Number(e.target.value) !== totalDue) {
                    setPaymentType('partial');
                  }
                }}
                placeholder={totalDue > 0 ? `e.g. ${Math.min(1000, totalDue)}` : 'e.g. 500'}
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md focus-visible:border-emerald-500 focus-visible:ring-0 text-slate-800 font-bold text-xs tabular"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Payment Mode *</label>
              <Select
                value={formData.method}
                onValueChange={(val) => setFormData({ ...formData, method: val })}
              >
                <SelectTrigger className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-emerald-500 text-slate-800 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                  <SelectItem value="Online Payment" className="text-xs">Online Payment</SelectItem>
                  <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Real-Time Balance Calculator Preview */}
          {totalDue > 0 && (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Total Due</span>
                <span className="font-bold text-slate-700 tabular">Rs. {totalDue.toLocaleString()}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <div>
                <span className="text-emerald-600 block font-medium">Paying Now</span>
                <span className="font-bold text-emerald-700 tabular">Rs. {enteredAmount.toLocaleString()}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <div>
                <span className="text-slate-400 block">Remaining</span>
                <span className={`font-bold tabular ${remainingBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Rs. {remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Date and Ref / Trx ID */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Date *</label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md focus-visible:border-emerald-500 focus-visible:ring-0 text-slate-800 cursor-pointer text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">
                Ref / Trx ID <span className="text-slate-400 font-normal">(Opt)</span>
              </label>
              <Input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="e.g. TXN-881"
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md focus-visible:border-emerald-500 focus-visible:ring-0 text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Description</label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Partial Payment Received"
              className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md focus-visible:border-emerald-500 focus-visible:ring-0 text-slate-800 text-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-0.5 text-[11px]">Notes (Optional)</label>
            <textarea
              rows={1}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional remarks..."
              className="w-full px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 text-slate-800 text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-2.5 py-1 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition cursor-pointer text-xs border-0 shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-3.5 py-1 h-7 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-md font-bold transition shadow-xs cursor-pointer text-xs"
            >
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

