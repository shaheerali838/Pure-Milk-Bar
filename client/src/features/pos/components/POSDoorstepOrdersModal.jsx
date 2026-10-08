import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Bike,
  RefreshCw,
  Search,
  ArrowUpRight,
  X,
  RotateCcw,
  Plus,
  Minus,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { useCustomerContext } from '@/context/CustomerContext';

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

  const [filterTab, setFilterTab] = useState('PENDING'); // 'PENDING' | 'TODAY' | 'DELIVERED' | 'FAILED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [openFuelByDelivery, setOpenFuelByDelivery] = useState({});

  // Card-specific inline edits state: { [delId]: { items, deliveryFee, cashPaid, onlinePaid, fuelLitres, fuelAmount } }
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

  const STANDARD_PRODUCTS = [
    { key: 'buffalo', name: 'Buffalo Milk', shortName: 'Buffalo', unit: 'L', defaultPrice: 220, match: /buffalo|bhains|fresh milk|pure milk|^milk$/i },
    { key: 'cow', name: 'Fresh Milk Cow', shortName: 'Cow Milk', unit: 'L', defaultPrice: 200, match: /cow|gai/i },
    { key: 'dahi', name: 'Dahi', shortName: 'Dahi', unit: 'KG', defaultPrice: 240, match: /dahi|yogurt|curd/i },
  ];

  // Helper to get active inline values for a specific delivery card
  const getCardValues = (delivery) => {
    const delId = delivery._id || delivery.id;

    // Dynamic Multi-Item Parsing: Always map all 3 products (Buffalo Milk, Fresh Milk Cow, Dahi)
    const existingItems = Array.isArray(delivery.items) && delivery.items.length > 0 ? delivery.items : [];
    
    // Also inspect customer's agreement if items are not present
    const deliveryCustomerId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
    const currentCustomer = (customers || []).find((c) => String(c._id || c.id) === String(deliveryCustomerId));
    const isMorning = String(delivery.shift || '').toUpperCase() === 'MORNING';
    const agreementItems = currentCustomer
      ? (isMorning
          ? (currentCustomer.morningItems || currentCustomer.standingOrder?.morningItems || [])
          : (currentCustomer.eveningItems || currentCustomer.standingOrder?.eveningItems || []))
      : [];

    const legacyMilkQty = Number(
      isMorning
        ? (currentCustomer?.morningMilkQty ?? currentCustomer?.standingOrder?.morningMilkQty)
        : (currentCustomer?.eveningMilkQty ?? currentCustomer?.standingOrder?.eveningMilkQty)
    ) || 0;

    const standardItems = STANDARD_PRODUCTS.map((std) => {
      // 1. Check existing delivery items first
      let found = existingItems.find((it) => std.match.test(it.name || ''));

      // 2. Fallback check agreement items
      if (!found && agreementItems.length > 0) {
        found = agreementItems.find((it) => std.match.test(it.name || ''));
      }

      // 3. Fallback check itemDescription
      if (!found && delivery.itemDescription && std.match.test(delivery.itemDescription)) {
        found = {
          name: std.name,
          quantity: Number(delivery.qtyLiters) || (legacyMilkQty > 0 ? legacyMilkQty : 1),
          unit: std.unit,
          unitPrice: std.defaultPrice,
        };
      }

      // 4. Fallback for Buffalo Milk if customer has legacy milk quantity or delivery qtyLiters
      if (!found && std.key === 'buffalo') {
        if (legacyMilkQty > 0) {
          found = {
            name: std.name,
            quantity: legacyMilkQty,
            unit: 'L',
            unitPrice: Number(currentCustomer?.milkRate || currentCustomer?.customRate) || std.defaultPrice,
          };
        } else if (Number(delivery.qtyLiters) > 0) {
          found = {
            name: std.name,
            quantity: Number(delivery.qtyLiters),
            unit: 'L',
            unitPrice: std.defaultPrice,
          };
        }
      }

      if (found) {
        const qty = Number(found.quantity !== undefined ? found.quantity : found.qty) || 0;
        const price = Number(found.unitPrice !== undefined ? found.unitPrice : found.price) || std.defaultPrice;
        const unit = found.unit || std.unit;
        return {
          name: std.name,
          shortName: std.shortName,
          quantity: qty,
          unit: unit,
          unitPrice: price,
          subtotal: Math.round(qty * price),
        };
      }

      // Default: Not ordered in agreement -> 0 quantity
      return {
        name: std.name,
        shortName: std.shortName,
        quantity: 0,
        unit: std.unit,
        unitPrice: std.defaultPrice,
        subtotal: 0,
      };
    });

    // Append any extra non-standard items
    const extraCustomItems = existingItems
      .filter((it) => !STANDARD_PRODUCTS.some((std) => std.match.test(it.name || '')))
      .map((it) => ({
        name: it.name || 'Custom Item',
        shortName: it.name || 'Item',
        quantity: Number(it.quantity || it.qty) || 1,
        unit: it.unit || 'Pcs',
        unitPrice: Number(it.unitPrice || it.price) || 0,
        subtotal: Math.round((Number(it.quantity || it.qty) || 1) * (Number(it.unitPrice || it.price) || 0)),
      }));

    const initialItems = [...standardItems, ...extraCustomItems];

    const deliveryFee = delivery.deliveryFee !== null && delivery.deliveryFee !== undefined && delivery.deliveryFee !== ''
      ? Number(delivery.deliveryFee)
      : 0;

    const itemsTotal = initialItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const orderTotal = Math.round(itemsTotal + deliveryFee);

    const ontime = isDeliveryOnTime(delivery);
    let initialCash = Number(delivery.cashCollected) || 0;
    let initialOnline = Number(delivery.onlineCollected) || 0;

    if (ontime) {
      if (initialCash === 0 && initialOnline === 0) {
        if (delivery.paymentMode === 'ONLINE' || delivery.paymentMethod === 'ONLINE') {
          initialOnline = orderTotal;
          initialCash = 0;
        } else {
          initialCash = orderTotal;
          initialOnline = 0;
        }
      }
    } else {
      initialCash = Number(delivery.amountPaid) || 0;
      initialOnline = 0;
    }

    const defaultValues = {
      items: initialItems,
      deliveryFee: deliveryFee,
      cashPaid: initialCash,
      onlinePaid: initialOnline,
      fuelLitres: Number(delivery.fuelLitres) || '',
      fuelAmount: Number(delivery.fuelAmount) || '',
      paymentModeType: ontime
        ? (initialOnline > 0 && initialCash > 0 ? 'SPLIT' : initialOnline > 0 ? 'ONLINE' : 'CASH')
        : 'CASH',
    };

    const savedEdits = cardEdits[delId] || {};
    const finalItems = Array.isArray(savedEdits.items) && savedEdits.items.length > 0
      ? savedEdits.items
      : initialItems;

    return {
      ...defaultValues,
      ...savedEdits,
      items: finalItems,
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

  const updateItemQty = (delivery, itemIndex, newQty) => {
    const delId = delivery._id || delivery.id;
    const cardVals = getCardValues(delivery);
    const currentItems = cardVals.items || [];
    
    const updatedItems = currentItems.map((it, idx) => {
      if (idx !== itemIndex) return it;
      const qty = typeof newQty === 'number' ? Math.max(0, newQty) : newQty;
      const rate = Number(it.unitPrice) || 0;
      const subtotal = typeof qty === 'number' ? Math.round(qty * rate) : it.subtotal;
      return { ...it, quantity: qty, subtotal };
    });

    const ontime = isDeliveryOnTime(delivery);
    const itemsTotal = updatedItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const orderTotal = Math.round(itemsTotal + (Number(cardVals.deliveryFee) || 0));

    const updates = { items: updatedItems };
    if (ontime) {
      if (cardVals.cashPaid > 0 && cardVals.onlinePaid === 0) updates.cashPaid = orderTotal;
      else if (cardVals.onlinePaid > 0 && cardVals.cashPaid === 0) updates.onlinePaid = orderTotal;
    }
    updateCardValue(delId, updates);
  };

  // Direct Inline Deliver Handler (Saves all items, handles fee, logs to Customer Khata if Monthly)
  const handleConfirmDeliver = async (delivery, forceFullKhata = false) => {
    const delId = delivery._id || delivery.id;
    if (updatingId === delId || delivery.status === 'DELIVERED') return;

    try {
      setUpdatingId(delId);
      const ontime = isDeliveryOnTime(delivery);
      const cardVals = getCardValues(delivery);

      const liveItems = (cardVals.items && cardVals.items.length > 0 ? cardVals.items : []).map((it) => {
        const qty = Number(it.quantity) || 0;
        const rate = Number(it.unitPrice) || 0;
        return {
          name: it.name || 'Item',
          quantity: qty,
          unit: it.unit || 'L',
          unitPrice: rate,
          subtotal: Math.round(qty * rate),
        };
      });

      const deliveryFeeVal = Number(cardVals.deliveryFee) || (Number(delivery.deliveryFee) || 0);
      const itemsTotal = liveItems.reduce((acc, it) => acc + it.subtotal, 0);
      const orderTotal = Math.max(0, Math.round(itemsTotal + deliveryFeeVal));

      const totalLiters = liveItems
        .filter((it) => String(it.unit).toUpperCase() === 'L')
        .reduce((acc, it) => acc + it.quantity, 0);

      const itemDescription = [
        ...liveItems.map((it) => `${it.quantity} ${it.unit} ${it.name}`),
        ...(deliveryFeeVal > 0 ? [`Fee: Rs. ${deliveryFeeVal}`] : []),
      ].join(' + ');

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
        qtyLiters: totalLiters,
        items: liveItems,
        deliveryFee: deliveryFeeVal > 0 ? deliveryFeeVal : null,
        itemDescription: itemDescription || 'Delivered',
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
          ? `${delivery.notes} · Delivered (${itemDescription})`
          : `Delivered (${itemDescription})`,
      };

      await updateDelivery(delId, payload);

      // Customer Khata Ledger Sync in Database ONLY for Monthly Customers (Not On-Time)
      const custId = delivery.customerId?._id || delivery.customerId?.id || delivery.customerId;
      if (custId && !ontime && typeof addLedgerEntry === 'function') {
        // 1. Debit Entry for Delivery Order Bill
        await addLedgerEntry(
          custId,
          {
            description: `Doorstep Delivery Delivered: ${itemDescription}`,
            debit: orderTotal,
            credit: 0,
            date: new Date().toISOString().split('T')[0],
            orderTotal: orderTotal,
            paidAmount: paidAmt,
            remainingAmount: dueAmt,
            fulfillmentType: 'Doorstep Delivery',
            paymentMethod: finalPaymentMode === 'KHATA' ? 'Khata Credit' : finalPaymentMode,
            items: liveItems,
            invoiceId: delivery.receiptNumber || delivery.runCode || undefined,
            notes: `Doorstep Delivered (${itemDescription}). Charged to Khata`,
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
          : `Order #${delivery.runCode || ''} Marked DELIVERED! (Total: Rs. ${orderTotal} · Rs. ${paidAmt} Paid · Rs. ${dueAmt} Khata)`
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <X className="w-2.5 h-2.5 text-rose-500" />
            Failed
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className={embedded ? 'w-full animate-in fade-in duration-150' : 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150'}>
      <div className={embedded ? 'relative w-full bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col min-h-[calc(100vh-11rem)] overflow-hidden' : 'relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden'}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            {embedded && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-slate-800 text-xs font-bold transition border border-slate-200 shadow-xs cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 rotate-180" />
                <span>Back</span>
              </button>
            )}
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">
                {modalTitle}
              </h2>
              {pendingCount > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingCount} Pending
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  0 Pending
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => refreshDeliveries && refreshDeliveries()}
              title="Refresh deliveries data"
              disabled={isLoading}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/delivery?tab=drop-points');
              }}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10 cursor-pointer"
            >
              <span>Doorstep Hub</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTab('PENDING')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Pending</span>
              <span className={`px-1 rounded text-[10px] font-bold ${filterTab === 'PENDING' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('TODAY')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterTab === 'TODAY'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Today's</span>
              <span className={`px-1 rounded text-[10px] font-bold ${filterTab === 'TODAY' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {todayCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('DELIVERED')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterTab === 'DELIVERED'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Delivered</span>
              <span className={`px-1 rounded text-[10px] font-bold ${filterTab === 'DELIVERED' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {deliveredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('FAILED')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterTab === 'FAILED'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Failed</span>
              {failedCount > 0 && (
                <span className={`px-1 rounded text-[10px] font-bold ${filterTab === 'FAILED' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
                  {failedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filterTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All ({deliveries.length})
            </button>
          </div>

          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
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
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-slate-50">
          {filteredDeliveries.length === 0 ? (
            <div className="py-10 text-center bg-white rounded-xl border border-slate-200 p-4 space-y-1.5">
              <Truck className="w-7 h-7 text-slate-400 mx-auto" />
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
              const liveItems = cardVals.items || [];
              const deliveryFeeVal = Number(cardVals.deliveryFee) || 0;
              const itemsTotal = liveItems.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
              const liveOrderTotal = Math.max(0, Math.round(itemsTotal + deliveryFeeVal));

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
                    ? 'bg-white border-slate-200 hover:border-slate-300 border-l-4 border-l-slate-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 border-l-4 border-l-emerald-600'
                  : delivery.status === 'DELIVERED'
                    ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300 border-l-4 border-l-emerald-600'
                    : delivery.status === 'FAILED'
                      ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300 border-l-4 border-l-rose-500'
                      : 'bg-white border-slate-200 border-l-4 border-l-slate-400';

              return (
                <div
                  key={delId}
                  className={`rounded-lg border overflow-hidden shadow-2xs ${cardStyle}`}
                >
                  {/* Card Header (Ultra Compact Corporate Styling) */}
                  <div className="px-3 py-1 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-800 font-mono">
                        {delivery.runCode || 'DEL-ORDER'}
                      </span>
                      {delivery.shift && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-slate-100 text-slate-700 border-slate-200">
                          {delivery.shift}
                        </span>
                      )}
                      {delivery.receiptNumber && (
                        <span className="text-[9px] font-mono text-slate-400">
                          #{delivery.receiptNumber}
                        </span>
                      )}
                      {isOntime ? (
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-300">
                          ⚡ On-Time
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                          Monthly Khata
                        </span>
                      )}
                      {getStatusBadge(delivery.status)}
                    </div>

                    {/* Rider info */}
                    <div className="flex items-center gap-1 text-[10px] bg-white text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded">
                      <Bike className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-400 text-[10px]">Rider:</span>
                      <span className="font-bold text-slate-800">
                        {delivery.riderNameSnapshot || delivery.riderId?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Streamlined 3-Column Layout (3 + 6 + 3 = 12) */}
                  <div className="p-2.5 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center text-xs">
                    {/* 1. Customer & Address Details */}
                    <div className="md:col-span-3 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {delivery.customerName || (isOntime ? 'One-Time Customer' : 'Customer')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {delivery.customerPhone && (
                          <div className="text-[10px] text-slate-700 font-mono inline-flex items-center gap-0.5 bg-slate-50 px-1 py-0.2 rounded border border-slate-200">
                            <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            <span>{delivery.customerPhone}</span>
                          </div>
                        )}

                        {!isOntime && (
                          <div className="text-[10px] font-bold text-slate-800 inline-flex items-center gap-0.5 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                            <Wallet className="w-2.5 h-2.5 text-slate-500" />
                            <span>Khata: Rs. {currentKhataBalance.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {delivery.deliveryAddress && (
                        <div className="flex items-start gap-1 text-[10px] text-slate-600">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {delivery.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. All 3 Standard Products Streamlined in a Horizontal Row */}
                    <div className="md:col-span-6 space-y-1">
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50/80 p-1.5 rounded-lg border border-slate-200">
                        {liveItems.map((item, idx) => {
                          const itemQty = item.quantity !== undefined ? item.quantity : 0;
                          const itemRate = Number(item.unitPrice) || 0;
                          const itemSubtotal = Math.round(itemQty * itemRate);
                          const isDahi = /dahi|yogurt/i.test(item.name);
                          const stepVal = isDahi ? 0.5 : 1;
                          const unitLabel = item.unit || (isDahi ? 'KG' : 'L');

                          let shortName = item.name;
                          if (/buffalo/i.test(item.name)) shortName = 'Buffalo';
                          else if (/cow/i.test(item.name)) shortName = 'Cow Milk';
                          else if (/dahi/i.test(item.name)) shortName = 'Dahi';

                          return (
                            <div
                              key={`${item.name}-${idx}`}
                              className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-md border transition-all ${
                                itemQty > 0
                                  ? 'bg-white border-slate-300 shadow-2xs'
                                  : 'bg-slate-100/50 border-slate-200/70 opacity-70 hover:opacity-100'
                              }`}
                            >
                              {/* Product Name & Rate */}
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="font-bold text-[11px] text-slate-800 truncate leading-tight" title={item.name}>
                                  {shortName}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono leading-none">
                                  @{itemRate}
                                </span>
                              </div>

                              {/* Stepper + Subtotal (Single Line) */}
                              {isPending ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-0.5 py-0.5 shadow-2xs">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextQty = Math.max(0, Number((itemQty - stepVal).toFixed(1)));
                                        updateItemQty(delivery, idx, nextQty);
                                      }}
                                      className="w-4 h-4 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] cursor-pointer border border-slate-200"
                                    >
                                      <Minus className="w-2 h-2" />
                                    </button>
                                    <input
                                      type="number"
                                      step={stepVal}
                                      min="0"
                                      value={itemQty}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        const nextQty = e.target.value === '' ? '' : isNaN(val) ? 0 : Math.max(0, val);
                                        updateItemQty(delivery, idx, nextQty);
                                      }}
                                      className="w-6 text-center font-bold text-slate-900 text-[11px] outline-none bg-transparent"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextQty = Number((itemQty + stepVal).toFixed(1));
                                        updateItemQty(delivery, idx, nextQty);
                                      }}
                                      className="w-4 h-4 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] cursor-pointer border border-slate-200"
                                    >
                                      <Plus className="w-2 h-2" />
                                    </button>
                                  </div>

                                  <span className={`text-[10px] font-mono font-bold shrink-0 min-w-8 text-right ${itemQty > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                    Rs.{itemSubtotal}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[11px] shrink-0">
                                  <span className="font-semibold text-slate-600 text-[10px]">
                                    {itemQty}{unitLabel}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900">
                                    Rs.{itemSubtotal}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Bar / Delivery Fee */}
                      <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
                        {deliveryFeeVal > 0 ? (
                          <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                            + Delivery Fee: Rs. {deliveryFeeVal}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Standard Doorstep Order
                          </span>
                        )}
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <span className="text-[10px] text-slate-500 uppercase">Bill:</span>
                          <span className="text-xs font-mono font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Rs. {liveOrderTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Payment & Action Buttons */}
                    <div className="md:col-span-3 space-y-1.5">
                      {isPending ? (
                        <>
                          {isOntime ? (
                            /* ON-TIME DELIVERY PAYMENT UI */
                            <div className="space-y-1 bg-slate-50 p-1.5 rounded-md border border-slate-200">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-bold text-slate-700 uppercase">
                                  Pay:
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateCardValue(delId, {
                                        cashPaid: liveOrderTotal,
                                        onlinePaid: 0,
                                      })
                                    }
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border transition cursor-pointer ${
                                      liveCashPaid === liveOrderTotal && liveOnlinePaid === 0
                                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border transition cursor-pointer ${
                                      liveOnlinePaid === liveOrderTotal && liveCashPaid === 0
                                        ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border transition cursor-pointer ${
                                      liveCashPaid > 0 && liveOnlinePaid > 0
                                        ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    50/50
                                  </button>
                                </div>
                              </div>

                              {/* Dual Exact Inputs */}
                              <div className="grid grid-cols-2 gap-1">
                                <div className="bg-white px-1 py-0.5 rounded border border-slate-200 flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-slate-600">Cash:</span>
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
                                    className="w-12 text-right font-bold text-[11px] text-slate-800 outline-none bg-transparent"
                                  />
                                </div>

                                <div className="bg-white px-1 py-0.5 rounded border border-slate-200 flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-slate-600">Online:</span>
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
                                    className="w-12 text-right font-bold text-[11px] text-slate-800 outline-none bg-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* MONTHLY CUSTOMER KHATA UI */
                            <div className="flex items-center justify-between gap-1.5 bg-slate-50 px-2 py-1.5 rounded border border-slate-200">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-600">Cash:</span>
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
                                  className="w-14 px-1 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-bold text-slate-800 text-center outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-bold text-slate-500 uppercase block">
                                  Baqi Khata:
                                </span>
                                <span className="font-mono font-bold text-[11px] text-emerald-800">
                                  Rs. {liveKhataDue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Fuel Option */}
                          <div className="flex items-center gap-1">
                            {!isFuelOpen ? (
                              <button
                                type="button"
                                onClick={() => setOpenFuelByDelivery((previous) => ({ ...previous, [delId]: true }))}
                                className="h-6 px-1.5 text-[10px] font-semibold text-slate-600 border border-slate-200 bg-white rounded hover:bg-slate-50"
                              >
                                + Fuel
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Liters"
                                  value={cardVals.fuelLitres ?? ''}
                                  onChange={(event) => updateCardValue(delId, { fuelLitres: event.target.value })}
                                  className="h-6 w-14 border border-slate-300 px-1 text-[10px] rounded"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Rs."
                                  value={cardVals.fuelAmount ?? ''}
                                  onChange={(event) => updateCardValue(delId, { fuelAmount: event.target.value })}
                                  className="h-6 w-16 border border-slate-300 px-1 text-[10px] rounded"
                                />
                                <button
                                  type="button"
                                  aria-label="Clear fuel fields"
                                  onClick={() => {
                                    updateCardValue(delId, { fuelLitres: '', fuelAmount: '' });
                                    setOpenFuelByDelivery((previous) => ({ ...previous, [delId]: false }));
                                  }}
                                  className="h-6 w-5 border border-slate-300 bg-white text-[10px] font-bold text-slate-500 rounded"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Directly on Card */}
                          <div className="flex items-center gap-1 justify-end pt-0.5">
                            {/* Primary Deliver Button */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleConfirmDeliver(delivery, false)}
                              title="Confirm this delivery"
                              className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {isOntime && liveOnlinePaid > 0 && liveCashPaid > 0
                                  ? `Deliver (${liveCashPaid}+${liveOnlinePaid})`
                                  : isOntime && liveOnlinePaid > 0
                                    ? `Deliver (Rs. ${liveOnlinePaid})`
                                    : isOntime ? `Deliver (Rs. ${liveCashPaid})` : 'Confirm Delivered'}
                              </span>
                            </button>

                            {/* Mark Failed */}
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(delId, 'FAILED', delivery.runCode)}
                              className="px-1.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-0.5"
                            >
                              <X className="w-3 h-3 text-slate-500" />
                              <span>Failed</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* For Already Delivered Orders */
                        <div className="flex flex-col items-end space-y-1">
                          <div className="text-right">
                            {isOntime ? (
                              <div className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">
                                Paid: Rs. {Number(delivery.amountPaid || delivery.cashCollected || 0).toLocaleString()}{' '}
                                {delivery.paymentMode ? `(${delivery.paymentMode})` : ''}
                              </div>
                            ) : Number(delivery.amountDue) > 0 ? (
                              <div className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">
                                Khata Due: Rs. {Number(delivery.amountDue).toLocaleString()}
                              </div>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-800">
                                Paid: Rs. {Number(delivery.amountPaid).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(delId, 'PENDING', delivery.runCode)}
                            title="Revert back to Pending"
                            className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 transition cursor-pointer"
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
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span>
              Total: <strong className="text-slate-800">{todayCount}</strong>
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
