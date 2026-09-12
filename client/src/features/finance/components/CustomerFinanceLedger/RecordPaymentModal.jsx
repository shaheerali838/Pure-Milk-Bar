import { useState, useEffect } from 'react';
import { X, DollarSign, CheckCircle2, ArrowRight, Wallet } from 'lucide-react';
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

  const outstanding = Math.max(0, Number(customer?.khataBalance || 0));

  const [paymentType, setPaymentType] = useState('partial'); // 'partial' | 'half' | 'full'
  const [formData, setFormData] = useState({
    amount: '',
    method: 'Cash',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    description: 'Partial Payment Received',
    notes: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      setPaymentSuccess(false);
      if (outstanding > 0) {
        // Default to half payment or partial
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
  }, [isOpen, customer, outstanding]);

  if (!isOpen || !customer) return null;

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
      description: pct === 100 ? 'Full Payment Received' : pct === 50 ? 'Half Payment (50%) Received' : `Partial Payment (${pct}%) Received`,
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

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight font-display">
                Record Payment — {customer.name}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Account ID: <span className="font-mono font-semibold tabular">{custCode}</span> · Khata Due: <strong className="font-mono text-white tabular">Rs. {outstanding.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
          {paymentSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payment of PKR {enteredAmount.toLocaleString()} recorded successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Type Selection: Partial / Half (50%) / Full */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Select Payment Type:</label>
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleTypeChange('partial')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                    paymentType === 'partial'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom Partial
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('half')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                    paymentType === 'half'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Half (50%) {outstanding > 0 ? `· Rs. ${Math.round(outstanding / 2).toLocaleString()}` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('full')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                    paymentType === 'full'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full (100%) {outstanding > 0 ? `· Rs. ${outstanding.toLocaleString()}` : ''}
                </button>
              </div>

              {/* Quick Presets */}
              {outstanding > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-semibold text-slate-500">Quick Fill (PKR):</span>
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePresetPercentage(pct)}
                      className="px-2.5 py-0.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 transition cursor-pointer tabular"
                    >
                      {pct === 50 ? '50% (Half)' : pct === 100 ? '100% (Full)' : `${pct}%`} (Rs. {Math.round((outstanding * pct) / 100).toLocaleString()})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Real-Time Balance Calculator Preview */}
            {outstanding > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">Total Due</span>
                  <span className="font-bold text-slate-700 font-mono tabular">Rs. {outstanding.toLocaleString()}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                <div>
                  <span className="text-emerald-600 block text-[10px] font-semibold">Paying Now</span>
                  <span className="font-black text-emerald-700 font-mono tabular">Rs. {enteredAmount.toLocaleString()}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold">Remaining Khata</span>
                  <span className={`font-black font-mono tabular ${remainingBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Rs. {remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Amount (PKR / Rs.) *</label>
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
                  placeholder={`e.g. ${outstanding > 0 ? Math.round(outstanding / 2) : 500}`}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold bg-white focus-visible:border-emerald-500 focus-visible:ring-0 font-mono tabular"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method *</label>
                <Select
                  value={formData.method}
                  onValueChange={(val) => setFormData({ ...formData, method: val })}
                >
                  <SelectTrigger className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Date *</label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white focus-visible:border-emerald-500 focus-visible:ring-0"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Trx / Ref ID (Optional)</label>
                <Input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="e.g. EP-998812"
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white focus-visible:border-emerald-500 focus-visible:ring-0"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Half Payment Received"
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white focus-visible:border-emerald-500 focus-visible:ring-0"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks &amp; Notes (Optional)</label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Remaining balance will be cleared next week"
                  className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs bg-white focus-visible:border-emerald-500 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="px-4 py-2 h-9 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="px-5 py-2 h-9 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-lg font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Record Payment (PKR {enteredAmount > 0 ? enteredAmount.toLocaleString() : '0'})
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

