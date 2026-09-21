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
    image: "/images/animals.webp",
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
    image: "/images/storage.webp",
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
    image: "/images/delivery.jpeg",
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
    image: "/images/delivery.jpeg",
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
    image: "/images/PnL.jpeg",
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

export default function LandingModulesShowcase() {
  const [activeModuleFilter, setActiveModuleFilter] = useState("all");

  const filteredModules =
    activeModuleFilter === "all"
      ? ERP_MODULES
      : ERP_MODULES.filter((m) => m.category === activeModuleFilter);

  return (
    <section className="py-10 lg:py-16 bg-slate-50 border-b border-slate-200/80" id="modules">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
              Complete ERP Suite
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mt-2">
              Every System &amp; Module We Manage
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore the 8 integrated functional pillars designed specifically for dairy business operations.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeModuleFilter === tab.id
                    ? "bg-[#00a86b] text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredModules.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col group"
            >
              {/* Card Visual / Image Section */}
              <div className="relative h-36 sm:h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1F4B3F] overflow-hidden flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Floating Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                    {item.badge}
                  </span>
                </div>

                {/* Top Right KPI */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/95 text-slate-900 shadow-md">
                    {item.kpi}
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
                    {item.features.slice(0, 2).map((feat, idx) => (
                      <li
                        key={idx}
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
                    {item.kpiLabel}
                  </span>
                  <Link
                    to={item.route}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#00a86b] hover:text-[#008f5b] group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Open Module</span>
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
