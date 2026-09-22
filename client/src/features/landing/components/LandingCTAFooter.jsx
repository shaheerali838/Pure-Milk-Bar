import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShoppingCart, Milk } from "lucide-react";

export default function LandingCTAFooter() {
  return (
    <section className="py-12 lg:py-16 bg-[#163E34] text-slate-300" id="contact">
      {/* Top CTA Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-4 mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-[#5BBB7B]" /> Live Operating System Ready
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Ready to streamline your dairy operations with zero shrinkage?
        </h2>
        <p className="text-slate-200 text-xs sm:text-sm lg:text-base max-w-lg mx-auto">
          Launch the live ERP dashboard right now. No lengthy setup required&mdash;all core dairy modules are pre-configured.
        </p>
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Live ERP Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pos"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold px-7 py-3 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#5BBB7B]" />
            <span>Open POS Counter</span>
          </Link>
        </div>
      </div>

      {/* Bottom Clean Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 border-t border-[#2A4D47]/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-xs sm:text-[13px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#00a86b] flex items-center justify-center text-white">
                <Milk className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">Pure Milk Bar</span>
            </div>
            <p className="text-xs text-slate-400">Next-gen dairy farm &amp; milk bar ERP.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">Farm &amp; Dock</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/farm/animals" className="hover:text-white">Cattle Herd Register</Link></li>
              <li><Link to="/supplier/intake" className="hover:text-white">Milk Intake Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">POS &amp; Fleet</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/pos" className="hover:text-white">Touch POS Sales</Link></li>
              <li><Link to="/delivery" className="hover:text-white">Rider Fleet Logistics</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">Finance</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/customer-khata-ledger" className="hover:text-white">Khata Ledger</Link></li>
              <li><Link to="/finance/daily-closing" className="hover:text-white">Daily Mass-Balance</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t border-[#2A4D47]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>&copy; {new Date().getFullYear()} Pure Milk Bar Dairy ERP SaaS. All rights reserved.</div>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/pos" className="hover:text-white">POS</Link>
            <Link to="/farm" className="hover:text-white">Farm</Link>
            <Link to="/settings" className="hover:text-white">Settings</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
