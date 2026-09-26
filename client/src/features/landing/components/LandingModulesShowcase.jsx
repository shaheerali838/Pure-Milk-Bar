import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const ERP_MODULES = [
  {
    id: "farm",
    category: "farm",
    title: "Livestock & Cattle Herd Register",
    badge: "RFID Herd Tracking",
    route: "/farm/animals",
    image: "/images/modules/livestock-herd.jpg",
    description:
      "Cattle profiles, ear-tag RFID codes, lactation status (Lactating/Dry/Pregnant), breed specifications, and individual yield curves.",
    features: [
      "Individual Cow & Buffalo RFID records",
      "Morning & Evening milking batch stats",
      "Veterinary history & vaccination alarms",
      "Cattle lifecycle & breeding records",
    ],
    kpi: "850 L/day Herd Yield",
    kpiLabel: "Live Herd Average",
  },
  {
    id: "milking",
    category: "farm",
    title: "Milking Shifts & Bulk Tank Log",
    badge: "Morning/Evening Shifts",
    route: "/farm/milking",
    image: "/images/milking-register.jpeg",
    description:
      "Shift-by-shift yield entries, milk temperature monitoring, bulk tank levels, and automated lactation yield variance tracking.",
    features: [
      "Real-time morning & evening milking registers",
      "Lactation status & peak yield curves",
      "Bulk tank level & storage dipstick logs",
      "Automated variance & shrinkage detection",
    ],
    kpi: "99.2% Capture Rate",
    kpiLabel: "Shift Logging",
  },
  {
    id: "supplier",
    category: "supplier",
    title: "Supplier Procurement & Milk Dock",
    badge: "Automated Intake",
    route: "/supplier",
    image: "/images/modules/procurement-dock.jpg",
    description:
      "Direct milk intake reception with density testing, batch volume logging, and instant supplier debit/credit vouchers.",
    features: [
      "Supplier volume intake & density logs",
      "Supplier directory & tiered pricing contracts",
      "Dipstick vs volumetric intake audits",
      "Automated supplier Khata entries",
    ],
    kpi: "3,400 L/day Dock",
    kpiLabel: "Procured Intake",
  },
  {
    id: "processing",
    category: "inventory",
    title: "Products, Dahi & Inventory",
    badge: "Cold-Chain & Batching",
    route: "/products",
    image: "/images/inventory.jpeg",
    description:
      "Maintain dairy cold-chain: Yogurt (Dahi) curdling batches, chilling rooms (0-4°C), SKU catalogs, and real-time inventory balances.",
    features: [
      "Fresh Pot Dahi yield & incubation batches",
      "Chiller room storage temperature logs",
      "Real-time stock balance across Cow/Buff/Dahi",
      "Cost-per-liter vs retail margin tracking",
    ],
    kpi: "320 Pots/day",
    kpiLabel: "Dahi Processing",
  },
  {
    id: "pos",
    category: "pos",
    title: "High-Speed POS & Retail Counter",
    badge: "Sub-Second Checkout",
    route: "/pos",
    image: "/images/modules/pos-counter.jpg",
    description:
      "Ultra-fast touch POS: Rupee-first quick sale (Rs. 50, 100, 500), Walk-in counter cash, instant thermal slips, and customer Khata sync.",
    features: [
      "Rupee-amount auto conversion to liter qty",
      "Cash, Online (JazzCash/Easypaisa), and Khata",
      "Thermal printer invoice generation",
      "Instant delivery dispatch with rider linkage",
    ],
    kpi: "Rs. 425K Daily",
    kpiLabel: "Counter Volume",
  },
  {
    id: "delivery",
    category: "logistics",
    title: "Delivery Fleet, Routes & Fuel",
    badge: "Fleet & Logistics",
    route: "/delivery",
    image: "/images/modules/logistics-fleet.jpg",
    description:
      "Manage morning/evening neighborhood milk runs: Route drops (Model Town, Faisal Town), bottle return audits, and rider fuel KM logging.",
    features: [
      "Model Town & Faisal Town route scheduling",
      "Rider vehicle fuel (Liters, KM, Cost) logs",
      "Empty glass bottle collection tracking",
      "Cash on Delivery (COD) collection custody",
    ],
    kpi: "18 Active Riders",
    kpiLabel: "Fleet Dispatches",
  },
  {
    id: "khata",
    category: "finance",
    title: "Customer Khata & Debt Recovery",
    badge: "100% Zero-Loss Ledger",
    route: "/customer-khata-ledger",
    image: "/images/modules/khata-finance.jpg",
    description:
      "Complete digital Khata: Real-time debit/credit timelines, monthly delivery automated billing, partial cash payments, and WhatsApp receipts.",
    features: [
      "Automated monthly delivery subscription billing",
      "Live Khata balance with partial payment support",
      "1-Click PDF & WhatsApp statement sharing",
      "Zero-dispute customer ledger history",
    ],
    kpi: "Rs. 1.2M Recovered",
    kpiLabel: "Monthly Khata",
  },
  {
    id: "closing",
    category: "finance",
    title: "Daily Closing & Mass Balance",
    badge: "Automated Reconciliation",
    route: "/finance/daily-closing",
    image: "/images/feeding.jpeg",
    description:
      "Reconciles bulk tank dipsticks with POS counter sales, fleet deliveries, spillage loss, and cash drawer balances for complete P&L.",
    features: [
      "Mass-balance dipstick vs sales tolerance audit",
      "Physical cash drawer vs system calculation",
      "Net liquid cash flow & daily P&L profit breakdown",
      "Immutable manager sign-off & lock mechanism",
    ],
    kpi: "99.8% Accuracy",
    kpiLabel: "Mass Balance",
  },
];

