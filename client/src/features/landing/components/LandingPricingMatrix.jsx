import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function LandingPricingMatrix() {
  const [billingCycle, setBillingCycle] = useState("annual");

  return (
    <section className="py-10 lg:py-16 bg-white border-t border-slate-200/80" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mt-2">
            Simple, Predictable Plans For Every Dairy Scale
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4 mt-1">
            All plans include complete offline localStorage resilience and automated supplier procurement.
          </p>

          {/* Billing Toggle (Monthly vs Annual) */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#1F4B3F] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-[#00a86b] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-white/20 text-white text-[9.5px] px-2 py-0.5 rounded-full font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full items-stretch">
          {/* Plan 1: Starter Dairy */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Small Dairy / Single Shop
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Starter Farm</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  Rs. {billingCycle === "annual" ? "7,500" : "9,999"}
                </span>
                <span className="text-xs sm:text-sm text-slate-500"> / mo</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Up to 50 Registered Cattle
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Touch POS Counter Sales
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Customer Khata Ledger
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Mass-Balance Closing
                </li>
              </ul>
            </div>
            <Link
              to="/dashboard"
              className="mt-6 w-full py-3 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-50 transition text-center block"
            >
              Start 14-Day Trial
            </Link>
          </div>

          {/* Plan 2: Commercial Station (Featured) */}
          <div className="bg-[#1F4B3F] text-white rounded-2xl p-6 sm:p-7 border-2 border-[#00a86b] shadow-2xl relative flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00a86b] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              Most Popular
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Commercial Milk Station
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Commercial Pro</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  Rs. {billingCycle === "annual" ? "14,500" : "18,999"}
                </span>
                <span className="text-xs sm:text-sm text-emerald-200"> / mo</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Unlimited Cattle Herd
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Milk Intake &amp; Dock Procurement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> 15 Delivery Riders &amp; Fuel Tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> WhatsApp Khata Statements
                </li>
              </ul>
            </div>
            <Link
              to="/dashboard"
              className="mt-6 w-full py-3 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold transition text-center shadow-lg block cursor-pointer"
            >
              Get Started Now
            </Link>
          </div>

          {/* Plan 3: Enterprise Multi-Branch */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-xl transition-all duration-300">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Multi-Branch Dairy Chains
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Enterprise Multi-Branch</h3>
              <div className="mt-3 mb-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  Rs. {billingCycle === "annual" ? "28,000" : "34,999"}
                </span>
                <span className="text-xs sm:text-sm text-slate-500"> / mo</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Multi-Branch Centralized Hub
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Unlimited Fleet Riders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Tamper-Proof Audit Trail
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> 24/7 Dedicated Support
                </li>
              </ul>
            </div>
            <Link
              to="/dashboard"
              className="mt-6 w-full py-3 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-50 transition text-center block"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
