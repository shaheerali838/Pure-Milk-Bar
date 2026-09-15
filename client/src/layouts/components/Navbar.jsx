import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Milk, Search, Download, ShoppingCart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimalContext } from '@/context/AnimalContext';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Access contexts for real data breadcrumb resolution
  const { animals = [] } = useAnimalContext() || {};
  const { rawCustomers = [], customers = [] } = useCustomerContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList = [] } = useDeliveryStaffContext() || {};

  // Build dynamic, clickable breadcrumbs with actual entity data
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

    // 1. Deliveries Route (/delivery)
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
          const matchedStaff = staffList.find((s) => String(s.id) === String(idParam));
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

    // 2. Farm Routes (/farm/...)
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

    // 3. Customer & Khata Routes
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

    // 4. Finance Routes
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

    // 5. Supplier Sourcing
    if (pathname.startsWith('/supplier')) {
      crumbs.push({ label: 'Supplier Sourcing', to: '/supplier' });
      crumbs.push({ label: 'Milk Suppliers', to: '/supplier' });
      return crumbs;
    }

    // 6. Processing / Inventory
    if (pathname.startsWith('/proccessing')) {
      crumbs.push({ label: 'Processing & Batching', to: '/proccessing' });
      crumbs.push({ label: 'Dahi & Milk Processing', to: '/proccessing' });
      return crumbs;
    }

    // 7. Counter POS
    if (pathname.startsWith('/pos')) {
      crumbs.push({ label: 'Sales & Billing', to: '/pos' });
      crumbs.push({ label: 'Counter Point of Sale', to: '/pos' });
      return crumbs;
    }

    // 8. Products Catalog
    if (pathname.startsWith('/products')) {
      crumbs.push({ label: 'Product Inventory', to: '/products' });
      crumbs.push({ label: 'Dairy Catalog', to: '/products' });
      return crumbs;
    }

    // Default Dashboard
    crumbs.push({ label: 'Dashboard Overview', to: '/dashboard' });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs(location.pathname, location.search);
  const activeCrumb = breadcrumbs[breadcrumbs.length - 1];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Item,Category,Metric,Date\n1,Milk Collection,Dairy,3840L,' +
      new Date().toLocaleDateString();
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${activeCrumb.label.toLowerCase().replace(/\s+/g, '_')}_export.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-3.5 py-1.5 flex items-center justify-between gap-3 shadow-2xs sticky top-0 z-20 no-print">
      {/* Clickable Real-Data Breadcrumbs */}
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
                  <span className="text-emerald-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs shadow-2xs truncate max-w-[220px]">
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

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={handleExportCSV}
          className="h-7 px-2.5 text-xs font-semibold shadow-2xs cursor-pointer"
          title="Export CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
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
