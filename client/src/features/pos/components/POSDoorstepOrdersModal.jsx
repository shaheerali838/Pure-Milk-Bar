import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Bike,
  RefreshCw,
  Search,
  ArrowUpRight,
  X,
  Banknote,
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { usePOSContext } from '@/context/POSContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function MonthlyDeliveryEditor({ delivery, onDelivered }) {
  const { updateDelivery } = useDeliveryContext();
  const { addLedgerEntry, fetchCustomerLedger } = useLedgerContext() || {};
  const { products = [] } = usePOSContext();
  const [items, setItems] = useState([]);
  const [paid, setPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [extraDahiQty, setExtraDahiQty] = useState(0);
  const [saving, setSaving] = useState(false);

  const availableProducts = useMemo(() => (products || []).map((product) => {
    const unit = String(product.unit || product.baseUnit || '').toUpperCase();
    const normalizedUnit = ['L', 'LITER', 'LITRE', 'LTR'].includes(unit) ? 'L' : ['KG', 'KILOGRAM', 'KGS'].includes(unit) ? 'KG' : '';
    return { id: product._id || product.id, name: product.name, unit: normalizedUnit, price: Number(product.sellingPrice ?? product.salePrice ?? product.price ?? product.unitPrice) || 0 };
  }).filter((product) => product.id && product.unit && /milk|dahi|yogurt/i.test(product.name || '')), [products]);

  useEffect(() => {
    const initial = Array.isArray(delivery.items) && delivery.items.length ? delivery.items : [{ name: delivery.itemDescription || 'Fresh Milk', quantity: delivery.qtyLiters || 1, unit: 'L', unitPrice: Number(delivery.amountDue) / (Number(delivery.qtyLiters) || 1) || 0 }];
    setItems(initial.map((item) => ({ ...item, quantity: Number(item.quantity) || 1, unitPrice: Number(item.unitPrice) || 0, unit: ['LITER', 'LITRE'].includes(String(item.unit).toUpperCase()) ? 'L' : item.unit || 'L' })));
    setPaid(String(Number(delivery.amountPaid) || 0));
    setExtraDahiQty(0);
  }, [delivery]);

  const dahiProduct = availableProducts.find((product) => /dahi|yogurt/i.test(product.name || ''));
  const extraDahiTotal = extraDahiQty * (dahiProduct?.price || 0);
  const productTotal = items.reduce((total, item) => total + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const deliveryFee = Number(delivery.deliveryFee) || 0;
  const billTotal = productTotal + extraDahiTotal + deliveryFee;
  const paidAmount = Math.max(0, Math.min(billTotal, Number(paid) || 0));
  const khataDue = Math.max(0, billTotal - paidAmount);

  const updateItem = (index, field, value) => setItems((previous) => previous.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const addProduct = () => {
    const product = availableProducts.find((item) => String(item.id) === String(selectedProductId));
    if (!product) return toast.error('Select Milk or Dahi');
    setItems((previous) => [...previous, { name: product.name, quantity: 1, unit: product.unit, unitPrice: product.price }]);
    setSelectedProductId('');
  };

  const deliver = async () => {
    if (!items.length || billTotal <= 0) return toast.error('Add a valid delivery item first');
    const customerId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
    const paymentMode = paidAmount <= 0 ? 'KHATA' : paidAmount >= billTotal ? paymentMethod : 'SPLIT';
    const deliveryItems = [
      ...items.map((item) => ({ ...item, quantity: Number(item.quantity) || 0, unitPrice: Number(item.unitPrice) || 0, subtotal: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) })),
      ...(extraDahiQty > 0 && dahiProduct ? [{ name: dahiProduct.name, quantity: extraDahiQty, unit: dahiProduct.unit, unitPrice: dahiProduct.price, subtotal: extraDahiTotal }] : []),
    ];
    try {
      setSaving(true);
      await updateDelivery(delivery._id || delivery.id, { status: 'DELIVERED', deliveredAt: new Date().toISOString(), items: deliveryItems, qtyLiters: deliveryItems.filter((item) => item.unit === 'L').reduce((sum, item) => sum + item.quantity, 0), itemDescription: deliveryItems.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(', '), amountPaid: paidAmount, amountDue: khataDue, cashCollected: paymentMethod === 'CASH' ? paidAmount : 0, onlineCollected: paymentMethod === 'ONLINE' ? paidAmount : 0, paymentMode, paymentStatus: khataDue ? (paidAmount ? 'PARTIAL' : 'UNPAID') : 'PAID', codAmountToCollect: 0 });
      if (customerId && typeof addLedgerEntry === 'function') {
        await addLedgerEntry(customerId, { description: `Doorstep Delivery Delivered: ${deliveryItems.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(' + ')}`, debit: billTotal, orderTotal: billTotal, paidAmount, remainingAmount: khataDue, fulfillmentType: 'Doorstep Delivery', paymentMethod, items: deliveryItems, invoiceId: delivery.runCode }, false);
        if (paidAmount > 0) await addLedgerEntry(customerId, { description: `Payment Received on Delivery (#${delivery.runCode || 'DEL'})`, credit: paidAmount, orderTotal: billTotal, paidAmount, remainingAmount: khataDue, fulfillmentType: 'Doorstep Collection', paymentMethod, invoiceId: `${delivery.runCode}-PAY` }, false);
        if (fetchCustomerLedger) fetchCustomerLedger(customerId);
      }
      toast.success('Delivery confirmed and Khata updated');
      onDelivered();
    } catch (error) {
      toast.error(error.message || 'Delivery could not be saved');
    } finally { setSaving(false); }
  };

  return <div className="mt-2 border-t border-slate-200 pt-2 space-y-1.5">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[11px] font-bold text-slate-700">Delivery items</span><span className="text-xs font-bold text-slate-800">Bill: Rs. {billTotal.toLocaleString()}</span></div>
    {items.map((item, index) => <div key={`${item.name}-${index}`} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2">
      <span className="min-w-24 flex-1 text-xs font-bold text-slate-800">{item.name} ({item.unit})</span>
      <input type="number" min="0" step="0.5" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} className="w-16 rounded border border-slate-300 bg-white px-1.5 py-1 text-xs font-bold" />
      <input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(index, 'unitPrice', event.target.value)} className="w-18 rounded border border-slate-300 bg-white px-1.5 py-1 text-xs font-bold" />
      <button type="button" onClick={() => setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-bold text-rose-600">Remove</button>
    </div>)}
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2"><span className="min-w-24 flex-1 text-xs font-bold text-blue-950">Dahi ({dahiProduct?.unit || 'KG'})</span><button type="button" onClick={() => setExtraDahiQty((quantity) => Math.max(0, quantity - 0.5))} className="w-6 h-6 rounded bg-white border border-blue-200 text-blue-800 font-bold">-</button><span className="w-8 text-center text-xs font-bold text-slate-900">{extraDahiQty}</span><button type="button" onClick={() => setExtraDahiQty((quantity) => quantity + 0.5)} className="w-6 h-6 rounded bg-white border border-blue-200 text-blue-800 font-bold">+</button><span className="text-[11px] font-semibold text-blue-700">Rs. {extraDahiTotal.toLocaleString()}</span></div>
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2"><span className="text-xs font-bold text-amber-900">Cash:</span><input type="number" min="0" value={paid} onChange={(event) => setPaid(event.target.value)} className="w-20 rounded border border-amber-300 bg-white px-2 py-1 text-xs font-bold" /><button type="button" onClick={() => setPaid('0')} className="text-xs font-bold text-amber-800">Khata</button><button type="button" onClick={() => setPaid(String(billTotal))} className="text-xs font-bold text-emerald-700">Full Paid</button><button type="button" onClick={() => setPaymentMethod(paymentMethod === 'CASH' ? 'ONLINE' : 'CASH')} className="text-xs font-bold text-blue-700">{paymentMethod === 'CASH' ? 'Cash' : 'Online'}</button><span className="ml-auto text-xs font-bold text-amber-900">Khata: Rs. {khataDue.toLocaleString()}</span></div>
    <div className="flex justify-end"><Button type="button" size="sm" disabled={saving} onClick={deliver} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Confirm Delivered</Button></div>
  </div>;
}

