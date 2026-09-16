import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Milk, Search, Download, ShoppingCart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimalContext } from '@/context/AnimalContext';
import { useExpense } from '@/context/ExpenseContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useLedgerContext } from '@/context/LedgerContext';
import { usePOSContext, deliveryRidersList } from '@/context/POSContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
import { useStaffContext } from '@/context/StaffContext';
import { exportToCSV } from '@/utils/csvExporter';

export default function Navbar() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { animals = [] } = useAnimalContext() || {};
  const { expenses = [] } = useExpense() || {};
  const { customers = [], rawCustomers = [] } = useCustomerContext() || {};
  const { ledgers = {} } = useLedgerContext() || {};
  const { products = [], salesHistory = [] } = usePOSContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList: deliveryStaffList = [] } = useDeliveryStaffContext() || {};
  const { fuelLogs = [] } = useFuelLogContext() || {};
  const { staffList = [] } = useStaffContext() || {};

  const getBreadcrumbs = (pathname, search) => {
    const searchParams = new URLSearchParams(search);
    const tabParam = searchParams.get('tab');
    const viewParam = searchParams.get('view');
    const idParam = searchParams.get('id');

    const crumbs = [
      {
        label: 'Pure Milk Bar',
        to: '/dashboard',
        isRoot: true,
      },
    ];

    if (pathname.startsWith('/delivery')) {
      crumbs.push({
        label: 'Doorstep Deliveries',
        to: '/delivery',
      });

      if (tabParam === 'fleet') {
        crumbs.push({
          label: 'Fleet & Staff',
          to: '/delivery?tab=fleet',
        });
        if (viewParam === 'registerStaff') {
          crumbs.push({ label: 'Register New Staff', to: null });
        } else if (viewParam === 'viewStaff') {
          const matchedStaff = deliveryStaffList.find((s) => String(s.id) === String(idParam));
          crumbs.push({
            label: matchedStaff ? `${matchedStaff.name}` : idParam ? `Staff #${idParam}` : 'Staff Details',
            to: null,
          });
        }
      } else if (tabParam === 'fuel') {
        crumbs.push({
          label: 'Fuel Log',
          to: '/delivery?tab=fuel',
        });
        if (viewParam === 'logFuel') {
          crumbs.push({ label: 'Log Fuel Receipt', to: null });
        }
      } else {
        crumbs.push({
          label: 'Drop Points',
          to: '/delivery?tab=drop-points',
        });
        if (viewParam === 'bookDelivery') {
          crumbs.push({ label: 'Book New Delivery', to: null });
        } else if (viewParam === 'viewDelivery') {
          const matchedDelivery = deliveries.find((d) => String(d.id) === String(idParam));
          crumbs.push({
            label: matchedDelivery
              ? `${matchedDelivery.runCode} (${matchedDelivery.customerName})`
              : idParam
              ? `Run #${idParam}`
              : 'Delivery Details',
            to: null,
          });
        }
      }
      return crumbs;
    }

    if (pathname.startsWith('/farm')) {
      crumbs.push({
        label: 'Farm Operations',
        to: '/farm',
      });

      if (pathname.includes('/animals/detail/')) {
        const animalId = pathname.split('/animals/detail/')[1];
        const matchedAnimal = animals.find(
          (a) => String(a.id) === String(animalId) || String(a.tag).toLowerCase() === String(animalId).toLowerCase()
        );
        crumbs.push({ label: 'Animals Herd', to: '/farm/animals' });
        crumbs.push({
          label: matchedAnimal ? `${matchedAnimal.tag} (${matchedAnimal.species})` : `Animal #${animalId}`,
          to: null,
        });
      } else if (pathname.includes('/animals')) {
        crumbs.push({ label: 'Animals Herd', to: '/farm/animals' });
      } else if (pathname.includes('/expenses/new')) {
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
        crumbs.push({ label: 'Record New Expense', to: null });
      } else if (pathname.includes('/expenses/edit/')) {
        const expId = pathname.split('/expenses/edit/')[1];
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
        crumbs.push({ label: `Edit Expense #${expId}`, to: null });
      } else if (pathname.includes('/expenses/detail/')) {
        const expId = pathname.split('/expenses/detail/')[1];
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
        crumbs.push({ label: `Expense #${expId}`, to: null });
      } else if (pathname.includes('/expenses')) {
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
      } else if (pathname.includes('/milking')) {
        crumbs.push({ label: 'Milking Register', to: '/farm/milking' });
      } else if (pathname.includes('/processing')) {
        crumbs.push({ label: 'Dahi Processing', to: '/farm/processing' });
      } else if (pathname.includes('/pl')) {
        crumbs.push({ label: 'Farm P&L', to: '/farm/pl' });
      } else if (pathname.includes('/dailysheet')) {
        crumbs.push({ label: 'Daily Sheet', to: '/farm/dailysheet' });
      } else {
        crumbs.push({ label: 'Farm Dashboard', to: '/farm' });
      }
      return crumbs;
    }

    if (pathname.startsWith('/customer-khata-ledger')) {
      crumbs.push({ label: 'Customer Management', to: '/customer' });
      crumbs.push({ label: 'Customer Khata Ledger', to: '/customer-khata-ledger' });
      return crumbs;
    }

    if (pathname.startsWith('/customer')) {
      crumbs.push({ label: 'Customer Management', to: '/customer' });
      crumbs.push({ label: 'Customers Directory', to: '/customer' });
      return crumbs;
    }

    if (pathname.startsWith('/finance/delivery')) {
      crumbs.push({ label: 'Finance & Accounts', to: '/finance/customer' });
      crumbs.push({ label: 'Rider & Delivery Finance', to: '/finance/delivery' });
      return crumbs;
    }

    if (pathname.startsWith('/finance/customer')) {
      crumbs.push({ label: 'Finance & Accounts', to: '/finance/customer' });
      crumbs.push({ label: 'Customer Finance Ledger', to: '/finance/customer' });
      return crumbs;
    }

    if (pathname.startsWith('/finance/daily-closing')) {
      crumbs.push({ label: 'Finance & Accounts', to: '/finance/daily-closing' });
      crumbs.push({ label: 'Daily Closing & Audit', to: '/finance/daily-closing' });
      return crumbs;
    }

    if (pathname.startsWith('/finance/staff') || pathname.startsWith('/staff')) {
      crumbs.push({ label: 'Staff Management', to: '/staff' });
      crumbs.push({ label: 'Staff Directory & Payroll', to: '/staff' });
      return crumbs;
    }

    if (pathname.startsWith('/supplier')) {
      crumbs.push({ label: 'Supplier Sourcing', to: '/supplier' });
      crumbs.push({ label: 'Milk Suppliers', to: '/supplier' });
      return crumbs;
    }

    if (pathname.startsWith('/proccessing')) {
      crumbs.push({ label: 'Processing & Batching', to: '/proccessing' });
      crumbs.push({ label: 'Dahi & Milk Processing', to: '/proccessing' });
      return crumbs;
    }

    if (pathname.startsWith('/pos')) {
      crumbs.push({ label: 'Sales & Billing', to: '/pos' });
      crumbs.push({ label: 'Counter Point of Sale', to: '/pos' });
      return crumbs;
    }

    if (pathname.startsWith('/products')) {
      crumbs.push({ label: 'Product Inventory', to: '/products' });
      crumbs.push({ label: 'Dairy Catalog', to: '/products' });
      return crumbs;
    }

    crumbs.push({ label: 'Dashboard Overview', to: '/dashboard' });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs(location.pathname, location.search);

  const handleExportCSV = () => {
    const pathname = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (pathname.includes('/farm/animals/detail/')) {
      const animalId = pathname.split('/animals/detail/')[1];
      const matchedAnimal = animals.find(
        (a) => String(a.id) === String(animalId) || String(a.tag).toLowerCase() === String(animalId).toLowerCase()
      );
      if (matchedAnimal && matchedAnimal.history) {
        const headers = ['Date', 'Animal Tag', 'Species', 'Morning Yield (L)', 'Evening Yield (L)', 'Total Yield (L)'];
        const rows = matchedAnimal.history.map((h) => [
          h.date,
          matchedAnimal.tag,
          matchedAnimal.species,
          h.morning,
          h.evening,
          (Number(h.morning || 0) + Number(h.evening || 0)).toFixed(1),
        ]);
        exportToCSV(`animal_${matchedAnimal.tag}_yield_history`, headers, rows);
        return;
      }
    }

    if (pathname.includes('/farm/animals')) {
      const headers = ['ID', 'Tag', 'Name', 'Species', 'Lactation Status', 'Morning Yield', 'Evening Yield', 'Total Daily Yield', 'Acquisition Date', 'Purchase Price', 'Health Status'];
      const rows = animals.map((a) => [
        a.id,
        a.tag,
        a.name || a.tag,
        a.species,
        a.lactationStatus,
        a.morningYield,
        a.eveningYield,
        a.totalDailyYield,
        a.acquisitionDate,
        a.purchasePrice || '-',
        a.healthStatus || 'Healthy',
      ]);
      exportToCSV('farm_animals_herd', headers, rows);
      return;
    }

    if (pathname.includes('/farm/milking')) {
      const headers = ['ID', 'Tag', 'Name', 'Species', 'Morning Yield (L)', 'Evening Yield (L)', 'Total Daily Yield (L)', 'Status'];
      const rows = animals.map((a) => [
        a.id,
        a.tag,
        a.name || a.tag,
        a.species,
        a.morningYield,
        a.eveningYield,
        a.totalDailyYield,
        a.lactationStatus,
      ]);
      exportToCSV('milking_register', headers, rows);
      return;
    }

    if (pathname.includes('/farm/expenses')) {
      const headers = ['ID', 'Date', 'Category', 'Description', 'Amount (PKR)', 'Payment Method', 'Receipt Ref', 'Authorized By'];
      const rows = (expenses || []).map((e) => [
        e.id,
        e.date,
        e.category,
        e.description,
        e.amount,
        e.paymentMethod,
        e.receiptRef || '-',
        e.authorizedBy || '-',
      ]);
      exportToCSV('farm_expenses_ledger', headers, rows);
      return;
    }

    if (pathname.startsWith('/farm')) {
      const totalYield = animals.reduce((sum, a) => sum + (parseFloat(a.totalDailyYield) || 0), 0);
      const totalExpense = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const headers = ['Metric', 'Value', 'Unit / Notes'];
      const rows = [
        ['Total Registered Animals', animals.length, 'Head'],
        ['Total Milking Animals', animals.filter((a) => a.lactationStatus === 'Milking').length, 'Head'],
        ['Total Daily Farm Milk Yield', totalYield.toFixed(1), 'Liters'],
        ['Total Farm Expenses Recorded', `Rs. ${totalExpense.toLocaleString()}`, 'PKR'],
        ['Report Generation Date', new Date().toLocaleDateString(), 'Generated via PMB ERP'],
      ];
      exportToCSV('farm_operations_summary', headers, rows);
      return;
    }

    if (pathname.startsWith('/pos')) {
      const headers = ['Invoice ID', 'Date', 'Time', 'Category', 'Fulfillment', 'Customer Info', 'Items Summary', 'Subtotal (PKR)', 'Discount (PKR)', 'Delivery Charge (PKR)', 'Net Payable (PKR)', 'Payment Method', 'Cash Tendered', 'Change Due'];
      const rows = (salesHistory || []).map((s) => [
        s.invoiceId,
        s.formattedDate || s.timestamp?.split('T')[0] || '-',
        s.formattedTime || '-',
        s.saleCategory || 'walkin',
        s.fulfillmentMode || 'counter',
        s.customer ? s.customer.name : s.walkinCustomer ? s.walkinCustomer.name : 'Walk-in',
        (s.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; '),
        s.subtotal,
        s.discount,
        s.deliveryCharge,
        s.netPayable,
        s.paymentMethod,
        s.cashTendered ?? '-',
        s.changeDue ?? 0,
      ]);
      exportToCSV('pos_sales_register', headers, rows);
      return;
    }

    if (pathname.startsWith('/products') || pathname.startsWith('/proccessing')) {
      const headers = ['SKU', 'Product Name', 'Category', 'Unit', 'Price (PKR)', 'Cost (PKR)', 'Barcode', 'Storage', 'Status'];
      const rows = (products || []).map((p) => [
        p.sku || p.id,
        p.name,
        p.category,
        p.unit,
        p.price,
        p.cost,
        p.barcode || '-',
        p.storage || 'Chiller',
        p.status || 'Active',
      ]);
      exportToCSV('products_catalog_inventory', headers, rows);
      return;
    }

    if (pathname.startsWith('/delivery')) {
      if (tabParam === 'fleet') {
        const headers = ['Staff ID', 'Name', 'Role', 'Mobile', 'Shift', 'Monthly Salary (PKR)', 'Route', 'Status'];
        const list = staffList?.length ? staffList : deliveryStaffList;
        const rows = (list || []).map((s) => [
          s.id,
          s.name,
          s.role || s.staffType || 'Rider',
          s.mobile || s.phone || '-',
          s.shift || 'Morning',
          s.monthlySalary || s.salary || 0,
          s.route || '-',
          s.status || 'Active',
        ]);
        exportToCSV('delivery_fleet_staff', headers, rows);
        return;
      }

      if (tabParam === 'fuel') {
        const headers = ['Log ID', 'Date', 'Staff Name', 'Liters', 'Amount (PKR)', 'Distance (KM)', 'Notes'];
        const rows = (fuelLogs || []).map((f) => [
          f.id,
          f.date,
          f.staffName,
          f.liters,
          f.amount,
          f.distanceKm,
          f.notes || '-',
        ]);
        exportToCSV('fleet_fuel_logs', headers, rows);
        return;
      }

      const headers = ['Run Code', 'Date', 'Shift', 'Customer Name', 'Delivery Address', 'Route', 'Item Description', 'Quantity (Liters)', 'Payment Mode', 'COD To Collect (PKR)', 'Status', 'Rider'];
      const rows = (deliveries || []).map((d) => [
        d.runCode || `RUN-${d.id}`,
        d.date,
        d.shift,
        d.customerName,
        d.deliveryAddress,
        d.route || '-',
        d.itemDescription,
        d.qtyLiters,
        d.paymentMode,
        d.codAmountToCollect || 0,
        d.status,
        d.riderNameSnapshot || '-',
      ]);
      exportToCSV('doorstep_deliveries_schedule', headers, rows);
      return;
    }

    if (pathname.startsWith('/customer-khata-ledger') || pathname.startsWith('/finance/customer')) {
      const headers = ['Txn ID', 'Customer ID', 'Customer Name', 'Customer Phone', 'Date', 'Type', 'Description', 'Debit (PKR)', 'Credit (PKR)', 'Running Balance (PKR)', 'Payment Method', 'Notes'];
      const allTxns = [];
      const customerList = rawCustomers?.length ? rawCustomers : customers;

      Object.entries(ledgers || {}).forEach(([custId, txns]) => {
        const cust = customerList.find((c) => String(c.id) === String(custId));
        const custName = cust ? cust.name : `Customer #${custId}`;
        const custPhone = cust ? cust.phone : '-';

        (txns || []).forEach((t) => {
          allTxns.push([
            t.id,
            custId,
            custName,
            custPhone,
            t.date,
            t.type,
            t.description,
            t.debit || 0,
            t.credit || 0,
            t.runningBalance || 0,
            t.method || '-',
            t.notes || '-',
          ]);
        });
      });

      exportToCSV('customer_khata_ledgers_all', headers, allTxns);
      return;
    }

    if (pathname.startsWith('/customer')) {
      const headers = ['Customer ID', 'Name', 'Phone', 'Secondary Phone', 'Area', 'Address', 'Shift', 'Subscription', 'Payment Mode', 'Credit Limit (PKR)', 'Khata Balance (PKR)', 'Status', 'Created Date'];
      const customerList = rawCustomers?.length ? rawCustomers : customers;
      const rows = (customerList || []).map((c) => [
        c.id,
        c.name,
        c.phone,
        c.secondaryPhone || '-',
        c.area,
        c.address,
        c.shift,
        c.subscription || 'Fresh Milk',
        c.paymentMode,
        c.creditLimit || 0,
        c.khataBalance || 0,
        c.status,
        c.createdAt || '-',
      ]);
      exportToCSV('customers_accounts_directory', headers, rows);
      return;
    }

    if (pathname.startsWith('/staff') || pathname.startsWith('/finance/staff')) {
      const headers = ['Staff ID', 'Name', 'Role', 'Mobile', 'Email', 'Shift', 'Monthly Salary (PKR)', 'CNIC', 'Route', 'Status', 'Joined Date'];
      const rows = (staffList || []).map((s) => [
        s.id,
        s.name,
        s.role,
        s.mobile,
        s.email || '-',
        s.shift,
        s.monthlySalary || 0,
        s.cnic || '-',
        s.route || '-',
        s.status || 'Active',
        s.joinedDate || '-',
      ]);
      exportToCSV('staff_payroll_directory', headers, rows);
      return;
    }

    if (pathname.startsWith('/finance/delivery')) {
      const headers = ['Rider ID', 'Rider Name', 'Vehicle Type', 'Vehicle Name', 'Plate Number', 'Phone', 'Badge'];
      const rows = (deliveryRidersList || []).map((r) => [
        r.id,
        r.name,
        r.vehicleType,
        r.vehicleName,
        r.plateNumber,
        r.phone,
        r.badge,
      ]);
      exportToCSV('rider_delivery_finance', headers, rows);
      return;
    }

    if (pathname.startsWith('/finance/daily-closing')) {
      const headers = ['Report Metric', 'Value', 'Notes'];
      const totalYield = animals.reduce((sum, a) => sum + (parseFloat(a.totalDailyYield) || 0), 0);
      const totalSales = (salesHistory || []).reduce((sum, s) => sum + (Number(s.netPayable) || 0), 0);
      const totalExpense = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const rows = [
        ['Closing Date', new Date().toLocaleDateString(), 'End of Day Reconciliation'],
        ['Total Farm Production', `${totalYield.toFixed(1)} Liters`, 'Milking Yield Total'],
        ['Total POS & Delivery Revenue', `Rs. ${totalSales.toLocaleString()}`, 'Gross Cash & Online Sales'],
        ['Total Farm Operating Expenses', `Rs. ${totalExpense.toLocaleString()}`, 'Daily Farm Expenditures'],
        ['Net Cash Flow', `Rs. ${(totalSales - totalExpense).toLocaleString()}`, 'Closing Liquid Position'],
      ];
      exportToCSV('daily_closing_reconciliation', headers, rows);
      return;
    }

    const customerList = rawCustomers?.length ? rawCustomers : customers;
    const totalKhata = (customerList || []).reduce((sum, c) => sum + (Number(c.khataBalance) || 0), 0);
    const totalSalesRev = (salesHistory || []).reduce((sum, s) => sum + (Number(s.netPayable) || 0), 0);
    const totalYield = animals.reduce((sum, a) => sum + (parseFloat(a.totalDailyYield) || 0), 0);
    const totalExpense = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const headers = ['Business KPI', 'Value', 'Category'];
    const rows = [
      ['Total Active Animals', animals.length, 'Farm Operations'],
      ['Daily Milk Production', `${totalYield.toFixed(1)} L`, 'Farm Operations'],
      ['Total Registered Customers', customerList.length, 'Customer Management'],
      ['Total Outstanding Khata Receivables', `Rs. ${totalKhata.toLocaleString()}`, 'Financial Ledgers'],
      ['Total Completed Sales Invoices', salesHistory.length, 'Sales & POS'],
      ['Total Sales Revenue', `Rs. ${totalSalesRev.toLocaleString()}`, 'Sales & POS'],
      ['Total Farm Expenses', `Rs. ${totalExpense.toLocaleString()}`, 'Finance'],
      ['Active Delivery Runs', deliveries.length, 'Deliveries & Logistics'],
      ['Export Timestamp', new Date().toLocaleString(), 'System Audit'],
    ];
    exportToCSV('pure_milk_bar_executive_summary', headers, rows);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-3.5 py-1.5 flex items-center justify-between gap-3 shadow-2xs sticky top-0 z-20 no-print">
      <div className="shrink-0 overflow-x-auto py-0.5 max-w-[65vw]">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs whitespace-nowrap">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            if (crumb.isRoot) {
              return (
                <Link
                  key={idx}
                  to={crumb.to}
                  className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200/80 transition-colors cursor-pointer"
                  title="Go to Dashboard Overview"
                >
                  <Milk className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{crumb.label}</span>
                </Link>
              );
            }

            return (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                {isLast || !crumb.to ? (
                  <span className="text-emerald-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs shadow-2xs truncate max-w-55">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="text-slate-600 hover:text-emerald-700 hover:bg-slate-100 px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer"
                    title={`Go back to ${crumb.label}`}
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={handleExportCSV}
          className="h-7 px-2.5 text-xs font-semibold shadow-2xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          title="Export CSV data for current view"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </Button>

        <Link to="/pos">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs font-semibold cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs"
            title="Open POS Terminal"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>POS</span>
          </Button>
        </Link>

        <div className="w-36 sm:w-44">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-md pl-6 pr-2 py-0.5 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-100 transition-all placeholder:text-slate-400 h-7"
            />
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
