import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Milk,
  Search,
  Download,
  ShoppingCart,
  Menu,
  X,
  ArrowRight,
  LayoutGrid,
  Tractor,
  Beef,
  Droplets,
  Receipt,
  TrendingUp,
  Calendar,
  Package,
  Layers,
  Users,
  Wallet,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePOSContext } from '@/context/POSContext';
import { useAnimalContext } from '@/context/AnimalContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { PKRIcon } from '@/components/common/PKRIcon';
import ExportCSVModal from '@/components/common/ExportCSVModal';

const APP_ROUTES = [
  { label: 'Dashboard Overview', path: '/dashboard', icon: LayoutGrid, category: 'Pages', keywords: ['home', 'overview', 'main', 'summary'] },
  { label: 'Farm Operations & Shed', path: '/farm', icon: Tractor, category: 'Pages', keywords: ['shed', 'cattle', 'livestock', 'dairy'] },
  { label: 'Animals Herd Register', path: '/farm/animals', icon: Beef, category: 'Pages', keywords: ['cows', 'buffalo', 'herd', 'tag', 'animals'] },
  { label: 'Milking Production Register', path: '/farm/milking', icon: Droplets, category: 'Pages', keywords: ['morning', 'evening', 'yield', 'liters', 'milk'] },
  { label: 'Farm Operating Expenses', path: '/farm/expenses', icon: Receipt, category: 'Pages', keywords: ['costs', 'feed', 'silage', 'wanda', 'expense', 'bills'] },
  { label: 'Farm Profit & Loss (P&L)', path: '/farm/pl', icon: TrendingUp, category: 'Pages', keywords: ['profit', 'loss', 'p&l', 'margin', 'financial', 'earnings', 'rupee', 'bachat'] },
  { label: 'Farm Daily Sheet Audit', path: '/farm/dailysheet', icon: Calendar, category: 'Pages', keywords: ['daily', 'audit', 'reconciliation', 'sheet'] },
  { label: 'POS Terminal (Point of Sale)', path: '/pos', icon: ShoppingCart, category: 'Pages', keywords: ['pos', 'sales', 'billing', 'counter', 'cart', 'invoice'] },
  { label: 'Product Inventory & Catalog', path: '/products', icon: Package, category: 'Pages', keywords: ['products', 'inventory', 'stock', 'items', 'catalog'] },
  { label: 'Dahi Processing Hub', path: '/dahi', icon: Layers, category: 'Pages', keywords: ['dahi', 'yogurt', 'curd', 'batch', 'processing', 'fermentation'] },
  { label: 'Milk Suppliers Directory', path: '/supplier', icon: Users, category: 'Pages', keywords: ['suppliers', 'intake', 'procurement', 'dairy farmers'] },
  { label: 'Supplier Procurement Sheet', path: '/supplier/procurement', icon: Receipt, category: 'Pages', keywords: ['procurement', 'supplier rates', 'milk fat', 'lr'] },
  { label: 'Staff Management & Payroll', path: '/staff', icon: Users, category: 'Pages', keywords: ['staff', 'employees', 'salary', 'payroll', 'attendance', 'wages'] },
  { label: 'Customers Directory', path: '/customer', icon: Users, category: 'Pages', keywords: ['customers', 'clients', 'directory', 'phone'] },
  { label: 'Customer Khata Ledger', path: '/customer-khata-ledger', icon: Wallet, category: 'Pages', keywords: ['khata', 'ledger', 'balance', 'udhar', 'receivables'] },
  { label: 'Doorstep Deliveries & Fleet', path: '/delivery', icon: Truck, category: 'Pages', keywords: ['delivery', 'riders', 'drop points', 'fleet', 'fuel'] },
  { label: 'Daily Closing & Audit', path: '/finance/daily-closing', icon: ShieldCheck, category: 'Pages', keywords: ['closing', 'cash audit', 'counter summary', 'shift'] },
];

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const { products = [] } = usePOSContext() || {};
  const { animals = [] } = useAnimalContext() || {};
  const { deliveries = [] } = useDeliveryContext() || {};
  const { staffList = [] } = useDeliveryStaffContext() || {};

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live search matches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { pages: [], products: [], animals: [], staff: [], deliveries: [], total: 0 };

    const matchedPages = APP_ROUTES.filter((r) =>
      r.label.toLowerCase().includes(q) ||
      r.path.toLowerCase().includes(q) ||
      (r.keywords && r.keywords.some((k) => k.includes(q)))
    ).slice(0, 5);

    const matchedProducts = products.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedAnimals = animals.filter((a) =>
      (a.tag || '').toLowerCase().includes(q) ||
      (a.species || '').toLowerCase().includes(q) ||
      (a.breed || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedStaff = staffList.filter((s) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.role || '').toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedDeliveries = deliveries.filter((d) =>
      (d.customerName || '').toLowerCase().includes(q) ||
      (d.runCode || '').toLowerCase().includes(q)
    ).slice(0, 3);

    const total =
      matchedPages.length +
      matchedProducts.length +
      matchedAnimals.length +
      matchedStaff.length +
      matchedDeliveries.length;

    return {
      pages: matchedPages,
      products: matchedProducts,
      animals: matchedAnimals,
      staff: matchedStaff,
      deliveries: matchedDeliveries,
      total,
    };
  }, [searchQuery, products, animals, staffList, deliveries]);

  const handleSelectResult = (path) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (searchResults.pages.length > 0) {
        handleSelectResult(searchResults.pages[0].path);
      } else if (searchResults.products.length > 0) {
        handleSelectResult('/products');
      } else if (searchResults.animals.length > 0) {
        const first = searchResults.animals[0];
        handleSelectResult(`/farm/animals/detail/${first.id || first.tag}`);
      } else if (searchResults.staff.length > 0) {
        handleSelectResult('/staff');
      } else if (searchResults.deliveries.length > 0) {
        handleSelectResult('/delivery');
      }
    }
  };

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
            label: matchedStaff ? `${matchedStaff.name}` : 'Staff Details',
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
          label: matchedAnimal ? `${matchedAnimal.tag} (${matchedAnimal.species})` : 'Animal Details',
          to: null,
        });
      } else if (pathname.includes('/animals')) {
        crumbs.push({ label: 'Animals Herd', to: '/farm/animals' });
      } else if (pathname.includes('/expenses/new')) {
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
        crumbs.push({ label: 'Record New Expense', to: null });
      } else if (pathname.includes('/expenses/edit/')) {
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
        crumbs.push({ label: 'Edit Expense', to: null });
      } else if (pathname.includes('/expenses/detail/')) {
        crumbs.push({ label: 'Farm Expenses', to: '/farm/expenses' });
        crumbs.push({ label: 'Expense Details', to: null });
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

    if (pathname.startsWith('/proccessing') || pathname.startsWith('/dahi') || pathname.startsWith('/processing')) {
      crumbs.push({ label: 'Processing & Batching', to: '/dahi' });
      crumbs.push({ label: 'Dahi Processing', to: '/dahi' });
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
    <header className="bg-white border-b border-slate-200/80 px-2 sm:px-3.5 py-1.5 flex items-center justify-between gap-2 sm:gap-3 shadow-2xs sticky top-0 z-20 no-print">
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            if (crumb.isRoot) {
              return (
                <Link
                  key={idx}
                  to={crumb.to}
                  className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200/80 transition-colors cursor-pointer shrink-0"
                  title="Go to Dashboard Overview"
                >
                  <Milk className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">{crumb.label}</span>
                  <span className="sm:hidden">PMB</span>
                </Link>
              );
            }

            return (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                {isLast || !crumb.to ? (
                  <span className="text-emerald-800 font-bold bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded border border-slate-200 text-xs shadow-2xs truncate max-w-36 sm:max-w-55">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="text-slate-600 hover:text-emerald-700 hover:bg-slate-100 px-1 sm:px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer truncate max-w-28 sm:max-w-none"
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

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          className="h-7 px-2 sm:px-2.5 text-xs font-semibold shadow-2xs cursor-pointer hidden sm:inline-flex"
          title="Export CSV Data & Custom Filter"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </Button>

        {/* Farm P&L Quick Link with Pakistani Rupee Currency Icon */}
        <Link to="/farm/pl">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 sm:px-2.5 text-xs font-semibold cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs gap-1"
            title="Farm Profit & Loss (P&L)"
          >
            <PKRIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">P&amp;L</span>
          </Button>
        </Link>

        {/* POS Terminal */}
        <Link to="/pos">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 sm:px-2.5 text-xs font-semibold cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs gap-1"
            title="Open POS Terminal"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">POS</span>
          </Button>
        </Link>

        {/* Functional Search Box with Visible Icon and Live Results Dropdown */}
        <div className="relative" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-28 sm:w-44 md:w-56 focus:w-40 sm:focus:w-56 md:focus:w-72 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg pl-8 pr-7 py-1 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 h-7"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Floating Live Search Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">
                  {searchResults.total > 0 ? `${searchResults.total} results found` : 'No results found'}
                </span>
                <span className="text-[10px] text-slate-400">Press Enter ↵ or Esc</span>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5 space-y-2">
                {searchResults.total === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching pages, products, animals or records found for "{searchQuery}".
                  </div>
                )}

                {/* Pages & Menus */}
                {searchResults.pages.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" /> Navigation
                    </div>
                    {searchResults.pages.map((item, idx) => {
                      const Icon = item.icon || LayoutGrid;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectResult(item.path)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-900 transition cursor-pointer group text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold">{item.label}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Products */}
                {searchResults.products.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Products
                    </div>
                    {searchResults.products.map((prod, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult('/products')}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-900 transition cursor-pointer group text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{prod.icon || '🥛'}</span>
                          <div>
                            <p className="font-bold leading-tight">{prod.name}</p>
                            <p className="text-[10px] text-slate-400">{prod.category} • Rs. {prod.price}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Catalog
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Animals */}
                {searchResults.animals.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Beef className="w-3 h-3" /> Herd Animals
                    </div>
                    {searchResults.animals.map((animal, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult(`/farm/animals/detail/${animal.id || animal.tag}`)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-900 transition cursor-pointer group text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{(animal.species || '').toLowerCase().includes('cow') ? '🐄' : '🐃'}</span>
                          <div>
                            <p className="font-bold leading-tight">{animal.tag || animal.name}</p>
                            <p className="text-[10px] text-slate-400">{animal.species} • {animal.breed || 'Farm'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          View Animal
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Staff & Deliveries */}
                {(searchResults.staff.length > 0 || searchResults.deliveries.length > 0) && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Staff & Deliveries
                    </div>
                    {searchResults.staff.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult('/staff')}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-900 transition cursor-pointer group text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold leading-tight">{s.name}</p>
                            <p className="text-[10px] text-slate-400">{s.role || 'Staff'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Staff
                        </span>
                      </div>
                    ))}
                    {searchResults.deliveries.map((d, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectResult('/delivery')}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-900 transition cursor-pointer group text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-bold leading-tight">{d.customerName || d.runCode}</p>
                            <p className="text-[10px] text-slate-400">Order #{d.runCode}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Delivery
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ExportCSVModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultModule={getDefaultModule(location.pathname)}
      />
    </header>
  );
}
