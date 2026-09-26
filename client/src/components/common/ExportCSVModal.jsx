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
  Database,
  Building2,
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
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { useIntakeContext } from '@/context/IntakeContext';
import { useSupplierContext } from '@/context/SupplierContext';
import { useAuditContext } from '@/context/AuditContext';
import { useTransactionContext } from '@/context/TransactionContext';
import { exportTableToCSV, exportMultiSectionCSV } from '@/utils/csvExport';

const MODULES_LIST = [
  {
    id: 'all',
    name: 'All Modules (Complete Bundle)',
    category: 'Master Export',
    icon: '✨',
    desc: 'Master combined multi-section audit export covering all 14 dairy and farm modules',
  },
  {
    id: 'daily_closing',
    name: 'Daily Closing & P&L',
    category: 'Finance',
    icon: '📊',
    desc: 'Milk flow mass balance, multi-channel collections, expenses, variance & net liquid flow',
  },
  {
    id: 'pos_sales',
    name: 'POS Sales & Invoices',
    category: 'Sales',
    icon: '🛒',
    desc: 'Counter sales, retail receipts, itemized invoices, discounts and billing methods',
  },
  {
    id: 'deliveries',
    name: 'Milk Deliveries & Subscriptions',
    category: 'Sales',
    icon: '🚚',
    desc: 'Doorstep subscriptions, rider dispatches, drop locations, routes & COD tracking',
  },
  {
    id: 'procurement',
    name: 'Milk Procurement & Intake',
    category: 'Procurement',
    icon: '🥛',
    desc: 'External farmer intake batches, Fat %, LR, SNF, liter quantities, rates & settlements',
  },
  {
    id: 'suppliers',
    name: 'Dairy Suppliers Registry',
    category: 'Procurement',
    icon: '🤝',
    desc: 'Farmer profiles, contacts, routes, supply volumes, payable dues & ledger balances',
  },
  {
    id: 'khata_ledger',
    name: 'Customer Khata Ledgers',
    category: 'Finance',
    icon: '📒',
    desc: 'Itemized customer debit/credit transactions, running balances & aging history',
  },
  {
    id: 'payments',
    name: 'Customer Payments & Receipts',
    category: 'Finance',
    icon: '💳',
    desc: 'Cash, JazzCash, EasyPaisa, and bank transfer payment collection records',
  },
  {
    id: 'expenses',
    name: 'Expenses & Feed Allocation',
    category: 'Expenses',
    icon: '💸',
    desc: 'Shop overheads, generator fuel, animal fodder/feed & veterinary medical expenses',
  },
  {
    id: 'animals',
    name: 'Herd Animals & Milk Yield',
    category: 'Farm',
    icon: '🐄',
    desc: 'Cattle ear tags, lactation status, morning/evening milking yields & health status',
  },
  {
    id: 'customers',
    name: 'Customer Directory',
    category: 'Directory',
    icon: '👥',
    desc: 'Customer addresses, credit limits, phone numbers, delivery shifts & khata balances',
  },
  {
    id: 'products',
    name: 'Products Catalog & Rates',
    category: 'Catalog',
    icon: '🏷️',
    desc: 'Fresh Milk, Dahi, Lassi retail & wholesale pricing, SKU, costs and storage types',
  },
  {
    id: 'users',
    name: 'Staff & Payroll Roster',
    category: 'System',
    icon: '🧑‍💼',
    desc: 'Riders, cashiers, milkers, labor list, monthly salaries, shifts & daily wages',
  },
  {
    id: 'audit_log',
    name: 'System Audit Trail Log',
    category: 'System',
    icon: '🛡️',
    desc: 'System activity history, price modifications, user actions & operational audit',
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

  // Domain Contexts
  const { animals = [], milkingLogs = [] } = useAnimalContext() || {};
  const { expenses = [] } = useExpense() || {};
  const { customers = [], rawCustomers = [] } = useCustomerContext() || {};
  const { ledgers = {} } = useLedgerContext() || {};
  const { products = [], salesHistory = [] } = usePOSContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList: deliveryStaff = [] } = useDeliveryStaffContext() || {};
  const { fuelLogs = [] } = useFuelLogContext() || {};
  const { staffList = [] } = useStaffContext() || {};
  const { payrollRecords = [] } = useStaffPayrollContext() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};
  const { suppliers = [] } = useSupplierContext() || {};
  const { auditEvents = [] } = useAuditContext() || {};
  const { transactions = [] } = useTransactionContext() || {};

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

  const customerList = useMemo(() => {
    return rawCustomers?.length ? rawCustomers : customers;
  }, [rawCustomers, customers]);

  const allStaff = useMemo(() => {
    return staffList?.length ? staffList : deliveryStaff;
  }, [staffList, deliveryStaff]);

  // Dynamic preview generator with robust fallbacks
  const preview = useMemo(() => {
    switch (selectedModule) {
      case 'animals': {
        const headers = [
          'Animal ID',
          'Ear Tag',
          'Name',
          'Species',
          'Lactation Status',
          'Morning Yield (L)',
          'Evening Yield (L)',
          'Total Daily Yield (L)',
          'Acquisition Date',
          'Purchase Price (Rs)',
          'Health Status',
        ];
        const rows = animals.map((a) => [
          a.id || a._id,
          a.tag || 'N/A',
          a.name || a.tag || 'Cattle',
          a.species || 'Buffalo',
          a.lactationStatus || 'Lactating',
          Number(a.morningYield || 0).toFixed(1),
          Number(a.eveningYield || 0).toFixed(1),
          Number(a.totalDailyYield || (Number(a.morningYield || 0) + Number(a.eveningYield || 0))).toFixed(1),
          a.acquisitionDate || a.createdAt?.split('T')[0] || '-',
          a.purchasePrice ? `Rs. ${Number(a.purchasePrice).toLocaleString()}` : '-',
          a.healthStatus || 'Healthy',
        ]);
        const totalYield = rows.reduce((acc, r) => acc + parseFloat(r[7] || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', '', 'Total Herd Production (L)', `${totalYield.toFixed(1)} Liters`, '', '', `Active Animals: ${rows.length}`],
          ],
        };
      }

      case 'procurement': {
        const filtered = (intakeLogs || []).filter((item) => isDateInRange(item.date));
        const headers = [
          'Slip ID',
          'Date',
          'Time / Shift',
          'Supplier ID',
          'Supplier Name',
          'Area / Route',
          'Quantity (Liters)',
          'Fat %',
          'LR Reading',
          'SNF %',
          'Rate / Liter (Rs)',
          'Total Gross (Rs)',
          'Paid Amount (Rs)',
          'Pending Balance (Rs)',
          'Settlement Status',
          'Received By',
        ];
        const rows = filtered.map((r) => [
          r.id || r._id,
          r.date || '-',
          r.time || r.shift || 'Morning',
          r.supplierId || '-',
          r.supplierName || 'Dairy Supplier',
          r.area || r.villageOrLocation || 'Local Route',
          Number(r.quantity || 0).toFixed(1),
          Number(r.fat || 0).toFixed(2),
          Number(r.lr || 0).toFixed(1),
          Number(r.snf || 0).toFixed(2),
          `Rs. ${Number(r.ratePerLiter || 0).toFixed(1)}`,
          `Rs. ${Number(r.totalCost || 0).toLocaleString()}`,
          `Rs. ${Number(r.paidAmount || 0).toLocaleString()}`,
          `Rs. ${Number(r.pendingAmount || 0).toLocaleString()}`,
          r.settlement || (Number(r.pendingAmount || 0) === 0 ? 'Paid' : 'Pending'),
          r.receivedBy || 'System',
        ]);
        const totalLiters = filtered.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
        const totalCost = filtered.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
        const totalPaid = filtered.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', 'Total Milk Procurement', `${totalLiters.toFixed(1)} Liters`, '', '', '', '', `Rs. ${totalCost.toLocaleString()}`, `Rs. ${totalPaid.toLocaleString()}`, `Rs. ${(totalCost - totalPaid).toLocaleString()}`, '', `Slips: ${rows.length}`],
          ],
        };
      }

      case 'suppliers': {
        const headers = [
          'Supplier Code',
          'Full Name',
          'Phone / Contact',
          'Area / Village',
          'Base Rate (Rs/L)',
          'Expected Daily (L)',
          'Total Delivered (L)',
          'Total Cost Payable (Rs)',
          'Total Cleared (Rs)',
          'Current Balance Due (Rs)',
          'Status',
          'Registration Date',
        ];
        const rows = (suppliers || []).map((s) => {
          const supIntakes = (intakeLogs || []).filter(
            (l) => String(l.supplierId) === String(s.id || s._id) || l.supplierName === s.name
          );
          const totalLit = supIntakes.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
          const totalCost = supIntakes.reduce((sum, i) => sum + (Number(i.totalCost) || 0), 0);
          const totalPaid = supIntakes.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0);
          const balance = totalCost - totalPaid;

          return [
            s.code || `SUP-${String(s.id || s._id).slice(-4)}`,
            s.name || 'Dairy Farmer',
            s.phone || s.contact || '-',
            s.area || s.villageOrLocation || 'Central',
            `Rs. ${Number(s.ratePerLiter || s.baseRate || 220).toFixed(1)}`,
            `${Number(s.avgLiters || s.expectedDailyQuantity || 0).toFixed(1)} L`,
            `${totalLit.toFixed(1)} L`,
            `Rs. ${totalCost.toLocaleString()}`,
            `Rs. ${totalPaid.toLocaleString()}`,
            `Rs. ${balance.toLocaleString()}`,
            s.status || 'Active',
            s.joinDate || s.createdAt?.split('T')[0] || '-',
          ];
        });
        return { headers, rows, count: rows.length };
      }

      case 'expenses': {
        const filtered = expenses.filter((e) => isDateInRange(e.date));
        const headers = [
          'Expense ID',
          'Date',
          'Category',
          'Description / Purpose',
          'Amount (Rs)',
          'Payment Mode',
          'Receipt / Voucher Ref',
          'Authorized By',
        ];
        const rows = filtered.map((e) => [
          e.id || e._id,
          e.date || '-',
          e.category || 'General Operations',
          e.description || e.notes || 'Operating expense',
          `Rs. ${Number(e.amount || 0).toLocaleString()}`,
          e.paymentMethod || e.paymentMode || 'Cash',
          e.receiptRef || e.voucherNumber || 'N/A',
          e.authorizedBy || e.loggedBy || 'Admin',
        ]);
        const totalExp = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', 'Total Expenses Logged', `Rs. ${totalExp.toLocaleString()}`, '', '', `Entries: ${rows.length}`],
          ],
        };
      }

      case 'pos_sales': {
        const filtered = salesHistory.filter((s) => isDateInRange(s.timestamp || s.formattedDate || s.date));
        const headers = [
          'Invoice ID',
          'Date',
          'Time',
          'Order Category',
          'Customer Name',
          'Items Summary',
          'Subtotal (Rs)',
          'Discount (Rs)',
          'Delivery Charge (Rs)',
          'Net Payable (Rs)',
          'Payment Method',
          'Cashier / Station',
        ];
        const rows = filtered.map((s) => [
          s.invoiceId || s.id || `INV-${Date.now()}`,
          s.formattedDate || s.date || s.timestamp?.split('T')[0] || '-',
          s.formattedTime || s.time || '-',
          s.saleCategory || 'Counter Walk-in',
          s.customer?.name || s.walkinCustomer?.name || s.customerName || 'Walk-in Customer',
          (s.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; ') || 'Standard Sale',
          `Rs. ${Number(s.subtotal || 0).toLocaleString()}`,
          `Rs. ${Number(s.discount || 0).toLocaleString()}`,
          `Rs. ${Number(s.deliveryCharge || 0).toLocaleString()}`,
          `Rs. ${Number(s.netPayable || s.total || 0).toLocaleString()}`,
          s.paymentMethod || 'Cash',
          s.cashier || 'Main Counter',
        ]);
        const totalRevenue = filtered.reduce((sum, s) => sum + (Number(s.netPayable || s.total) || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', 'Total Net Realized Revenue', '', '', '', `Rs. ${totalRevenue.toLocaleString()}`, '', `Invoices: ${rows.length}`],
          ],
        };
      }

      case 'deliveries': {
        const filtered = deliveries.filter((d) => isDateInRange(d.date || d.createdAt));
        const headers = [
          'Run Code',
          'Date',
          'Shift',
          'Customer Name',
          'Delivery Address',
          'Route / Sector',
          'Item Description',
          'Quantity (Liters)',
          'Payment Mode',
          'COD Amount Due (Rs)',
          'Delivery Status',
          'Assigned Rider',
        ];
        const rows = filtered.map((d) => [
          d.runCode || `RUN-${d.id}`,
          d.date || '-',
          d.shift || 'Morning',
          d.customerName || 'Customer',
          d.deliveryAddress || 'Doorstep',
          d.route || 'General Route',
          d.itemDescription || 'Fresh Farm Milk',
          Number(d.qtyLiters || d.quantity || 0).toFixed(1),
          d.paymentMode || 'COD Cash',
          `Rs. ${Number(d.codAmountToCollect || 0).toLocaleString()}`,
          d.status || 'Delivered',
          d.riderNameSnapshot || d.rider || 'Delivery Staff',
        ]);
        const totalLiters = filtered.reduce((sum, d) => sum + (Number(d.qtyLiters || d.quantity) || 0), 0);
        const totalCod = filtered.reduce((sum, d) => sum + (Number(d.codAmountToCollect) || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', '', 'Total Delivered Volume', `${totalLiters.toFixed(1)} Liters`, '', `Rs. ${totalCod.toLocaleString()}`, '', `Runs: ${rows.length}`],
          ],
        };
      }

      case 'customers': {
        const headers = [
          'Customer ID',
          'Customer Name',
          'Phone Number',
          'Secondary Phone',
          'Delivery Area',
          'Street Address',
          'Shift Preference',
          'Active Subscription',
          'Payment Terms',
          'Credit Limit (Rs)',
          'Current Khata Due (Rs)',
          'Account Status',
          'Member Since',
        ];
        const rows = customerList.map((c) => [
          c.id || c._id,
          c.name || 'Account Holder',
          c.phone || '-',
          c.secondaryPhone || '-',
          c.area || 'City',
          c.address || '-',
          c.shift || 'Both Shifts',
          c.subscription || 'Fresh Farm Milk',
          c.paymentMode || 'Weekly Khata',
          `Rs. ${Number(c.creditLimit || 0).toLocaleString()}`,
          `Rs. ${Number(c.khataBalance || c.currentBalance || 0).toLocaleString()}`,
          c.status || 'Active',
          c.createdAt?.split('T')[0] || '-',
        ]);
        const totalKhata = customerList.reduce((sum, c) => sum + (Number(c.khataBalance || c.currentBalance) || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', '', '', '', '', 'Total Receivables Ledger Due', `Rs. ${totalKhata.toLocaleString()}`, '', `Total Accounts: ${rows.length}`],
          ],
        };
      }

      case 'khata_ledger': {
        const headers = [
          'Txn ID',
          'Customer ID',
          'Customer Name',
          'Customer Phone',
          'Date',
          'Transaction Type',
          'Description',
          'Debit / Charged (Rs)',
          'Credit / Paid (Rs)',
          'Running Balance (Rs)',
          'Payment Method',
          'Notes',
        ];
        const allTxns = [];
        let grandDebit = 0;
        let grandCredit = 0;

        Object.entries(ledgers || {}).forEach(([custId, txns]) => {
          const cust = customerList.find((c) => String(c.id || c._id) === String(custId));
          const custName = cust ? cust.name : `Customer #${custId}`;
          const custPhone = cust ? cust.phone : '-';

          (txns || []).forEach((t) => {
            if (isDateInRange(t.date)) {
              const debit = Number(t.debit) || 0;
              const credit = Number(t.credit) || 0;
              grandDebit += debit;
              grandCredit += credit;

              allTxns.push([
                t.id || t._id || `TX-${allTxns.length + 1}`,
                custId,
                custName,
                custPhone,
                t.date || '-',
                t.type || 'ADJUSTMENT',
                t.description || 'Ledger entry',
                `Rs. ${debit.toLocaleString()}`,
                `Rs. ${credit.toLocaleString()}`,
                `Rs. ${Number(t.runningBalance || 0).toLocaleString()}`,
                t.method || '-',
                t.notes || '-',
              ]);
            }
          });
        });

        return {
          headers,
          rows: allTxns,
          count: allTxns.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', '', 'Total Period Ledger Movement', `Rs. ${grandDebit.toLocaleString()}`, `Rs. ${grandCredit.toLocaleString()}`, '', '', `Entries: ${allTxns.length}`],
          ],
        };
      }

      case 'payments': {
        const paymentList = [];
        // Derive payments from transactions context & customer ledgers
        (transactions || []).forEach((tx) => {
          if (tx.type === 'Payment' || tx.channel === 'Online' || tx.type === 'Adjustment') {
            if (isDateInRange(tx.timestamp || tx.date)) {
              paymentList.push([
                tx.id || tx.referenceId,
                (tx.timestamp || tx.date)?.split('T')[0] || '-',
                tx.customerName || 'Customer',
                tx.type || 'Payment',
                tx.channel || 'Cash',
                `Rs. ${Number(tx.amount || 0).toLocaleString()}`,
                tx.referenceId || '-',
                tx.description || 'Customer Khata Payment',
                tx.cashier || 'System Cashier',
              ]);
            }
          }
        });

        // Also pull credit entries from ledgers if transactions list is light
        if (paymentList.length === 0) {
          Object.entries(ledgers || {}).forEach(([custId, txns]) => {
            const cust = customerList.find((c) => String(c.id || c._id) === String(custId));
            (txns || []).forEach((t) => {
              if (Number(t.credit) > 0 && isDateInRange(t.date)) {
                paymentList.push([
                  t.id || `REC-${paymentList.length + 1}`,
                  t.date || '-',
                  cust?.name || `Customer #${custId}`,
                  'Khata Collection',
                  t.method || 'Cash',
                  `Rs. ${Number(t.credit || 0).toLocaleString()}`,
                  t.reference || t.id || '-',
                  t.description || 'Payment Received',
                  'Accounts Cashier',
                ]);
              }
            });
          });
        }

        const headers = [
          'Receipt ID',
          'Date',
          'Customer / Payee',
          'Transaction Category',
          'Payment Channel',
          'Amount Received (Rs)',
          'Reference No',
          'Description',
          'Collected By',
        ];
        const totalCollected = paymentList.reduce((sum, p) => sum + (parseFloat(p[5]?.replace(/[^0-9.]/g, '')) || 0), 0);

        return {
          headers,
          rows: paymentList,
          count: paymentList.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', 'Total Payments Collected', `Rs. ${totalCollected.toLocaleString()}`, '', '', `Receipts: ${paymentList.length}`],
          ],
        };
      }

      case 'products': {
        const headers = [
          'Product SKU',
          'Product Name',
          'Category',
          'Unit Measurement',
          'Retail Price (Rs)',
          'Wholesale Price (Rs)',
          'Cost Price (Rs)',
          'Storage Temperature',
          'Barcode',
          'Status',
        ];
        const rows = (products || []).map((p) => [
          p.sku || p.id || `PRD-${p.name?.slice(0, 3).toUpperCase()}`,
          p.name || 'Dairy Product',
          p.category || 'Dairy',
          p.unit || 'Liter',
          `Rs. ${Number(p.price || 0).toLocaleString()}`,
          `Rs. ${Number(p.wholesalePrice || p.price || 0).toLocaleString()}`,
          `Rs. ${Number(p.cost || 0).toLocaleString()}`,
          p.storage || 'Chiller (+4°C)',
          p.barcode || '-',
          p.status || 'Active',
        ]);
        return { headers, rows, count: rows.length };
      }

      case 'users': {
        const headers = [
          'Staff ID',
          'Employee Name',
          'Designation / Role',
          'Contact Mobile',
          'CNIC Number',
          'Assigned Shift',
          'Monthly Base Salary (Rs)',
          'Daily Wage Rate (Rs)',
          'Route / Station Assignment',
          'Duty Status',
          'Joining Date',
        ];
        const rows = allStaff.map((s) => [
          s.id || s.staffId || `STF-${s.name?.slice(0, 3)}`,
          s.name || 'Staff Member',
          s.role || s.designation || 'Staff',
          s.mobile || s.phone || '-',
          s.cnic || '-',
          s.shift || 'Morning',
          `Rs. ${Number(s.monthlySalary || s.salary || 0).toLocaleString()}`,
          `Rs. ${Number(s.dailyWage || Math.round((Number(s.monthlySalary || s.salary || 0)) / 30) || 0).toLocaleString()}`,
          s.route || s.station || 'Main Dairy Facility',
          s.status || 'Active On-Duty',
          s.joinedDate || s.createdAt?.split('T')[0] || '-',
        ]);
        const totalSalaries = allStaff.reduce((sum, s) => sum + (Number(s.monthlySalary || s.salary) || 0), 0);
        return {
          headers,
          rows,
          count: rows.length,
          summaryRows: [
            ['SUMMARY TOTALS', '', '', '', '', 'Total Monthly Payroll Obligation', `Rs. ${totalSalaries.toLocaleString()}`, '', '', '', `Headcount: ${rows.length}`],
          ],
        };
      }

      case 'audit_log': {
        const filtered = (auditEvents || []).filter((e) => isDateInRange(e.timestamp?.split('T')[0]));
        const headers = [
          'Log Event ID',
          'Timestamp',
          'User / Operator',
          'System Module',
          'Action Executed',
          'Event Details / Changes',
          'IP / Network Address',
        ];
        const rows = filtered.map((e) => [
          e.id || `EVT-${Date.now()}`,
          e.timestamp || new Date().toLocaleString(),
          e.user || 'Admin',
          e.module || 'System',
          e.action || 'Activity',
          e.detail || e.description || '-',
          e.ipAddress || 'Internal Network',
        ]);
        return { headers, rows, count: rows.length };
      }

      case 'daily_closing': {
        const totalHerdYield = animals.reduce((sum, a) => sum + (parseFloat(a.totalDailyYield) || 0), 0);
        const filteredIntakes = intakeLogs.filter((i) => isDateInRange(i.date));
        const totalSupplierInflow = filteredIntakes.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
        const totalAvailableMilk = totalHerdYield + totalSupplierInflow;

        const filteredSales = salesHistory.filter((s) => isDateInRange(s.timestamp || s.formattedDate));
        const totalCounterSales = filteredSales.reduce((sum, s) => sum + (Number(s.netPayable || s.total) || 0), 0);

        const filteredDeliveries = deliveries.filter((d) => isDateInRange(d.date || d.createdAt));
        const totalDeliveryLit = filteredDeliveries.reduce((sum, d) => sum + (Number(d.qtyLiters) || 0), 0);
        const totalCodCollected = filteredDeliveries.reduce((sum, d) => sum + (Number(d.codAmountToCollect) || 0), 0);

        const filteredExpenses = expenses.filter((e) => isDateInRange(e.date));
        const totalExp = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const totalCashCollected = totalCounterSales + totalCodCollected;
        const netCashLiquidFlow = totalCashCollected - totalExp;

        const headers = ['Financial & Operational Metric', 'Reconciled Value', 'Operational Context / Audit Notes'];
        const rows = [
          ['Closing Audit Period', period === 'custom' ? `${startDate} to ${endDate}` : singleDate, 'Target date range'],
          ['Herd Milking Yield (Farm)', `${totalHerdYield.toFixed(1)} Liters`, 'Recorded from animal milking register'],
          ['Supplier Milk Inflow (Procurement)', `${totalSupplierInflow.toFixed(1)} Liters`, `Logged across ${filteredIntakes.length} supplier intake slips`],
          ['Total Combined Milk Available', `${totalAvailableMilk.toFixed(1)} Liters`, 'Farm production + external supplier sourcing'],
          ['Doorstep Deliveries Volume', `${totalDeliveryLit.toFixed(1)} Liters`, `Dispatched across ${filteredDeliveries.length} active runs`],
          ['POS Counter Gross Sales', `Rs. ${totalCounterSales.toLocaleString()}`, `Generated from ${filteredSales.length} retail invoices`],
          ['Doorstep Delivery COD Recoveries', `Rs. ${totalCodCollected.toLocaleString()}`, 'Rider cash collections on delivery'],
          ['Total Cash Revenue Collections', `Rs. ${totalCashCollected.toLocaleString()}`, 'Gross cash inflows received'],
          ['Total Operating Expenses Paid', `Rs. ${totalExp.toLocaleString()}`, `Feed, wages, fuel & maintenance across ${filteredExpenses.length} vouchers`],
          ['Net Operational Liquid Cash Flow', `Rs. ${netCashLiquidFlow.toLocaleString()}`, 'Total Collections minus Total Operating Expenses'],
        ];
        return { headers, rows, count: rows.length };
      }

      default: {
        const headers = ['System Module', 'Active Records Count', 'Operational Status'];
        const rows = [
          ['Herd Animals & Yield', animals.length, 'Active in herd'],
          ['Milk Procurement Slips', intakeLogs.length, 'Logged in register'],
          ['Dairy Suppliers', suppliers.length, 'Registered'],
          ['POS Retail Invoices', salesHistory.length, 'Processed'],
          ['Doorstep Delivery Runs', deliveries.length, 'Dispatched'],
          ['Customer Accounts', customerList.length, 'Active in directory'],
          ['Customer Ledgers', Object.keys(ledgers).length, 'Active ledgers'],
          ['Operating Expenses', expenses.length, 'Vouchers logged'],
          ['Products Catalog', products.length, 'SKUs active'],
          ['Staff & Payroll Roster', allStaff.length, 'On duty'],
          ['Audit Trail Events', auditEvents.length, 'Events logged'],
        ];
        return { headers, rows, count: rows.length };
      }
    }
  }, [
    selectedModule,
    period,
    singleDate,
    startDate,
    endDate,
    animals,
    expenses,
    customerList,
    ledgers,
    products,
    salesHistory,
    deliveries,
    allStaff,
    intakeLogs,
    suppliers,
    auditEvents,
    transactions,
  ]);

  const handleExport = () => {
    const periodLabel = period === 'custom' ? `${startDate}_to_${endDate}` : period === 'today' ? singleDate : period;
    const dateRangeMeta = [
      ['Export Period Mode', period.toUpperCase()],
      ['Filter Range', period === 'custom' ? `${startDate} to ${endDate}` : period === 'today' ? singleDate : 'All Available Records'],
      ['Report Title', MODULES_LIST.find((m) => m.id === selectedModule)?.name || selectedModule],
    ];

    if (selectedModule === 'all') {
      // Build master multi-section bundle
      const sections = [
        {
          title: 'Daily Closing & Liquid Flow Summary',
          description: 'Reconciled milk flow and operational cash flow for period',
          headers: ['Metric', 'Value', 'Audit Context'],
          rows: [
            ['Report Period', periodLabel, 'Master System Bundle'],
            ['Total Animals in Herd', animals.length, 'Cattle Registry'],
            ['Total Procurement Slips', intakeLogs.length, 'Intake Register'],
            ['Total POS Sales Invoices', salesHistory.length, 'Counter Sales'],
            ['Total Doorstep Deliveries', deliveries.length, 'Delivery Logistics'],
            ['Total Registered Customers', customerList.length, 'Directory'],
            ['Total Registered Suppliers', suppliers.length, 'Procurement Registry'],
            ['Total Active Staff', allStaff.length, 'Payroll Roster'],
          ],
        },
        {
          title: 'Milk Procurement & Intake Slips',
          description: 'External farmer batches and quality tests',
          headers: ['Slip ID', 'Date', 'Supplier Name', 'Shift', 'Liters', 'Fat %', 'Rate/L (Rs)', 'Total (Rs)', 'Status'],
          rows: intakeLogs.filter((i) => isDateInRange(i.date)).map((r) => [
            r.id, r.date, r.supplierName, r.shift, r.quantity, r.fat, r.ratePerLiter, r.totalCost, r.settlement
          ]),
        },
        {
          title: 'Dairy Suppliers Registry',
          description: 'Farmer profiles and procurement balances',
          headers: ['Code', 'Supplier Name', 'Phone', 'Area', 'Base Rate (Rs)', 'Expected Daily (L)', 'Status'],
          rows: suppliers.map((s) => [
            s.code || s.id, s.name, s.phone || s.contact, s.area, s.ratePerLiter || 220, s.avgLiters || 0, s.status || 'Active'
          ]),
        },
        {
          title: 'POS Sales & Invoices',
          description: 'Counter retail orders and customer billings',
          headers: ['Invoice ID', 'Date', 'Customer', 'Items', 'Net Payable (Rs)', 'Payment Method'],
          rows: salesHistory.filter((s) => isDateInRange(s.timestamp || s.formattedDate)).map((s) => [
            s.invoiceId, s.formattedDate || s.timestamp?.split('T')[0], s.customer?.name || s.walkinCustomer?.name || 'Walk-in',
            (s.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; '), s.netPayable, s.paymentMethod
          ]),
        },
        {
          title: 'Doorstep Deliveries & Subscriptions',
          description: 'Customer daily milk drops and rider logs',
          headers: ['Run Code', 'Date', 'Shift', 'Customer', 'Address', 'Quantity (L)', 'COD Due (Rs)', 'Status'],
          rows: deliveries.filter((d) => isDateInRange(d.date || d.createdAt)).map((d) => [
            d.runCode || d.id, d.date, d.shift, d.customerName, d.deliveryAddress, d.qtyLiters, d.codAmountToCollect, d.status
          ]),
        },
        {
          title: 'Customer Directory & Khata Balances',
          description: 'Account profiles, routes and outstanding ledger balances',
          headers: ['Customer ID', 'Name', 'Phone', 'Area', 'Shift', 'Payment Mode', 'Credit Limit (Rs)', 'Khata Balance (Rs)', 'Status'],
          rows: customerList.map((c) => [
            c.id, c.name, c.phone, c.area, c.shift, c.paymentMode, c.creditLimit || 0, c.khataBalance || c.currentBalance || 0, c.status
          ]),
        },
        {
          title: 'Herd Animals & Milk Yield',
          description: 'Herd inventory, lactation stages and daily production yields',
          headers: ['Tag', 'Name', 'Species', 'Lactation', 'Morning (L)', 'Evening (L)', 'Total Daily (L)', 'Health'],
          rows: animals.map((a) => [
            a.tag, a.name, a.species, a.lactationStatus, a.morningYield, a.eveningYield, a.totalDailyYield, a.healthStatus
          ]),
        },
        {
          title: 'Farm & Operational Expenses',
          description: 'Itemized operating vouchers, feed and facility bills',
          headers: ['ID', 'Date', 'Category', 'Description', 'Amount (Rs)', 'Payment Mode', 'Authorized By'],
          rows: expenses.filter((e) => isDateInRange(e.date)).map((e) => [
            e.id, e.date, e.category, e.description, e.amount, e.paymentMethod, e.authorizedBy || 'Admin'
          ]),
        },
        {
          title: 'Products Catalog & Rates',
          description: 'Active inventory SKUs, retail and wholesale prices',
          headers: ['SKU', 'Product Name', 'Category', 'Unit', 'Retail Price (Rs)', 'Cost (Rs)', 'Status'],
          rows: products.map((p) => [
            p.sku || p.id, p.name, p.category, p.unit, p.price, p.cost, p.status
          ]),
        },
        {
          title: 'Staff Directory & Payroll Roster',
          description: 'Employees, duties, shifts and monthly salaries',
          headers: ['Staff ID', 'Name', 'Role', 'Mobile', 'Shift', 'Monthly Salary (Rs)', 'Status'],
          rows: allStaff.map((s) => [
            s.id, s.name, s.role, s.mobile || s.phone, s.shift, s.monthlySalary || s.salary, s.status
          ]),
        },
      ];

      exportMultiSectionCSV({
        filename: `PureMilkBar_COMPLETE_BUNDLE_${periodLabel}`,
        title: 'Pure Milk Bar ERP — Master Multi-Module Operational & Audit Bundle',
        metadata: dateRangeMeta,
        sections,
      });

      setToastMessage('Exported complete multi-module bundle CSV report successfully!');
    } else {
      const moduleMeta = MODULES_LIST.find((m) => m.id === selectedModule);
      exportTableToCSV({
        filename: `PureMilkBar_${selectedModule}_${periodLabel}`,
        title: `${moduleMeta?.name || selectedModule} Report`,
        metadata: dateRangeMeta,
        headers: preview.headers,
        rows: preview.rows,
        summaryRows: preview.summaryRows || [],
      });

      setToastMessage(`Exported ${moduleMeta?.name || selectedModule} CSV successfully!`);
    }

    setTimeout(() => {
      onClose();
    }, 800);
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
              Export CSV Data &amp; Custom Date Filter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Generate structured, audit-ready CSV exports with full operational data for Microsoft Excel, Google Sheets, or Tally.
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
                    UTF-8 BOM Enabled
                  </span>
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5 font-sans">
                  Includes comprehensive datasets, proper character escaping, currency metrics, and date range filtering.
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
                  2. Select Date Period &amp; Range
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
                  Export Preview &amp; Filtered Output Summary
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

                {preview.count > 0 ? (
                  <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span>
                      First record sample: <strong className="text-slate-900 font-bold">{String(preview.rows[0]?.[1] || preview.rows[0]?.[0])}</strong>
                    </span>
                    <span className="font-semibold text-emerald-800">Ready to download .CSV</span>
                  </div>
                ) : (
                  <div className="mt-3 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    No records found for this module in the selected date range ({period}). Exporting will generate the structured headers and summary schema.
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
                  Downloading will create a master structured CSV document containing formatted sections for Daily Closing, Milk Procurement, Suppliers Registry, POS Invoices, Deliveries, Customer Directory, Customer Ledgers, Herd Animals, Operating Expenses, Products, and Staff Payroll!
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0 bg-slate-50/80 rounded-b-2xl">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Compatible with MS Excel, Tally &amp; Google Sheets
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