export default function POSDoorstepOrdersModal({ isOpen, onClose, mode = 'all', embedded = false }) {
  const navigate = useNavigate();
  const {
    deliveries = [],
    updateDelivery,
    updateDeliveryStatus,
    refreshDeliveries,
    isLoading = false,
  } = useDeliveryContext();
  const { addLedgerEntry, fetchCustomerLedger } = useLedgerContext() || {};
  const { customers = [] } = useCustomerContext();
  const { products = [] } = usePOSContext();

  const [filterTab, setFilterTab] = useState('PENDING'); // 'PENDING' | 'TODAY' | 'DELIVERED' | 'FAILED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [openFuelByDelivery, setOpenFuelByDelivery] = useState({});

  // Card-specific inline edits state: { [delId]: { qty, rate, cashPaid, isCash } }
  const [cardEdits, setCardEdits] = useState({});

  if (!embedded && !isOpen) return null;

  const todayISO = new Date().toISOString().split('T')[0];

  const isTodayDelivery = (d) => {
    if (!d.date) return false;
    const dateStr = typeof d.date === 'string' ? d.date.split('T')[0] : new Date(d.date).toISOString().split('T')[0];
    return dateStr === todayISO;
  };

  const isDeliveryOnTime = (d) => {
    return (
      d.deliverySubType === 'ontime' ||
      d.source === 'POS_ONE_TIME' ||
      d.deliveryType === 'ONTIME' ||
      d.isOneTime ||
      (!d.customerId && !d.customer?.monthlySubscription)
    );
  };

  // Base list filtered strictly by mode ('ontime' | 'monthly' | 'all')
  const modeFilteredDeliveries = deliveries.filter((d) => {
    if (mode === 'ontime') return isDeliveryOnTime(d);
    if (mode === 'monthly') return !isDeliveryOnTime(d);
    return true;
  });

  // Helper to get active inline values for a specific delivery card
  const getCardValues = (delivery) => {
    const delId = delivery._id || delivery.id;
    if (cardEdits[delId]) {
      return cardEdits[delId];
    }

    const initialQty = Number(delivery.qtyLiters) || (Array.isArray(delivery.items) && delivery.items.length > 0 ? Number(delivery.items[0].quantity) || 1 : 1);
    const initialRate = Array.isArray(delivery.items) && delivery.items.length > 0 && delivery.items[0].unitPrice
      ? Number(delivery.items[0].unitPrice)
      : initialQty > 0 && delivery.amountDue ? Math.round(Number(delivery.amountDue) / initialQty) : 200;

    const ontime = isDeliveryOnTime(delivery);
    const orderTotal = Math.round(initialQty * initialRate);

    let initialCash = Number(delivery.cashCollected) || 0;
    let initialOnline = Number(delivery.onlineCollected) || 0;

    if (ontime) {
      if (initialCash === 0 && initialOnline === 0) {
        if (delivery.paymentMode === 'ONLINE' || delivery.paymentMethod === 'ONLINE') {
          initialOnline = orderTotal;
          initialCash = 0;
        } else {
          // Default COD (full cash to rider)
          initialCash = orderTotal;
          initialOnline = 0;
        }
      }
    } else {
      // Monthly customer - default cash paid is 0 (all on khata) or existing amountPaid
      initialCash = Number(delivery.amountPaid) || 0;
      initialOnline = 0;
    }

    return {
      qty: initialQty,
      rate: initialRate,
      cashPaid: initialCash,
      onlinePaid: initialOnline,
      extraQty: 0,
      fuelLitres: Number(delivery.fuelLitres) || '',
      fuelAmount: Number(delivery.fuelAmount) || '',
      paymentModeType: ontime
        ? (initialOnline > 0 && initialCash > 0 ? 'SPLIT' : initialOnline > 0 ? 'ONLINE' : 'CASH')
        : 'CASH',
    };
  };

  const updateCardValue = (delId, updates) => {
    setCardEdits((prev) => {
      const current = prev[delId] || {};
      return {
        ...prev,
        [delId]: { ...current, ...updates },
      };
    });
  };

  // Direct Inline Deliver Handler (Saves quantity, cash/online paid, and logs to Customer Khata if Monthly)
  const handleConfirmDeliver = async (delivery, forceFullKhata = false) => {
    const delId = delivery._id || delivery.id;
    try {
      setUpdatingId(delId);
      const ontime = isDeliveryOnTime(delivery);
      const cardVals = getCardValues(delivery);
      const currentQty = cardVals.qty !== undefined ? Number(cardVals.qty) : (Number(delivery.qtyLiters) || 1);
      const currentRate = cardVals.rate !== undefined ? Number(cardVals.rate) : 200;
      const primaryItem = (Array.isArray(delivery.items) && delivery.items[0]) || {};
      const primaryName = primaryItem.name || delivery.itemDescription || 'Fresh Milk';
      const primaryUnit = /dahi|yogurt/i.test(primaryName) ? 'KG' : ['KG', 'KILOGRAM', 'KGS'].includes(String(primaryItem.unit || '').toUpperCase()) ? 'KG' : 'L';
      const extraProduct = (products || []).find((product) => {
        const name = String(product.name || '').toLowerCase();
        return /dahi|yogurt/.test(primaryName.toLowerCase())
          ? /milk/.test(name) && !/dahi|yogurt/.test(name)
          : /dahi|yogurt/.test(name);
      });
      const extraUnit = ['KG', 'KILOGRAM', 'KGS'].includes(String(extraProduct?.unit || extraProduct?.baseUnit || '').toUpperCase()) ? 'KG' : 'L';
      const extraQty = Math.max(0, Number(cardVals.extraQty) || 0);
      const extraRate = Number(extraProduct?.sellingPrice ?? extraProduct?.salePrice ?? extraProduct?.price ?? extraProduct?.unitPrice) || 0;
      const orderTotal = Math.max(0, Math.round((currentQty * currentRate) + (extraQty * extraRate)));

      const itemName = primaryName;

      const updatedItems = [
        {
          name: itemName,
          quantity: currentQty,
          unit: primaryUnit,
          unitPrice: currentRate,
          subtotal: orderTotal,
        },
        ...(extraQty > 0 && extraProduct ? [{ name: extraProduct.name, quantity: extraQty, unit: extraUnit, unitPrice: extraRate, subtotal: Math.round(extraQty * extraRate) }] : []),
      ];

      let paidAmt = 0;
      let cashAmt = 0;
      let onlineAmt = 0;
      let dueAmt = 0;
      let finalPaymentMode = 'KHATA';

      if (ontime) {
        // ON-TIME DELIVERY (No Khata: Full Cash, Full Online, or Split)
        cashAmt = Math.max(0, Number(cardVals.cashPaid) || 0);
        onlineAmt = Math.max(0, Number(cardVals.onlinePaid) || 0);
        paidAmt = cashAmt + onlineAmt;
        dueAmt = Math.max(0, orderTotal - paidAmt);

        if (onlineAmt > 0 && cashAmt > 0) {
          finalPaymentMode = 'SPLIT';
        } else if (onlineAmt > 0) {
          finalPaymentMode = 'ONLINE';
        } else {
          finalPaymentMode = 'CASH';
        }
      } else {
        // MONTHLY CUSTOMER (Khata with optional partial cash)
        cashAmt = forceFullKhata ? 0 : Math.min(orderTotal, Math.max(0, Number(cardVals.cashPaid) || 0));
        onlineAmt = 0;
        paidAmt = cashAmt;
        dueAmt = Math.max(0, orderTotal - paidAmt);

        if (paidAmt >= orderTotal && orderTotal > 0) {
          finalPaymentMode = 'CASH';
        } else if (paidAmt > 0) {
          finalPaymentMode = 'SPLIT';
        } else {
          finalPaymentMode = 'KHATA';
        }
      }

      const finalPaymentStatus = dueAmt <= 0 ? 'PAID' : paidAmt > 0 ? 'PARTIAL' : 'UNPAID';
      const fuelLitres = Math.max(0, Number(cardVals.fuelLitres) || 0);
      const fuelAmount = Math.max(0, Number(cardVals.fuelAmount) || 0);

      const payload = {
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString(),
        qtyLiters: updatedItems.filter((item) => item.unit === 'L').reduce((sum, item) => sum + item.quantity, 0),
        items: updatedItems,
        itemDescription: updatedItems.map((item) => `${item.quantity} ${item.unit} ${item.name}`).join(', '),
        amountPaid: paidAmt,
        amountDue: dueAmt,
        paymentMode: finalPaymentMode,
        paymentStatus: finalPaymentStatus,
        codAmountToCollect: 0,
        cashCollected: cashAmt,
        onlineCollected: onlineAmt,
        fuelLitres: fuelLitres || null,
        fuelAmount: fuelAmount || null,
        notes: delivery.notes
          ? `${delivery.notes} · Delivered (${currentQty}L, ${ontime ? `Cash: Rs. ${cashAmt}, Online: Rs. ${onlineAmt}` : `Paid: Rs. ${paidAmt}, Khata: Rs. ${dueAmt}`})`
          : `Delivered (${currentQty}L, ${ontime ? `Cash: Rs. ${cashAmt}, Online: Rs. ${onlineAmt}` : `Paid: Rs. ${paidAmt}, Khata: Rs. ${dueAmt}`})`,
      };

      await updateDelivery(delId, payload);

      // Customer Khata Ledger Sync in Database ONLY for Monthly Customers (Not On-Time)
      const custId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
      if (custId && !ontime && typeof addLedgerEntry === 'function') {
        // 1. Debit Entry for Delivery Order Bill
        await addLedgerEntry(
          custId,
          {
            description: `Doorstep Delivery Delivered: ${currentQty}x ${itemName}`,
            debit: orderTotal,
            credit: 0,
            date: new Date().toISOString().split('T')[0],
            orderTotal: orderTotal,
            paidAmount: paidAmt,
            remainingAmount: dueAmt,
            fulfillmentType: 'Doorstep Delivery',
            paymentMethod: finalPaymentMode === 'KHATA' ? 'Khata Credit' : finalPaymentMode,
            items: updatedItems,
            invoiceId: delivery.receiptNumber || delivery.runCode || undefined,
            notes: `Delivered ${currentQty} Liters. Charged to Khata`,
          },
          false
        );

        // 2. Credit Entry for Cash Paid at Doorstep
        if (paidAmt > 0) {
          await addLedgerEntry(
            custId,
            {
              description: `Payment Received on Delivery (#${delivery.runCode || 'DEL'})`,
              debit: 0,
              credit: paidAmt,
              date: new Date().toISOString().split('T')[0],
              orderTotal: orderTotal,
              paidAmount: paidAmt,
              remainingAmount: dueAmt,
              fulfillmentType: 'Doorstep Collection',
              paymentMethod: 'Cash',
              invoiceId: delivery.receiptNumber || delivery.runCode || undefined,
              notes: `Cash Collected: Rs. ${paidAmt}. Remaining Khata: Rs. ${dueAmt}`,
            },
            false
          );
        }

        if (typeof fetchCustomerLedger === 'function') {
          fetchCustomerLedger(custId);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pure_milk_bar_pos_sale_completed'));
        window.dispatchEvent(new Event('pure_milk_bar_finance_updated'));
        window.dispatchEvent(new Event('pure_milk_bar_deliveries_updated'));
      }

      toast.success(
        ontime
          ? `One-Time Order #${delivery.runCode || ''} Delivered! (Cash: Rs. ${cashAmt} · Online: Rs. ${onlineAmt})`
          : `Order #${delivery.runCode || ''} Marked DELIVERED! (${currentQty}L · Rs. ${paidAmt} Paid · Rs. ${dueAmt} on Khata)`
      );
    } catch (err) {
      console.error('Error in inline deliver:', err);
      toast.error('Failed to deliver order');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus, runCode) => {
    try {
      setUpdatingId(deliveryId);
      await updateDeliveryStatus(deliveryId, newStatus);
      if (newStatus === 'DELIVERED') {
        toast.success(`Order ${runCode || ''} marked as DELIVERED!`);
      } else if (newStatus === 'FAILED') {
        toast.error(`Order ${runCode || ''} marked as FAILED`);
      } else {
        toast.info(`Order ${runCode || ''} status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
      toast.error('Failed to update delivery status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter deliveries based on tab & search
  const filteredDeliveries = modeFilteredDeliveries.filter((d) => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (d.customerName && d.customerName.toLowerCase().includes(term)) ||
      (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(term)) ||
      (d.runCode && d.runCode.toLowerCase().includes(term)) ||
      (d.receiptNumber && d.receiptNumber.toLowerCase().includes(term)) ||
      (d.riderNameSnapshot && d.riderNameSnapshot.toLowerCase().includes(term)) ||
      (d.itemDescription && d.itemDescription.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterTab === 'PENDING') return d.status === 'PENDING';
    if (filterTab === 'TODAY') return isTodayDelivery(d);
    if (filterTab === 'DELIVERED') return d.status === 'DELIVERED';
    if (filterTab === 'FAILED') return d.status === 'FAILED' || d.status === 'SKIPPED';
    return true;
  });

  const pendingCount = modeFilteredDeliveries.filter((d) => d.status === 'PENDING').length;
  const todayCount = modeFilteredDeliveries.filter(isTodayDelivery).length;
  const deliveredCount = modeFilteredDeliveries.filter((d) => d.status === 'DELIVERED').length;
  const failedCount = modeFilteredDeliveries.filter((d) => d.status === 'FAILED' || d.status === 'SKIPPED').length;

  const modalTitle =
    mode === 'ontime'
      ? '⚡ On-Time Doorstep Delivery Orders'
      : mode === 'monthly'
      ? '📅 Monthly Dispatched Delivery Orders'
      : 'Doorstep & Delivery Orders';

  const modalSubtitle =
    mode === 'ontime'
      ? 'Instant one-time doorstep orders & direct cash / online payments'
      : mode === 'monthly'
      ? 'Scheduled monthly customer deliveries with Khata & partial collection'
      : 'Active delivery runs & dispatch management';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <X className="w-3 h-3 text-rose-500" />
            Failed
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className={embedded ? 'w-full animate-in fade-in duration-150' : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150'}>
      <div className={embedded ? 'relative w-full bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col min-h-[calc(100vh-11rem)] overflow-hidden' : 'relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden'}>
        {/* Modal Header (Sleek Dark with Blue Touch) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            {embedded && <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold transition border border-slate-200 shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back</span>
            </button>}
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  {modalTitle}
                </h2>
                {pendingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingCount} Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    0 Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshDeliveries && refreshDeliveries()}
              title="Refresh deliveries data"
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/delivery?tab=drop-points');
              }}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10 cursor-pointer"
            >
              <span>Doorstep Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Pending</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                filterTab === 'PENDING' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('TODAY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'TODAY'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Today's All</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                filterTab === 'TODAY' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {todayCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('DELIVERED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'DELIVERED'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Delivered</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                filterTab === 'DELIVERED' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {deliveredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('FAILED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'FAILED'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Failed / Skipped</span>
              {failedCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  filterTab === 'FAILED' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {failedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filterTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All ({deliveries.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Orders List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {filteredDeliveries.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <Truck className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">
                {filterTab === 'PENDING' ? 'No pending deliveries' : 'No orders found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No records matching the selected view.
              </p>
            </div>
          ) : (
            filteredDeliveries.map((delivery) => {
              const delId = delivery._id || delivery.id;
              const isOntime = isDeliveryOnTime(delivery);

              const isPending = delivery.status === 'PENDING';
              const isUpdating = updatingId === delId;

              const cardVals = getCardValues(delivery);
              const liveQty = cardVals.qty !== undefined ? Number(cardVals.qty) : (Number(delivery.qtyLiters) || 1);
              const liveRate = cardVals.rate !== undefined ? Number(cardVals.rate) : 200;
              const primaryProductName = delivery.items?.[0]?.name || delivery.itemDescription || 'Fresh Milk';
              const primaryUnit = /dahi|yogurt/i.test(primaryProductName) ? 'KG' : ['KG', 'KILOGRAM', 'KGS'].includes(String(delivery.items?.[0]?.unit || '').toUpperCase()) ? 'KG' : 'L';
              const extraProduct = !isOntime && (products || []).find((product) => {
                const name = String(product.name || '').toLowerCase();
                return /dahi|yogurt/.test(primaryProductName.toLowerCase())
                  ? /milk/.test(name) && !/dahi|yogurt/.test(name)
                  : /dahi|yogurt/.test(name);
              });
              const extraProductName = extraProduct?.name || (/dahi|yogurt/.test(primaryProductName.toLowerCase()) ? 'Milk' : 'Dahi');
              const extraUnit = ['KG', 'KILOGRAM', 'KGS'].includes(String(extraProduct?.unit || extraProduct?.baseUnit || '').toUpperCase()) ? 'KG' : 'L';
              const extraRate = Number(extraProduct?.sellingPrice ?? extraProduct?.salePrice ?? extraProduct?.price ?? extraProduct?.unitPrice) || 0;
              const liveExtraQty = Number(cardVals.extraQty) || 0;
              const liveExtraTotal = Math.round(liveExtraQty * extraRate);
              const liveOrderTotal = Math.round((liveQty * liveRate) + liveExtraTotal);

              const liveCashPaid = cardVals.cashPaid !== undefined ? Number(cardVals.cashPaid) || 0 : 0;
              const liveOnlinePaid = cardVals.onlinePaid !== undefined ? Number(cardVals.onlinePaid) || 0 : 0;
              const livePaid = Math.min(liveOrderTotal, Math.max(0, liveCashPaid));
              const liveKhataDue = Math.max(0, liveOrderTotal - livePaid);
              const liveOntimeTotalPaid = liveCashPaid + liveOnlinePaid;
              const isFuelOpen = Boolean(openFuelByDelivery[delId]);
              const deliveryCustomerId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
              const currentCustomer = (customers || []).find((customer) => String(customer._id || customer.id) === String(deliveryCustomerId));
              const currentKhataBalance = Number(
                currentCustomer?.currentBalance ?? currentCustomer?.khataBalance ?? delivery.customerId?.currentBalance ?? delivery.customerId?.khataBalance ?? 0
              ) || 0;

              const cardStyle =
                isPending
                  ? isOntime
                    ? 'bg-linear-to-r from-blue-50/40 via-white to-white border-blue-200 hover:border-blue-300 border-l-4 border-l-blue-500'
                    : 'bg-linear-to-r from-amber-50/40 via-white to-white border-amber-200 hover:border-amber-300 border-l-4 border-l-amber-500'
                  : delivery.status === 'DELIVERED'
                  ? 'bg-linear-to-r from-emerald-50/40 via-white to-white border-emerald-200 hover:border-emerald-300 border-l-4 border-l-emerald-500'
                  : delivery.status === 'FAILED'
                  ? 'bg-linear-to-r from-rose-50/40 via-white to-white border-rose-200 hover:border-rose-300 border-l-4 border-l-rose-500'
                  : 'bg-white border-slate-200 border-l-4 border-l-slate-300';

              return (
                <div
                  key={delId}
                  className={`rounded-xl border overflow-hidden shadow-2xs ${cardStyle}`}
                >
                  {/* Card Header */}
                  <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {delivery.runCode || 'DEL-ORDER'}
                      </span>
                      {delivery.receiptNumber && (
                        <span className="text-[10px] font-mono text-slate-400">
                          #{delivery.receiptNumber}
                        </span>
                      )}
                      {isOntime ? (
                        <span className="text-[10px] bg-blue-100/90 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300/60">
                          ⚡ On-Time Order (No Khata)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100/80 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300/60">
                          Monthly Customer (Khata)
                        </span>
                      )}
                      {getStatusBadge(delivery.status)}
                    </div>

                    {/* Rider info */}
                    <div className="flex items-center gap-1.5 text-xs bg-indigo-50/80 text-indigo-900 border border-indigo-200/70 px-2 py-0.5 rounded-md">
                      <Bike className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-indigo-600 text-[11px] font-medium">Rider:</span>
                      <span className="font-bold text-indigo-900">
                        {delivery.riderNameSnapshot || (delivery.riderId?.name) || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body with Direct Inline Editing for Pending Orders */}
                  <div className="p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                    {/* 1. Customer & Address Details */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-bold text-slate-900 text-xs">
                          {delivery.customerName || (isOntime ? 'One-Time Customer' : 'Customer')}
                        </span>
                      </div>

                      {delivery.customerPhone && (
                        <div className="text-[10px] text-emerald-700 font-mono inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span>{delivery.customerPhone}</span>
                        </div>
                      )}

                      {!isOntime && (
                        <div className="text-[10px] font-bold text-amber-800 inline-flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70">
                          <Wallet className="w-2.5 h-2.5" />
                          Current Khata: Rs. {currentKhataBalance.toLocaleString()}
                        </div>
                      )}

                      {delivery.deliveryAddress && (
                        <div className="flex items-start gap-1 text-[11px] text-slate-600">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {delivery.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Items & Quantity Controls (Directly Editable on Card!) */}
                    <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className="min-w-0 border border-slate-200 bg-slate-50 p-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">
                          {primaryProductName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          @ Rs. {liveRate}/{primaryUnit}
                        </span>
                      </div>

                      {isPending ? (
                        <div className="flex items-center justify-between gap-2">
                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                const nextQty = Math.max(0.5, Number((liveQty - 0.5).toFixed(1)));
                                const nextTotal = Math.round(nextQty * liveRate);
                                const updates = { qty: nextQty };
                                if (isOntime) {
                                  if (liveCashPaid > 0 && liveOnlinePaid === 0) updates.cashPaid = nextTotal;
                                  else if (liveOnlinePaid > 0 && liveCashPaid === 0) updates.onlinePaid = nextTotal;
                                }
                                updateCardValue(delId, updates);
                              }}
                              className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={cardVals.qty !== undefined ? cardVals.qty : liveQty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextQty = e.target.value === '' ? '' : isNaN(val) ? 1 : Math.max(0.5, val);
                                const nextTotal = typeof nextQty === 'number' ? Math.round(nextQty * liveRate) : liveOrderTotal;
                                const updates = { qty: nextQty };
                                if (isOntime && typeof nextQty === 'number') {
                                  if (liveCashPaid > 0 && liveOnlinePaid === 0) updates.cashPaid = nextTotal;
                                  else if (liveOnlinePaid > 0 && liveCashPaid === 0) updates.onlinePaid = nextTotal;
                                }
                                updateCardValue(delId, updates);
                              }}
                              className="w-10 text-center font-bold text-slate-900 text-xs outline-none bg-transparent"
                            />
                            <span className="text-[10px] text-slate-400 font-semibold pr-1">{primaryUnit}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextQty = Number((liveQty + 0.5).toFixed(1));
                                const nextTotal = Math.round(nextQty * liveRate);
                                const updates = { qty: nextQty };
                                if (isOntime) {
                                  if (liveCashPaid > 0 && liveOnlinePaid === 0) updates.cashPaid = nextTotal;
                                  else if (liveOnlinePaid > 0 && liveCashPaid === 0) updates.onlinePaid = nextTotal;
                                }
                                updateCardValue(delId, updates);
                              }}
                              className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Calculated Total Bill */}
                          <div className="text-right whitespace-nowrap">
                            <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                            <span className="font-mono font-bold text-blue-900 text-xs">
                              Rs. {Math.round(liveQty * liveRate).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">{delivery.qtyLiters || 1} Liters</span>
                          <span className="font-mono font-bold text-slate-900">
                            Rs. {Number(delivery.amountDue || delivery.codAmountToCollect || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                      </div>
                      {!isOntime && isPending && (
                        <div className="min-w-0 border border-slate-200 bg-slate-50 p-2 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                            <span className="text-[11px] font-bold text-slate-700">{extraProductName}</span>
                            <span className="text-[10px] text-slate-500">@ Rs. {extraRate}/{extraUnit}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5">
                              <button type="button" onClick={() => updateCardValue(delId, { extraQty: Math.max(0, Number((liveExtraQty - 0.5).toFixed(2))) })} className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                              <span className="w-8 text-center text-xs font-bold text-slate-900">{liveExtraQty}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{extraUnit}</span>
                              <button type="button" onClick={() => updateCardValue(delId, { extraQty: Number((liveExtraQty + 0.5).toFixed(2)) })} className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                            </div>
                            <span className="text-xs font-mono font-bold text-blue-900 whitespace-nowrap">Rs. {liveExtraTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Payment Received & Action Buttons */}
                    <div className="md:col-span-4 space-y-2">
                      {isPending ? (
                        <>
                          {isOntime ? (
                            /* ON-TIME DELIVERY PAYMENT UI (No Khata: Cash, Online, Split) */
                            <div className="space-y-1.5 bg-blue-50/60 p-2 rounded-lg border border-blue-200/80">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-blue-950 uppercase tracking-tight">
                                  Payment Mode:
                                </span>
                                {/* Quick Pill Presets */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCardValue(delId, {
                                        cashPaid: liveOrderTotal,
                                        onlinePaid: 0,
                                      })
                                    }
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                      liveCashPaid === liveOrderTotal && liveOnlinePaid === 0
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                  >
                                    Cash
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCardValue(delId, {
                                        cashPaid: 0,
                                        onlinePaid: liveOrderTotal,
                                      })
                                    }
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                      liveOnlinePaid === liveOrderTotal && liveCashPaid === 0
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-50'
                                    }`}
                                  >
                                    Online
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const half = Math.floor(liveOrderTotal / 2);
                                      updateCardValue(delId, {
                                        cashPaid: half,
                                        onlinePaid: liveOrderTotal - half,
                                      });
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                                      liveCashPaid > 0 && liveOnlinePaid > 0
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                        : 'bg-white text-purple-800 border-purple-300 hover:bg-purple-50'
                                    }`}
                                  >
                                    Split 50/50
                                  </button>
                                </div>
                              </div>

                              {/* Dual Exact Inputs */}
                              <div className="grid grid-cols-2 gap-1.5">
                                <div className="bg-white px-1.5 py-1 rounded border border-emerald-200 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-emerald-700">Cash:</span>
                                  <div className="flex items-center gap-0.5">
                                    <span className="text-[9px] text-slate-400">Rs.</span>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      value={cardVals.cashPaid !== undefined ? cardVals.cashPaid : 0}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        updateCardValue(delId, {
                                          cashPaid: e.target.value === '' ? '' : isNaN(val) ? 0 : Math.max(0, val),
                                        });
                                      }}
                                      className="w-12 px-1 py-0.5 font-bold text-xs text-slate-800 text-right outline-none bg-slate-50 rounded focus:bg-white"
                                    />
                                  </div>
                                </div>

                                <div className="bg-white px-1.5 py-1 rounded border border-blue-200 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-blue-700">Online:</span>
                                  <div className="flex items-center gap-0.5">
                                    <span className="text-[9px] text-slate-400">Rs.</span>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      value={cardVals.onlinePaid !== undefined ? cardVals.onlinePaid : 0}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        updateCardValue(delId, {
                                          onlinePaid: e.target.value === '' ? '' : isNaN(val) ? 0 : Math.max(0, val),
                                        });
                                      }}
                                      className="w-12 px-1 py-0.5 font-bold text-xs text-slate-800 text-right outline-none bg-slate-50 rounded focus:bg-white"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* On-Time Summary Bar */}
                              <div className="flex items-center justify-between text-[10px] pt-0.5">
                                <span className="text-slate-600 font-medium">
                                  Collected: <strong className="text-slate-900 font-bold">Rs. {liveOntimeTotalPaid.toLocaleString()}</strong>
                                </span>
                                {liveOntimeTotalPaid >= liveOrderTotal ? (
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    ✓ Fully Paid
                                  </span>
                                ) : (
                                  <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                    Short: Rs. {(liveOrderTotal - liveOntimeTotalPaid).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* MONTHLY CUSTOMER KHATA UI */
                            <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500">Cash: Rs.</span>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={cardVals.cashPaid !== undefined ? cardVals.cashPaid : 0}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    updateCardValue(delId, {
                                      cashPaid: e.target.value === '' ? '' : isNaN(val) ? 0 : Math.max(0, val),
                                    });
                                  }}
                                  className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800 text-center outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                                  Baqi Khata:
                                </span>
                                <span className="font-mono font-bold text-xs text-amber-800">
                                  Rs. {liveKhataDue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5">
                            {!isFuelOpen ? (
                              <button
                                type="button"
                                onClick={() => setOpenFuelByDelivery((previous) => ({ ...previous, [delId]: true }))}
                                className="h-7 px-2 text-[11px] font-semibold text-slate-600 border border-slate-200 bg-white"
                              >
                                + Fuel
                              </button>
                            ) : (
                              <>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Fuel L"
                                  value={cardVals.fuelLitres ?? ''}
                                  onChange={(event) => updateCardValue(delId, { fuelLitres: event.target.value })}
                                  className="h-7 w-20 border border-slate-300 px-2 text-[11px]"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Amount Rs."
                                  value={cardVals.fuelAmount ?? ''}
                                  onChange={(event) => updateCardValue(delId, { fuelAmount: event.target.value })}
                                  className="h-7 w-24 border border-slate-300 px-2 text-[11px]"
                                />
                                <button
                                  type="button"
                                  aria-label="Clear fuel fields"
                                  onClick={() => {
                                    updateCardValue(delId, { fuelLitres: '', fuelAmount: '' });
                                    setOpenFuelByDelivery((previous) => ({ ...previous, [delId]: false }));
                                  }}
                                  className="h-7 w-7 border border-slate-300 bg-white text-xs font-bold text-slate-500"
                                >
                                  x
                                </button>
                              </>
                            )}
                          </div>

                          {/* Action Buttons Directly on Card */}
                          <div className="flex flex-wrap items-center gap-1.5 justify-end pt-1">
                            {/* Primary Button: Deliver */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleConfirmDeliver(delivery, false)}
                              title="Confirm this delivery"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {isOntime && liveOnlinePaid > 0 && liveCashPaid > 0
                                  ? `Deliver (Cash: ${liveCashPaid} + Online: ${liveOnlinePaid})`
                                  : isOntime && liveOnlinePaid > 0
                                  ? `Deliver (Rs. ${liveOnlinePaid} Online)`
                                  : isOntime ? `Deliver (Rs. ${liveCashPaid} Cash)` : 'Confirm Delivered'}
                              </span>
                            </button>

                            {/* Mark Failed */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(delId, 'FAILED', delivery.runCode)}
                              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <X className="w-3 h-3 text-rose-500" />
                              <span>Failed</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* For Already Delivered Orders */
                        <div className="flex flex-col items-end space-y-1.5">
                          <div className="text-right">
                            {isOntime ? (
                              <div className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg inline-block text-[11px] font-bold text-emerald-800">
                                Paid: Rs. {Number(delivery.amountPaid || delivery.cashCollected || 0).toLocaleString()}{' '}
                                {delivery.paymentMode ? `(${delivery.paymentMode})` : ''}
                              </div>
                            ) : Number(delivery.amountDue) > 0 ? (
                              <div className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg inline-block text-[11px] font-bold text-amber-800">
                                Khata Due: Rs. {Number(delivery.amountDue).toLocaleString()}
                              </div>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg inline-block text-[11px] font-bold text-emerald-800">
                                Paid: Rs. {Number(delivery.amountPaid).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(delId, 'PENDING', delivery.runCode)}
                            title="Revert back to Pending"
                            className="text-[11px] font-semibold text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 transition cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Revert</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Total Today: <strong className="text-slate-800">{todayCount}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Pending: <strong className="text-amber-700 font-bold">{pendingCount}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Delivered: <strong className="text-emerald-700 font-bold">{deliveredCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/delivery?tab=drop-points');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition"
            >
              <span>Doorstep Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

