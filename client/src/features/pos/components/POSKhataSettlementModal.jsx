import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  User,
  CheckCircle2,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function POSKhataSettlementModal() {
  const {
    khataSettlementModal,
    closeKhataSettlement,
    executeKhataPayment,
    registeredCustomers,
  } = usePOSContext();

  const [selectedCustId, setSelectedCustId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const targetCustomer =
    registeredCustomers.find((c) => String(c.id) === String(selectedCustId)) ||
    khataSettlementModal.customer ||
    null;

  useEffect(() => {
    if (khataSettlementModal.isOpen) {
      setSuccessMessage(null);
      if (khataSettlementModal.customer) {
        setSelectedCustId(String(khataSettlementModal.customer.id));
        setPayAmount(String(khataSettlementModal.customer.khataBalance || ''));
      } else if (registeredCustomers.length > 0) {
        setSelectedCustId(String(registeredCustomers[0].id));
        setPayAmount(String(registeredCustomers[0].khataBalance || ''));
      }
    }
  }, [khataSettlementModal.isOpen, khataSettlementModal.customer, registeredCustomers]);

  if (!khataSettlementModal.isOpen) return null;

  const outstandingKhata = Math.max(0, Number(targetCustomer?.khataBalance || 0));

  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustId(custId);
    const cust = registeredCustomers.find((c) => String(c.id) === String(custId));
    if (cust) {
      setPayAmount(String(cust.khataBalance || ''));
    }
  };

  const handleSettleFull = () => {
    setPayAmount(String(outstandingKhata));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetCustomer) return;

    const amt = Number(payAmount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid amount greater than Rs. 0');
      return;
    }

    const success = executeKhataPayment({
      customerId: targetCustomer.id,
      amountPaid: amt,
      paymentMethod: payMethod,
      notes: notes || `Counter Khata Clearance for ${targetCustomer.name}`,
    });

    if (success) {
      setSuccessMessage({
        customerName: targetCustomer.name,
        amount: amt,
        method: payMethod,
        remaining: Math.max(0, outstandingKhata - amt),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">
                Pay Khata Money &amp; Settle Udhaar
              </h2>
              <p className="text-xs text-slate-500">
                Receive customer khata payment &amp; clear outstanding debt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeKhataSettlement}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Khata Payment Successfully Recorded!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Rs. {successMessage.amount.toLocaleString()} received via {successMessage.method} for{' '}
                <strong>{successMessage.customerName}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 max-w-xs mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600 tabular">
                  Rs. {successMessage.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-slate-800 tabular">
                  Rs. {successMessage.remaining.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">
                  {successMessage.remaining === 0 ? 'Fully Cleared / Zero Debt' : 'Partially Settled'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={closeKhataSettlement}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Done &amp; Return to POS
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Select Customer
              </label>
              <select
                value={selectedCustId}
                onChange={handleCustomerChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
              >
                {registeredCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.phone} (Khata Due: Rs. {(c.khataBalance || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {targetCustomer && (
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold">{targetCustomer.name}</span>
                    <span className="text-[10px] text-slate-400">({targetCustomer.area || 'Model Town'})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{targetCustomer.phone}</span>
                </div>

                <div className="flex justify-between items-baseline pt-1 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">TOTAL OUTSTANDING KHATA DUE</span>
                  <span className="text-xl font-black text-amber-400 tabular">
                    Rs. {outstandingKhata.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Amount Received / Settle (Rs.) *
                </label>
                {outstandingKhata > 0 && (
                  <button
                    type="button"
                    onClick={handleSettleFull}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Pay Full Balance (Rs. {outstandingKhata.toLocaleString()})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount to pay..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'Online Payment', 'Bank Transfer'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      payMethod === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Remarks / Receipt Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter details"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={closeKhataSettlement}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Payment &amp; Update Khata
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
