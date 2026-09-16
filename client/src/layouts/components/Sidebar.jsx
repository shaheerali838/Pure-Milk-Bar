import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";

import { reconciliationLinks } from '@/components/common/Reconciliation_links';

export default function Sidebar() {
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
      path: "/proccessing",
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
    {
      id: "rider-delivery-finance",
      name: "Rider & Delivery Finance",
      icon: Bike,
      path: "/finance/delivery",
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
    {
      id: "customer-finance",
      name: "Customer Finance",
      icon: Wallet,
      path: "/finance/customer",
    },
  ];

  return (
    <aside className="w-64 bg-white h-screen sticky top-0 flex flex-col border-r border-slate-200/80 shadow-xs shrink-0 select-none z-30">
      {/* Brand Header */}
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

      {/* Main Navigation Container */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Section 1: Operations Command */}
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

        {/* Section 2: Sales */}
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

        {/* Section 3: Production */}
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

        {/* Section 4: Delivery */}
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

        {/* Section 5: Customers */}
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

        {/* Section 6: Reconciliation & Management */}
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
    </aside>
  );
}
