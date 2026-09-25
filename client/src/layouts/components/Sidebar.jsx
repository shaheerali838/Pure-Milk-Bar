import React, { useState, useRef, useEffect, useMemo } from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Milk,
  Users,
  LayoutGrid,
  Tractor,
  Truck,
  ShoppingCart,
  Layers,
  Bike,
  Wallet,
  Package,
  Sparkles,
  LogOut,
  LogIn,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  User as UserIcon,
  KeyRound,
  X,
  GraduationCap,
} from "lucide-react";

import { reconciliationLinks as rawReconciliationLinks } from '@/components/common/Reconciliation_links';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';

export default function Sidebar({ isOpen = false, onClose }) {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const currentRole = user?.role || ROLES.ADMIN;

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  // 1. Operations Command Links
  const operationsLinks = useMemo(() => {
    const all = [
      { id: "Dashboard", name: "Main Dashboard", icon: LayoutGrid, path: "/dashboard", roles: [ROLES.ADMIN, ROLES.MANAGER] },
      { id: "Farm", name: "Farm Dashboard", icon: Tractor, path: "/farm", roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FARM_SUPERVISOR] },
      { id: "Supplier", name: "Supplier Dashboard", icon: Truck, path: "/supplier", roles: [ROLES.ADMIN, ROLES.MANAGER] },
    ];
    return all.filter((l) => l.roles.includes(currentRole));
  }, [currentRole]);

  // 2. Sales Links
  const salesLinks = useMemo(() => {
    const all = [
      { id: "pos", name: "Counter POS & Sales", icon: ShoppingCart, path: "/pos", roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
    ];
    return all.filter((l) => l.roles.includes(currentRole));
  }, [currentRole]);

  // 3. Production Links
  const productionLinks = useMemo(() => {
    const all = [
      { id: "processing", name: "Dahi & Milk Processing", icon: Layers, path: "/dahi", roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FARM_SUPERVISOR] },
      { id: "products", name: "Products & Pricing", icon: Milk, path: "/products", roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FARM_SUPERVISOR] },
    ];
    return all.filter((l) => l.roles.includes(currentRole));
  }, [currentRole]);

  // 4. Delivery Links
  const deliveryLinks = useMemo(() => {
    const all = [
      { id: "doorstep-delivery", name: "Doorstep Deliveries", icon: Truck, path: "/delivery", roles: [ROLES.ADMIN, ROLES.MANAGER] },
    ];
    return all.filter((l) => l.roles.includes(currentRole));
  }, [currentRole]);

  // 5. Customers Links
  const customerLinks = useMemo(() => {
    const all = [
      { id: "customer", name: "Customer & Accounts", icon: Users, path: "/customer", roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] },
    ];
    return all.filter((l) => l.roles.includes(currentRole));
  }, [currentRole]);

  // 6. Finance Links
  const financeLinks = useMemo(() => {
    const all = [
      { id: "finance", name: "Finance", icon: Wallet, path: "/finance", roles: [ROLES.ADMIN] },
    ];
    return all.filter((l) => l.roles.includes(currentRole));
  }, [currentRole]);

  // 7. Reconciliation & Management Links
  const reconciliationLinks = useMemo(() => {
    return rawReconciliationLinks.filter((l) => {
      if (currentRole === ROLES.ADMIN) return true;
      if (currentRole === ROLES.MANAGER) return l.id !== 'global-settings';
      if (currentRole === ROLES.CASHIER) return l.id === 'daily-closing';
      return false; // FARM_SUPERVISOR has no direct reconciliation tabs
    });
  }, [currentRole]);

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white h-screen flex flex-col border-r border-slate-200/80 shadow-2xl lg:shadow-xs shrink-0 select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00a86b] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Milk className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  Pure Milk Bar
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  ERP
                </span>
              </div>
              <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Dairy Operations Engine
              </p>
            </div>
          </div>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Operations Section */}
        {operationsLinks.length > 0 && (
          <div>
            <nav className="space-y-0.5">
              {operationsLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#00a86b] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Sales Section */}
        {salesLinks.length > 0 && (
          <div>
            <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              SALES
            </div>
            <nav className="space-y-0.5">
              {salesLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#00a86b] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Production Section */}
        {productionLinks.length > 0 && (
          <div>
            <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              PRODUCTION
            </div>
            <nav className="space-y-0.5">
              {productionLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#00a86b] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Delivery Section */}
        {deliveryLinks.length > 0 && (
          <div>
            <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              DELIVERY
            </div>
            <nav className="space-y-0.5">
              {deliveryLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#00a86b] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Customers Section */}
        {customerLinks.length > 0 && (
          <div>
            <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              CUSTOMERS
            </div>
            <nav className="space-y-0.5">
              {customerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-[#00a86b] text-white shadow-sm shadow-emerald-500/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Finance Section */}
        {financeLinks.length > 0 && (
          <div>
            <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              FINANCE
            </div>
            <nav className="space-y-0.5">
              {financeLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) => {
                      const isFinanceActive =
                        (isActive || pathname.startsWith("/finance")) &&
                        !pathname.startsWith("/finance/daily-closing") &&
                        !pathname.startsWith("/finance/audit-log") &&
                        pathname !== "/daily-closing" &&
                        pathname !== "/dailyclosing" &&
                        pathname !== "/audit-log" &&
                        pathname !== "/audit" &&
                        pathname !== "/transactions";
                      return `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isFinanceActive
                          ? "bg-[#00a86b] text-white shadow-sm shadow-emerald-500/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`;
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Reconciliation & Management Section */}
        {reconciliationLinks.length > 0 && (
          <div>
            <div className="px-2.5 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              RECONCILIATION & MANAGEMENT
            </div>
            <nav className="space-y-0.5">
              {reconciliationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.id}
                    to={link.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) => {
                      const isCurrentActive =
                        isActive ||
                        pathname === link.path ||
                        (link.path === '/finance/daily-closing' && (pathname === '/daily-closing' || pathname === '/dailyclosing')) ||
                        (link.path === '/finance/audit-log' && (pathname === '/audit-log' || pathname === '/audit' || pathname === '/transactions'));
                      return `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                        isCurrentActive
                          ? 'bg-[#00a86b] text-white shadow-sm shadow-emerald-500/20'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`;
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50/70 space-y-1.5">
        {/* Active Logged-in User Profile with Floating Popup */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            {/* Upward Floating Popover Menu */}
            {isProfileOpen && (
              <div className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 bg-white rounded-xl border border-slate-200/90 shadow-xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* Header Profile Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#00a86b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {user.avatar ? user.avatar[0] : (user.name ? user.name[0] : 'S')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-[125px]" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-0.5 rounded transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="border-t border-slate-100" />

                {/* Popover Action Links */}
                <div className="space-y-0.5">
                  {currentRole === ROLES.ADMIN && (
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>My Profile &amp; Settings</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Change Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Pill Trigger Button */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between p-1.5 px-2 rounded-xl bg-white border transition-all cursor-pointer shadow-2xs select-none ${
                isProfileOpen ? 'border-black ring-1 ring-black/80' : 'border-black hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#00a86b] text-white flex items-center justify-center font-bold text-xs shrink-0 relative shadow-2xs">
                  <span>{user.avatar ? user.avatar[0] : (user.name ? user.name[0] : 'S')}</span>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#00c980] border border-white rounded-full"></span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[11.5px] font-bold text-slate-900 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[9.5px] font-semibold text-[#008f5b] truncate flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span>
                      {user.roleLabel ||
                        (user.role === ROLES.ADMIN
                          ? 'Owner & Administrator'
                          : user.role === ROLES.MANAGER
                          ? 'Branch Manager'
                          : user.role === ROLES.CASHIER
                          ? 'POS Cashier'
                          : 'Farm Supervisor')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-slate-400 pl-1">
                {isProfileOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to ERP</span>
          </NavLink>
        )}
      </div>

      {/* Quick Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
                  <p className="text-[11px] text-slate-500">Update your security credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Password updated successfully!');
                setIsPasswordModalOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#00a86b] hover:bg-[#008f5b] shadow-xs cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
