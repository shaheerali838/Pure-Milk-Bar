import React, { useMemo, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Truck,
  CheckCircle2,
  Banknote,
  Smartphone,
  Plus,
  Minus,
  X,
  Package,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { usePOSContext } from '@/context/POSContext';

export default function POSAdjustDeliveryModal({
  delivery,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { updateDelivery } = useDeliveryContext();
  const { addLedgerEntry, fetchCustomerLedger } = useLedgerContext() || {};
  const { products = [] } = usePOSContext();

  const [items, setItems] = useState([]);
  const [cashPaid, setCashPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'Online'
  const [onlineProvider, setOnlineProvider] = useState('EasyPaisa');
  const [onlineTrxId, setOnlineTrxId] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  const addableProducts = useMemo(() => (products || [])
    .filter((product) => /milk|dahi|yogurt/i.test(`${product.name || ''} ${product.category || ''}`))
    .map((product) => {
      const rawUnit = String(product.unit || product.baseUnit || '').toUpperCase();
      const unit = ['L', 'LITER', 'LITRE', 'LTR'].includes(rawUnit) ? 'L'
        : ['KG', 'KILOGRAM', 'KGS'].includes(rawUnit) ? 'KG' : '';
      return {
        id: product._id || product.id,
        name: product.name,
        unit,
        unitPrice: Number(product.sellingPrice ?? product.salePrice ?? product.price ?? product.unitPrice) || 0,
      };
    })
    .filter((product) => product.id && product.unit), [products]);

  // Initialize editable state from delivery prop
  useEffect(() => {
    if (delivery && isOpen) {
      // 1. Items array normalization
      let initialItems = [];
      if (Array.isArray(delivery.items) && delivery.items.length > 0) {
        initialItems = delivery.items.map((it) => {
          const qty = Number(it.quantity) || 1;
          const subtotal = Number(it.subtotal) || 0;
          const unitPrice = Number(it.unitPrice || (qty > 0 && subtotal > 0 ? subtotal / qty : 0)) || 200;
          return {
            name: it.name || 'Pure Milk',
            quantity: qty,
            unit: ['LITER', 'LITRE', 'LTR'].includes(String(it.unit || '').toUpperCase()) ? 'L' : (it.unit || 'L'),
            unitPrice: unitPrice,
            subtotal: subtotal > 0 ? subtotal : qty * unitPrice,
          };
        });
      } else {
        const qty = Number(delivery.qtyLiters) || 1;
        const total = Number(delivery.amountDue || delivery.codAmountToCollect || 200 * qty) || (200 * qty);
        const unitPrice = qty > 0 ? Math.round(total / qty) : 200;
        initialItems = [
          {
            name: delivery.itemDescription || 'Pure Milk',
            quantity: qty,
            unit: 'LITER',
            unitPrice: unitPrice,
            subtotal: total,
          },
        ];
      }

      setItems(initialItems);

      // 2. Initial payment values
      const initialPaid = Number(delivery.amountPaid) || 0;
      setCashPaid(initialPaid > 0 ? String(initialPaid) : '0');
      setPaymentMethod('Cash');
      setOnlineProvider('EasyPaisa');
      setOnlineTrxId('');
      setDeliveryNotes(delivery.notes || '');
      setSelectedProductId('');
    }
  }, [delivery, isOpen]);

  const handleAddProduct = () => {
    const product = addableProducts.find((item) => String(item.id) === String(selectedProductId));
    if (!product) {
      toast.error('Select Milk or Dahi first');
      return;
    }
    setItems((previous) => [...previous, {
      name: product.name,
      quantity: 1,
      unit: product.unit,
      unitPrice: product.unitPrice,
      subtotal: product.unitPrice,
    }]);
    setSelectedProductId('');
  };

  const handleRemoveItem = (index) => {
    setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  if (!delivery) return null;

  // Compute live calculations
  const totalQtyLiters = items.reduce((acc, it) => (
    String(it.unit).toUpperCase() === 'L' ? acc + (Number(it.quantity) || 0) : acc
  ), 0);
  const productTotal = items.reduce(
    (acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)),
    0
  );
  const deliveryFee = Number(delivery.deliveryFee) || 0;
  const newOrderTotal = productTotal + deliveryFee;

  const numPaid = Math.max(0, Math.min(newOrderTotal, parseFloat(cashPaid) || 0));
  const remainingKhata = Math.max(0, newOrderTotal - numPaid);

  const handleQtyChange = (index, delta) => {
    setItems((prev) => {
      const next = [...prev];
      const cur = next[index];
      const newQty = Math.max(0.5, Number(((Number(cur.quantity) || 1) + delta).toFixed(2)));
      next[index] = {
        ...cur,
        quantity: newQty,
        subtotal: Math.round(newQty * (Number(cur.unitPrice) || 0)),
      };
      return next;
    });
  };

  const handleQtyDirectInput = (index, value) => {
    const val = parseFloat(value);
    setItems((prev) => {
      const next = [...prev];
      const cur = next[index];
      const validQty = isNaN(val) ? 0 : Math.max(0, val);
      next[index] = {
        ...cur,
        quantity: value === '' ? '' : validQty,
        subtotal: isNaN(val) ? 0 : Math.round(validQty * (Number(cur.unitPrice) || 0)),
      };
      return next;
    });
  };

  const handleRateChange = (index, value) => {
    const val = parseFloat(value);
    setItems((prev) => {
      const next = [...prev];
      const cur = next[index];
      const validRate = isNaN(val) ? 0 : Math.max(0, val);
      const qty = Number(cur.quantity) || 0;
      next[index] = {
        ...cur,
        unitPrice: value === '' ? '' : validRate,
        subtotal: isNaN(val) ? 0 : Math.round(qty * validRate),
      };
      return next;
    });
  };

  const handleConfirmAndDeliver = async () => {
    if (newOrderTotal <= 0) {
      toast.error('Order total must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const delId = delivery.id || delivery._id;
      const custId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
      const isOntime = delivery.deliverySubType === 'ontime' || delivery.source === 'POS_ONE_TIME';

      // 1. Determine final payment mode
      let finalPaymentMode = 'KHATA';
      if (numPaid >= newOrderTotal) {
        finalPaymentMode = paymentMethod === 'Online' ? 'ONLINE' : 'CASH';
      } else if (numPaid > 0) {
        finalPaymentMode = 'SPLIT';
      } else {
        finalPaymentMode = 'KHATA';
      }

      const finalPaymentStatus = remainingKhata <= 0 ? 'PAID' : numPaid > 0 ? 'PARTIAL' : 'UNPAID';

      const notesArr = [];
      if (deliveryNotes.trim()) notesArr.push(deliveryNotes.trim());
      if (numPaid > 0) {
        notesArr.push(`${paymentMethod === 'Online' ? `Online (${onlineProvider})` : 'Cash Paid'}: Rs. ${numPaid.toLocaleString()}`);
      }
      if (remainingKhata > 0) {
        notesArr.push(`Khata Due: Rs. ${remainingKhata.toLocaleString()}`);
      }
      const combinedNotes = notesArr.join(' · ');

      // 2. Update Delivery Run in database
      const updatedDeliveryData = {
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString(),
        qtyLiters: totalQtyLiters,
        items: items.map((it) => ({
          name: it.name || 'Pure Milk',
          quantity: Number(it.quantity) || 1,
          unit: it.unit || 'LITER',
          unitPrice: Number(it.unitPrice) || 0,
          subtotal: Math.round((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)),
        })),
        itemDescription: items.map((i) => `${i.quantity} ${i.unit || 'L'} ${i.name}`).join(', '),
        amountPaid: numPaid,
        amountDue: remainingKhata,
        codAmountToCollect: 0,
        cashCollected: paymentMethod === 'Cash' ? numPaid : 0,
        onlineCollected: paymentMethod === 'Online' ? numPaid : 0,
        paymentMode: finalPaymentMode,
        paymentStatus: finalPaymentStatus,
        notes: combinedNotes,
      };

      await updateDelivery(delId, updatedDeliveryData);

      // 3. Customer Ledger Sync (For registered monthly customers)
      if (custId && !isOntime && typeof addLedgerEntry === 'function') {
        const itemSummary = items.map((i) => `${i.quantity}x ${i.name}`).join(' + ');

        // Add Ledger Debit for new total amount
        await addLedgerEntry(
          custId,
          {
            description: `Doorstep Delivery Delivered: ${itemSummary}`,
            debit: newOrderTotal,
            credit: 0,
            date: new Date().toISOString().split('T')[0],
            orderTotal: newOrderTotal,
            paidAmount: numPaid,
            remainingAmount: remainingKhata,
            fulfillmentType: 'Doorstep Delivery',
            paymentMethod: finalPaymentMode === 'KHATA' ? 'Khata Credit' : finalPaymentMode,
            items: updatedDeliveryData.items,
            invoiceId: delivery.receiptNumber || delivery.runCode || undefined,
            notes: combinedNotes,
          },
          false
        );

        // If customer paid some cash/online at doorstep, credit the customer ledger
        if (numPaid > 0) {
          const payMethodDesc =
            paymentMethod === 'Online'
              ? `Doorstep Online (${onlineProvider}${onlineTrxId ? ` #${onlineTrxId}` : ''})`
              : 'Doorstep Cash (COD)';

          await addLedgerEntry(
            custId,
            {
              description: `Payment Received on Delivery (#${delivery.runCode || 'DEL'})`,
              debit: 0,
              credit: numPaid,
              date: new Date().toISOString().split('T')[0],
              orderTotal: newOrderTotal,
              paidAmount: numPaid,
              remainingAmount: remainingKhata,
              fulfillmentType: 'Doorstep Collection',
              paymentMethod: payMethodDesc,
              invoiceId: delivery.receiptNumber || delivery.runCode || undefined,
              notes: `Collected Rs. ${numPaid.toLocaleString()} at doorstep. Remaining Baqi: Rs. ${remainingKhata.toLocaleString()}`,
            },
            false
          );
        }

        if (typeof fetchCustomerLedger === 'function') {
          fetchCustomerLedger(custId);
        }
      }

      // 4. Dispatch global real-time events
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pure_milk_bar_pos_sale_completed'));
        window.dispatchEvent(new Event('pure_milk_bar_finance_updated'));
        window.dispatchEvent(new Event('pure_milk_bar_deliveries_updated'));
      }

      toast.success(
        `Order ${delivery.runCode || ''} updated & marked DELIVERED! (Rs. ${numPaid.toLocaleString()} Paid, Rs. ${remainingKhata.toLocaleString()} on Khata)`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update and deliver order:', err);
      toast.error('Failed to deliver: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-5 bg-white rounded-2xl">
        <DialogHeader className="pb-2.5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Adjust Delivery &amp; Payment</span>
              </DialogTitle>
              <p className="text-[11px] text-slate-500 font-medium">
                {delivery.customerName || 'Customer'} · <span className="font-mono">{delivery.runCode || 'DEL'}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-1 text-xs">
          {/* 1. Items & Quantity Editor */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              1. Delivery Items &amp; Quantity (Liters / Kg)
            </label>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs block truncate">{it.name}</span>
                      <span className="text-[10px] font-bold text-slate-400">/{it.unit}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span>Rate: Rs.</span>
                      <input
                        type="number"
                        value={it.unitPrice}
                        onChange={(e) => handleRateChange(idx, e.target.value)}
                        className="w-16 px-1.5 py-0.5 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(idx, -0.5)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      value={it.quantity}
                      onChange={(e) => handleQtyDirectInput(idx, e.target.value)}
                      className="w-12 text-center text-xs font-bold text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(idx, 0.5)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-16">
                    <span className="text-[10px] text-slate-400 block">Subtotal</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      Rs. {((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)).toLocaleString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    aria-label={`Remove ${it.name}`}
                    className="w-6 h-6 shrink-0 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700"
              >
                <option value="">Add Milk or Dahi</option>
                {addableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>
              <Button type="button" variant="outline" size="sm" onClick={handleAddProduct} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* 2. Total Billed Amount */}
          <div className="bg-linear-to-r from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">
              Total Bill ({totalQtyLiters} L milk):
            </span>
            <span className="text-sm font-black font-mono text-blue-950">
              Rs. {newOrderTotal.toLocaleString()}
            </span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between px-1 text-[11px] text-slate-500">
              <span>Includes delivery fee</span>
              <span>Rs. {deliveryFee.toLocaleString()}</span>
            </div>
          )}

          {/* 3. Doorstep Payment Received (Cash / Online) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                2. Cash / Payment Paid Now
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Online')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    paymentMethod === 'Online'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Online
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCashPaid('0')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer text-center ${
                  parseFloat(cashPaid) === 0
                    ? 'bg-amber-500 text-white border-amber-600 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Full Khata (Rs 0)
              </button>
              <button
                type="button"
                onClick={() => setCashPaid(String(newOrderTotal))}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer text-center ${
                  parseFloat(cashPaid) === newOrderTotal && newOrderTotal > 0
                    ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Full Paid (Rs {newOrderTotal})
              </button>
            </div>

            {/* Paid Amount Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                Rs.
              </span>
              <input
                type="number"
                placeholder="Enter paid amount (e.g. 200)"
                value={cashPaid}
                onChange={(e) => setCashPaid(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 shadow-2xs"
              />
            </div>

            {paymentMethod === 'Online' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <select
                  value={onlineProvider}
                  onChange={(e) => setOnlineProvider(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
                >
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <input
                  type="text"
                  placeholder="TRX ID (optional)"
                  value={onlineTrxId}
                  onChange={(e) => setOnlineTrxId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700"
                />
              </div>
            )}
          </div>

          {/* 4. Live Calculation Box (Clear Khata Result) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Order Bill:</span>
              <span className="font-mono font-bold text-slate-900">Rs. {newOrderTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700">
              <span>Cash / Online Paid:</span>
              <span className="font-mono font-bold">- Rs. {numPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-slate-200 font-bold">
              <span className={remainingKhata > 0 ? 'text-amber-800' : 'text-slate-700'}>
                Remaining on Khata:
              </span>
              <span className={`font-mono ${remainingKhata > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                Rs. {remainingKhata.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={handleConfirmAndDeliver}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm &amp; Mark Delivered</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
