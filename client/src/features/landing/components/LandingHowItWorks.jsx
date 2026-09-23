import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function LandingHowItWorks() {
  return (
    <section className="py-10 lg:py-16 bg-white border-b border-slate-200/80" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            End-to-End Operational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mt-2 mb-2">
            How Pure Milk Bar ERP Powers Your Daily Operations
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            From morning herd milking to evening financial closing, every drop of milk is accounted for across 4 automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1: Log Herd & Intake */}
          <Link
            to="/login"
            className="border border-slate-200/90 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-[#00a86b] transition-all duration-300 bg-slate-50/70 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-3.5 group-hover:scale-105 transition-transform bg-slate-100 shadow-xs">
              <img
                alt="Log Herd & Milk Intake"
                className="w-full h-full object-cover"
                src="/images/animals.webp"
              />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-1.5">
              Step 1
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-[#00a86b] transition-colors">
              Log Herd &amp; Intake
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2">
              Morning/evening yields and dock supplier deliveries with digital volume verification.
            </p>
            <span className="mt-3 text-xs font-bold text-[#00a86b] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Open Farm &amp; Intake <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Step 2: Quality Grade & Batching */}
          <Link
            to="/login"
            className="border border-slate-200/90 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-[#00a86b] transition-all duration-300 bg-slate-50/70 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-3.5 group-hover:scale-105 transition-transform bg-slate-100 shadow-xs">
              <img
                alt="Quality Grade & Batching"
                className="w-full h-full object-cover"
                src="/images/storage.webp"
              />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-1.5">
              Step 2
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-[#00a86b] transition-colors">
              Grade &amp; Process Dahi
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2">
              Compute formula milk rates, route into chilled bulk tanks, and batch fresh pot Dahi.
            </p>
            <span className="mt-3 text-xs font-bold text-[#00a86b] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Explore Milk Dock <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Step 3: POS Retail & Delivery Dispatch */}
          <Link
            to="/login"
            className="border border-slate-200/90 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-[#00a86b] transition-all duration-300 bg-slate-50/70 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-3.5 group-hover:scale-105 transition-transform bg-slate-100 shadow-xs">
              <img
                alt="POS Retail & Delivery Dispatch"
                className="w-full h-full object-cover"
                src="/images/delivery.jpeg"
              />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-1.5">
              Step 3
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-[#00a86b] transition-colors">
              Sell &amp; Dispatch Fleet
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2">
              Sub-second walk-in sales, customer monthly delivery runs, and rider vehicle fuel logging.
            </p>
            <span className="mt-3 text-xs font-bold text-[#00a86b] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Launch POS Counter <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Step 4: Reconcile & Settle Khata */}
          <Link
            to="/login"
            className="border border-slate-200/90 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-[#00a86b] transition-all duration-300 bg-slate-50/70 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
          >
            <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-3.5 group-hover:scale-105 transition-transform bg-slate-100 shadow-xs">
              <img
                alt="Reconcile & Settle Khata"
                className="w-full h-full object-cover"
                src="/images/PnL.jpeg"
              />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-1.5">
              Step 4
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-[#00a86b] transition-colors">
              Reconcile &amp; Settle
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2">
              Auto-update Customer Khata balances, audit physical dipsticks, and generate daily P&amp;L closing.
            </p>
            <span className="mt-3 text-xs font-bold text-[#00a86b] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View Daily Closing <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
