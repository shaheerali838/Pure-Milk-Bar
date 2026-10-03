import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Truck,
  CheckCircle2,
  Banknote,
  Smartphone,
  CreditCard,
  User,
  MapPin,
  Coins,
  Receipt,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useLedgerContext } from '@/context/LedgerContext';

export default function DoorstepSettlementModal({
  delivery,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { updateDeliveryStatus } = useDeliveryContext();
  const { addLedgerEntry, fetchCustomerLedger } = useLedgerContext() || {};

  // Settlement Mode: 'full_cash' | 'half_cash' | 'custom_cash' | 'online' | 'split' | 'khata'
  const [settlementMode, setSettlementMode] = useState('full_cash');
  const [halfCashAmount, setHalfCashAmount] = useState('');
  const [customCashAmount, setCustomCashAmount] = useState('');
  const [onlineAmount, setOnlineAmount] = useState('');
  const [splitCashAmount, setSplitCashAmount] = useState('');
  const [splitOnlineAmount, setSplitOnlineAmount] = useState('');
  const [onlineProvider, setOnlineProvider] = useState('EasyPaisa');
  const [onlineTrxId, setOnlineTrxId] = useState('');
  const [onlineSenderAccount, setOnlineSenderAccount] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute base figures from delivery
  const prevPaid = Number(delivery?.amountPaid) || 0;
  const prevDue = Number(delivery?.amountDue) || 0;
  const codToCollect = Number(delivery?.codAmountToCollect) || 0;

  // Calculate net order total
  const itemsTotal = Array.isArray(delivery?.items) && delivery.items.length > 0
    ? delivery.items.reduce((acc, it) => acc + (Number(it.subtotal) || Number(it.unitPrice * it.quantity) || 0), 0)
    : 0;

  const orderTotal = Math.max(
    itemsTotal,
    prevPaid + (prevDue > 0 ? prevDue : codToCollect),
    codToCollect,
    prevPaid
  );

  // Effective due amount remaining to be collected at doorstep
  const balanceDue = Math.max(0, orderTotal - prevPaid);

  // Check if this is a One-Time Delivery (Random / Calling customer)
  const isOntimeDelivery =
    delivery?.deliverySubType === 'ontime' ||
    delivery?.source === 'POS_ONE_TIME' ||
    delivery?.deliveryType === 'ONTIME';

  // Initialize defaults whenever modal opens
  useEffect(() => {
    if (delivery && isOpen) {
      if (balanceDue === 0) {
        setSettlementMode('full_cash');
      } else if (delivery.paymentMode === 'ONLINE') {
        setSettlementMode('online');
        setOnlineAmount(String(balanceDue));
      } else {
        setSettlementMode('full_cash');
      }
      setHalfCashAmount(String(Math.round(balanceDue / 2)));
      setCustomCashAmount(String(balanceDue));
      setOnlineAmount(String(balanceDue));
      setSplitCashAmount(String(Math.round(balanceDue / 2)));
      setSplitOnlineAmount(String(balanceDue - Math.round(balanceDue / 2)));
      setOnlineProvider('EasyPaisa');
      setSettlementNotes('');
    }
  }, [delivery, isOpen, balanceDue]);

  if (!delivery) return null;

  // Calculate dynamic collected amounts based on selected mode
  let cashCollected = 0;
  let onlineCollected = 0;

  if (settlementMode === 'full_cash') {
    cashCollected = balanceDue;
    onlineCollected = 0;
  } else if (settlementMode === 'half_cash' && !isOntimeDelivery) {
    cashCollected = Math.min(balanceDue, Math.max(0, parseFloat(halfCashAmount) || 0));
    onlineCollected = 0;
  } else if (settlementMode === 'custom_cash' && !isOntimeDelivery) {
    cashCollected = Math.min(balanceDue, Math.max(0, parseFloat(customCashAmount) || 0));
    onlineCollected = 0;
  } else if (settlementMode === 'online') {
    cashCollected = 0;
    onlineCollected = Math.min(balanceDue, Math.max(0, parseFloat(onlineAmount) || 0));
  } else if (settlementMode === 'split' && !isOntimeDelivery) {
    cashCollected = Math.max(0, parseFloat(splitCashAmount) || 0);
    onlineCollected = Math.max(0, parseFloat(splitOnlineAmount) || 0);
    if (cashCollected + onlineCollected > balanceDue) {
      onlineCollected = Math.max(0, balanceDue - cashCollected);
    }
  } else if (settlementMode === 'khata' && !isOntimeDelivery) {
    cashCollected = 0;
    onlineCollected = 0;
  } else {
    cashCollected = balanceDue;
    onlineCollected = 0;
  }

  const totalCollectedNow = cashCollected + onlineCollected;
  const newTotalPaid = prevPaid + totalCollectedNow;
  const remainingKhataDue = Math.max(0, orderTotal - newTotalPaid);

  const finalPaymentMode =
    totalCollectedNow >= orderTotal
      ? onlineCollected > 0 && cashCollected === 0
        ? 'ONLINE'
        : cashCollected > 0 && onlineCollected > 0
        ? 'SPLIT'
        : 'CASH'
      : totalCollectedNow === 0
      ? 'KHATA'
      : 'SPLIT';

  const finalPaymentStatus =
    remainingKhataDue <= 0 ? 'PAID' : newTotalPaid > 0 ? 'PARTIAL' : 'UNPAID';

  const handleConfirmSettlement = async () => {
    try {
      setIsSubmitting(true);

      const notesArr = [];
      if (settlementNotes.trim()) notesArr.push(settlementNotes.trim());
      if (cashCollected > 0) notesArr.push(`Rider Cash: Rs. ${cashCollected.toLocaleString()}`);
      if (onlineCollected > 0) {
        notesArr.push(`Online (${onlineProvider}): Rs. ${onlineCollected.toLocaleString()}${onlineTrxId ? ` [TRX: ${onlineTrxId}]` : ''}`);
      }
      if (remainingKhataDue > 0) {
        notesArr.push(`Remaining on Khata: Rs. ${remainingKhataDue.toLocaleString()}`);
      }
      const combinedNotes = notesArr.join(' · ');

      // 1. Update delivery run on server & DeliveryContext
      const deliveryPayload = {
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString(),
        amountPaid: newTotalPaid,
        amountDue: remainingKhataDue,
        cashCollected: (Number(delivery.cashCollected) || 0) + cashCollected,
        onlineCollected: (Number(delivery.onlineCollected) || 0) + onlineCollected,
        codAmountToCollect: 0,
        paymentMode: finalPaymentMode,
        paymentStatus: finalPaymentStatus,
        notes: combinedNotes,
      };

      const delId = delivery.id || delivery._id;
      await updateDeliveryStatus(delId, deliveryPayload);

      // 2. Customer Khata Ledger Entry (Credit payment received - for registered customers)
      const custId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
      if (custId && totalCollectedNow > 0 && typeof addLedgerEntry === 'function') {
        const payMethodDesc =
          onlineCollected > 0 && cashCollected > 0
            ? `Doorstep Split (Cash: Rs. ${cashCollected}, ${onlineProvider}: Rs. ${onlineCollected})`
            : onlineCollected > 0
            ? `Doorstep Online (${onlineProvider}${onlineTrxId ? ` #${onlineTrxId}` : ''})`
            : 'Doorstep Cash (COD)';

        await addLedgerEntry(
          custId,
          {
            description: `Payment Received on Delivery (Run #${delivery.runCode || 'DEL'}${delivery.receiptNumber ? ` / Order #${delivery.receiptNumber}` : ''})`,
            debit: 0,
            credit: totalCollectedNow,
            date: new Date().toISOString().split('T')[0],
            orderTotal: orderTotal,
            paidAmount: totalCollectedNow,
            remainingAmount: remainingKhataDue,
            fulfillmentType: 'Doorstep Collection',
            paymentMethod: payMethodDesc,
            invoiceId: delivery.receiptNumber || delivery.runCode || undefined,
            notes: combinedNotes,
          },
          true
        );

        if (typeof fetchCustomerLedger === 'function') {
          fetchCustomerLedger(custId);
        }
      }

      // 3. Dispatch global events for live update in other tabs & dashboards
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pure_milk_bar_pos_sale_completed'));
        window.dispatchEvent(new Event('pure_milk_bar_finance_updated'));
        window.dispatchEvent(new Event('pure_milk_bar_deliveries_updated'));
      }

      toast.success(
        `Delivery ${delivery.runCode || ''} Marked DELIVERED! (Collected: Rs. ${totalCollectedNow.toLocaleString()})`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Settlement confirmation error:', err);
      toast.error('Failed to complete delivery settlement: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Doorstep Delivery Settlement</span>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {delivery.runCode || 'DEL-RUN'}
                </span>
                {isOntimeDelivery && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                    ⚡ One-Time
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Record payment collected by rider or digital account transfer.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* Order & Customer Summary Card - Clean White Design */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="font-bold text-sm font-display text-slate-900 block">
                    {delivery.customerName || (isOntimeDelivery ? 'One-Time Customer' : 'Customer')}
                  </span>
                  {delivery.customerPhone && delivery.customerPhone !== 'N/A' && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      📞 {delivery.customerPhone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Order Value:</span>
                <span className="font-black font-mono text-slate-900 text-sm">
                  Rs. {orderTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {delivery.deliveryAddress && (
                <div className="flex items-start gap-1.5 col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-[11px] text-slate-600 font-medium">
                    {delivery.deliveryAddress}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Rider: <strong className="text-slate-800">{delivery.riderNameSnapshot || 'Unassigned'}</strong></span>
              </div>
              <div className="flex items-center justify-end gap-2 font-mono">
                {prevPaid > 0 && (
                  <span className="text-emerald-700 text-[11px] font-semibold">
                    Advance: Rs. {prevPaid.toLocaleString()}
                  </span>
                )}
                <span className="text-amber-700 font-black">
                  Balance Due: Rs. {balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Collection Mode Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>DOORSTEP PAYMENT RECEIVED FROM CUSTOMER:</span>
              </label>
              {isOntimeDelivery && (
                <span className="text-[10px] text-slate-500 font-medium">
                  Full Cash or Online Payment Only
                </span>
              )}
            </div>

            {/* If On-Time Delivery: Show only Full Cash and Online Payment */}
            {isOntimeDelivery ? (
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Full Cash (100%) */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('full_cash')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'full_cash'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Full Cash (100%)</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 font-mono font-black text-base text-emerald-700">
                    Rs. {balanceDue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Rider collected full cash</span>
                </button>

                {/* 2. Online Payment (EasyPaisa / JazzCash) */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('online')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'online'
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Online Payment</span>
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="mt-2 font-mono font-black text-base text-indigo-700">
                    Rs. {balanceDue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">EasyPaisa / JazzCash</span>
                </button>
              </div>
            ) : (
              /* If Monthly Delivery: Show all 6 settlement options */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* 1. Full Cash */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('full_cash')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'full_cash'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Full Cash (100%)</span>
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="mt-1 font-mono font-black text-sm text-emerald-700">
                    Rs. {balanceDue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Rider collected full amount</span>
                </button>

                {/* 2. Half Cash */}
                <button
                  type="button"
                  onClick={() => {
                    setSettlementMode('half_cash');
                    if (!halfCashAmount) {
                      setHalfCashAmount(String(Math.round(balanceDue / 2)));
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'half_cash'
                      ? 'border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Half Cash (50%)</span>
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="mt-1 font-mono font-black text-sm text-amber-700">
                    Rs. {Math.round(balanceDue / 2).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">50% Cash, rest to Khata</span>
                </button>

                {/* 3. Custom Cash */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('custom_cash')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'custom_cash'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-950 ring-2 ring-blue-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Custom Cash</span>
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="mt-1 font-mono font-black text-sm text-blue-700">
                    Enter Amount
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Partial cash, rest to Khata</span>
                </button>

                {/* 4. Online Payment */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('online')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'online'
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Online Payment</span>
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="mt-1 font-mono font-black text-sm text-indigo-700">
                    Rs. {balanceDue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Digital payment to account</span>
                </button>

                {/* 5. Split (Cash + Online) */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('split')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'split'
                      ? 'border-teal-500 bg-teal-50/80 text-teal-950 ring-2 ring-teal-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">Split (Cash+Online)</span>
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="mt-1 font-mono font-black text-sm text-teal-700">
                    Dual Payment
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Cash + Online</span>
                </button>

                {/* 6. On Khata */}
                <button
                  type="button"
                  onClick={() => setSettlementMode('khata')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                    settlementMode === 'khata'
                      ? 'border-purple-500 bg-purple-50/80 text-purple-950 ring-2 ring-purple-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">On Khata (0% Now)</span>
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="mt-1 font-mono font-black text-sm text-purple-700">
                    Rs. 0 Collected
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">Full balance to Khata</span>
                </button>
              </div>
            )}
          </div>

          {/* Conditional Detail Inputs based on Mode */}

          {/* Half Cash Amount Input */}
          {settlementMode === 'half_cash' && !isOntimeDelivery && (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-900">
                  Half Cash Amount Received by Rider (Rs.):
                </label>
                <button
                  type="button"
                  onClick={() => setHalfCashAmount(String(Math.round(balanceDue / 2)))}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold cursor-pointer border border-amber-300"
                >
                  Reset 50% (Rs. {Math.round(balanceDue / 2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  max={balanceDue}
                  value={halfCashAmount}
                  onChange={(e) => setHalfCashAmount(e.target.value)}
                  placeholder="Enter half amount"
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-amber-600"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-amber-800 font-medium">
                <span>Remaining to Khata:</span>
                <span className="font-mono font-bold">
                  Rs. {Math.max(0, balanceDue - (parseFloat(halfCashAmount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Custom Cash Amount Input */}
          {settlementMode === 'custom_cash' && !isOntimeDelivery && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-blue-900">
                Custom Cash Amount Received by Rider (Rs.):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  max={balanceDue}
                  value={customCashAmount}
                  onChange={(e) => setCustomCashAmount(e.target.value)}
                  placeholder="Enter custom cash amount"
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-blue-800 font-medium">
                <span>Remaining Charged to Khata:</span>
                <span className="font-mono font-bold">
                  Rs. {Math.max(0, balanceDue - (parseFloat(customCashAmount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Online Details (EasyPaisa & JazzCash) */}
          {settlementMode === 'online' && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  Online Account / Digital Receipt
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOnlineProvider('EasyPaisa')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      onlineProvider === 'EasyPaisa'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    EasyPaisa
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineProvider('JazzCash')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      onlineProvider === 'JazzCash'
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    JazzCash
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                    Total Online Amount:
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      max={balanceDue}
                      value={onlineAmount}
                      onChange={(e) => setOnlineAmount(e.target.value)}
                      placeholder="Online Amount"
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                    Sender Mobile # (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0300-1234567"
                    value={onlineSenderAccount}
                    onChange={(e) => setOnlineSenderAccount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-0.5">
                  Transaction / TID / Reference ID (Optional):
                </label>
                <input
                  type="text"
                  placeholder="Enter EasyPaisa / JazzCash TID..."
                  value={onlineTrxId}
                  onChange={(e) => setOnlineTrxId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          )}

          {/* Split Cash + Online Inputs */}
          {settlementMode === 'split' && !isOntimeDelivery && (
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2.5 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wide block">
                Dual Payment Breakdown
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-teal-900 uppercase mb-0.5">
                    Rider Cash Amount:
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      max={balanceDue}
                      value={splitCashAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSplitCashAmount(val);
                        const c = parseFloat(val) || 0;
                        setSplitOnlineAmount(String(Math.max(0, balanceDue - c)));
                      }}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-teal-900 uppercase mb-0.5">
                    Online Amount ({onlineProvider}):
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      max={balanceDue}
                      value={splitOnlineAmount}
                      onChange={(e) => setSplitOnlineAmount(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-slate-800 tabular focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <select
                  value={onlineProvider}
                  onChange={(e) => setOnlineProvider(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
                <input
                  type="text"
                  placeholder="Online TID (Optional)"
                  value={onlineTrxId}
                  onChange={(e) => setOnlineTrxId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Full Khata notice */}
          {settlementMode === 'khata' && !isOntimeDelivery && (
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1 animate-in fade-in duration-150">
              <div className="font-bold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Zero Cash Collected Today</span>
              </div>
              <p className="text-[11px] text-purple-800">
                Full order balance of <strong>Rs. {balanceDue.toLocaleString()}</strong> will be added as debit to customer Khata ledger.
              </p>
            </div>
          )}

          {/* Settlement Notes (Optional) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Settlement Notes / Remarks (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in full on delivery, delivered at door..."
              value={settlementNotes}
              onChange={(e) => setSettlementNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Live Summary Bar */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-2xs font-mono text-xs">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-sans">Cash</span>
                <span className="font-bold text-emerald-400">
                  Rs. {cashCollected.toLocaleString()}
                </span>
              </div>
              {onlineCollected > 0 && (
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block font-sans">Online</span>
                  <span className="font-bold text-indigo-300">
                    Rs. {onlineCollected.toLocaleString()}
                  </span>
                </div>
              )}
              {remainingKhataDue > 0 && (
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block font-sans">Khata</span>
                  <span className="font-bold text-amber-400">
                    Rs. {remainingKhataDue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase text-slate-400 block font-sans">Total Collected</span>
              <span className="text-sm font-black text-white">
                Rs. {totalCollectedNow.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmSettlement}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording...' : 'Confirm Delivery & Settlement'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
