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
import { useCustomerContext, getCustomerDueBalance } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useStaffContext } from '@/context/StaffContext';
import { exportTableToCSV } from '@/utils/csvExport';
import posService from '@/services/posService';

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
  const { staffList: deliveryStaffList = [] } = useDeliveryStaffContext() || {};
  const { staffList: generalStaffList = [], fetchStaff } = useStaffContext() || {};

  // Ensure staff records are fetched fresh from database
  React.useEffect(() => {
    if (typeof fetchStaff === 'function') {
      fetchStaff();
    }
  }, [fetchStaff]);

  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [activeShift, setActiveShift] = useState('Morning'); // 'Morning' | 'Evening' | 'All'
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);

  // Load products to perform strict inventory stock checks
  const loadAvailableProducts = React.useCallback(async () => {
    try {
      const data = await posService.getProducts({ limit: 1000 });
      const list = Array.isArray(data) ? data : data?.products || data?.data || [];
      setAvailableProducts(list);
    } catch (e) {
      console.warn('Failed to load products for delivery stock check:', e);
    }
  }, []);

  React.useEffect(() => {
    loadAvailableProducts();
    const handleInvUpdate = () => loadAvailableProducts();
    window.addEventListener('pure_milk_bar_inventory_updated', handleInvUpdate);
    window.addEventListener('pure_milk_bar_pos_sale_completed', handleInvUpdate);
    return () => {
      window.removeEventListener('pure_milk_bar_inventory_updated', handleInvUpdate);
      window.removeEventListener('pure_milk_bar_pos_sale_completed', handleInvUpdate);
    };
  }, [loadAvailableProducts]);

  // Helper to identify real delivery personnel (Rider, Delivery Boy, Driver, etc.)
  const isDeliveryStaff = (s) => {
    if (!s) return false;
    if (s.type === 'RIDER' || s.type === 'WALKING' || s.type === 'MOTORCYCLE_RIDER' || s.type === 'WALKING_BOY') return true;
    const r = (s.role || '').toLowerCase().trim();
    if (!r) return false;
    if (
      r.includes('manager') ||
      r.includes('milking') ||
      r.includes('farm') ||
      r.includes('security') ||
      r.includes('cashier') ||
      r.includes('accountant') ||
      r.includes('owner') ||
      r.includes('admin') ||
      r.includes('vet')
    ) {
      return false;
    }
    return (
      r.includes('delivery') ||
      r.includes('rider') ||
      r.includes('driver') ||
      r.includes('boy') ||
      r.includes('courier') ||
      r.includes('fleet') ||
      r.includes('walking')
    );
  };

  // Dynamically combine active delivery staff & riders only
  const activeRiders = useMemo(() => {
    const map = new Map();

    (deliveryStaffList || []).forEach((s) => {
      if (s && s.active !== false && isDeliveryStaff(s)) {
        const id = String(s.id || s._id || s.name);
        map.set(id, {
          id,
          name: s.name,
          role: s.role || 'Delivery Rider',
          phone: s.phone || s.mobile || '',
        });
      }
    });

    (generalStaffList || []).forEach((s) => {
      if (s && s.status !== 'Inactive' && s.status !== 'Terminated' && isDeliveryStaff(s)) {
        const id = String(s.id || s._id || s.name);
        const name = s.name;
        const alreadyExists = Array.from(map.values()).some(
          (m) => m.name && name && m.name.toLowerCase().trim() === name.toLowerCase().trim()
        );
        if (!alreadyExists) {
          map.set(id, {
            id,
            name,
            role: s.role || 'Delivery Rider',
            phone: s.mobile || s.phone || '',
          });
        }
      }
    });

    return Array.from(map.values());
  }, [deliveryStaffList, generalStaffList]);

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

    // Optional rider selection: empty by default unless already dispatched or explicitly preferred
    const defaultRider = dispatched?.riderId || row.preferredRiderId || '';
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
    const isFailedOrSkipped = dispatchedRec && (dispatchedRec.status === 'FAILED' || dispatchedRec.status === 'SKIPPED' || dispatchedRec.status === 'CANCELLED');

    // If already dispatched and active (PENDING/IN_TRANSIT): unticking cancels dispatch
    if (isCurrentlyDispatched && !isFailedOrSkipped) {
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

    // If previous record was FAILED or SKIPPED, remove the old record before placing new dispatch
    if (isCurrentlyDispatched && isFailedOrSkipped) {
      try {
        setProcessingKeys((p) => ({ ...p, [rowKey]: true }));
        await deleteDelivery(dispatchedRec._id || dispatchedRec.id);
      } catch (err) {
        console.warn('Notice cleaning previous failed delivery run:', err);
      }
    }

    // Place the new / updated order
    const rowVals = getRowValue(row);
    const parsedQty = parseFloat(rowVals.qty);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      toast.error('Please enter a valid milk quantity');
      setProcessingKeys((p) => ({ ...p, [rowKey]: false }));
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

      // Strict stock validation before dispatching order
      if (availableProducts.length > 0) {
        for (const it of items) {
          const itQty = Number(it.quantity) || 0;
          if (itQty <= 0) continue;
          const cleanName = (it.name || '').trim().toLowerCase();
          const matched = availableProducts.find(
            (p) =>
              p.name.trim().toLowerCase() === cleanName ||
              (cleanName.includes('cow') && p.name.toLowerCase().includes('cow')) ||
              (cleanName.includes('buffalo') && p.name.toLowerCase().includes('buffalo')) ||
              (cleanName.includes('dahi') && p.name.toLowerCase().includes('dahi'))
          );
          if (matched) {
            const avail = Number(matched.currentStock ?? matched.stock ?? 0);
            if (avail <= 0 || itQty > avail) {
              toast.error(`Cannot dispatch: Insufficient stock for "${matched.name}". Available: ${avail} ${matched.unit || ''}, Requested: ${itQty}`);
              return;
            }
          }
        }
      }

      const selectedRider = activeRiders.find(
        (r) => String(r.id) === String(rowVals.riderId) || (r.name && r.name.toLowerCase().trim() === String(rowVals.riderId).toLowerCase().trim())
      );
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
        riderNameSnapshot: selectedRider?.name || customer.preferredRider || 'Unassigned',
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

    const pendingToPlace = filteredRows.filter((r) => {
      const rec = getDispatchedRecord(r.customerId, r.shift);
      return !rec || rec.status === 'FAILED' || rec.status === 'SKIPPED' || rec.status === 'CANCELLED';
    });
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
        getCustomerDueBalance(r.customer).toLocaleString(),
        dispatched
          ? dispatched.status === 'DELIVERED'
            ? 'DELIVERED'
            : dispatched.status === 'FAILED'
            ? 'FAILED'
            : dispatched.status === 'SKIPPED'
            ? 'SKIPPED'
            : `Dispatched (#${dispatched.runCode || 'DEL'})`
          : 'Pending',
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
    <div className="customer-delivery-compact space-y-2.5 animate-in fade-in duration-150">
      {/* 1. Page Header with Action Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            <Droplets className="w-5 h-5 text-slate-700" />
            Daily Monthly Deliveries Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Place &amp; dispatch scheduled monthly milk orders (Delivered orders are tracked in Doorstep Deliveries)
          </p>
        </div>

        {/* Register actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direct Link to Doorstep Deliveries Tab */}
          <button
            type="button"
            onClick={() => navigate('/customer-hub/doorstep-orders')}
            className={`relative flex items-center gap-2 px-3.5 h-[34px] rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer border ${
              monthlyPendingCount > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600 shadow-emerald-700/20'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="Open pending monthly doorstep orders"
          >
            <Truck className={`w-3.5 h-3.5 ${monthlyPendingCount > 0 ? 'text-emerald-100' : 'text-slate-500'}`} />
            <span>Doorstep Orders</span>
            {monthlyPendingCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-white text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>{monthlyPendingCount} Pending</span>
              </span>
            )}
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 h-[34px] rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {activeShift === 'All' && (
            <button
              type="button"
              onClick={handleSaveAllShiftOrders}
              className="flex items-center gap-1.5 px-4 h-[34px] rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs cursor-pointer select-none"
            >
              <Save className="w-4 h-4" />
              <span>Place All Shifts</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Banner Card with Date, Shift Pills & Stat Pills */}
      <div className="compact-surface bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Left Side: Date Picker & Shift Selector Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 px-3 h-[32px] rounded-md bg-slate-50 border border-slate-200 text-xs shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer text-xs"
              />
            </div>

            {/* Shift Pill Buttons */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveShift('Morning')}
                className={`flex items-center gap-1.5 px-3 h-[28px] rounded text-xs font-bold transition cursor-pointer select-none ${
                  activeShift === 'Morning'
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Morning</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('Evening')}
                className={`flex items-center gap-1.5 px-3 h-[28px] rounded text-xs font-bold transition cursor-pointer select-none ${
                  activeShift === 'Evening'
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Evening</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShift('All')}
                className={`flex items-center gap-1.5 px-3 h-[28px] rounded text-xs font-bold transition cursor-pointer select-none ${
                  activeShift === 'All'
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>All Shifts</span>
              </button>
            </div>
          </div>

          {/* Right Side: 3 Stat Pills (Orders Placed, Total Liters, Total Billing) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 mr-1.5 font-medium">Pending:</span>
              <span className="font-mono font-bold text-slate-800">
                {totalCustomersCount - placedCount} / {totalCustomersCount}
              </span>
            </div>

            <div className="flex items-center px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 mr-1.5 font-medium">Shift Liters:</span>
              <span className="font-mono font-bold text-slate-800">
                {totalEnteredLiters.toFixed(1)} L
              </span>
            </div>

            <div className="flex items-center px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 mr-1.5 font-medium">Shift Billing:</span>
              <span className="font-mono font-bold text-slate-900">
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
            placeholder="Search customer name, phone, or drop area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
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
      <div className="compact-surface bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <form onSubmit={handleSaveAllShiftOrders}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-2.5 px-3 w-28 text-center">DISPATCH</th>
                  <th className="py-2.5 px-4 min-w-44">CUSTOMER</th>
                  <th className="py-2.5 px-3 min-w-28">LOCATION &amp; KHATA</th>
                  <th className="py-2.5 px-3 text-center">SHIFT</th>
                  <th className="py-2.5 px-3 text-center min-w-32">AGREED QTY</th>
                  <th className="py-2.5 px-4 min-w-56">CUSTOMER AGREEMENT</th>
                  <th className="py-2.5 px-3 min-w-24 text-center">DELIVERY FEE</th>
                  <th className="py-2.5 px-3 min-w-36">ASSIGN RIDER</th>
                  <th className="py-2.5 px-4 text-right min-w-28">LINE TOTAL</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-xs font-bold text-slate-700 font-display">
                          All Orders Placed / Delivered for {activeShift} Shift
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-sm">
                          There are no pending orders left to place for this shift. Switch shifts or view active deliveries in Doorstep Deliveries.
                        </p>
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
                    const isFailed = dispatchedRec?.status === 'FAILED';
                    const isSkipped = dispatchedRec?.status === 'SKIPPED';
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
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isDelivered
                            ? 'bg-slate-50/40'
                            : isFailed
                            ? 'bg-rose-50/25'
                            : isSkipped
                            ? 'bg-amber-50/20'
                            : isDispatched
                            ? 'bg-emerald-50/20'
                            : ''
                        }`}
                      >
                        {/* Column 1: explicit dispatch confirmation */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center">
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : isDelivered ? (
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-slate-200 bg-slate-100 text-slate-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Delivered
                              </span>
                            ) : isFailed ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-rose-200 bg-rose-50 text-rose-700">
                                  <AlertCircle className="h-3 w-3" />
                                  Failed
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRowOrder(row)}
                                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-2xs"
                                  title="Re-dispatch with edited values"
                                >
                                  <Check className="h-2.5 w-2.5" /> Re-dispatch
                                </button>
                              </div>
                            ) : isSkipped ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-slate-300 bg-slate-100 text-slate-700">
                                  <Clock className="h-3 w-3" />
                                  Skipped
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRowOrder(row)}
                                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold bg-slate-700 hover:bg-slate-800 text-white transition cursor-pointer shadow-2xs"
                                  title="Re-dispatch with edited values"
                                >
                                  <Check className="h-2.5 w-2.5" /> Re-dispatch
                                </button>
                              </div>
                            ) : isDispatched ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-800">
                                  <Clock className="h-3 w-3" />
                                  Dispatched
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleRowOrder(row)}
                                  className="text-[9px] text-rose-600 hover:text-rose-800 hover:underline cursor-pointer font-medium"
                                  title="Cancel dispatch"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleRowOrder(row)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs transition cursor-pointer"
                              >
                                <Check className="h-3 w-3" /> Dispatch
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Column 2: CUSTOMER */}
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {initialLetter}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">
                                {customer.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono font-medium">
                                {customer.phone || 'No phone'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Column 3: LOCATION & KHATA DUE */}
                        <td className="py-2.5 px-3">
                          <p className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{customer.area || 'Model Town'}</span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-600 mt-0.5">
                            Khata: <span className="font-mono text-slate-800">Rs. {getCustomerDueBalance(customer).toLocaleString()}</span>
                          </p>
                        </td>

                        {/* Column 4: SHIFT BADGE */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {shift === 'Morning' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                            <span>{shift}</span>
                          </span>
                        </td>

                        {/* Column 5: primary agreement item quantity */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder={String(row.defaultQty || 0)}
                              value={rowVals.qty}
                              disabled={isDelivered}
                              onChange={(e) => handleRowChange(rowKey, 'qty', e.target.value)}
                              className={`w-20 h-[28px] px-1.5 rounded-md border text-center text-xs font-bold outline-none tabular transition-all shadow-2xs ${
                                isDelivered ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-slate-500'
                              }`}
                            />
                            <span className="text-[9px] text-slate-400 font-medium">
                              {row.primaryItem?.name} @ Rs.{rate}/{row.primaryItem?.unit || 'L'}
                            </span>
                          </div>
                        </td>

                        {/* Column 6: customer agreement products */}
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap items-center gap-1">
                            {row.scheduledItems.map((item, index) => (
                              <span key={`${item.name}-${index}`} className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                                <span className="font-bold text-slate-900">{index === 0 ? q : item.quantity} {item.unit}</span>
                                <span>{item.name}</span>
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Column 7: DELIVERY FEE */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {row.deliveryFee !== null && row.deliveryFee !== undefined ? (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50">
                              <span className="text-[9px] font-medium text-slate-500">Rs.</span>
                              <input
                                type="number"
                                min="0"
                                value={rowVals.deliveryFee !== null ? rowVals.deliveryFee : ''}
                                disabled={isDelivered}
                                onChange={(e) => handleRowChange(rowKey, 'deliveryFee', e.target.value)}
                                className={`w-10 h-4 text-center font-mono font-bold text-[10px] border border-slate-200 rounded outline-none ${
                                  isDelivered ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white focus:border-slate-400'
                                }`}
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Free</span>
                          )}
                        </td>

                        {/* Column 8: ASSIGNED RIDER */}
                        <td className="py-2.5 px-3 min-w-36">
                          <div className="relative">
                            <select
                              value={rowVals.riderId || ''}
                              disabled={isDelivered}
                              onChange={(e) => handleRowChange(rowKey, 'riderId', e.target.value)}
                              className={`w-full border rounded-md px-2 py-1 text-[11px] font-medium appearance-none pr-6 shadow-2xs ${
                                isDelivered ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer'
                              }`}
                            >
                              <option value="">— Select Rider —</option>
                              {activeRiders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>

                        {/* Column 9: LINE TOTAL */}
                        <td className="py-2.5 px-4 text-right font-bold tabular text-slate-900">
                          {grandTotal > 0 ? (
                            <div>
                              <span className="text-slate-900 text-xs font-mono font-bold">
                                Rs. {grandTotal.toLocaleString()}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-normal">
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
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>
                Pending Rows: <strong className="text-slate-800">{totalCustomersCount}</strong>
              </span>
              <span>•</span>
              <span>
                Shift Total Liters: <strong className="text-slate-800">{totalEnteredLiters.toFixed(1)} L</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Total Shift Billing</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  Rs. {totalOrderCost.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs cursor-pointer"
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
