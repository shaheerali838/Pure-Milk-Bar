import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Milk, Search, Download, ShoppingCart, Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnimalContext } from '@/context/AnimalContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useAuth } from '@/context/AuthContext';
import ExportCSVModal from '@/components/common/ExportCSVModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const { animals = [] } = useAnimalContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList = [] } = useDeliveryStaffContext() || {};

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

  const getDefaultModule = (pathname) => {
    if (pathname.includes('/farm/animals') || pathname.includes('/farm/milking')) return 'animals';
    if (pathname.includes('/farm/expenses')) return 'expenses';
    if (pathname.startsWith('/farm')) return 'daily_closing';
    if (pathname.startsWith('/pos')) return 'pos_sales';
    if (pathname.startsWith('/delivery')) return 'deliveries';
    if (pathname.startsWith('/customer-khata-ledger') || pathname.startsWith('/finance/customer')) return 'khata_ledger';
    if (pathname.startsWith('/customer')) return 'customers';
    if (pathname.startsWith('/products') || pathname.startsWith('/proccessing')) return 'products';
    if (pathname.startsWith('/staff') || pathname.startsWith('/finance/staff')) return 'users';
    if (pathname.startsWith('/supplier')) return 'suppliers';
    if (pathname.startsWith('/finance/daily-closing')) return 'daily_closing';
    return 'all';
  };

  const breadcrumbs = getBreadcrumbs(location.pathname, location.search);

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
          onClick={() => setIsExportModalOpen(true)}
          className="h-7 px-2.5 text-xs font-semibold shadow-2xs cursor-pointer"
          title="Export CSV Data & Custom Filter"
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

        {/* User Profile / Status Indicator */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
            <Link
              to="/settings"
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
              title={`Logged in as ${user.name} (${user.roleLabel || user.role})`}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center ring-1 ring-emerald-600/30 group-hover:ring-emerald-600">
                {user.avatar || 'SA'}
              </div>
              <span className="hidden md:inline-block text-xs font-bold text-slate-700 max-w-24 truncate">
                {user.name.split(' ')[0]}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link to="/login">
            <Button
              type="button"
              size="sm"
              className="h-7 px-2.5 text-xs font-semibold bg-[#00a86b] hover:bg-[#008f5b] text-white cursor-pointer"
            >
              <User className="w-3 h-3" />
              <span>Login</span>
            </Button>
          </Link>
        )}
      </div>

      <ExportCSVModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultModule={getDefaultModule(location.pathname)}
      />
    </header>
  );
}
