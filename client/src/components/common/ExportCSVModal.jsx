import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Sparkles,
  Table,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tractor,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Coins,
  Milk,
  Package,
  FileText,
  UserCheck,
  History,
  X,
} from 'lucide-react';
import { useAnimalContext } from '@/context/AnimalContext';
import { useExpense } from '@/context/ExpenseContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { usePOSContext } from '@/context/POSContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
import { useStaffContext } from '@/context/StaffContext';
function exportToCSV(filename, headers, rows) {
  if (!headers || !headers.length) return;

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = (rows || []).map((row) =>
    (Array.isArray(row) ? row : headers.map((h) => row[h] ?? '')).map(escapeCell).join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanFilename = (filename || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_');

  const today = new Date().toISOString().split('T')[0];
  const finalFilename = `${cleanFilename}_${today}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const MODULES_LIST = [
  {
    id: 'all',
    name: 'All Modules (Complete Bundle)',
    category: 'Master Export',
    icon: '✨',
    desc: 'Master combined export containing data from all modules in multi-table CSV',
  },
  {
    id: 'daily_closing',
    name: 'Daily Closing & P&L',
    category: 'Finance',
    icon: '📊',
    desc: 'Cash, Online Payment, Khata revenue, expenses & daily profit margins',
  },
  {
    id: 'pos_sales',
    name: 'POS Sales & Invoices',
    category: 'Sales',
    icon: '🛒',
    desc: 'Counter sales, retail receipts, itemized invoices and billing history',
  },
  {
    id: 'deliveries',
    name: 'Milk Deliveries & Subscriptions',
    category: 'Sales',
    icon: '🚚',
    desc: 'Doorstep subscriptions, rider dispatches, drop locations & bottle tracking',
  },
  {
    id: 'procurement',
    name: 'Milk Procurement & Suppliers',
    category: 'Procurement',
    icon: '🥛',
    desc: 'External supplier milk batches, purchases, rates & payment statuses',
  },
  {
    id: 'khata_ledger',
    name: 'Customer Khata Ledgers',
    category: 'Finance',
    icon: '📒',
    desc: 'Detailed debit/credit entries, running balances & aging history',
  },
  {
    id: 'expenses',
    name: 'Expenses & Feed Allocation',
    category: 'Expenses',
    icon: '💸',
    desc: 'Shop overheads, generator fuel, fodder/chara & vet medicine expenses',
  },
  {
    id: 'payments',
    name: 'Customer Payments & Receipts',
    category: 'Finance',
    icon: '💳',
    desc: 'Cash, Online Payment collection records & verification',
  },
  {
    id: 'animals',
    name: 'Herd Animals & Milk Yield',
    category: 'Farm',
    icon: '🐄',
    desc: 'Cattle tags, morning/evening milking yield logs & health status',
  },
  {
    id: 'customers',
    name: 'Customer Directory',
    category: 'Directory',
    icon: '👥',
    desc: 'Customer addresses, credit limits, phone numbers & delivery schedules',
  },
  {
    id: 'suppliers',
    name: 'Dairy Suppliers Registry',
    category: 'Directory',
    icon: '🤝',
    desc: 'Farmer contacts, rates per liter/kg, total supply volume & balances',
  },
  {
    id: 'products',
    name: 'Products Catalog & Rates',
    category: 'Catalog',
    icon: '🏷️',
    desc: 'Cow milk, Buffalo milk, Dahi, Lassi pricing and active products',
  },
  {
    id: 'users',
    name: 'Staff & Payroll Roster',
    category: 'System',
    icon: '🧑‍💼',
    desc: 'Riders, cashiers, labor list, monthly salaries & shift assignments',
  },
  {
    id: 'audit_log',
    name: 'System Audit Trail Log',
    category: 'System',
    icon: '🛡️',
    desc: 'User activity history, price modifications & system event audit',
  },
];

export default function ExportCSVModal({
  isOpen,
  onClose,
  defaultModule = 'all',
  defaultPeriod = 'all',
}) {
  const [selectedModule, setSelectedModule] = useState(defaultModule);
  const [period, setPeriod] = useState(defaultPeriod);
  const [singleDate, setSingleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState('');

  const { animals = [] } = useAnimalContext() || {};
  const { expenses = [] } = useExpense() || {};
  const { customers = [], rawCustomers = [] } = useCustomerContext() || {};
  const { ledgers = {} } = useLedgerContext() || {};
  const { products = [], salesHistory = [] } = usePOSContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList: deliveryStaff = [] } = useDeliveryStaffContext() || {};
  const { fuelLogs = [] } = useFuelLogContext() || {};
  const { staffList = [] } = useStaffContext() || {};

  useEffect(() => {
    if (defaultModule) setSelectedModule(defaultModule);
    if (defaultPeriod) setPeriod(defaultPeriod);
  }, [defaultModule, defaultPeriod, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isDateInRange = (dateStr) => {
    if (period === 'all') return true;
    if (!dateStr) return true;
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

    if (period === 'today') {
      return cleanDate === singleDate;
    }
    if (period === 'weekly') {
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
      return cleanDate >= firstDay;
    }
    if (period === 'monthly') {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return cleanDate.startsWith(currentMonth);
    }
    if (period === 'custom') {
      if (startDate && endDate) {
        return cleanDate >= startDate && cleanDate <= endDate;
      }
    }
    return true;
  };

  const applyPreset = (preset) => {
    const today = new Date().toISOString().split('T')[0];
    if (preset === 'today') {
      setPeriod('today');
      setSingleDate(today);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setPeriod('custom');
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setPeriod('custom');
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (preset === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setPeriod('custom');
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (preset === 'thisMonth') {
      const d = new Date();
      const firstDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      setPeriod('monthly');
      setStartDate(firstDay);
      setEndDate(today);
    }
  };

  const preview = useMemo(() => {
    const customerList = rawCustomers?.length ? rawCustomers : customers;
    const allStaff = staffList?.length ? staffList : deliveryStaff;

    switch (selectedModule) {
      case 'animals': {
        const headers = ['ID', 'Tag', 'Name', 'Species', 'Lactation Status', 'Morning Yield (L)', 'Evening Yield (L)', 'Total Daily Yield (L)', 'Acquisition Date', 'Purchase Price', 'Health Status'];
        const rows = animals.map((a) => [
          a.id, a.tag, a.name || a.tag, a.species, a.lactationStatus, a.morningYield, a.eveningYield, a.totalDailyYield, a.acquisitionDate, a.purchasePrice || '-', a.healthStatus || 'Healthy'
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'expenses': {
        const filtered = expenses.filter((e) => isDateInRange(e.date));
        const headers = ['ID', 'Date', 'Category', 'Description', 'Amount (Rs)', 'Payment Method', 'Receipt Ref', 'Authorized By'];
        const rows = filtered.map((e) => [
          e.id, e.date, e.category, e.description, e.amount, e.paymentMethod, e.receiptRef || 'N/A', e.authorizedBy || 'N/A'
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'pos_sales': {
        const filtered = salesHistory.filter((s) => isDateInRange(s.timestamp || s.formattedDate));
        const headers = ['Invoice ID', 'Date', 'Time', 'Category', 'Customer', 'Items Summary', 'Subtotal (Rs)', 'Discount (Rs)', 'Delivery Charge (Rs)', 'Net Payable (Rs)', 'Payment Method'];
        const rows = filtered.map((s) => [
          s.invoiceId, s.formattedDate || s.timestamp?.split('T')[0] || '-', s.formattedTime || '-', s.saleCategory || 'walkin',
          s.customer ? s.customer.name : s.walkinCustomer ? s.walkinCustomer.name : 'Walk-in',
          (s.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; '),
          s.subtotal, s.discount, s.deliveryCharge, s.netPayable, s.paymentMethod
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'deliveries': {
        const filtered = deliveries.filter((d) => isDateInRange(d.date || d.createdAt));
        const headers = ['Run Code', 'Date', 'Shift', 'Customer Name', 'Delivery Address', 'Route', 'Item Description', 'Quantity (L)', 'Payment Mode', 'COD To Collect (Rs)', 'Status', 'Rider'];
        const rows = filtered.map((d) => [
          d.runCode || `RUN-${d.id}`, d.date, d.shift, d.customerName, d.deliveryAddress, d.route || '-', d.itemDescription, d.qtyLiters, d.paymentMode, d.codAmountToCollect || 0, d.status, d.riderNameSnapshot || '-'
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'customers': {
        const headers = ['Customer ID', 'Name', 'Phone', 'Secondary Phone', 'Area', 'Address', 'Shift', 'Subscription', 'Payment Mode', 'Credit Limit (Rs)', 'Khata Balance (Rs)', 'Status', 'Created Date'];
        const rows = customerList.map((c) => [
          c.id, c.name, c.phone, c.secondaryPhone || '-', c.area, c.address, c.shift, c.subscription || 'Fresh Milk', c.paymentMode, c.creditLimit || 0, c.khataBalance || 0, c.status, c.createdAt || '-'
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'khata_ledger': {
        const headers = ['Txn ID', 'Customer ID', 'Customer Name', 'Customer Phone', 'Date', 'Type', 'Description', 'Debit (Rs)', 'Credit (Rs)', 'Running Balance (Rs)', 'Payment Method', 'Notes'];
        const allTxns = [];
        Object.entries(ledgers || {}).forEach(([custId, txns]) => {
          const cust = customerList.find((c) => String(c.id) === String(custId));
          const custName = cust ? cust.name : `Customer #${custId}`;
          const custPhone = cust ? cust.phone : '-';
          (txns || []).forEach((t) => {
            if (isDateInRange(t.date)) {
              allTxns.push([
                t.id, custId, custName, custPhone, t.date, t.type, t.description, t.debit || 0, t.credit || 0, t.runningBalance || 0, t.method || '-', t.notes || '-'
              ]);
            }
          });
        });
        return { headers, rows: allTxns, count: allTxns.length };
      }
      case 'products': {
        const headers = ['SKU', 'Product Name', 'Category', 'Unit', 'Price (Rs)', 'Cost (Rs)', 'Barcode', 'Storage', 'Status'];
        const rows = products.map((p) => [
          p.sku || p.id, p.name, p.category, p.unit, p.price, p.cost, p.barcode || '-', p.storage || 'Chiller', p.status || 'Active'
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'users': {
        const headers = ['Staff ID', 'Name', 'Role', 'Mobile', 'Email', 'Shift', 'Monthly Salary (Rs)', 'CNIC', 'Route', 'Status', 'Joined Date'];
        const rows = allStaff.map((s) => [
          s.id, s.name, s.role || 'Staff', s.mobile || s.phone || '-', s.email || '-', s.shift || 'Morning', s.monthlySalary || s.salary || 0, s.cnic || '-', s.route || '-', s.status || 'Active', s.joinedDate || '-'
        ]);
        return { headers, rows, count: rows.length };
      }
      case 'daily_closing': {
        const totalYield = animals.reduce((sum, a) => sum + (parseFloat(a.totalDailyYield) || 0), 0);
        const totalSales = salesHistory.reduce((sum, s) => sum + (Number(s.netPayable) || 0), 0);
        const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const headers = ['Report Metric', 'Value', 'Notes'];
        const rows = [
          ['Closing Date', singleDate, 'Day End Audit'],
          ['Daily Milk Production', `${totalYield.toFixed(1)} Liters`, 'Herd Milking Register'],
          ['Total Gross Sales Revenue', `Rs. ${totalSales.toLocaleString()}`, 'POS + Doorstep'],
          ['Total Farm Operating Expenses', `Rs. ${totalExp.toLocaleString()}`, 'Feed + Operations'],
          ['Net Liquid Flow', `Rs. ${(totalSales - totalExp).toLocaleString()}`, 'Daily Operating Balance'],
        ];
        return { headers, rows, count: rows.length };
      }
      default: {
        const headers = ['Module', 'Total Records', 'Status'];
        const rows = [
          ['Herd Animals', animals.length, 'Active'],
          ['Farm Expenses', expenses.length, 'Logged'],
          ['POS Sales Invoices', salesHistory.length, 'Completed'],
          ['Doorstep Deliveries', deliveries.length, 'Registered'],
          ['Customer Directory', customerList.length, 'Verified'],
          ['Staff & Payroll', allStaff.length, 'On-duty'],
          ['Products Catalog', products.length, 'Available'],
        ];
        return { headers, rows, count: rows.length };
      }
    }
  }, [selectedModule, period, singleDate, startDate, endDate, animals, expenses, customers, rawCustomers, ledgers, products, salesHistory, deliveries, staffList, deliveryStaff]);

  const handleExport = () => {
    if (selectedModule === 'all') {
      const allModulesExport = [
        ['=== HERD ANIMALS & MILK YIELD ==='],
        ['ID', 'Tag', 'Name', 'Species', 'Daily Yield (L)', 'Health'],
        ...animals.map((a) => [a.id, a.tag, a.name, a.species, a.totalDailyYield, a.healthStatus || 'Healthy']),
        [''],
        ['=== FARM EXPENSES ==='],
        ['ID', 'Date', 'Category', 'Description', 'Amount (Rs)', 'Method'],
        ...expenses.map((e) => [e.id, e.date, e.category, e.description, e.amount, e.paymentMethod]),
        [''],
        ['=== POS SALES INVOICES ==='],
        ['Invoice ID', 'Date', 'Customer', 'Net Payable (Rs)', 'Payment Method'],
        ...salesHistory.map((s) => [s.invoiceId, s.formattedDate, s.customer?.name || s.walkinCustomer?.name || 'Walk-in', s.netPayable, s.paymentMethod]),
        [''],
        ['=== DOORSTEP DELIVERIES ==='],
        ['Run Code', 'Date', 'Customer', 'Address', 'Liters', 'Status'],
        ...deliveries.map((d) => [d.runCode, d.date, d.customerName, d.deliveryAddress, d.qtyLiters, d.status]),
        [''],
        ['=== CUSTOMER DIRECTORY ==='],
        ['Customer ID', 'Name', 'Phone', 'Area', 'Khata Balance (Rs)', 'Status'],
        ...(rawCustomers?.length ? rawCustomers : customers).map((c) => [c.id, c.name, c.phone, c.area, c.khataBalance || 0, c.status]),
      ];

      exportToCSV(`PureMilkBar_COMPLETE_BUNDLE_${period}`, ['Pure Milk Bar ERP — Master Multi-Module System Report'], allModulesExport);
      setToastMessage('Exported complete multi-module bundle CSV report successfully!');
    } else {
      const moduleMeta = MODULES_LIST.find((m) => m.id === selectedModule);
      exportToCSV(`PureMilkBar_${selectedModule}_${period}`, preview.headers, preview.rows);
      setToastMessage(`Exported ${moduleMeta?.name || selectedModule} CSV successfully!`);
    }

    setTimeout(() => {
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto border border-slate-200 z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 gap-4 shrink-0 bg-slate-50/80 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              Export CSV Data & Custom Date Filter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Generate structured CSV exports for external reporting, accounting audits, and Excel analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer shrink-0 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain space-y-5">
          {toastMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-4.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 border border-emerald-700/40">
            <div className="flex items-center gap-3">
              <div className="w-10.5 h-10.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="text-emerald-300 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Export System Data to CSV / Excel
                  <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    UTF-8 Enabled
                  </span>
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5 font-sans">
                  Generate clean, compatible CSV files for Microsoft Excel, Google Sheets, or Tally with custom date range filtering.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export Now
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-600" />
              1. Select Module to Export:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 p-1 bg-slate-50 border border-slate-200/90 rounded-2xl">
              {MODULES_LIST.map((mod) => {
                const isSelected = selectedModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedModule(mod.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                        : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-lg leading-none">{mod.icon}</span>
                      {isSelected && (
                        <CheckCircle2 size={14} className="text-white shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {mod.name}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {mod.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Select Date Period & Range
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('today')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('yesterday')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('last7')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('last30')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('thisMonth')}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPeriod('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                All Records (All Time)
              </button>

              <button
                type="button"
                onClick={() => setPeriod('today')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === 'today'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Day-wise / Daily
              </button>

              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === 'weekly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Weekly (This Week)
              </button>

              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Monthly (This Month)
              </button>

              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  period === 'custom'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Custom Date Range
              </button>
            </div>

            {period === 'today' && (
              <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200/80">
                <span className="text-xs font-bold text-slate-700">Select Day:</span>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
                <span className="text-xs text-slate-500 font-normal">
                  Filters records matching exact day {singleDate}
                </span>
              </div>
            )}

            {period === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">From (Start Date):</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
                <ArrowRight size={14} className="text-slate-400 hidden sm:inline" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">To (End Date):</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border border-slate-200/90 rounded-2xl p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Export Preview & Filtered Output Summary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {selectedModule === 'all' ? '14 Modules Combined' : `${preview.count} Records Found`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full capitalize text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Period: {period}
                </span>
              </div>
            </div>

            {selectedModule !== 'all' ? (
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Included CSV Columns ({preview.headers.length}):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {preview.headers.map((h, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] border border-slate-200 font-mono font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {preview.count > 0 && (
                  <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span>
                      First record sample: <strong className="text-slate-900 font-bold">{String(preview.rows[0]?.[1] || preview.rows[0]?.[0])}</strong>
                    </span>
                    <span className="font-semibold text-emerald-800">Ready to download .CSV</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-600 bg-emerald-50/60 border border-emerald-200/90 p-3.5 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block font-bold mb-0.5">
                    Complete Multi-Module Bundle Selected
                  </strong>
                  Downloading will create a master structured CSV document containing formatted sections for Daily Closing, POS Invoices, Deliveries, Procurement, Expenses, Customer Ledgers, Herd Yield, Products, Staff Roster, and Audit Logs!
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0 bg-slate-50/80 rounded-b-2xl">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Compatible with MS Excel, Tally & Google Sheets
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download size={14} />
              Download CSV File
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
