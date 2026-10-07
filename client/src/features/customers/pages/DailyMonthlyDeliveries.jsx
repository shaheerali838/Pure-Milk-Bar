import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Droplets,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  Plus,
  Minus,
  Search,
  Calendar,
  Filter,
  Users,
  PackagePlus,
  Trash2,
  Bike,
  MapPin,
  Phone,
  Receipt,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Check,
  ChevronDown,
  Loader2,
  Save,
  CheckSquare,
  Square,
  Edit3,
  History,
  Download,
  Wallet,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { exportTableToCSV } from '@/utils/csvExport';

const getShiftAgreementItems = (customer, shift) => {
  const standing = customer.standingOrder || {};
  const items = shift === 'Morning'
    ? (customer.morningItems || standing.morningItems || [])
    : (customer.eveningItems || standing.eveningItems || []);

  if (items.length > 0) {
    return items
      .filter((item) => Number(item.qty || item.quantity) > 0)
      .map((item) => ({
        name: item.name || 'Product',
        quantity: Number(item.qty || item.quantity) || 0,
        unit: item.unit || 'Pcs',
        unitPrice: Number(item.unitPrice) || 0,
      }));
  }

  const legacyQty = Number(
    shift === 'Morning'
      ? (customer.morningMilkQty ?? standing.morningMilkQty)
      : (customer.eveningMilkQty ?? standing.eveningMilkQty)
  ) || 0;

  return legacyQty > 0
    ? [{
        name: 'Fresh Milk',
        quantity: legacyQty,
        unit: 'L',
        unitPrice: Number(customer.milkRate || customer.customRate) || 0,
      }]
    : [];
};

