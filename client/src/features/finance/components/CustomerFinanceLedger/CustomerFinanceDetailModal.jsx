import { useState, useEffect } from 'react';
import { X, Phone, MapPin, CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';

export default function CustomerFinanceDetailModal({ customer, isOpen, onClose, onEdit }) {
  const { getLedgerForCustomer, addLedgerEntry } = useLedgerContext();
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'payment' | 'profile'

  const outstanding = Math.max(0, Number(customer?.khataBalance || 0));

  // Payment type selection inside modal
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
      if (paymentType === 'full' && outstanding > 0) {
        setFormData((prev) => ({
          ...prev,
          amount: String(outstanding),
          description: 'Full Payment Received',
        }));
      } else if (paymentType === 'half' && outstanding > 0) {
        const halfAmt = Math.round(outstanding / 2);
        setFormData((prev) => ({
          ...prev,
          amount: String(halfAmt),
          description: 'Half Payment (50%) Received',
        }));
      } else if (paymentType === 'partial') {
        setFormData((prev) => ({
          ...prev,
          description: 'Partial Payment Received',
        }));
      }
    }
  }, [isOpen, customer, paymentType, outstanding]);

  if (!isOpen || !customer) return null;

  const entries = getLedgerForCustomer(customer.id) || [];
  const totalPaid = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
  const custCode = `CUST-${String(customer.id).slice(-4)}`;

  const lastTxn = entries.length > 0 ? entries[entries.length - 1] : null;
  const lastTxnDate = lastTxn ? lastTxn.date : (customer.createdAt || new Date().toISOString().split('T')[0]);

  const enteredAmount = Number(formData.amount) || 0;
  const remainingBalance = Math.max(0, outstanding - enteredAmount);

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

  const handleRecordPaymentSubmit = (e) => {
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
      setFormData({
        amount: '',
        method: 'Cash',
        reference: '',
        date: new Date().toISOString().split('T')[0],
        description: 'Partial Payment Received',
        notes: '',
      });
      setPaymentType('partial');
      setActiveTab('transactions');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Customer Financial Ledger — {customer.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Account ID: <span className="font-mono">{custCode}</span> · Area: {customer.area || 'Model Town'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
          {/* 1. Dark Hero Card */}
          <div className="bg-[#0b1b1a] p-4 sm:p-5 rounded-2xl text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0d3b36] text-[#2dd4bf] font-extrabold flex items-center justify-center text-xl shrink-0 border border-[#134e48]">
                {initial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white leading-tight">{customer.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#134e48] text-emerald-300 border border-[#0d3b36]">
                    {customer.status || 'Active'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {customer.phone}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {customer.address || `Street 4, House 18, ${customer.area || 'Model Town'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Khata Balance Due */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                KHATA BALANCE DUE (PKR)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#ff6b81] tracking-tight mt-0.5 font-mono">
                Rs. {outstanding.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 2. 3 Stat Boxes Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Paid */}
            <div className="bg-[#f0fdf4] border border-emerald-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                TOTAL PAID TO DATE (PKR)
              </span>
              <div className="text-lg font-black text-emerald-950 mt-1 font-mono">
                Rs. {totalPaid.toLocaleString()}
              </div>
            </div>

            {/* Outstanding Credit */}
            <div className="bg-[#fff1f2] border border-rose-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                OUTSTANDING CREDIT (PKR)
              </span>
              <div className="text-lg font-black text-rose-900 mt-1 font-mono">
                Rs. {outstanding.toLocaleString()}
              </div>
            </div>

            {/* Last Transaction Date */}
            <div className="bg-[#f5f3ff] border border-indigo-100 p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                LAST TRANSACTION DATE
              </span>
              <div className="text-lg font-black text-indigo-950 mt-1 font-mono">
                {lastTxnDate}
              </div>
            </div>
          </div>

          {/* 3. Internal Pill Tabs Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-full border border-slate-200/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transaction History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === 'payment'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Record Payment (Half / Partial / Full)
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(customer);
              }}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          {/* 4. Tab Contents */}
          {activeTab === 'transactions' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">DATE &amp; REF</th>
                      <th className="px-3.5 py-2.5">TYPE</th>
                      <th className="px-3.5 py-2.5 text-right">TOTAL DUE</th>
                      <th className="px-3.5 py-2.5 text-right">AMOUNT PAID</th>
                      <th className="px-3.5 py-2.5 text-right">REMAINING</th>
                      <th className="px-3.5 py-2.5 text-center">STATUS</th>
                      <th className="px-3.5 py-2.5">METHOD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3.5 py-8 text-center text-slate-400">
                          No transaction records found for this customer.
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, idx) => {
                        const refCode = entry.ref || (entry.id ? `TXN-${String(entry.id).slice(-4)}` : `TXN-${1000 + idx}`);
                        const credit = Number(entry.credit) || 0;
                        const debit = Number(entry.debit) || 0;
                        const runningBal = Number(entry.runningBalance) || 0;
                        const totalDueBefore = runningBal + credit;

                        let typeLabel = 'Custom Amount';
                        if (entry.type === 'OPENING') typeLabel = 'Opening Balance';
                        else if (credit > 0 && runningBal === 0) typeLabel = 'Full Payment';
                        else if (credit > 0 && totalDueBefore > 0 && Math.abs(credit - Math.round(totalDueBefore / 2)) < 5) typeLabel = 'Half Payment (50%)';
                        else if (credit > 0) typeLabel = 'Partial Payment';
                        else if (debit > 0) typeLabel = 'Debit Charge';

                        const isPaid = credit > 0 && runningBal === 0;
                        const isPartial = credit > 0 && runningBal > 0;

                        return (
                          <tr key={entry.id || idx} className="hover:bg-slate-50/70 transition-colors">
                            {/* Date & Ref */}
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <div className="font-mono text-slate-800 font-semibold text-[11px]">{entry.date}</div>
                              <div className="text-[10px] font-mono text-blue-600 font-bold">{refCode}</div>
                            </td>

                            {/* Type Badge */}
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                                {typeLabel}
                              </span>
                            </td>

                            {/* Total Due */}
                            <td className="px-3.5 py-2.5 text-right font-medium text-slate-800 whitespace-nowrap">
                              Rs. {totalDueBefore > 0 ? totalDueBefore.toLocaleString() : (debit > 0 ? debit.toLocaleString() : '—')}
                            </td>

                            {/* Amount Paid */}
                            <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                              {credit > 0 ? `Rs. ${credit.toLocaleString()}` : '—'}
                            </td>

                            {/* Remaining */}
                            <td className="px-3.5 py-2.5 text-right font-bold text-[#ff4d6d] whitespace-nowrap">
                              Rs. {runningBal.toLocaleString()}
                            </td>

                            {/* Status */}
                            <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isPaid
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isPartial
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}
                              >
                                {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending'}
                              </span>
                            </td>

                            {/* Method */}
                            <td className="px-3.5 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                              {entry.method || 'Cash'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <form onSubmit={handleRecordPaymentSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Record Khata Payment (PKR)
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  Total Due: <strong className="text-rose-600">Rs. {outstanding.toLocaleString()}</strong>
                </span>
              </div>

              {paymentSuccess && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payment in PKR recorded successfully! Updating ledger balance...
                </div>
              )}

              {/* Payment Type Selection: Partial / Half (50%) / Full */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Payment Option:</label>
                <div className="flex rounded-lg bg-slate-200/80 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('partial')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer text-center ${
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                      paymentType === 'half'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Half Payment (50%) {outstanding > 0 ? `(Rs. ${Math.round(outstanding / 2).toLocaleString()})` : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('full')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                      paymentType === 'full'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full Settlement (100%) {outstanding > 0 ? `(Rs. ${outstanding.toLocaleString()})` : ''}
                  </button>
                </div>

                {/* Quick Presets */}
                {outstanding > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-slate-500">Quick Fill (PKR):</span>
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePresetPercentage(pct)}
                        className="px-2.5 py-0.5 bg-white hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 border border-slate-300 rounded text-[10px] font-bold text-slate-700 transition cursor-pointer"
                      >
                        {pct === 50 ? '50% (Half)' : pct === 100 ? '100% (Full)' : `${pct}%`} (Rs. {Math.round((outstanding * pct) / 100).toLocaleString()})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-Time Balance Calculator Preview */}
              {outstanding > 0 && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Total Due (PKR)</span>
                    <span className="font-bold text-slate-700">Rs. {outstanding.toLocaleString()}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <div>
                    <span className="text-emerald-600 block text-[10px] font-semibold">Paying Now (PKR)</span>
                    <span className="font-black text-emerald-700">Rs. {enteredAmount.toLocaleString()}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Remaining Khata Balance</span>
                    <span className={`font-black ${remainingBalance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Rs. {remainingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Amount (PKR / Rs.) *</label>
                  <input
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
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Cash">Cash (PKR)</option>
                    <option value="Online Payment">Online Payment (EasyPaisa / JazzCash)</option>
                    <option value="Bank Transfer">Bank Transfer (1Link / Raast)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trx / Ref ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="e.g. EP-998812"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Half Payment Received"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Remarks &amp; Notes (Optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Remaining balance will be cleared next week"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a86b] hover:bg-[#00925d] text-white rounded-lg font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Record Payment (PKR {enteredAmount > 0 ? enteredAmount.toLocaleString() : '0'})
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/70 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold transition text-xs cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
