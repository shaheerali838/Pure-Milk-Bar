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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
            How Pure Milk Bar ERP Powers Your Daily Operations
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            From morning herd milking to evening financial closing, every drop of milk is accounted for across 4 automated steps.
          </p>
        </div>

        {/* Step Cards Grid - Matching Commercial Farms Section Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WORKFLOW_STEPS.map((item, idx) => (
            <div
              key={idx}
              className="relative h-[340px] sm:h-[380px] lg:h-[400px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {/* Top Floating Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {item.step}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10.5px] font-bold shadow-md">
                  {item.phaseBadge}
                </span>
              </div>

              {/* Default State: Bottom Gradient Overlay & Overview */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
                <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-xs text-slate-200 font-medium mt-0.5 line-clamp-1">{item.description}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                  <span>{item.phaseBadge}</span>
                  <span className="text-emerald-300 font-semibold">{item.actionLabel}</span>
                </div>
              </div>

              {/* Hover Reveal State: Deep Emerald Gradient & Full Details */}
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-5 text-white">
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-1.5">
                  {item.step} &bull; {item.phaseBadge}
                </span>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1">
                  {item.description}
                </p>

                {/* Features List */}
                <ul className="mt-2.5 space-y-1.5">
                  {item.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5BBB7B] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={item.route || "/login"}
                  className="mt-3.5 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