export default function DailyMonthlyDeliveries() {
  const navigate = useNavigate();
  const { customers = [], isLoading: customersLoading, refreshCustomers } = useCustomerContext();
  const { deliveries = [], addDelivery, deleteDelivery, refreshDeliveries, isLoading: deliveriesLoading } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();

  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [activeShift, setActiveShift] = useState('Morning'); // 'Morning' | 'Evening' | 'All'
  const [searchQuery, setSearchQuery] = useState('');

  // Active delivery staff
  const activeRiders = useMemo(() => {
    return (staffList || []).filter((s) => s.active !== false);
  }, [staffList]);

  // Local state for shift quantities & testing per customer row
  // Structure: { [rowKey]: { qty: string|number, riderId: string, deliveryFee: string|number, extra: { [prodId]: number } } }
  const [shiftEntries, setShiftEntries] = useState({});
  const [processingKeys, setProcessingKeys] = useState({});


  const monthlyPendingCount = useMemo(() => (deliveries || []).filter((delivery) => (
    delivery.status === 'PENDING' &&
    (delivery.deliverySubType === 'monthly' || delivery.source === 'SCHEDULED_ROUTE')
  )).length, [deliveries]);

  // Helper to check if a specific customer + shift is already dispatched for the selected date
  const getDispatchedRecord = (custId, shift) => {
    if (!custId) return null;
    return deliveries.find((d) => {
      const dCustId = d.customerId?._id || d.customerId?.id || (typeof d.customerId === 'string' ? d.customerId : null);
      if (!dCustId) return false;
      const dDate = typeof d.date === 'string' ? d.date.split('T')[0] : (d.date ? new Date(d.date).toISOString().split('T')[0] : '');
      const dShift = (d.shift || 'Morning').toUpperCase();
      return String(dCustId) === String(custId) && dDate === selectedDate && dShift === shift.toUpperCase();
    });
  };

  // Build dispatch schedule rows based on customer standing order (morningMilkQty, eveningMilkQty, standingOrder)
  const dispatchRows = useMemo(() => {
    const rows = [];

    (customers || []).forEach((cust) => {
      const custId = cust.id || cust._id;
      if (!custId) return;
      const standing = cust.standingOrder || {};

      // Customer specific delivery fee (strictly null if not set)
      const custFee = cust.deliveryFee !== undefined && cust.deliveryFee !== null && cust.deliveryFee !== ''
        ? Number(cust.deliveryFee)
        : (standing.deliveryFee !== undefined && standing.deliveryFee !== null && standing.deliveryFee !== '' ? Number(standing.deliveryFee) : null);

      const prefRider = cust.preferredRiderId || standing.preferredRiderId || '';

      // Check if Morning order already delivered/dispatched
      const morningItems = getShiftAgreementItems(cust, 'Morning');
      if (morningItems.length > 0) {
        const primaryItem = morningItems[0];
        rows.push({
          rowKey: `${custId}_MORNING`,
          customerId: custId,
          customer: cust,
          shift: 'Morning',
          defaultQty: primaryItem.quantity,
          rate: primaryItem.unitPrice,
          primaryItem,
          scheduledItems: morningItems,
          deliveryFee: custFee,
          preferredRiderId: prefRider,
          initialLetter: (cust.name || 'C').charAt(0).toUpperCase(),
        });
      }

      // Check if Evening order already delivered/dispatched
      const eveningItems = getShiftAgreementItems(cust, 'Evening');
      if (eveningItems.length > 0) {
        const primaryItem = eveningItems[0];
        rows.push({
          rowKey: `${custId}_EVENING`,
          customerId: custId,
          customer: cust,
          shift: 'Evening',
          defaultQty: primaryItem.quantity,
          rate: primaryItem.unitPrice,
          primaryItem,
          scheduledItems: eveningItems,
          deliveryFee: custFee,
          preferredRiderId: prefRider,
          initialLetter: (cust.name || 'C').charAt(0).toUpperCase(),
        });
      }
    });

    return rows;
  }, [customers, deliveries, selectedDate]);

  // Get current row values
  const getRowValue = (row) => {
    const edit = shiftEntries[row.rowKey];
    const dispatched = row.dispatchedRecord || getDispatchedRecord(row.customerId, row.shift);

    const defaultRider = dispatched?.riderId || row.preferredRiderId || (activeRiders[0]?.id || '');
    const currentQty = edit?.qty !== undefined ? edit.qty : dispatched ? String(dispatched.qtyLiters || row.defaultQty) : String(row.defaultQty);

    const currentFee = edit?.deliveryFee !== undefined
      ? edit.deliveryFee
      : dispatched?.deliveryFee !== undefined && dispatched?.deliveryFee !== null
        ? dispatched.deliveryFee
        : row.deliveryFee;

    return {
      qty: currentQty,
      riderId: edit?.riderId !== undefined ? edit.riderId : defaultRider,
      deliveryFee: currentFee,
      extra: edit?.extra || {},
    };
  };

  const handleRowChange = (rowKey, field, value) => {
    setShiftEntries((prev) => ({
      ...prev,
      [rowKey]: {
        ...(prev[rowKey] || {}),
        [field]: value,
      },
    }));
  };

  const handleExtraProductChange = (rowKey, prodId, val) => {
    setShiftEntries((prev) => {
      const current = prev[rowKey] || {};
      const currentExtra = current.extra || {};
      const parsed = Math.max(0, parseInt(val, 10) || 0);
      return {
        ...prev,
        [rowKey]: {
          ...current,
          extra: {
            ...currentExtra,
            [prodId]: parsed,
          },
        },
      };
    });
  };

  const adjustExtraProductStepper = (rowKey, prodId, delta) => {
    setShiftEntries((prev) => {
      const current = prev[rowKey] || {};
      const currentExtra = current.extra || {};
      const curVal = Number(currentExtra[prodId] || 0);
      const nextVal = Math.max(0, curVal + delta);
      return {
        ...prev,
        [rowKey]: {
          ...current,
          extra: {
            ...currentExtra,
            [prodId]: nextVal,
          },
        },
      };
    });
  };

  // Dispatch single row to MongoDB when Checkbox is ticked
  const handleToggleRowOrder = async (row) => {
    const { customer, shift, rate, rowKey, customerId } = row;
    const dispatchedRec = getDispatchedRecord(customerId, shift);
    const isCurrentlyDispatched = !!dispatchedRec;

    // If already dispatched, unticking removes the pending order (if not delivered)
    if (isCurrentlyDispatched) {
      if (dispatchedRec.status === 'DELIVERED') {
        toast.info(`This order is already marked DELIVERED in Doorstep Deliveries (#${dispatchedRec.runCode || ''})`);
        return;
      }
      try {
        setProcessingKeys((p) => ({ ...p, [rowKey]: true }));
        await deleteDelivery(dispatchedRec._id || dispatchedRec.id);
        toast.info(`Cancelled dispatch for ${customer.name} (${shift})`);
      } catch (err) {
        console.error('Failed to cancel delivery:', err);
        toast.error('Failed to remove delivery');
      } finally {
        setProcessingKeys((p) => ({ ...p, [rowKey]: false }));
      }
      return;
    }

    // If NOT dispatched, place the order
    const rowVals = getRowValue(row);
    const parsedQty = parseFloat(rowVals.qty);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      toast.error('Please enter a valid milk quantity');
      return;
    }

    try {
      setProcessingKeys((p) => ({ ...p, [rowKey]: true }));

      const items = row.scheduledItems.map((item, index) => {
        const quantity = index === 0 ? parsedQty : Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return {
          name: item.name,
          quantity,
          unit: item.unit || 'Pcs',
          unitPrice,
          subtotal: Math.round(quantity * unitPrice),
        };
      });
      const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryFeeVal = rowVals.deliveryFee !== null && rowVals.deliveryFee !== undefined && rowVals.deliveryFee !== ''
        ? Number(rowVals.deliveryFee) || 0
        : 0;

      const grandTotal = itemsTotal + deliveryFeeVal;

      const selectedRider = activeRiders.find((r) => String(r.id) === String(rowVals.riderId));
      const itemSummary = [
        ...items.map((item) => `${item.quantity} ${item.unit} ${item.name}`),
        ...(deliveryFeeVal > 0 ? [`Fee: Rs. ${deliveryFeeVal}`] : []),
      ].join(' + ');

      const payload = {
        date: selectedDate,
        shift: shift.toUpperCase(),
        customerId: customer.id || customer._id,
        customerName: customer.name,
        customerPhone: customer.phone || '',
        deliveryAddress: customer.area || customer.address || 'Doorstep Delivery',
        itemDescription: itemSummary,
        qtyLiters: items
          .filter((item) => String(item.unit).toUpperCase() === 'L')
          .reduce((sum, item) => sum + item.quantity, 0),
        deliveryFee: rowVals.deliveryFee !== null && rowVals.deliveryFee !== undefined && rowVals.deliveryFee !== '' ? Number(rowVals.deliveryFee) : null,
        items: items,
        amountDue: grandTotal,
        amountPaid: 0,
        codAmountToCollect: 0,
        paymentMode: 'KHATA',
        paymentStatus: 'UNPAID',
        status: 'PENDING',
        deliverySubType: 'monthly',
        source: 'SCHEDULED_ROUTE',
        riderId: selectedRider?.id || null,
        riderNameSnapshot: selectedRider?.name || customer.preferredRider || 'Default Rider',
        notes: `Customer agreement dispatch (${selectedDate}, ${shift})`,
      };

      const created = await addDelivery(payload);
      await refreshCustomers();
      toast.success(`Order Placed for ${customer.name}! (#${created.runCode || 'DEL'}) → Sent to Doorstep Deliveries`);
    } catch (err) {
      console.error('Failed to dispatch monthly delivery:', err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setProcessingKeys((p) => ({ ...p, [rowKey]: false }));
    }
  };

  // Bulk Dispatch / Place All visible shift orders
  const handleSaveAllShiftOrders = async (e) => {
    if (e) e.preventDefault();

    const pendingToPlace = filteredRows.filter((r) => !getDispatchedRecord(r.customerId, r.shift));
    if (pendingToPlace.length === 0) {
      toast.info('All visible customer orders are already dispatched!');
      return;
    }

    try {
      toast.info(`Placing ${pendingToPlace.length} shift orders...`);
      for (const row of pendingToPlace) {
        await handleToggleRowOrder(row);
      }
      toast.success(`Successfully saved and dispatched all ${pendingToPlace.length} orders!`);
    } catch (err) {
      console.error('Error saving all shift orders:', err);
      toast.error('Failed to place some orders');
    }
  };

  // Filtered rows for register table
  // Delivered orders are hidden from this order placement register by default (as they move to Doorstep Deliveries)
  const filteredRows = useMemo(() => {
    return dispatchRows.filter((r) => {
      // Delivered runs are completed in Doorstep Deliveries and do not return here.
      if (r.isDelivered) return false;

      if (activeShift !== 'All' && r.shift.toLowerCase() !== activeShift.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = r.customer.name && r.customer.name.toLowerCase().includes(q);
        const phoneMatch = r.customer.phone && r.customer.phone.includes(q);
        const areaMatch = r.customer.area && r.customer.area.toLowerCase().includes(q);
        return nameMatch || phoneMatch || areaMatch;
      }
      return true;
    });
  }, [dispatchRows, activeShift, searchQuery]);

  // Statistics calculation for active view
  const totalCustomersCount = filteredRows.length;
  const placedCount = filteredRows.filter((r) => !!getDispatchedRecord(r.customerId, r.shift)).length;

  let totalEnteredLiters = 0;
  let totalOrderCost = 0;

  filteredRows.forEach((r) => {
    const rowVals = getRowValue(r);
    const q = parseFloat(rowVals.qty) || 0;
    totalEnteredLiters += q;

    const feeVal = rowVals.deliveryFee !== null && rowVals.deliveryFee !== undefined && rowVals.deliveryFee !== ''
      ? Number(rowVals.deliveryFee) || 0
      : 0;

    const scheduledTotal = r.scheduledItems.reduce((sum, item, index) => {
      const quantity = index === 0 ? q : Number(item.quantity) || 0;
      return sum + quantity * (Number(item.unitPrice) || 0);
    }, 0);
    totalOrderCost += scheduledTotal + feeVal;
  });

  // Export CSV of delivery records
  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = [
      'Customer ID',
      'Customer Name',
      'Phone Number',
      'Area / Drop Point',
      'Shift',
      'Milk Liters',
      'Rate (PKR)',
      'Delivery Fee (PKR)',
      'Total Bill (PKR)',
      'Khata Due (PKR)',
      'Dispatched Status',
    ];

    const rows = filteredRows.map((r) => {
      const rowVals = getRowValue(r);
      const dispatched = getDispatchedRecord(r.customerId, r.shift);
      const q = parseFloat(rowVals.qty) || 0;
      const feeVal = rowVals.deliveryFee !== null && rowVals.deliveryFee !== undefined && rowVals.deliveryFee !== ''
        ? Number(rowVals.deliveryFee) || 0
        : 0;

      return [
        r.customerId || '-',
        r.customer.name || '-',
        r.customer.phone || '-',
        r.customer.area || '-',
        r.shift,
        q.toFixed(1),
        r.rate,
        feeVal > 0 ? feeVal : '0 (Free)',
        ((q * r.rate) + feeVal).toLocaleString(),
        Number(r.customer.khataBalance || 0).toLocaleString(),
        dispatched ? (dispatched.status === 'DELIVERED' ? 'DELIVERED' : `Dispatched (#${dispatched.runCode || 'DEL'})`) : 'Pending',
      ];
    });

    exportTableToCSV({
      filename: `daily_monthly_deliveries_${selectedDate}_${activeShift}`,
      title: `Daily Monthly Deliveries Register (${selectedDate} - ${activeShift})`,
      metadata: [
        ['Date', selectedDate],
        ['Shift', activeShift],
        ['Total Customers', totalCustomersCount],
        ['Total Liters', `${totalEnteredLiters.toFixed(1)} L`],
        ['Total Order Bill', `Rs. ${totalOrderCost.toLocaleString()}`],
      ],
      headers,
      rows,
    });
  };

  return (
    <div className="customer-delivery-compact space-y-2 animate-in fade-in duration-150">
      {/* 1. Page Header with Action Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            Daily Monthly Deliveries Order Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Place &amp; dispatch scheduled monthly milk orders (Delivered orders are tracked in Doorstep Deliveries)
          </p>
        </div>

        {/* Register actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Direct Link to Doorstep Deliveries Tab */}
          <button
            type="button"
            onClick={() => navigate('/customer-hub/doorstep-orders')}
            className={`relative flex items-center gap-1.5 px-3.5 h-[36px] rounded-full text-[0px] font-bold transition shadow-2xs cursor-pointer ${
              monthlyPendingCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 ring-2 ring-amber-400/40'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="Open pending monthly doorstep orders"
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="text-xs">Orders</span>
            <span className="bg-slate-950 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black">
              {monthlyPendingCount} Pending
            </span>
            <span>Go to Doorstep Deliveries 🚚</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 h-[36px] rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {activeShift === 'All' && <button
            type="button"
            onClick={handleSaveAllShiftOrders}
            className="flex items-center gap-1.5 px-4 h-[36px] rounded-full text-xs font-bold text-white transition-all shadow-xs cursor-pointer hover:brightness-110 active:translate-y-0 select-none"
            style={{ backgroundColor: '#009966' }}
          >
            <Save className="w-4 h-4" />
            <span>Place All Shifts</span>
          </button>}
        </div>
      </div>

      {/* 2. Top Banner Card with Date, Shift Pills & Stat Pills */}
      <div className="compact-surface bg-white border border-slate-200/90 rounded-lg p-2 space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Left Side: Date Picker & Shift Selector Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 px-3 h-[36px] rounded-full bg-slate-50 border border-slate-200 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#155dfc] shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer text-xs"
              />
            </div>

            {/* Shift Pill Buttons */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-full border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveShift('Morning')}
                className={`flex items-center gap-1.5 px-3.5 h-[30px] rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                  activeShift === 'Morning'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Morning 🌅</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('Evening')}
                className={`flex items-center gap-1.5 px-3.5 h-[30px] rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                  activeShift === 'Evening'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Evening 🌙</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('All')}
                className={`flex items-center gap-1.5 px-3.5 h-[30px] rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                  activeShift === 'All'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All Shifts</span>
              </button>
            </div>
          </div>

          {/* Right Side: 3 Stat Pills (Orders Placed, Total Liters, Total Billing) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs shadow-2xs">
              <span className="text-slate-500 mr-1.5 font-medium">Pending Placement:</span>
              <span className="font-mono font-bold text-slate-800">
                {totalCustomersCount - placedCount} / {totalCustomersCount}
              </span>
            </div>

            <div className="flex items-center px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs shadow-2xs">
              <span className="text-slate-500 mr-1.5 font-medium">Shift Liters:</span>
              <span className="font-mono font-bold text-slate-800">
                {totalEnteredLiters.toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="text-emerald-700 mr-1.5 font-medium">Shift Billing:</span>
              <span className="font-mono font-black">
                Rs. {totalOrderCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone, or drop area to place order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Register Table (POS for Standing Monthly Orders) */}
      <div className="compact-surface bg-white border border-slate-200/90 rounded-lg overflow-hidden">
        <form onSubmit={handleSaveAllShiftOrders}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-3 w-28 text-center">DISPATCH</th>
                  <th className="py-3 px-4 min-w-44">CUSTOMER</th>
                  <th className="py-3 px-3 min-w-28">LOCATION &amp; KHATA</th>
                  <th className="py-3 px-3 text-center">SHIFT</th>
                  <th className="py-3 px-3 text-center min-w-32">AGREED QTY</th>
                  <th className="py-3 px-4 min-w-56">CUSTOMER AGREEMENT</th>
                  <th className="py-3 px-3 min-w-28 text-center">DELIVERY FEE</th>
                  <th className="py-3 px-3 min-w-36">ASSIGN RIDER</th>
                  <th className="py-3 px-4 text-right min-w-28">LINE TOTAL</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 font-display">
                          All Orders Placed / Delivered for {activeShift} Shift!
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          There are no pending orders left to place for this shift. Switch shifts or view all deliveries in Doorstep Deliveries.
                        </p>
                        <button
                          type="button"
                          onClick={() => {}}
                          className="hidden"
                        >
                          View Doorstep Deliveries 🚚
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const { rowKey, customer, shift, rate, customerId, initialLetter } = row;
                    const rowVals = getRowValue(row);
                    const dispatchedRec = getDispatchedRecord(customerId, shift);
                    const isDispatched = !!dispatchedRec;
                    const isDelivered = dispatchedRec?.status === 'DELIVERED';
                    const isProcessing = !!processingKeys[rowKey];

                    const q = parseFloat(rowVals.qty) || 0;
                    const feeVal = rowVals.deliveryFee !== null && rowVals.deliveryFee !== undefined && rowVals.deliveryFee !== ''
                      ? Number(rowVals.deliveryFee) || 0
                      : 0;

                    const agreementTotal = row.scheduledItems.reduce((sum, item, index) => {
                      const quantity = index === 0 ? q : Number(item.quantity) || 0;
                      return sum + quantity * (Number(item.unitPrice) || 0);
                    }, 0);
                    const grandTotal = agreementTotal + feeVal;

                    return (
                      <tr
                        key={rowKey}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          isDispatched
                            ? isDelivered
                              ? 'bg-emerald-50/20'
                              : 'bg-emerald-50/30'
                            : ''
                        }`}
                      >
                        {/* Column 1: explicit dispatch confirmation */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center">
                            {isProcessing ? (
                              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            ) : isDispatched ? (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                                isDelivered
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-800'
                              }`}>
                                {isDelivered ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {isDelivered ? 'Delivered' : 'Pending'}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleRowOrder(row)}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-2xs transition hover:bg-emerald-700"
                              >
                                <Check className="h-3 w-3" /> Dispatch
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Column 2: CUSTOMER with Blue Initial Circle */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#155dfc] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {initialLetter}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs sm:text-sm font-display truncate">
                                {customer.name}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono font-medium">
                                {customer.phone || 'No phone'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Column 3: LOCATION & KHATA DUE */}
                        <td className="py-3.5 px-3">
                          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate">{customer.area || 'Model Town'}</span>
                          </p>
                          <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                            Khata: Rs. {Number(customer.khataBalance || 0).toLocaleString()}
                          </p>
                        </td>

                        {/* Column 4: SHIFT BADGE */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {shift === 'Morning' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              <Sun className="w-3 h-3 text-amber-600" />
                              <span>Morning 🌅</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                              <Moon className="w-3 h-3 text-indigo-600" />
                              <span>Evening 🌙</span>
                            </span>
                          )}
                        </td>

                        {/* Column 5: primary agreement item quantity */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder={String(row.defaultQty || 0)}
                              value={rowVals.qty}
                              disabled={isDelivered}
                              onChange={(e) => handleRowChange(rowKey, 'qty', e.target.value)}
                              className={`w-24 h-[34px] px-2 rounded-full border text-center text-xs sm:text-sm font-bold outline-none tabular transition-all shadow-2xs ${
                                isDelivered ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                              }`}
                            />
                            <span className="text-[10px] text-slate-400 font-medium">
                              {row.primaryItem?.name} @ Rs. {rate}/{row.primaryItem?.unit || 'Pcs'}
                            </span>
                          </div>
                        </td>

                        {/* Column 6: customer agreement products */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {row.scheduledItems.map((item, index) => (
                              <span key={`${item.name}-${index}`} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10.5px] font-bold text-blue-900">
                                {index === 0 ? q : item.quantity} {item.unit} {item.name}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Column 7: DELIVERY FEE (Only rendered if customer has fee set) */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {row.deliveryFee !== null && row.deliveryFee !== undefined ? (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50/80 border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-900">Rs.</span>
                              <input
                                type="number"
                                min="0"
                                value={rowVals.deliveryFee !== null ? rowVals.deliveryFee : ''}
                                disabled={isDelivered}
                                onChange={(e) => handleRowChange(rowKey, 'deliveryFee', e.target.value)}
                                className={`w-12 h-5 text-center font-mono font-bold text-xs border rounded outline-none ${
                                  isDelivered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-amber-300 focus:border-amber-500'
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">Free</span>
                          )}
                        </td>

                        {/* Column 8: ASSIGNED RIDER */}
                        <td className="py-3.5 px-3 min-w-36">
                          <div className="relative">
                            <select
                              value={rowVals.riderId}
                              disabled={isDelivered}
                              onChange={(e) => handleRowChange(rowKey, 'riderId', e.target.value)}
                              className={`w-full border rounded-lg px-2 py-1.5 text-xs font-semibold appearance-none pr-6 shadow-2xs ${
                                isDelivered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer'
                              }`}
                            >
                              <option value="">— Select Rider —</option>
                              {activeRiders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.vehicle === 'Motorbike' ? '🛵' : '🚲'} {r.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>

                        {/* Column 9: LINE TOTAL */}
                        <td className="py-3.5 px-4 text-right font-bold tabular text-slate-900">
                          {grandTotal > 0 ? (
                            <div>
                              <span className="text-emerald-700 text-xs sm:text-sm font-display">
                                Rs. {grandTotal.toLocaleString()}
                              </span>
                              <span className="block text-[9.5px] text-slate-400 font-normal">
                                {isDispatched ? (isDelivered ? 'Delivered' : `#${dispatchedRec?.runCode || 'DEL'}`) : 'Ready'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-2 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600">
                Pending Rows: <strong>{totalCustomersCount}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-600">
                Shift Total Liters: <strong className="text-blue-700">{totalEnteredLiters.toFixed(1)} L</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Shift Billing</span>
                <span className="text-base font-bold text-slate-900 font-display">
                  Rs. {totalOrderCost.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white transition-all shadow-xs cursor-pointer hover:brightness-110 active:translate-y-0"
                style={{ backgroundColor: '#009966' }}
              >
                <Save className="w-4 h-4" />
                <span>{activeShift === 'All' ? 'Place All Shifts' : `Place All ${activeShift}`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