function ModuleCard({ item, isMarquee = false }) {
  return (
    <div
      className={`relative ${
        isMarquee
          ? "w-[280px] sm:w-[320px] lg:w-[350px] shrink-0"
          : "w-full max-w-[380px]"
      } h-[360px] sm:h-[390px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group bg-slate-900 border border-slate-200/80 cursor-pointer`}
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
          {item.badge}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10.5px] font-bold shadow-md">
          {item.kpi}
        </span>
      </div>

      {/* Default State: Bottom Gradient Overlay & Overview */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />
      <div className="absolute bottom-4 left-4 right-4 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
        <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
        <p className="text-xs text-slate-200 font-medium mt-0.5 line-clamp-1">{item.description}</p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[11px] text-slate-300">
          <span>{item.kpiLabel}</span>
          <span className="text-emerald-300 font-semibold">{item.kpi}</span>
        </div>
      </div>

      {/* Hover Reveal State: Deep Emerald Gradient & Full Details */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-5 text-white">
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-1.5">
          {item.badge}
        </span>
        <h3 className="text-base font-bold text-white">{item.title}</h3>
        <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-1">
          {item.description}
        </p>

        {/* Features List */}
        <ul className="mt-2.5 space-y-1.5">
          {item.features.slice(0, 2).map((feat, fIdx) => (
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
          <span>Open {item.title.split(" ")[0]} Module</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function LandingModulesShowcase() {
  const [activeModuleFilter, setActiveModuleFilter] = useState("all");

  const filteredModules =
    activeModuleFilter === "all"
      ? ERP_MODULES
      : ERP_MODULES.filter((m) => m.category === activeModuleFilter);

  return (
    <section className="py-10 lg:py-16 bg-slate-50 border-b border-slate-200/80" id="modules">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-5 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Every System &amp; Module We Manage
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore the 8 integrated functional pillars designed specifically for dairy business operations.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
            {activeModuleFilter === "all"
              ? `Live Marquee (${ERP_MODULES.length} Systems)`
              : `Showing ${filteredModules.length} ${filteredModules.length === 1 ? "System" : "Systems"}`}
          </span>
        </div>

        {/* Category Filter Chips - Responsive Single Line */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 sm:mb-8 flex-nowrap whitespace-nowrap">
          {[
            { id: "all", label: "All Modules" },
            { id: "farm", label: "Livestock & Herd" },
            { id: "supplier", label: "Procurement Dock" },
            { id: "pos", label: "POS Counter" },
            { id: "logistics", label: "Logistics Fleet" },
            { id: "finance", label: "Khata & Finance" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveModuleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeModuleFilter === tab.id
                  ? "bg-[#00a86b] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switch: Continuous Marquee for "All Modules" vs Clean Static Grid for Filtered Category */}
        {activeModuleFilter === "all" ? (
          /* Continuous 1-Line Marquee Track with Seamless Feathered Blur Mask */
          <div
            className="relative w-full overflow-hidden py-2"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
            }}
          >
            {/* Left Feathered Blur Mask */}
            <div
              className="absolute top-0 bottom-0 left-0 w-14 sm:w-20 lg:w-24 z-20 pointer-events-none backdrop-blur-[2.5px]"
              style={{
                maskImage: "linear-gradient(to right, black 20%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, black 20%, transparent 100%)",
              }}
            />

            {/* Right Feathered Blur Mask */}
            <div
              className="absolute top-0 bottom-0 right-0 w-10 sm:w-16 lg:w-20 z-20 pointer-events-none backdrop-blur-[2px]"
              style={{
                maskImage: "linear-gradient(to left, black 20%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to left, black 20%, transparent 100%)",
              }}
            />

            {/* Smooth Marquee Rail */}
            <div className="animate-marquee-left flex gap-5 will-change-transform py-2">
              {[...ERP_MODULES, ...ERP_MODULES].map((item, idx) => (
                <ModuleCard key={`${item.id}-${idx}`} item={item} isMarquee={true} />
              ))}
            </div>
          </div>
        ) : (
          /* Filtered Modules Static Grid View */
          <div className="py-2 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredModules.map((item) => (
                <ModuleCard key={item.id} item={item} isMarquee={false} />
              ))}
            </div>

            {/* Bottom Return Action to return to Marquee */}
            <div className="mt-8 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setActiveModuleFilter("all")}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
              >
                <span>&larr; Return to All Modules Marquee</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
