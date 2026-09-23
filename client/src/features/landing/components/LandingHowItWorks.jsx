import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const WORKFLOW_STEPS = [
  {
    step: "Step 1",
    phaseBadge: "Herd & Dock",
    title: "Log Herd & Intake",
    description:
      "Morning/evening yields and dock supplier deliveries with digital volume verification.",
    image: "/images/animals.webp",
    route: "/farm",
    actionLabel: "Open Farm & Intake",
    features: [
      "Individual cow & buffalo RFID logs",
      "Supplier milk dock intake slips",
    ],
  },
  {
    step: "Step 2",
    phaseBadge: "Cold Batching",
    title: "Grade & Process Dahi",
    description:
      "Compute formula milk rates, route into chilled bulk tanks, and batch fresh pot Dahi.",
    image: "/images/storage.webp",
    route: "/supplier",
    actionLabel: "Explore Milk Dock",
    features: [
      "Fat %, SNF & quality grading",
      "Chiller storage & Dahi incubation",
    ],
  },
  {
    step: "Step 3",
    phaseBadge: "POS & Transit",
    title: "Sell & Dispatch Fleet",
    description:
      "Sub-second walk-in sales, customer monthly delivery runs, and rider vehicle fuel logging.",
    image: "/images/delivery.jpeg",
    route: "/pos",
    actionLabel: "Launch POS Counter",
    features: [
      "Sub-second touch POS checkout",
      "Rider fleet bottle & fuel sheets",
    ],
  },
  {
    step: "Step 4",
    phaseBadge: "Ledger & P&L",
    title: "Reconcile & Settle",
    description:
      "Auto-update Customer Khata balances, audit physical dipsticks, and generate daily P&L closing.",
    image: "/images/PnL.jpeg",
    route: "/farm/pl",
    actionLabel: "View Daily Closing",
    features: [
      "Customer Khata & WhatsApp slips",
      "Dipstick vs cash mass balance",
    ],
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="py-10 lg:py-16 bg-white border-b border-slate-200/80" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
            End-to-End Operational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mt-2 mb-2">
            How Pure Milk Bar ERP Powers Your Daily Operations
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            From morning herd milking to evening financial closing, every drop of milk is accounted for across 4 automated steps.
          </p>
        </div>

        {/* Step Cards Grid - Identical edge-to-edge styling as 'Every Module We Manage' */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WORKFLOW_STEPS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col group"
            >
              {/* Card Visual / Image Section (Edge-to-Edge with no inner borders) */}
              <div className="relative h-36 sm:h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1F4B3F] overflow-hidden flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Left Floating Step Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                    {item.step}
                  </span>
                </div>

                {/* Top Right Floating Phase Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/95 text-slate-900 shadow-md">
                    {item.phaseBadge}
                  </span>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-[#00a86b] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="mt-2.5 space-y-1.5">
                    {item.features.map((feat, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-start gap-1.5 text-xs text-slate-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Link */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Operational Phase
                  </span>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#00a86b] hover:text-[#008f5b] group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
