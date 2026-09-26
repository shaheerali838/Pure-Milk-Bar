import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Milk,
  ShieldCheck,
  Globe,
  Layers,
  ChevronDown,
  ArrowRight,
  LogIn,
  Tractor,
  Truck,
  ShoppingCart,
  Bike,
  Wallet,
  Scale,
} from "lucide-react";

export default function LandingNavbar() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <>
      {/* 1. TOP SLIM UTILITY BAR (Ultra-Slim 24px) */}
      <aside className="bg-[#14332D] text-[#A2B8B3] text-[9.5px] border-b border-[#234941] py-0.5 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00a86b]/20 text-[#5BBB7B] border border-[#00a86b]/30">
              <ShieldCheck className="w-2.5 h-2.5 mr-1 text-[#5BBB7B]" />{" "}
              Verified Dairy ERP
            </span>
            <span className="text-slate-300 hidden md:inline">
              Active Hubs: Lahore &bull; Faisalabad &bull; Twin Cities
            </span>
            <span className="text-emerald-400/80 font-medium hidden lg:inline">
              &bull; ISO 22000 Compliant
            </span>
          </div>
          <div className="flex items-center space-x-3.5 text-slate-300">
            <span className="hidden sm:inline">
              Live Milk Index:{" "}
              <strong className="text-white font-semibold">
                Rs. 260/L (Cow) &bull; Rs. 290/L (Buff)
              </strong>
            </span>
            <a
              href="#faq"
              className="hover:text-white transition-colors font-medium hidden sm:inline"
            >
              Help Center
            </a>
            <span className="hover:text-white transition-colors flex items-center gap-1 font-medium text-[9px]">
              <Globe className="w-2.5 h-2.5" /> English / اردو
            </span>
          </div>
        </div>
      </aside>

      {/* 2. STICKY MAIN NAVBAR (Slim 52px) */}
      <header className="bg-[#1B3E35]/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Categories Button */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 group"
              title="Pure Milk Bar ERP"
            >
              <div className="w-7.5 h-7.5 rounded-lg bg-[#00a86b] flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
                <Milk className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white">
                    Pure Milk Bar
                  </span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-[#5BBB7B]/20 text-[#5BBB7B] border border-[#5BBB7B]/30 uppercase">
                    ERP SaaS
                  </span>
                </div>
                <p className="text-[8.5px] text-emerald-200/80 font-medium leading-none">
                  Dairy Operations &amp; Supply Chain
                </p>
              </div>
            </Link>

            {/* Categories / Modules Dropdown Button */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-white/15 transition cursor-pointer"
              >
                <Layers className="w-2.5 h-2.5 text-[#5BBB7B]" />
                <span>Modules</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    ERP System Modules
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {[
                      {
                        name: "Herd & Milking Hub",
                        path: "/login",
                        icon: Tractor,
                      },
                      {
                        name: "Supplier Intake Dock",
                        path: "/login",
                        icon: Truck,
                      },
                      {
                        name: "Counter Touch POS",
                        path: "/login",
                        icon: ShoppingCart,
                      },
                      {
                        name: "Customer Khata Ledgers",
                        path: "/login",
                        icon: Wallet,
                      },
                      {
                        name: "Delivery Fleet Logistics",
                        path: "/login",
                        icon: Bike,
                      },
                      {
                        name: "Daily Closing & Audit",
                        path: "/login",
                        icon: Scale,
                      },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={idx}
                          to={item.path}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition text-[11px]"
                        >
                          <Icon className="w-3 h-3 text-[#5BBB7B]" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Navigation Anchor Links */}
          <nav className="hidden lg:flex items-center space-x-4 text-[11px] font-bold text-slate-200">
            <a href="#how-it-works" className="hover:text-white transition">
              How It Works
            </a>
            <a href="#modules" className="hover:text-white transition">
              ERP Modules
            </a>
            <a
              href="#screenshots"
              className="hover:text-white transition text-emerald-300"
            >
              Screenshots
            </a>
            <a href="#pos-sandbox" className="hover:text-white transition">
              POS Sandbox
            </a>
            <a href="#simulators" className="hover:text-white transition">
              Simulators
            </a>
            <a href="#commercial-farms" className="hover:text-white transition">
              Enrolled Farms
            </a>
            <a href="#faq" className="hover:text-white transition">
              FAQ
            </a>
            <a href="#contact" className="hover:text-white transition">
              Contact
            </a>
          </nav>

          {/* Right: Unified Clear Authentication Button */}
          <div className="flex items-center shrink-0">
            <Link
              to="/login"
              className="bg-[#00a86b] hover:bg-[#008f5b] text-white font-bold text-xs px-4 py-2 rounded-full shadow-md shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <span>Sign In to ERP</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
