import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit, Building2, Phone, MapPin, Tag, Banknote, Wallet, Clock, Droplets, Calendar, CreditCard, CheckCircle2, AlertCircle, FileText, Sun, Moon, Coins, ChevronRight, Filter, Landmark, Smartphone, Receipt, ArrowDownRight, Check, Copy, PlusCircle, BadgeCheck } from 'lucide-react';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import IntakeDetail from '../intakeRegistor/IntakeDetail';
import { toast } from 'sonner';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const normalizeDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) return dateVal.slice(0, 10);
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal).slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', desc: 'Direct cash in hand', icon: Coins, color: 'emerald' },
  { id: 'Bank Transfer', label: 'Bank Transfer', desc: 'Direct to bank account', icon: Landmark, color: 'blue' },
  { id: 'JazzCash / EasyPaisa', label: 'JazzCash / EasyPaisa', desc: 'Mobile wallet transfer', icon: Smartphone, color: 'purple' },
  { id: 'Cheque', label: 'Cheque / Other', desc: 'Cheque clearance / voucher', icon: CreditCard, color: 'amber' },
];

export default function SupplierDetail({ supplier: propSupplier, onBack, onEdit }) {
  const { intakeLogs = [], updateBatchSettlement } = useIntakeContext();
  const { suppliers = [], settleSupplierBalance, recordSupplierPayout, directPayouts = [] } = useSupplierContext();

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [paymentTargetBatch, setPaymentTargetBatch] = useState(null);

  // Payment process state
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [accountNumber, setAccountNumber] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayDateStr());
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Table active tab & filter states
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'payouts'
  const [shiftFilter, setShiftFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'Today' | 'Custom'
  const [customDate, setCustomDate] = useState('');

  const todayStr = getTodayDateStr();

  // Ensure we use the live enriched supplier from context so balance updates instantly
  const supplier =
    suppliers.find((s) => s.id === propSupplier?.id) || propSupplier;

  if (!supplier) {
    return (
      <div className="p-8 bg-slate-50 min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 font-display">
          Supplier Record Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested supplier profile does not exist or has been removed.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-2xs"
        >
          Back to Suppliers
        </button>
      </div>
    );
  }

  // Query procurement batches logged for this supplier
  const supplierBatches = intakeLogs.filter(
    (b) =>
      b.supplierId === supplier.id ||
      (b.supplierName &&
        supplier.name &&
        b.supplierName.toLowerCase().includes(supplier.name.toLowerCase())) ||
      (supplier.name &&
        b.supplierName &&
        supplier.name.toLowerCase().includes(b.supplierName.toLowerCase()))
  );

  // Filter based on selected shift and date
  const filteredBatches = supplierBatches.filter((b) => {
    const matchesShift =
      shiftFilter === 'All'
        ? true
        : b.shift?.toLowerCase() === shiftFilter.toLowerCase();

    const bDate = normalizeDate(b.date);
    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = bDate === todayStr;
    } else if (dateFilter === 'Custom' && customDate) {
      matchesDate = bDate === customDate;
    }

    return matchesShift && matchesDate;
  });

  const morningCount = supplierBatches.filter(
    (b) => b.shift?.toLowerCase() === 'morning'
  ).length;
  const eveningCount = supplierBatches.filter(
    (b) => b.shift?.toLowerCase() === 'evening'
  ).length;

  const rate = parseFloat(supplier.ratePerLiter) || 220;

  // Use enriched supplier totals from SupplierContext for single-source-of-truth accuracy
  const totalLiters =
    supplier.totalSourced !== undefined
      ? parseFloat(supplier.totalSourced)
      : supplierBatches.reduce((sum, b) => sum + (parseFloat(b.quantity) || 0), 0);

  const totalValue =
    supplier.grossProcuredValue !== undefined
      ? parseFloat(supplier.grossProcuredValue)
      : supplierBatches.reduce(
          (sum, b) =>
            sum +
            (parseFloat(b.totalCost) ||
              (parseFloat(b.quantity) || 0) * (parseFloat(b.ratePerLiter) || rate)),
          0
        );

  const totalPayout =
    supplier.totalPayout !== undefined
      ? parseFloat(supplier.totalPayout)
      : 0;

  const balanceDue =
    supplier.balanceDue !== undefined
      ? Math.max(0, Math.round(supplier.balanceDue))
      : Math.max(0, Math.round(totalValue - totalPayout));

  // Compute all payouts & payment records for this supplier (batch settlements + direct disbursements)
  const combinedPayments = useMemo(() => {
    const batchPayments = supplierBatches
      .filter((b) => (parseFloat(b.paidAmount) || 0) > 0)
      .map((b) => {
        const cost =
          parseFloat(b.totalCost) ||
          (parseFloat(b.quantity) || 0) * (parseFloat(b.ratePerLiter) || rate);
        const paid = parseFloat(b.paidAmount) || 0;
        return {
          id: `BATCH-${b.id}`,
          type: `${b.shift || 'Milk'} Shift Settlement`,
          date: b.paidDate || b.date,
          amount: paid,
          totalCost: cost,
          quantity: b.quantity,
          method: b.paymentMethod || supplier.paymentMethod || 'Cash',
          reference: b.paymentRef || b.referenceNumber || `SLIP-${String(b.id).slice(-4)}`,
          notes: b.paymentNotes || `${b.quantity} L delivered at Rs. ${b.ratePerLiter || rate}/L`,
          status: b.settlement || 'Paid',
          isBatch: true,
          batchData: b,
        };
      });

    const directList = (directPayouts || [])
      .filter((p) => String(p.supplierId) === String(supplier.id))
      .map((p) => ({
        id: p.id,
        type: 'Direct Payout / Advance',
        date: p.date,
        amount: parseFloat(p.amount) || 0,
        totalCost: parseFloat(p.amount) || 0,
        quantity: null,
        method: p.method || 'Cash',
        reference: p.referenceNumber || p.id,
        notes: p.notes || 'Advance payment / balance settlement',
        status: 'Paid',
        isBatch: false,
      }));

    return [...batchPayments, ...directList].sort((a, b) =>
      String(b.date).localeCompare(String(a.date))
    );
  }, [supplierBatches, directPayouts, supplier.id, supplier.paymentMethod, rate]);

  // Open Settle Modal for full supplier balance or advance
  const handleOpenGeneralPayment = () => {
    setPaymentTargetBatch(null);
    setSettleAmount(balanceDue > 0 ? String(balanceDue) : '');
    // Default method to supplier's preferred or Cash
    const pref = supplier.paymentMethod || 'Cash';
    if (pref.toLowerCase().includes('bank')) setPaymentMethod('Bank Transfer');
    else if (pref.toLowerCase().includes('wallet')) setPaymentMethod('JazzCash / EasyPaisa');
    else setPaymentMethod('Cash');

    setAccountNumber(supplier.accountNumber || '');
    setPaymentRef('');
    setPaymentNotes('');
    setPaymentDate(todayStr);
    setShowSettleModal(true);
  };

  // Open Pay Modal for a specific intake slip/batch
  const handleOpenPayForBatch = (batch) => {
    setPaymentTargetBatch(batch);
    const cost =
      parseFloat(batch.totalCost) ||
      (parseFloat(batch.quantity) || 0) * (parseFloat(batch.ratePerLiter) || rate);
    const paid = parseFloat(batch.paidAmount) || 0;
    const due =
      batch.pendingAmount !== undefined
        ? parseFloat(batch.pendingAmount)
        : Math.max(0, cost - paid);

    setSettleAmount(String(due));
    const pref = supplier.paymentMethod || 'Cash';
    if (pref.toLowerCase().includes('bank')) setPaymentMethod('Bank Transfer');
    else if (pref.toLowerCase().includes('wallet')) setPaymentMethod('JazzCash / EasyPaisa');
    else setPaymentMethod('Cash');

    setAccountNumber(supplier.accountNumber || '');
    setPaymentRef('');
    setPaymentNotes(`Payment for ${batch.shift} milk collection (${batch.quantity} L)`);
    setPaymentDate(todayStr);
    setShowSettleModal(true);
  };

  // Active target due amount calculation for the modal
  const targetDueAmount = paymentTargetBatch
    ? paymentTargetBatch.pendingAmount !== undefined
      ? parseFloat(paymentTargetBatch.pendingAmount) || 0
      : Math.max(
          0,
          (parseFloat(paymentTargetBatch.totalCost) || 0) -
            (parseFloat(paymentTargetBatch.paidAmount) || 0)
        )
    : balanceDue;

  // Numeric payment validation in modal
  const numSettle = Math.max(0, parseFloat(settleAmount) || 0);
  const remainingDueAfterPayment = Math.max(0, targetDueAmount - numSettle);

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (numSettle <= 0) {
      toast.error('Please enter a valid payment amount greater than 0.');
      return;
    }

    try {
      if (paymentTargetBatch) {
        // 1. Paying for a specific batch/intake slip
        const cost =
          parseFloat(paymentTargetBatch.totalCost) ||
          (parseFloat(paymentTargetBatch.quantity) || 0) *
            (parseFloat(paymentTargetBatch.ratePerLiter) || rate);
        const currentPaid = parseFloat(paymentTargetBatch.paidAmount) || 0;
        const newPaid = currentPaid + numSettle;
        const newSettlement = newPaid >= cost ? 'Paid' : 'Partial';

        await updateBatchSettlement(
          paymentTargetBatch.id,
          newSettlement,
          newPaid,
          paymentMethod,
          paymentNotes
        );

        toast.success(
          `Disbursed Rs. ${numSettle.toLocaleString()} via ${paymentMethod} for ${paymentTargetBatch.shift} shift.`
        );
      } else {
        // 2. Paying general supplier balance or advance
        if (targetDueAmount > 0 && numSettle <= targetDueAmount) {
          if (settleSupplierBalance) {
            settleSupplierBalance(supplier.id, numSettle, paymentMethod, paymentNotes);
          }
        } else {
          // If paying advance or payment exceeds balance
          if (recordSupplierPayout) {
            recordSupplierPayout({
              supplierId: supplier.id,
              amount: numSettle,
              method: paymentMethod,
              notes: paymentNotes || `Payment / Advance to ${supplier.name}`,
              date: paymentDate,
              referenceNumber: paymentRef,
              accountNumber,
            });
          }
          if (settleSupplierBalance && targetDueAmount > 0) {
            settleSupplierBalance(supplier.id, targetDueAmount, paymentMethod, paymentNotes);
          }
        }

        toast.success(
          `Disbursed Rs. ${numSettle.toLocaleString()} via ${paymentMethod} to ${supplier.name}. Balance updated!`
        );
      }

      setShowSettleModal(false);
      setPaymentTargetBatch(null);
      setSettleAmount('');
      setPaymentRef('');
      setPaymentNotes('');
    } catch (err) {
      console.error('Payment disbursement error:', err);
      toast.error('Failed to process payment. Please try again.');
    }
  };

  const handleCopyAccount = () => {
    if (supplier.accountNumber) {
      navigator.clipboard.writeText(supplier.accountNumber);
      setCopiedAccount(true);
      toast.success('Account number copied to clipboard');
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const initialLetter =
    supplier.name.replace(/Supplier\s+/i, '').charAt(0).toUpperCase() || 'S';

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-8">
      {/* Top Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suppliers
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Supplier Profile — {supplier.name}
            </h1>
            <p className="text-xs text-slate-500">
              Route: {supplier.area || 'Direct Supply'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary Pay / Settle Button */}
          <button
            type="button"
            onClick={handleOpenGeneralPayment}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 ${
              balanceDue > 0
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>
              {balanceDue > 0
                ? `Pay / Settle (Rs. ${balanceDue.toLocaleString()})`
                : 'Disburse Payment / Advance'}
            </span>
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(supplier)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/70 transition shadow-2xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Supplier
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
        {/* Profile Hero Section */}
        <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {supplier.image ? (
              <img
                src={supplier.image}
                alt={supplier.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-2xl shadow-xs shrink-0 font-display">
                {initialLetter}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {supplier.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                  {supplier.supplierType || 'Commercial Dairy Farm'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {supplier.status || 'Active'}
                </span>
                {/* Registered Payment Method Badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                  <CreditCard className="w-3 h-3 text-blue-600" />
                  <span>{supplier.paymentMethod || 'Cash / Direct Settlement'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Agreed Milk Rate
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                Rs. {rate} / L
              </span>
            </div>
          </div>
        </div>

        {/* 4 Highlight Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Droplets className="w-3.5 h-3.5" />
              Total Liters Procured
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              {totalLiters.toFixed(1)} L
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70">
            <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Banknote className="w-3.5 h-3.5" />
              Gross Procurement
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              Rs. {Math.round(totalValue).toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/70">
            <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Total Amount Paid
            </div>
            <p className="text-base font-black text-slate-900 font-mono">
              Rs. {Math.round(totalPayout).toLocaleString()}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              balanceDue > 0
                ? 'bg-amber-50/70 border-amber-200/80'
                : 'bg-slate-50/70 border-slate-200/70'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${
                balanceDue > 0 ? 'text-amber-700' : 'text-slate-500'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Balance Due
            </div>
            <p
              className={`text-base font-black font-mono ${
                balanceDue > 0 ? 'text-amber-700' : 'text-slate-700'
              }`}
            >
              Rs. {balanceDue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Contact & Location and Terms & Account Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Card 1: Contact & Location */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-2xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
              <Building2 className="w-4 h-4 text-slate-500" />
              Contact &amp; Location
            </h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" /> Phone:
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {supplier.contact || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> Area / Route:
                </span>
                <span className="font-medium text-slate-800 text-sm">
                  {supplier.area || '—'}
                </span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-500 shrink-0">Address:</span>
                <span className="text-slate-700 text-right pl-3 font-medium">
                  {supplier.address || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Terms & Payment Profile */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600">
                <Tag className="w-4 h-4 text-slate-500" />
                Terms &amp; Payment Profile
              </h3>
              <button
                type="button"
                onClick={handleOpenGeneralPayment}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Wallet className="w-3 h-3" />
                <span>Pay Supplier</span>
              </button>
            </div>

            <div className="space-y-3 text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Registration Date:
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {supplier.joinDate || new Date().toISOString().split('T')[0]}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-slate-400" /> Payment Terms:
                </span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  {supplier.paymentMethod || 'Cash / Direct Settlement'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Agreed Rate:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  Rs. {rate} / L
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Daily Expected:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {supplier.avgLiters ? `${supplier.avgLiters} L/day` : '10 L/day'}
                </span>
              </div>

              {supplier.accountNumber && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-slate-400" /> Bank / Account:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                      {supplier.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      title="Copy account number"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      {copiedAccount ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Procurement Batches & Payment History Tabs Container */}
        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col space-y-4 shadow-2xs text-xs">
          {/* Tab Selector & Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
            {/* Primary Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('batches')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'batches'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Procurement Batches ({supplierBatches.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'payouts'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Payment &amp; Payout History ({combinedPayments.length})</span>
              </button>
            </div>

            {/* If in batches tab, show Date & Shift filter controls */}
            {activeTab === 'batches' && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Date Filter: All / Today */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter('All');
                      setCustomDate('');
                    }}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      dateFilter === 'All'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter('Today');
                      setCustomDate('');
                    }}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      dateFilter === 'Today'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Today
                  </button>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setDateFilter(e.target.value ? 'Custom' : 'All');
                    }}
                    className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
                  />
                  {customDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDate('');
                        setDateFilter('All');
                      }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold ml-1 cursor-pointer"
                      title="Clear date"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Shift Filter Controls: All / Morning / Evening */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShiftFilter('All')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      shiftFilter === 'All'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All ({supplierBatches.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftFilter('Morning')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      shiftFilter === 'Morning'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-amber-300" />
                    <span>Morning ({morningCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftFilter('Evening')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      shiftFilter === 'Evening'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-indigo-200" />
                    <span>Evening ({eveningCount})</span>
                  </button>
                </div>
              </div>
            )}

            {/* If in payouts tab, show action to disburse payment */}
            {activeTab === 'payouts' && (
              <button
                type="button"
                onClick={handleOpenGeneralPayment}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Disburse New Payment</span>
              </button>
            )}
          </div>

          {/* TAB 1: Procurement Batches Table */}
          {activeTab === 'batches' && (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Date &amp; Shift</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Rate / L</th>
                    <th className="px-4 py-3">Total Value</th>
                    <th className="px-4 py-3">Quality Test</th>
                    <th className="px-4 py-3 text-center">Settlement &amp; Pay</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                        No {shiftFilter !== 'All' ? shiftFilter.toLowerCase() : ''} intake logs recorded yet for this supplier.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((batch) => {
                      const cost =
                        parseFloat(batch.totalCost) ||
                        (parseFloat(batch.quantity) || 0) * (parseFloat(batch.ratePerLiter) || rate);
                      const isMorn = batch.shift?.toLowerCase() === 'morning';
                      const isPaid = batch.settlement === 'Paid';

                      return (
                        <tr
                          key={batch.id}
                          onClick={() => setSelectedBatch(batch)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-800">{batch.date}</span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                              {isMorn ? (
                                <Sun className="w-3 h-3 text-amber-500" />
                              ) : (
                                <Moon className="w-3 h-3 text-indigo-500" />
                              )}
                              {batch.shift} Shift
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-700 text-sm">
                            {batch.quantity} L
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            Rs. {batch.ratePerLiter || rate}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            Rs. {Math.round(cost).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                            Fat: {batch.fat || '4.5'}% • LR: {batch.lr || '28'}
                          </td>
                          {/* Settlement Status & Pay Button */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  isPaid
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : batch.settlement === 'Partial'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {batch.settlement || 'Pending'}
                              </span>

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPayForBatch(batch);
                                  }}
                                  title="Pay for this intake delivery"
                                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#009966] text-white hover:brightness-110 shadow-2xs transition cursor-pointer"
                                >
                                  <Wallet className="w-2.5 h-2.5" />
                                  <span>Pay</span>
                                </button>
                              )}
                            </div>
                            {batch.paidAmount > 0 && (
                              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                Paid: Rs. {parseFloat(batch.paidAmount).toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:underline">
                              View Slip <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Payment & Payout History Table */}
          {activeTab === 'payouts' && (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Date &amp; Voucher</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Reference / Notes</th>
                    <th className="px-4 py-3 text-right">Amount Disbursed</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {combinedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-400 font-medium">
                        No payments or disbursements recorded yet for {supplier.name}.
                      </td>
                    </tr>
                  ) : (
                    combinedPayments.map((p) => {
                      const methodDef =
                        PAYMENT_METHODS.find((m) =>
                          p.method?.toLowerCase().includes(m.id.toLowerCase())
                        ) || PAYMENT_METHODS[0];
                      const IconComp = methodDef.icon;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-slate-800">{p.date}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {p.type}
                            {p.quantity && (
                              <span className="text-[11px] text-slate-500 font-normal block">
                                Volume: {p.quantity} Liters
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                methodDef.id === 'Cash'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : methodDef.id === 'Bank Transfer'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : methodDef.id.includes('JazzCash')
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5" />
                              <span>{p.method}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <span className="block font-medium">{p.notes || '—'}</span>
                            {p.reference && (
                              <span className="text-[10px] font-mono text-slate-400">
                                Ref: {p.reference}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-emerald-700 text-sm">
                            Rs. {Math.round(p.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <BadgeCheck className="w-3 h-3 text-emerald-600" />
                              <span>Settled</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Settle Due Balance / Payment Disbursement Modal with Full Payment Method Selection */}
      {showSettleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowSettleModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-display">
                    {paymentTargetBatch ? 'Pay Milk Delivery Batch' : 'Disburse Supplier Payment'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {supplier.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettleModal(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSettleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Context Banner: Target Batch or Overall Balance */}
              {paymentTargetBatch ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      {paymentTargetBatch.shift?.toLowerCase() === 'morning' ? (
                        <Sun className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {paymentTargetBatch.shift} Shift Delivery • {paymentTargetBatch.date}
                      </span>
                      <span className="text-[11px] text-slate-600">
                        {paymentTargetBatch.quantity} L @ Rs. {paymentTargetBatch.ratePerLiter || rate}/L
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">
                      Batch Due
                    </span>
                    <span className="text-base font-black text-amber-950 font-mono">
                      Rs. {targetDueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-emerald-100/30 to-white border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Outstanding Supplier Balance
                    </span>
                    <p className="text-lg font-black text-slate-900 font-mono">
                      Rs. {balanceDue.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      balanceDue > 0
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {balanceDue > 0 ? 'Pending Dues' : 'Balance Cleared'}
                  </span>
                </div>
              )}

              {/* 1. Payment Method Selection (Cards) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const IconComp = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="text-xs font-bold text-slate-900 block">
                            {method.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {method.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Bank / Wallet Account Details */}
              {(paymentMethod === 'Bank Transfer' || paymentMethod === 'JazzCash / EasyPaisa') && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      {paymentMethod === 'Bank Transfer' ? (
                        <Landmark className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      <span>Destination Account Number / IBAN</span>
                    </span>
                    {supplier.accountNumber && (
                      <span className="text-[10px] text-emerald-700 font-bold">
                        (Supplier on-file)
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={
                      paymentMethod === 'Bank Transfer'
                        ? 'Enter bank name and account / IBAN'
                        : 'Enter mobile wallet number (e.g., 0300-1234567)'
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800 bg-white outline-none focus:border-emerald-600"
                  />
                </div>
              )}

              {/* Quick Amount Selectors */}
              {targetDueAmount > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quick Amount Selection
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettleAmount(String(targetDueAmount))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        numSettle === targetDueAmount
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pay Full (100%): Rs. {targetDueAmount.toLocaleString()}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettleAmount(String(Math.round(targetDueAmount / 2)))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        numSettle === Math.round(targetDueAmount / 2)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Pay Half (50%): Rs. {Math.round(targetDueAmount / 2).toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Amount to Disburse Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Amount Paying Now (Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    PKR
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full h-11 pl-13 pr-3.5 rounded-2xl border border-slate-200 text-base font-black text-slate-900 bg-white outline-none focus:border-emerald-600 shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Reference ID & Date in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white outline-none focus:border-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Txn Ref / Voucher #
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g., TRX-9823 or Cheque #"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Payment Notes / Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Notes, authorization or comments"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white outline-none focus:border-emerald-600"
                />
              </div>

              {/* Live Settlement Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Balance Before:</span>
                  <span>Rs. {targetDueAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Paying Now ({paymentMethod}):</span>
                  <span>- Rs. {numSettle.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold">
                  <span className="text-slate-800">Remaining Due:</span>
                  <span
                    className={
                      remainingDueAfterPayment > 0
                        ? 'text-amber-700 font-black'
                        : 'text-emerald-700 font-black'
                    }
                  >
                    Rs. {remainingDueAfterPayment.toLocaleString()}
                    {remainingDueAfterPayment === 0 && ' (Cleared!)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSettleModal(false)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#009966] hover:brightness-110 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm &amp; Pay Rs. {numSettle.toLocaleString()} ({paymentMethod})
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Batch Slip Modal */}
      {selectedBatch && (
        <IntakeDetail
          item={selectedBatch}
          onClose={() => setSelectedBatch(null)}
          onEdit={() => setSelectedBatch(null)}
        />
      )}
    </div>
  );
}
