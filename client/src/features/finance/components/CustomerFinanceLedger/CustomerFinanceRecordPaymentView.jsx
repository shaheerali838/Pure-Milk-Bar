import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';
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
import { Card } from '@/components/ui/card';

export default function CustomerFinanceRecordPaymentView({ customer, onBack }) {
  const { addLedgerEntry } = useLedgerContext();

  const outstanding = Math.max(0, Number(customer?.khataBalance || 0));

  const [paymentType, setPaymentType] = useState('half'); // 'partial' | 'half' | 'full'
  const [formData, setFormData] = useState({
    amount: '',
    method: 'Cash',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    description: 'Half Payment (50%) Received',
    notes: '',
  });

  useEffect(() => {
    if (customer) {
      if (outstanding > 0) {
        setPaymentType('half');
        setFormData({
          amount: String(Math.round(outstanding / 2)),
          method: 'Cash',
          reference: '',
          date: new Date().toISOString().split('T')[0],
          description: 'Half Payment (50%) Received',
          notes: '',
        });
      } else {
        setPaymentType('partial');
        setFormData({
          amount: '',
          method: 'Cash',
          reference: '',
          date: new Date().toISOString().split('T')[0],
          description: 'Advance / Khata Payment Received',
          notes: '',
        });
      }
    }
  }, [customer, outstanding]);

  if (!customer) return null;

  const enteredAmount = Number(formData.amount) || 0;
  const remainingBalance = Math.max(0, outstanding - enteredAmount);
  const custCode = `CUST-${String(customer.id).slice(-4)}`;

  const handleTypeChange = (type) => {
    setPaymentType(type);
    if (type === 'full') {
      setFormData((prev) => ({
        ...prev,
        amount: outstanding > 0 ? String(outstanding) : prev.amount,
        description: 'Full Payment Received',
      }));
    } else if (type === 'half') {
      const halfAmt = Math.round(outstanding / 2);
      setFormData((prev) => ({
        ...prev,
        amount: String(halfAmt),
        description: 'Half Payment (50%) Received',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        description: 'Partial Payment Received',
      }));
    }
  };

  const handlePresetPercentage = (pct) => {
    if (outstanding <= 0) return;
    const calcAmount = Math.round((outstanding * pct) / 100);
    setFormData((prev) => ({
      ...prev,
      amount: String(calcAmount),
      description:
        pct === 100
          ? 'Full Payment Received'
          : pct === 50
          ? 'Half Payment (50%) Received'
          : `Partial Payment (${pct}%) Received`,
    }));
    if (pct === 100) setPaymentType('full');
    else if (pct === 50) setPaymentType('half');
    else setPaymentType('partial');
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
            <Wallet className="w-4.5 h-4.5 text-emerald-600" />
            Record Payment Inflow &bull; {customer.name}
          </h1>
          <p className="text-xs text-slate-500">
            Account ID: <span className="font-mono font-semibold tabular">{custCode}</span> &bull; Total Khata Due:{' '}
            <strong className="font-mono text-slate-800 tabular">Rs. {outstanding.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700">Payment Type:</label>
              {outstanding > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Fill:</span>
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePresetPercentage(pct)}
                      className="px-2.5 py-0.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer tabular"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 gap-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleTypeChange('partial')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                  paymentType === 'partial'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom Partial
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('half')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                  paymentType === 'half'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Half (50%) {outstanding > 0 ? `· Rs. ${Math.round(outstanding / 2).toLocaleString()}` : ''}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('full')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                  paymentType === 'full'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full (100%) {outstanding > 0 ? `· Rs. ${outstanding.toLocaleString()}` : ''}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Payment Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  const val = Number(e.target.value);
                  if (val === Math.round(outstanding / 2) && outstanding > 0) setPaymentType('half');
                  else if (val === outstanding && outstanding > 0) setPaymentType('full');
                  else setPaymentType('partial');
                }}
                placeholder="e.g. 5000"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-bold tabular"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.method}
                onValueChange={(val) => setFormData({ ...formData, method: val })}
              >
                <SelectTrigger className="h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash" className="text-xs">Cash (PKR)</SelectItem>
                  <SelectItem value="Online Payment" className="text-xs">Online Payment (EasyPaisa / JazzCash)</SelectItem>
                  <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer (1Link / Raast)</SelectItem>
                  <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white cursor-pointer font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Trx / Ref ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="e.g. EP-998812"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Description / Memo
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Half Payment Received"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                Remarks &amp; Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Remaining balance will be cleared next week"
                className="h-8.5 px-2.5 py-1 text-xs bg-slate-50/50 border-slate-200 rounded-lg focus-visible:bg-white"
              />
            </div>
          </div>

          {outstanding > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Due</span>
                <span className="font-bold text-slate-800 font-mono tabular text-sm">Rs. {outstanding.toLocaleString()}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div>
                <span className="text-emerald-600 block text-[10px] font-bold uppercase">Paying Now</span>
                <span className="font-bold text-emerald-700 font-mono tabular text-sm">Rs. {enteredAmount.toLocaleString()}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Remaining Khata</span>
                <span className={`font-bold font-mono tabular text-sm ${remainingBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Rs. {remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>
          )}

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
              className="px-6 py-1.5 h-8 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Record Payment (PKR {enteredAmount > 0 ? enteredAmount.toLocaleString() : '0'})
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
