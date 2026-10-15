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
import DoorstepPaymentModes from './DoorstepPaymentModes';
import DoorstepPaymentInputs from './DoorstepPaymentInputs';

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

  const deliveryFee = Number(delivery?.deliveryFee) || 0;
  const itemsPlusFee = itemsTotal > 0 ? itemsTotal + deliveryFee : 0;

  const orderTotal = Math.max(
    itemsPlusFee,
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
        const isSplit = onlineCollected > 0 && cashCollected > 0;
        const isPureOnline = onlineCollected > 0 && cashCollected === 0;
        
        let payMethodDesc = 'Doorstep Cash (COD)';
        let finalChannel = 'Cash';
        let splitMeta = null;
        let onlineMeta = null;

        if (isSplit) {
          payMethodDesc = `Split Payment: Cash + ${onlineProvider}`;
          finalChannel = 'Split';
          splitMeta = {
            cashAmount: cashCollected,
            onlineAmount: onlineCollected,
            onlineMethod: onlineProvider.toUpperCase() === 'JAZZCASH' ? 'JAZZCASH' : 'EASYPAISA',
          };
          onlineMeta = {
            provider: onlineProvider,
            transactionId: onlineTrxId || undefined,
            senderAccount: onlineSenderAccount || undefined,
          };
        } else if (isPureOnline) {
          payMethodDesc = `Online Payment (${onlineProvider})`;
          finalChannel = onlineProvider;
          onlineMeta = {
            provider: onlineProvider,
            transactionId: onlineTrxId || undefined,
            senderAccount: onlineSenderAccount || undefined,
          };
        }

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
            paymentChannel: finalChannel,
            splitPaymentMeta: splitMeta,
            onlineTransferMeta: onlineMeta,
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
          <DoorstepPaymentModes
            isOntimeDelivery={isOntimeDelivery}
            settlementMode={settlementMode}
            setSettlementMode={setSettlementMode}
            balanceDue={balanceDue}
            halfCashAmount={halfCashAmount}
            setHalfCashAmount={setHalfCashAmount}
          />

          {/* Conditional Detail Inputs based on Mode */}
          <DoorstepPaymentInputs
            settlementMode={settlementMode}
            isOntimeDelivery={isOntimeDelivery}
            balanceDue={balanceDue}
            halfCashAmount={halfCashAmount}
            setHalfCashAmount={setHalfCashAmount}
            customCashAmount={customCashAmount}
            setCustomCashAmount={setCustomCashAmount}
            onlineAmount={onlineAmount}
            setOnlineAmount={setOnlineAmount}
            onlineProvider={onlineProvider}
            setOnlineProvider={setOnlineProvider}
            onlineSenderAccount={onlineSenderAccount}
            setOnlineSenderAccount={setOnlineSenderAccount}
            onlineTrxId={onlineTrxId}
            setOnlineTrxId={setOnlineTrxId}
            splitCashAmount={splitCashAmount}
            setSplitCashAmount={setSplitCashAmount}
            splitOnlineAmount={splitOnlineAmount}
            setSplitOnlineAmount={setSplitOnlineAmount}
            settlementNotes={settlementNotes}
            setSettlementNotes={setSettlementNotes}
          />

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
