import React from "react";
import { Link } from "react-router-dom";
import {
  Milk,
  ShieldCheck,
  Globe,
  ArrowRight,
  LogIn,
} from "lucide-react";

export default function LandingNavbar() {
  return (
    <>
      {/* 1. TOP SLIM UTILITY BAR (Ultra-Slim 24px) */}
      <aside className="bg-[#14332D] text-[#A2B8B3] text-[9.5px] border-b border-[#234941] py-0.5 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00a86b]/20 text-[#5BBB7B] border border-[#00a86b]/30">
              <ShieldCheck className="w-2.5 h-2.5 mr-1 text-[#5BBB7B]" /> Verified Dairy ERP
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
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group" title="Pure Milk Bar">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#00b074] to-[#008f5b] flex items-center justify-center text-white shadow-sm shadow-emerald-950/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Milk className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                  Pure Milk <span className="text-[#5BBB7B]">Bar</span>
                </span>
                <span className="text-[9px] text-emerald-200/85 font-medium tracking-tight leading-none mt-0.5">
                  Dairy Operations &amp; Supply Chain
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Anchor Links */}
          <nav className="hidden lg:flex items-center space-x-4 text-[11px] font-bold text-slate-200">
            <a href="#how-it-works" className="text-slate-200 hover:text-white transition">How It Works</a>
            <a href="#modules" className="text-slate-200 hover:text-white transition">ERP Modules</a>
            <a href="#screenshots" className="text-slate-200 hover:text-white transition">Screenshots</a>
            <a href="#pos-sandbox" className="text-slate-200 hover:text-white transition">POS Sandbox</a>
            <a href="#simulators" className="text-slate-200 hover:text-white transition">Simulators</a>
            <a href="#commercial-farms" className="text-slate-200 hover:text-white transition">Enrolled Farms</a>
            <a href="#faq" className="text-slate-200 hover:text-white transition">FAQ</a>
            <a href="#contact" className="text-slate-200 hover:text-white transition">Contact</a>
          </nav>

          {/* Right: Unified Clear Authentication Button */}
          <div className="flex items-center shrink-0">
            <Link
              to="/login"
              className="bg-[#00a86b] hover:bg-[#008f5b] text-white font-bold text-xs px-4 py-2 rounded-full shadow-md shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-100" />
              <span>Sign In to ERP</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
