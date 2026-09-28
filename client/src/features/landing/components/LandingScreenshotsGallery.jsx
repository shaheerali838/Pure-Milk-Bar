import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Monitor,
  X,
  Eye,
  ShieldCheck,
} from "lucide-react";

/**
 * ============================================================================
 * 📸 ERP SYSTEM SCREENSHOTS CONFIGURATION
 * ============================================================================
 * You can easily paste or replace your ERP system screenshots here!
 *
 * Steps to add your own screenshots:
 * 1. Drop your image files into `client/public/images/screenshots/` (e.g. dashboard.png)
 * 2. Update or add entries in the `ERP_SCREENSHOTS` array below with your image paths!
 * 3. Supports `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, or external image URLs.
 * ============================================================================
 */
export const ERP_SCREENSHOTS = [
  {
    id: "dashboard",
    title: "Executive Dashboard & Production Telemetry",
    category: "overview",
    categoryLabel: "Overview",
    badge: "Real-Time Telemetry",
    urlBar: "puremilkbar.erp/dashboard",
    image: "/images/screenshots/dashboard.png",
    route: "/dashboard",
    description:
      "Unified real-time dairy intelligence: Live milk yield vs procurement intake, cold-room temperature status, active POS counter revenue, and fleet dispatch tracking.",
    highlights: [
      "Morning & Evening Milking vs Procurement reconciliation",
      "Instant counter revenue & cash drawer balances",
      "Bulk chiller storage capacity & cold-chain status",
      "Automated mass-balance discrepancy alerts",
    ],
  },
  {
    id: "herd-management",
    title: "Livestock & Cattle RFID Herd Register",
    category: "farm",
    categoryLabel: "Farm & Cattle",
    badge: "RFID Herd Tracking",
    urlBar: "puremilkbar.erp/farm/animals",
    image: "/images/screenshots/farm-animals.png",
    route: "/farm/animals",
    description:
      "Individual cow and buffalo profile tracking with RFID tags, lactation cycles (Lactating, Dry, Pregnant), pedigree details, and daily yield historical curves.",
    highlights: [
      "Individual RFID ear-tag registry & cattle profile",
      "Lactation status & AI breeding calendar",
      "Veterinary health, vaccinations & treatment alarms",
      "Yield curves & sudden drop anomaly alerts",
    ],
  },
  {
    id: "supplier-dock",
    title: "Milk Dock Intake & Supplier Procurement",
    category: "procurement",
    categoryLabel: "Milk Dock",
    badge: "Automated Intake Dock",
    urlBar: "puremilkbar.erp/supplier",
    image: "/images/screenshots/supplier.png",
    route: "/supplier",
    description:
      "Rapid milk reception terminal with digital dipstick logging, temperature quality grading, tiered rate contracts, and automated Khata debit/credit vouchers.",
    highlights: [
      "Sub-second supplier milk intake slip generation",
      "Tiered rate cards based on quality (Fat / SNF)",
      "Automated supplier Khata balance updating",
      "Dock intake vs bulk tank storage verification",
    ],
  },
  {
    id: "touch-pos",
    title: "High-Speed Touch POS & Retail Counter",
    category: "pos",
    categoryLabel: "POS & Sales",
    badge: "Sub-Second Billing",
    urlBar: "puremilkbar.erp/pos",
    image: "/images/screenshots/pos.png",
    route: "/pos",
    description:
      "Ultra-fast POS interface optimized for touchscreens and thermal receipt printers: Quick milk bagging, Dahi pots, retail dairy products, and instant cash/Khata split billing.",
    highlights: [
      "Rupee-first quick sale & automatic liter calculation",
      "Cash, Online (JazzCash/Easypaisa), and Khata settlement",
      "Instant 80mm/58mm thermal receipt printing",
      "End-of-shift drawer cash count and reconciliation",
    ],
  },
  {
    id: "finance-pnl",
    title: "Profit & Loss and Customer Khata Ledgers",
    category: "finance",
    categoryLabel: "Finance & Ledgers",
    badge: "100% Zero-Loss Ledger",
    urlBar: "puremilkbar.erp/farm/pl",
    image: "/images/screenshots/farm-pl.png",
    route: "/farm/pl",
    description:
      "Real-time cost per liter analysis (feed, labor, vet, electricity) alongside customer khata recovery, daily cash register closing, and bank settlements.",
    highlights: [
      "Live Cost-per-Liter production economics",
      "Automated monthly customer ledger balance sheets",
      "Daily closing mass-balance reconciliation sheets",
      "Zero-dispute audit logs with WhatsApp statement sharing",
    ],
  },
  {
    id: "rider-delivery",
    title: "Delivery Fleet, Routes & Logistics",
    category: "logistics",
    categoryLabel: "Fleet & Logistics",
    badge: "Route Logistics",
    urlBar: "puremilkbar.erp/delivery",
    image: "/images/screenshots/delivery.png",
    route: "/delivery",
    description:
      "Doorstep morning/evening delivery route management: Rider dispatch sheets, route bottles allocation, customer collection tracking, and empty bottle returns.",
    highlights: [
      "Model Town & Faisal Town route scheduling",
      "Rider dispatch sheets & bottle accounting",
      "Cash on delivery (COD) collection custody",
      "Vehicle fuel (Liters, KM, Cost) tracking",
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Screenshots" },
  { id: "overview", label: "Dashboard" },
  { id: "farm", label: "Livestock & Herd" },
  { id: "procurement", label: "Milk Dock Intake" },
  { id: "pos", label: "Touch POS" },
  { id: "finance", label: "Khata & P&L" },
  { id: "logistics", label: "Fleet Logistics" },
];

export default function LandingScreenshotsGallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState({});

  const filteredScreenshots =
    activeCategory === "all"
      ? ERP_SCREENSHOTS
      : ERP_SCREENSHOTS.filter((s) => s.category === activeCategory);

  const currentItem =
    filteredScreenshots[selectedIdx] || filteredScreenshots[0] || ERP_SCREENSHOTS[0];

  const handleNext = () => {
    setSelectedIdx((prev) => (prev + 1) % filteredScreenshots.length);
  };

  const handlePrev = () => {
    setSelectedIdx(
      (prev) => (prev - 1 + filteredScreenshots.length) % filteredScreenshots.length
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, filteredScreenshots.length]);

  const handleImageError = (id) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section
      id="screenshots"
      className="py-10 lg:py-16 bg-white border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 lg:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Inside Pure Milk Bar ERP: Live System Screens
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore high-definition UI previews of our core operational screens, from livestock herd registers to thermal POS counters.
            </p>
          </div>

          {/* Category Filter Chips (Matching Landing Page Style) */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setSelectedIdx(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#00a86b] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.id !== "all" && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {ERP_SCREENSHOTS.filter((s) => s.category === tab.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Screenshot Showcase Frame (Modern Browser Window) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden mb-6">
          {/* Top Window Chrome / Address Bar (Theme Emerald Green Header) */}
          <div className="bg-[#14332D] px-4 py-2.5 flex items-center justify-between border-b border-[#234941]">
            {/* macOS Window Controls */}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <div className="hidden sm:flex items-center space-x-1.5 ml-3 pl-3 border-l border-emerald-800 text-emerald-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5BBB7B]" />
                <span>Pure Milk Bar ERP &bull; Verified Interface</span>
              </div>
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-sm sm:max-w-md mx-3 hidden md:flex items-center justify-center bg-[#1B3E35] border border-emerald-600/30 px-3 py-1 rounded-lg text-xs font-mono text-emerald-200 truncate">
              <span className="text-emerald-400/60 mr-1 select-none">https://</span>
              <span>{currentItem.urlBar}</span>
            </div>

            {/* Actions: Direct Route Link & Lightbox Trigger */}
            <div className="flex items-center space-x-2">
              <Link
                to={currentItem.route || "/login"}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Live Route</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Expand Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Screenshot Display & Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Screenshot Image Canvas */}
            <div className="lg:col-span-8 bg-slate-900 p-3 sm:p-5 flex items-center justify-center relative group min-h-[280px] sm:min-h-[420px] max-h-[520px] overflow-hidden">
              {imageErrorMap[currentItem.id] ? (
                /* Fallback if screenshot file is missing */
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-800/80 rounded-xl border border-dashed border-slate-700 w-full h-full min-h-[300px]">
                  <ImageIcon className="w-10 h-10 text-emerald-400/80 mb-2.5 animate-pulse" />
                  <h4 className="text-white font-bold text-sm sm:text-base mb-1">
                    {currentItem.title}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mb-3">
                    Paste your screenshot at <code className="text-emerald-300 bg-black/40 px-1.5 py-0.5 rounded font-mono">{currentItem.image}</code> in <code className="text-emerald-300">client/public/images/screenshots/</code> to display it here.
                  </p>
                  <Link
                    to={currentItem.route || "/login"}
                    className="px-3.5 py-1.5 rounded-lg bg-[#00a86b] text-white text-xs font-bold hover:bg-[#008f5b] transition flex items-center gap-1.5"
                  >
                    <span>Open {currentItem.categoryLabel} Screen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div
                  className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden rounded-xl border border-slate-800 group"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    onError={() => handleImageError(currentItem.id)}
                    className="w-full h-auto max-h-[480px] object-cover object-top rounded-xl shadow-xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 text-white">
                    <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Click to Expand Full View
                    </span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      Pure Milk Bar UI
                    </span>
                  </div>
                </div>
              )}

              {/* Prev / Next Floating Navigation Arrows */}
              {filteredScreenshots.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-lg cursor-pointer z-10"
                    title="Previous Screen"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-lg cursor-pointer z-10"
                    title="Next Screen"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Right: Screen Details & Capabilities Panel (Theme Consistent Light Styling) */}
            <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold">
                    {currentItem.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {selectedIdx + 1} of {filteredScreenshots.length}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-2">
                  {currentItem.title}
                </h3>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4">
                  {currentItem.description}
                </p>

                {/* Key Capabilities List */}
                <div className="space-y-2 mb-5">
                  <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Key Features &amp; Controls:
                  </h5>
                  {currentItem.highlights.map((highlight, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <Link
                  to={currentItem.route || "/login"}
                  className="w-full bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Launch {currentItem.categoryLabel} Module</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#00a86b]" />
                  <span>Open Full-Screen Lightbox</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5 text-xs text-slate-700 font-bold px-1">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Layers className="w-3.5 h-3.5 text-[#00a86b]" /> Available System Screens ({filteredScreenshots.length})
            </span>
            <span className="text-slate-400 text-[11px] font-normal">
              Click thumbnail to preview screen
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {filteredScreenshots.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`group text-left rounded-xl overflow-hidden p-1.5 transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "bg-emerald-50/80 border-[#00a86b] ring-2 ring-emerald-500/30 shadow-md scale-102"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 relative mb-1.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className={`absolute inset-0 ${
                        isSelected ? "bg-emerald-500/10" : "bg-black/20 group-hover:bg-black/5"
                      } transition-colors`}
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.2 rounded bg-slate-900/80 text-white">
                      #{idx + 1}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-900 truncate group-hover:text-[#00a86b] transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[9.5px] text-[#00a86b] font-semibold truncate">
                    {item.badge}
                  </p>
                </button>
              );
            })}
          </div>
        </div>


      </div>

      {/* Full-Screen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Lightbox Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/15">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00a86b] text-xs font-bold text-white">
                {currentItem.badge}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {currentItem.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={currentItem.route || "/login"}
                onClick={() => setIsLightboxOpen(false)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition"
              >
                <span>Open Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image View */}
          <div className="flex-1 flex items-center justify-center relative p-2 sm:p-6 overflow-hidden">
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="max-h-[78vh] max-w-[95vw] object-contain rounded-xl shadow-2xl border border-white/15"
            />

            {/* Modal Navigation Arrows */}
            {filteredScreenshots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-2xl cursor-pointer"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition hover:scale-110 shadow-2xl cursor-pointer"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Bar */}
          <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
            <span className="font-mono text-emerald-400">
              {currentItem.urlBar}
            </span>
            <p className="text-center sm:text-right text-slate-400 text-[11px]">
              Use Arrow keys to navigate &bull; Esc to close &bull; {selectedIdx + 1} of{" "}
              {filteredScreenshots.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
