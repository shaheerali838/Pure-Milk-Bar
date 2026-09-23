import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LandingEnrolledFarms() {
  return (
    <section className="py-10 lg:py-16 bg-slate-50 border-b border-slate-200" id="farms">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
              Verified Dairy Producers
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mt-2">
              Commercial Farms Enrolled With Pure Milk Bar ERP
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Leading dairy farms and commercial milk producers managing daily herd milking, bulk chiller procurement, and distribution.
            </p>
          </div>
          <Link
            to="/login"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-[#00a86b] flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <span>Explore Farm Module</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Farm 1: Al-Noor Dairy & Cattle Farm */}
          <div className="relative h-[330px] sm:h-[370px] lg:h-[400px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
            <img
              alt="Al-Noor Dairy Farm"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              src="/images/dairyfarm.jpeg"
            />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active ERP Node
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10.5px] font-bold shadow-md">
                ★ 4.98
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 right-4 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
              <h3 className="text-base font-bold text-white tracking-tight">Al-Noor Dairy &amp; Cattle Farm</h3>
              <p className="text-xs text-slate-200 font-medium mt-0.5">Sahiwal &amp; HF Cattle Herd &bull; Lahore</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                <span>180 Head Herd</span>
                <span className="text-emerald-300 font-semibold">3,200 L Daily Yield</span>
              </div>
            </div>
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-5 text-white">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-1.5">
                Tier-1 Commercial Producer
              </span>
              <h3 className="text-base font-bold text-white">Al-Noor Dairy Farm</h3>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1">
                Automated milking parlor with direct refrigerated chiller tank transfer and batch lactation logs.
              </p>
              <Link
                to="/login"
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span>View Farm Herd</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Farm 2: Green Pastures Dairy Complex */}
          <div className="relative h-[330px] sm:h-[370px] lg:h-[400px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
            <img
              alt="Green Pastures Dairy Complex"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              src="/images/animals.webp"
            />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Inflow Dock
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10.5px] font-bold shadow-md">
                ★ 4.95
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 right-4 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
              <h3 className="text-base font-bold text-white tracking-tight">Green Pastures Dairy Complex</h3>
              <p className="text-xs text-slate-200 font-medium mt-0.5">Nili-Ravi Buffalo &amp; Cow Unit &bull; Faisalabad</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                <span>240 Head Herd</span>
                <span className="text-emerald-300 font-semibold">4,500 L Daily Yield</span>
              </div>
            </div>
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-5 text-white">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-1.5">
                High-Volume Unit
              </span>
              <h3 className="text-base font-bold text-white">Green Pastures Complex</h3>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1">
                High-yield lactation logs with 100% automated feed formula allocation and veterinary schedules.
              </p>
              <Link
                to="/login"
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span>View Feed Formulations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Farm 3: Bismillah Organic Milk Farm */}
          <div className="relative h-[330px] sm:h-[370px] lg:h-[400px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
            <img
              alt="Bismillah Milk Farm"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              src="/images/milking-register.jpeg"
            />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Chiller Dock Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10.5px] font-bold shadow-md">
                ★ 4.99
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 right-4 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
              <h3 className="text-base font-bold text-white tracking-tight">Bismillah Organic Milk Farm</h3>
              <p className="text-xs text-slate-200 font-medium mt-0.5">Raw Milk Chilling Station &bull; Sahiwal</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                <span>120 Head Herd</span>
                <span className="text-emerald-300 font-semibold">2,800 L Daily Yield</span>
              </div>
            </div>
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-5 text-white">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-1.5">
                Bulk Supplier Hub
              </span>
              <h3 className="text-base font-bold text-white">Bismillah Milk Farm</h3>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1">
                Zero-shrinkage mass-balance tank audit and automated supplier khata payout settlement.
              </p>
              <Link
                to="/login"
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span>View Milk Procurement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Farm 4: Royal Fresh Dairy Estate */}
          <div className="relative h-[330px] sm:h-[370px] lg:h-[400px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
            <img
              alt="Royal Fresh Dairy Estate"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              src="/images/storage.webp"
            />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Cold-Chain Certified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10.5px] font-bold shadow-md">
                ★ 4.96
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 right-4 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
              <h3 className="text-base font-bold text-white tracking-tight">Royal Fresh Dairy Estate</h3>
              <p className="text-xs text-slate-200 font-medium mt-0.5">Pasteurization &amp; Chilling &bull; Multan</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                <span>310 Head Herd</span>
                <span className="text-emerald-300 font-semibold">6,200 L Daily Yield</span>
              </div>
            </div>
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-5 text-white">
              <span className="text-[9px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-1.5">
                Integrated Estate
              </span>
              <h3 className="text-base font-bold text-white">Royal Fresh Estate</h3>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1">
                Direct farm-to-counter distribution with real-time route fleet tracking and automated closing balances.
              </p>
              <Link
                to="/login"
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg"
              >
                <span>View Delivery Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
