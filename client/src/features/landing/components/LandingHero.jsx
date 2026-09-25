import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";

export default function LandingHero() {
  return (
    <section
      id="home"
      className="text-white min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center relative overflow-hidden py-4 sm:py-6 bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(15, 38, 33, 0.72) 0%, rgba(16, 45, 39, 0.56) 50%, rgba(15, 38, 33, 0.76) 100%), url('/images/dairyfarm.jpeg')",
      }}
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center my-auto text-center items-center">
        <div className="space-y-3.5 sm:space-y-4 max-w-3xl mx-auto flex flex-col items-center">

          {/* Centered Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow-md">
            From cow yield to doorstep delivery,{" "}
            <span className="text-[#5BBB7B]">manage your entire dairy</span> in real-time.
          </h1>

          {/* Centered Subtitle */}
          <p className="text-slate-100 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed drop-shadow-sm">
            Automate herd logs, bulk milk procurement intake, sub-second POS counter sales, rider fleet fuel tracking, and daily mass-balance reconciliation.
          </p>

          {/* Clean Centered CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Live ERP Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#5BBB7B]" />
              <span>Open POS Counter</span>
            </Link>
          </div>

          {/* Centered Popular Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] text-slate-300 pt-1">
            <span className="font-semibold text-white">Explore Modules:</span>
            <Link
              to="/login"
              className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
            >
              ⚡ Touch POS
            </Link>
            <Link
              to="/login"
              className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
            >
              🐄 Herd &amp; Milking Log
            </Link>
            <Link
              to="/login"
              className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
            >
              📒 Customer Khata
            </Link>
            <Link
              to="/login"
              className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
            >
              ⚖️ Mass Balance Closing
            </Link>
          </div>

          {/* Centered 4-Counter Metrics Row */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-2xl border-t border-white/15 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">1.2M+</div>
              <div className="text-[10px] text-slate-300 font-normal">Liters Reconciled</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#5BBB7B]">99.8%</div>
              <div className="text-[10px] text-slate-300 font-normal">Mass Balance Acc.</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white">100%</div>
              <div className="text-[10px] text-slate-300 font-normal">Zero-Loss Khata</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#5BBB7B]">4.95 ★</div>
              <div className="text-[10px] text-slate-300 font-normal">Operator Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
