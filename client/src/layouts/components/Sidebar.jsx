import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
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

import { reconciliationLinks } from '@/components/common/Reconciliation_links';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const profileMenuRef = useRef(null);

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
  };
  // 1. Operations Command
  const operationsLinks = [
    {
      id: "Dashboard",
      name: "Main Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: "Farm",
      name: "Farm Dashboard",
      icon: Tractor,
      path: "/farm",
    },
    {
      id: "Supplier",
      name: "Supplier Dashboard",
      icon: Truck,
      path: "/supplier",
    },
  ];

  // 2. Sales
  const salesLinks = [
    {
      id: "pos",
      name: "Counter POS & Sales",
      icon: ShoppingCart,
      path: "/pos",
    },
  ];

  // 3. Production
  const productionLinks = [
    {
      id: "processing",
      name: "Dahi & Milk Processing",
      icon: Layers,
      path: "/dahi",
    },
    {
      id: "products",
      name: "Products & Pricing",
      icon: Milk,
      path: "/products",
    },
  ];

  // 4. Delivery
  const deliveryLinks = [
    {
      id: "doorstep-delivery",
      name: "Doorstep Deliveries",
      icon: Truck,
      path: "/delivery",
    },
  ];

  // 5. Customers
  const customerLinks = [
    {
      id: "customer",
      name: "Customer & Accounts",
      icon: Users,
      path: "/customer",
    },
  ];

  // 6. Finance
  const financeLinks = [
    {
      id: "customer-finance",
      name: "Customer Finance",
      icon: Wallet,
      path: "/finance/customer",
    },
    {
      id: "rider-delivery-finance",
      name: "Rider & Delivery Finance",
      icon: Bike,
      path: "/finance/delivery",
    },
  ];

  return (
    <aside className="w-64 bg-white h-screen sticky top-0 flex flex-col border-r border-slate-200/80 shadow-xs shrink-0 select-none z-30">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
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
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Dairy Operations Engine
          </p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <nav className="space-y-0.5">
            {operationsLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.id}
                  to={link.path}
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
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#00a86b] text-white shadow-sm shadow-emerald-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>My Profile &amp; Settings</span>
                  </Link>

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
                        (user.role === 'ADMIN'
                          ? 'System Administrator'
                          : user.role === 'MANAGER'
                          ? 'Branch Manager'
                          : user.role === 'CASHIER'
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
  );
}
