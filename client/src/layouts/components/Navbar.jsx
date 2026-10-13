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
import { useGlobalDate } from '@/context/GlobalDateContext';
import ExportCSVModal from '@/components/common/ExportCSVModal';
import DateHeader from '@/components/common/DateHeader';
import { APP_ROUTES, getBreadcrumbs, getDefaultModule } from './navbarRoutes';

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
  const { globalDate, setGlobalDate, setToday, isToday, formattedDate } = useGlobalDate();

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

  const breadcrumbs = getBreadcrumbs(location.pathname, location.search, { animals, staffList, deliveries });

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
        {/* Synchronized Reusable Global DateHeader */}
        <DateHeader compact date={globalDate} setDate={setGlobalDate} />

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
