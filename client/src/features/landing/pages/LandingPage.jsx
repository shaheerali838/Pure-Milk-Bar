import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Milk,
  Tractor,
  Truck,
  ShoppingCart,
  Layers,
  Bike,
  Wallet,
  Package,
  ShieldCheck,
  Activity,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calculator,
  Gauge,
  FileText,
  BarChart3,
  Database,
  Cpu,
  Zap,
  Award,
  TrendingUp,
  Printer,
  QrCode,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Scale,
  Droplets,
  Thermometer,
  Clock,
  Compass,
  HelpCircle,
  Send,
  Star,
  Users,
  Check,
  Building2,
  Server,
  Code2,
  Smartphone,
  ChevronRight,
  Flame,
  MessageSquare,
  BadgeCheck,
  Percent,
  TrendingDown,
  BarChart2,
  ArrowUpRight,
  PhoneCall,
  Search,
  Sliders,
  DollarSign,
  UserCheck,
  Calendar,
  Layers2,
  MapPin,
  ClipboardCheck,
  FileSpreadsheet,
  Coins,
  Settings,
  Shield,
  Phone,
  Globe,
  PlusCircle,
  Play,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  // Search & Navigation State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Active Module Filter in System Showcase
  const [activeModuleFilter, setActiveModuleFilter] = useState("all");

  // Pricing toggle state (Monthly vs Annual)
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" or "annual"

  // Simulator 1: Richmond SNF & Pricing Engine State
  const [fatValue, setFatValue] = useState(6.5);
  const [lrValue, setLrValue] = useState(28.0);
  const [baseMilkRate, setBaseMilkRate] = useState(180);

  // Richmond SNF Calculation: SNF% = (LR / 4) + (0.21 * FAT%) + 0.36
  const calculatedSNF = ((lrValue / 4) + (0.21 * fatValue) + 0.36).toFixed(2);
  const priceMultiplier = fatValue / 6.0;
  const lrBonus = (lrValue - 28.0) * 1.5;
  const calculatedPricePerLiter = Math.max(
    100,
    Math.round(baseMilkRate * priceMultiplier + lrBonus)
  );

  // Simulator 2: Mass Balance Reconciliation State
  const [openingTank, setOpeningTank] = useState(1200);
  const [herdYield, setHerdYield] = useState(850);
  const [sourcerIntake, setSourcerIntake] = useState(3400);
  const [retailSales, setRetailSales] = useState(1650);
  const [deliveriesTotal, setDeliveriesTotal] = useState(3600);
  const [spillageLoss, setSpillageLoss] = useState(15);
  const [actualDipstick, setActualDipstick] = useState(185);

  const calculatedExpectedStock =
    openingTank + herdYield + sourcerIntake - retailSales - deliveriesTotal - spillageLoss;
  const massBalanceVariance = actualDipstick - calculatedExpectedStock;
  const isBalanceWithinTolerance = Math.abs(massBalanceVariance) <= 1.5;

  // Simulator 3: Enterprise ROI & Shrinkage Savings Calculator
  const [dailyVolume, setDailyVolume] = useState(5000);
  const monthlyVolume = dailyVolume * 30;
  const monthlyShrinkageSaved = Math.round(monthlyVolume * 0.025 * 180); // 2.5% shrinkage reduction
  const monthlyKhataDebtRecovered = Math.round(monthlyVolume * 0.04 * 180 * 0.95); // 4% default prevention
  const monthlyQualityTestingSavings = Math.round(monthlyVolume * 3.5); // PKR 3.5/L saved on precise FAT grading
  const totalMonthlySavings =
    monthlyShrinkageSaved + monthlyKhataDebtRecovered + monthlyQualityTestingSavings;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Handle Quick Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedCategory) {
      navigate(selectedCategory);
    } else {
      const q = searchQuery.toLowerCase().trim();
      if (q.includes("pos") || q.includes("sale") || q.includes("counter")) {
        navigate("/pos");
      } else if (q.includes("farm") || q.includes("cow") || q.includes("buff") || q.includes("herd") || q.includes("milk")) {
        navigate("/farm");
      } else if (q.includes("suppl") || q.includes("intake") || q.includes("fat") || q.includes("snf") || q.includes("sourc")) {
        navigate("/supplier");
      } else if (q.includes("deliv") || q.includes("rider") || q.includes("fuel") || q.includes("fleet")) {
        navigate("/delivery");
      } else if (q.includes("khata") || q.includes("cust") || q.includes("ledger") || q.includes("credit")) {
        navigate("/customer-khata-ledger");
      } else if (q.includes("clos") || q.includes("reconcil") || q.includes("profit") || q.includes("finance")) {
        navigate("/finance/daily-closing");
      } else if (q.includes("staff") || q.includes("pay") || q.includes("salary")) {
        navigate("/staff");
      } else {
        navigate("/dashboard");
      }
    }
  };

  // All 8 Core ERP Modules with Complete Functional Details
  const erpModules = [
    {
      id: "farm",
      category: "farm",
      title: "Livestock & Herd Management",
      badge: "Herd Intelligence",
      route: "/farm",
      image: "/landing-images/db-panel-wiring.png", // Sample asset from landing page
      description:
        "End-to-end cattle tracking: Cow & Buffalo registry, tagging, lactation lifecycle, daily automated milking yield, and feed expense audits.",
      features: [
        "Individual Cow & Buffalo RFID profiles",
        "Morning & Evening milking batch log",
        "Automated bulk chiller tank integration",
        "Feed & veterinary expense attribution",
      ],
      kpi: "850 L/day Herd Yield",
      kpiLabel: "Live Herd Avg",
    },
    {
      id: "supplier",
      category: "supplier",
      title: "Milk Procurement & Dock Intake",
      badge: "Richmond FAT & SNF Lab",
      route: "/supplier",
      image: "/landing-images/solar-inverter.png",
      description:
        "Precision milk dock station: Automated Richmond SNF% calculation, Lactometer (LR) grading, dipstick volume, and instant supplier debit/credit ledger.",
      features: [
        "Automatic Richmond formula grading (FAT + LR)",
        "Supplier directory & tiered pricing contracts",
        "Dipstick vs Flowmeter volumetric validation",
        "Instant supplier Khata voucher generation",
      ],
      kpi: "3,400 L/day Dock",
      kpiLabel: "Procured Intake",
    },
    {
      id: "processing",
      category: "inventory",
      title: "Processing, Dahi & Inventory",
      badge: "Cold-Chain & Batching",
      route: "/proccessing",
      image: "/landing-images/washing-machine-repair.png",
      description:
        "Maintain dairy cold-chain (0-4°C): Yogurt (Dahi) curdling batches, pasteurization logs, product SKU catalogs, and real-time inventory levels.",
      features: [
        "Fresh Pot Dahi yield & incubation batches",
        "Chiller room storage temperature logs",
        "Stock balance sync across Cow/Buffalo/Dahi",
        "Batch cost vs retail margin calculations",
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
      image: "/landing-images/electrician-db-technician.png",
      description:
        "Ultra-fast touch POS: Rupee-first quick sale (Rs. 50, 100, 500), Walk-in counter cash, instant thermal receipts, and registered customer Khata sync.",
      features: [
        "Rupee-amount auto conversion to liter qty",
        "Cash, Online (JazzCash/Easypaisa), and Khata pay",
        "Direct thermal printer invoice generation",
        "1-click delivery dispatch with rider linkage",
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
      image: "/landing-images/ac-deep-wash-alt.png",
      description:
        "Manage morning/evening neighborhood milk runs: Area route scheduling, bottle drop validation, empty bottle returns, and rider vehicle fuel logging.",
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
      title: "Customer Khata & Recovery Ledger",
      badge: "100% Zero-Loss Ledger",
      route: "/customer-khata-ledger",
      image: "/landing-images/water-tank-disinfection.png",
      description:
        "Complete digital Khata ledger: Real-time debit/credit timelines, monthly subscription automated billing, partial cash payments, and instant WhatsApp receipts.",
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
      title: "Daily Financial Closing & Mass Balance",
      badge: "Automated Reconciliation",
      route: "/finance/daily-closing",
      image: null, // Leaves clean, elegant empty-space placeholder with stylized UI representation
      description:
        "The heartbeat of dairy governance: Reconciles bulk tank dipsticks with POS counter sales, fleet deliveries, spillage loss, and cash drawer balances.",
      features: [
        "Mass-balance dipstick vs sales tolerance audit",
        "Physical cash drawer vs system calculation",
        "Net liquid cash flow & daily P&L profit breakdown",
        "Immutable manager sign-off & lock mechanism",
      ],
      kpi: "99.8% Accuracy",
      kpiLabel: "Mass Balance",
    },
    {
      id: "audit",
      category: "finance",
      title: "Transaction Audit & Security Log",
      badge: "Immutable Audit Trail",
      route: "/finance/audit-log",
      image: null, // Leaves clean, elegant empty-space placeholder
      description:
        "Enterprise compliance: Complete chronological log of every sale, Khata adjustment, supplier payout, stock edit, and staff wage disbursement.",
      features: [
        "Chronological tamper-proof event stream",
        "User role & IP attribution for every action",
        "Filtered search across invoices and vouchers",
        "Exportable CSV audit logs for regulatory filing",
      ],
      kpi: "100% Traceable",
      kpiLabel: "Audit Trail",
    },
  ];

  const filteredModules =
    activeModuleFilter === "all"
      ? erpModules
      : erpModules.filter((m) => m.category === activeModuleFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#00a86b] selection:text-white font-sans antialiased">
      {/* =========================================================================
          1. TOP UTILITY BAR (Freeio Spruce / Emerald Brand Bar)
      ========================================================================= */}
      <aside className="bg-[#1B3B36] text-[#A2B8B3] text-xs border-b border-[#2A4D47] py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#00a86b]/20 text-[#5BBB7B] border border-[#00a86b]/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#5BBB7B]" /> Verified Dairy ERP
            </span>
            <span className="text-slate-300">
              Active Hubs: Lahore, Faisalabad, Twin Cities
            </span>
          </div>
          <div className="flex items-center space-x-6 text-[11px] sm:text-xs text-slate-300">
            <span className="flex items-center gap-1">
              Live Milk Index:{" "}
              <strong className="text-white font-semibold">Rs. 260/L (Cow) · Rs. 290/L (Buff)</strong>
            </span>
            <Link
              to="/dashboard"
              className="hover:text-white transition-colors flex items-center gap-1 font-medium"
            >
              ERP Help Center
            </Link>
            <span className="hover:text-white transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> English / Urdu
            </span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. STICKY MAIN NAVBAR (Deep Spruce with Emerald Highlights)
      ========================================================================= */}
      <header className="bg-[#1F4B3F] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Categories Button */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center gap-3 group" title="Pure Milk Bar ERP">
              <div className="w-10 h-10 rounded-2xl bg-[#00a86b] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Milk className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    Pure Milk Bar
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#5BBB7B]/20 text-[#5BBB7B] border border-[#5BBB7B]/30 uppercase">
                    ERP SaaS
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 font-semibold leading-none">
                  Dairy Operations & Supply Chain
                </p>
              </div>
            </Link>

            {/* Categories / Modules Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="hidden lg:flex items-center space-x-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-4 py-2.5 rounded-full border border-white/15 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#5BBB7B]" />
                <span>ERP Modules</span>
                <ChevronDown className="w-3 h-3 text-slate-300" />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Functional Pillars
                  </div>
                  <Link
                    to="/farm"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    <Tractor className="w-4 h-4 text-emerald-600" /> Farm & Livestock Management
                  </Link>
                  <Link
                    to="/supplier"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" /> Milk Intake & Procurement
                  </Link>
                  <Link
                    to="/pos"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" /> POS & Retail Sales Counter
                  </Link>
                  <Link
                    to="/delivery"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    <Truck className="w-4 h-4 text-emerald-600" /> Delivery Fleet & Rider Logistics
                  </Link>
                  <Link
                    to="/customer-khata-ledger"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" /> Customer Khata Ledger
                  </Link>
                  <Link
                    to="/finance/daily-closing"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    <Scale className="w-4 h-4 text-emerald-600" /> Daily Closing & Mass Balance
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden xl:flex items-center space-x-7 text-sm font-semibold text-slate-200">
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#modules" className="hover:text-white transition">All Modules</a>
            <a href="#simulators" className="hover:text-white transition">Live Simulators</a>
            <a href="#team" className="hover:text-white transition">Operations Fleet</a>
            <a href="#pricing" className="hover:text-white transition">SaaS Pricing</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center space-x-4">
            <Link
              to="/pos"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#5BBB7B] bg-[#5BBB7B]/15 hover:bg-[#5BBB7B]/25 border border-[#5BBB7B]/30 px-3.5 py-2 rounded-full transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Quick POS
            </Link>
            <Link
              to="/dashboard"
              className="bg-white hover:bg-slate-100 text-[#1F4B3F] text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch ERP</span>
              <ArrowRight className="w-4 h-4 text-[#1F4B3F]" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. HERO SECTION (Freeio Arch Showcase + Search Pill + Live Metrics)
      ========================================================================= */}
      <section
        id="home"
        className="text-white min-h-[calc(100vh-114px)] flex items-center relative overflow-hidden py-12 lg:py-16"
        style={{
          backgroundColor: "#1F4B3F",
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(91, 187, 123, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(0, 168, 107, 0.08) 0%, transparent 50%)",
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-[#5BBB7B] animate-pulse" />
                <span>Next-Gen Operating System for Commercial Dairies</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.18]">
                From cow yield to doorstep delivery,{" "}
                <span className="text-[#5BBB7B]">manage your entire dairy</span> in real-time.
              </h1>

              <p className="text-slate-200 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Automate milking logs, Richmond SNF & FAT testing, sub-second POS counter sales, rider fuel tracking, and daily mass-balance reconciliation.
              </p>

              {/* Freeio Iconic Rounded Search / Quick Dispatch Pill */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-2xl border border-white/20"
              >
                {/* Keyword Input */}
                <div className="flex items-center w-full px-4 py-2">
                  <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search module (e.g., POS, Cow Milk, FAT Lab, Khata, Fuel...)"
                    className="w-full bg-transparent border-0 text-slate-800 placeholder-slate-400 text-sm focus:ring-0 p-0 font-medium outline-none"
                  />
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

                {/* Module Selector */}
                <div className="flex items-center w-full sm:w-auto px-4 py-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-48 bg-transparent border-0 text-slate-700 text-sm focus:ring-0 p-0 font-medium cursor-pointer outline-none"
                  >
                    <option value="">Jump to Module</option>
                    <option value="/pos">POS Sales Counter</option>
                    <option value="/farm">Herd & Milking Log</option>
                    <option value="/supplier">Milk Intake & FAT Lab</option>
                    <option value="/delivery">Fleet & Rider Logistics</option>
                    <option value="/customer-khata-ledger">Customer Khata Ledger</option>
                    <option value="/finance/daily-closing">Daily Closing P&L</option>
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#00a86b] hover:bg-[#008f5b] text-white text-sm font-bold px-8 py-3.5 rounded-xl sm:rounded-full transition-all duration-200 shrink-0 flex items-center justify-center shadow-md cursor-pointer"
                >
                  Explore
                </button>
              </form>

              {/* Popular Tags Pill Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-white">Popular:</span>
                <Link
                  to="/pos"
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
                >
                  ⚡ Touch POS
                </Link>
                <Link
                  to="/supplier"
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
                >
                  🧪 FAT / SNF Calculator
                </Link>
                <Link
                  to="/customer-khata-ledger"
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
                >
                  📒 Customer Khata
                </Link>
                <Link
                  to="/finance/daily-closing"
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
                >
                  ⚖️ Mass Balance Closing
                </Link>
              </div>

              {/* 4-Counter Metrics Row */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-white/10">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">1.2M+</div>
                  <div className="text-xs text-slate-300 font-normal mt-0.5">Liters Reconciled</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#5BBB7B]">99.8%</div>
                  <div className="text-xs text-slate-300 font-normal mt-0.5">Mass Balance Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
                  <div className="text-xs text-slate-300 font-normal mt-0.5">Zero-Loss Khata</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#5BBB7B]">4.95 ★</div>
                  <div className="text-xs text-slate-300 font-normal mt-0.5">Operator Rating</div>
                </div>
              </div>
            </div>

            {/* Right Freeio Arched Double Card Composition */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full max-w-lg flex items-end justify-center gap-4">
                {/* Left Foreground Arch: Master Herdsman / Operations Incharge */}
                <div
                  className="w-1/2 overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-800 relative z-20 aspect-[3/4.6] group block cursor-pointer"
                  style={{ borderRadius: "180px 180px 32px 32px" }}
                >
                  <img
                    alt="Master Herdsman"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                    src="/landing-images/tariq-mehmood-hero2.png"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-bold text-[#5BBB7B]">Tariq Mehmood</span>
                    <p className="text-[11px] text-slate-200">Milking & Chiller Supervisor</p>
                    <p className="text-[10px] text-emerald-300 mt-0.5">Batch Yield: 850L · FAT 6.8%</p>
                  </div>
                </div>

                {/* Right Background Arch: Cold-Chain Fleet Manager */}
                <div
                  className="w-1/2 overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-800 relative z-10 aspect-[3/5] -translate-y-8 group block cursor-pointer"
                  style={{ borderRadius: "220px 220px 32px 32px" }}
                >
                  <img
                    alt="Cold-Chain Quality Incharge"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    src="/landing-images/maqsood-raza-hero.png"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-bold text-[#5BBB7B]">Maqsood Raza</span>
                    <p className="text-[11px] text-slate-200">Logistics & Dock Quality Lead</p>
                    <p className="text-[10px] text-emerald-300 mt-0.5">Chiller Dispatch: 3.8°C</p>
                  </div>
                </div>

                {/* Top-Left Floating Badge: Proof of Quality */}
                <div className="absolute -top-4 -left-4 z-30 bg-white/95 backdrop-blur text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#00a86b] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-[#00a86b]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">100% Pure Milk</p>
                    <p className="text-[11px] text-slate-500">FAT & SNF Lab Tested</p>
                  </div>
                </div>

                {/* Bottom-Right Floating Badge: Zero Shrinkage */}
                <div className="absolute -bottom-6 -right-2 z-30 bg-white/95 backdrop-blur text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-[#1F4B3F] flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 text-[#1F4B3F]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Zero Shrinkage</p>
                    <p className="text-[11px] text-slate-500">Mass-Balance Reconciled</p>
                  </div>
                </div>

                {/* Bottom Floating Pro Avatar Pill */}
                <div className="absolute -bottom-4 left-6 z-30 bg-white/95 backdrop-blur border border-slate-100 text-slate-800 px-3.5 py-2 rounded-full shadow-2xl flex items-center space-x-2.5">
                  <span className="text-xs font-bold text-slate-900">500+ Active Routes</span>
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      alt="pro"
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src="/landing-images/pro-avatar-1-alt.png"
                    />
                    <img
                      alt="pro"
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src="/landing-images/pro-avatar-2-alt.png"
                    />
                    <img
                      alt="pro"
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      src="/landing-images/pro-avatar-3-alt.png"
                    />
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-[#00a86b] flex items-center justify-center text-[10px] font-bold text-white">
                      +
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. "HOW IT WORKS" 4-STEP COMPLETE DAIRY LIFECYCLE
      ========================================================================= */}
      <section className="py-16 bg-white border-b border-slate-200/80" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              End-to-End Operational Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight mt-3 mb-3">
              How Pure Milk Bar ERP Powers Your Daily Operations
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              From morning herd milking to evening financial closing, every drop of milk is accounted for across 4 automated steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1: Log Herd & Intake */}
            <Link
              to="/farm"
              className="border border-slate-200/80 rounded-2xl p-6 hover:shadow-xl hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <img
                  alt="Log Herd & Milk Intake"
                  className="h-36 w-auto object-contain mix-blend-multiply"
                  src="/landing-images/post-a-job.png"
                />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-2">
                Step 1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Log Herd & Milk Intake</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                Record morning/evening cow yields and dock supplier deliveries with Richmond FAT% and LR density testing.
              </p>
              <span className="mt-4 text-xs font-bold text-[#00a86b] flex items-center gap-1">
                Open Farm & Intake <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Step 2: Quality Grade & Batching */}
            <Link
              to="/supplier"
              className="border border-slate-200/80 rounded-2xl p-6 hover:shadow-xl hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <img
                  alt="Quality Grade & Batching"
                  className="h-36 w-auto object-contain mix-blend-multiply"
                  src="/landing-images/choose-worker.png"
                />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-2">
                Step 2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Grade & Process Dahi</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                Compute automatic formula milk rates, route liters into chilled bulk tanks, and batch fresh pot Dahi yogurt.
              </p>
              <span className="mt-4 text-xs font-bold text-[#00a86b] flex items-center gap-1">
                Explore FAT Lab <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Step 3: POS Retail & Delivery Dispatch */}
            <Link
              to="/pos"
              className="border border-slate-200/80 rounded-2xl p-6 hover:shadow-xl hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <img
                  alt="POS Retail & Delivery Dispatch"
                  className="h-36 w-auto object-contain mix-blend-multiply"
                  src="/landing-images/work-done.png"
                />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-2">
                Step 3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Sell & Dispatch Fleet</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                Sub-second walk-in counter sales, customer monthly delivery runs, and rider vehicle fuel logging in 1 click.
              </p>
              <span className="mt-4 text-xs font-bold text-[#00a86b] flex items-center gap-1">
                Launch POS Counter <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Step 4: Reconcile & Settle Khata */}
            <Link
              to="/finance/daily-closing"
              className="border border-slate-200/80 rounded-2xl p-6 hover:shadow-xl hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <img
                  alt="Reconcile & Settle Khata"
                  className="h-36 w-auto object-contain mix-blend-multiply"
                  src="/landing-images/pay-safely.png"
                />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[11px] font-bold mb-2">
                Step 4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Reconcile & Settle</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                Auto-update Customer Khata balances, audit physical dipstick vs system stock, and generate daily P&L closing.
              </p>
              <span className="mt-4 text-xs font-bold text-[#00a86b] flex items-center gap-1">
                View Daily Closing <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMPLETE ERP SYSTEMS & MODULES SHOWCASE (Grid with Image & Empty-Space Handlers)
      ========================================================================= */}
      <section className="py-16 bg-slate-50" id="modules">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
                Complete ERP Suite
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
                Every System & Module We Manage
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore the 8 integrated functional pillars designed specifically for high-throughput dairy business operations.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredModules.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-300 flex flex-col group"
              >
                {/* Card Visual / Image Section (With Fallback Empty Space) */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1F4B3F] overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    /* Stylized Branded Empty Space Placeholder for modules awaiting screenshots */
                    <div className="w-full h-full p-4 flex flex-col justify-between relative bg-gradient-to-br from-[#1B3B36] to-[#0B1C30] border-b border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-400/30">
                          Automated Core
                        </span>
                        <Milk className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-white text-sm font-bold tracking-tight">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-emerald-200/80 font-mono">
                          Live Reconciled Ledger Engine
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Floating Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                      {item.badge}
                    </span>
                  </div>

                  {/* Top Right KPI */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/95 text-slate-900 shadow-md">
                      {item.kpi}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-[#00a86b] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="mt-3 space-y-1.5">
                      {item.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[11px] text-slate-700 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
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

      {/* =========================================================================
          6. LIVE INTERACTIVE SIMULATORS (Richmond SNF & Mass Balance Sandbox)
      ========================================================================= */}
      <section className="py-16 bg-white border-y border-slate-200/80" id="simulators">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Interactive Mathematical Domain Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3 mb-3">
              Test Our Real-Time Dairy Calculation Engines
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Experience the exact algorithms running inside Pure Milk Bar ERP: Richmond SNF% quality formula, mass-balance tank audit, and operational ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Simulator 1: Richmond SNF & Pricing Calculator */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      🧪
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Richmond SNF & Pricing Engine
                      </h3>
                      <p className="text-xs text-slate-500">
                        Standard Formula: SNF% = (LR / 4) + (0.21 × FAT%) + 0.36
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Live Formula
                  </span>
                </div>

                <div className="space-y-5 mt-6">
                  {/* FAT Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Milk FAT Content (%):</span>
                      <span className="text-emerald-700 font-mono text-sm">{fatValue}%</span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="10.0"
                      step="0.1"
                      value={fatValue}
                      onChange={(e) => setFatValue(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>3.0% (Skimmed)</span>
                      <span>6.5% (Cow/Buff Mix)</span>
                      <span>10.0% (High Cream)</span>
                    </div>
                  </div>

                  {/* LR Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Lactometer Reading (LR at 20°C):</span>
                      <span className="text-emerald-700 font-mono text-sm">{lrValue}</span>
                    </div>
                    <input
                      type="range"
                      min="20.0"
                      max="34.0"
                      step="0.5"
                      value={lrValue}
                      onChange={(e) => setLrValue(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>20.0 (Watered)</span>
                      <span>28.0 (Pure Standard)</span>
                      <span>34.0 (Dense Milk)</span>
                    </div>
                  </div>

                  {/* Base Rate Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Base Milk Rate (PKR / Liter):</span>
                      <span className="text-emerald-700 font-mono text-sm">Rs. {baseMilkRate}</span>
                    </div>
                    <input
                      type="range"
                      min="140"
                      max="240"
                      step="5"
                      value={baseMilkRate}
                      onChange={(e) => setBaseMilkRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                    />
                  </div>
                </div>
              </div>

              {/* Calculation Output Box */}
              <div className="mt-8 p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Calculated SNF%
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">
                    {calculatedSNF}%
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                    {calculatedSNF >= 8.5 ? "✓ Grade A Premium" : "⚠ Below Standard"}
                  </span>
                </div>
                <div className="border-l border-slate-100 pl-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Dynamic Purchase Rate
                  </span>
                  <span className="text-2xl font-extrabold text-[#00a86b] font-mono">
                    Rs. {calculatedPricePerLiter}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    per liter payout
                  </span>
                </div>
              </div>
            </div>

            {/* Simulator 2: Mass Balance Reconciliation Simulator */}
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      ⚖️
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Mass-Balance Dipstick Audit
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tank Opening + Inflow - Outflow - Spillage = Physical Dipstick
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    Zero Shrinkage
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mt-6">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Opening Tank</label>
                    <input
                      type="number"
                      value={openingTank}
                      onChange={(e) => setOpeningTank(Number(e.target.value) || 0)}
                      className="w-full mt-1 font-bold text-slate-800 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">+ Herd Yield</label>
                    <input
                      type="number"
                      value={herdYield}
                      onChange={(e) => setHerdYield(Number(e.target.value) || 0)}
                      className="w-full mt-1 font-bold text-emerald-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">+ Sourcer Dock</label>
                    <input
                      type="number"
                      value={sourcerIntake}
                      onChange={(e) => setSourcerIntake(Number(e.target.value) || 0)}
                      className="w-full mt-1 font-bold text-emerald-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">- POS Counter</label>
                    <input
                      type="number"
                      value={retailSales}
                      onChange={(e) => setRetailSales(Number(e.target.value) || 0)}
                      className="w-full mt-1 font-bold text-rose-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">- Doorstep Fleet</label>
                    <input
                      type="number"
                      value={deliveriesTotal}
                      onChange={(e) => setDeliveriesTotal(Number(e.target.value) || 0)}
                      className="w-full mt-1 font-bold text-rose-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Physical Dipstick</label>
                    <input
                      type="number"
                      value={actualDipstick}
                      onChange={(e) => setActualDipstick(Number(e.target.value) || 0)}
                      className="w-full mt-1 font-bold text-slate-900 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Liters</span>
                  </div>
                </div>
              </div>

              {/* Reconciliation Status Alert Box */}
              <div
                className={`mt-8 p-5 rounded-2xl border text-center transition-all ${
                  isBalanceWithinTolerance
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isBalanceWithinTolerance ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="font-bold text-sm">
                    {isBalanceWithinTolerance
                      ? "Mass-Balance Reconciled (Within 1.5L Tolerance)"
                      : "Discrepancy Detected (Audit Shrinkage or Leakage)"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Expected System Balance:</span>
                    <strong className="font-mono text-sm">{calculatedExpectedStock} Liters</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Variance (Dipstick - System):</span>
                    <strong
                      className={`font-mono text-sm ${
                        massBalanceVariance === 0
                          ? "text-emerald-700"
                          : massBalanceVariance > 0
                          ? "text-blue-700"
                          : "text-rose-700"
                      }`}
                    >
                      {massBalanceVariance > 0 ? `+${massBalanceVariance}` : massBalanceVariance} Liters
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. TOP OPERATIONS SPECIALISTS & FLEET MASTERS SHOWCASE
      ========================================================================= */}
      <section className="py-16 bg-white" id="team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
                Verified Personnel
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Highest Rated Dairy Specialists & Fleet Masters
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Background-checked, CNIC verified, and specialized across milking, lab quality, and cold-chain logistics.
              </p>
            </div>
            <Link
              to="/staff"
              className="text-xs font-bold text-slate-700 hover:text-[#00a86b] flex items-center gap-1 transition"
            >
              <span>Manage All Staff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Specialist 1: Ahmad Khan */}
            <div className="relative h-[440px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Ahmad Khan"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                src="/landing-images/ahmad-khan-large-alt.png"
              />
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Master
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md">
                  ★ 4.95
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-400 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-5 left-5 right-5 z-10 transition-all duration-400 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
                <h3 className="text-lg font-bold text-white tracking-tight">Ahmad Khan</h3>
                <p className="text-xs text-slate-200 font-medium">Head Milker & Herd Care Specialist</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                  <span>Farm Shed 1</span>
                  <span className="text-emerald-300 font-semibold">99% Yield Consistency</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out flex flex-col justify-end p-5 text-white transform translate-y-3 group-hover:translate-y-0">
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-2">
                  Herd Master
                </span>
                <h3 className="text-lg font-bold text-white">Ahmad Khan</h3>
                <p className="text-xs text-emerald-100 font-medium">Lactation Management & Milking Hygiene</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Milking Parlor</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Cattle Health</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Yield Audit</span>
                </div>
                <Link
                  to="/farm/animals"
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <span>View Herd Roster</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Specialist 2: Tariq Mehmood */}
            <div className="relative h-[440px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Tariq Mehmood"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                src="/landing-images/tariq-mehmood-large-alt.png"
              />
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Incharge
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md">
                  ★ 4.98
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-400 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-5 left-5 right-5 z-10 transition-all duration-400 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
                <h3 className="text-lg font-bold text-white tracking-tight">Tariq Mehmood</h3>
                <p className="text-xs text-slate-200 font-medium">Chiller & Milk Tank Quality Manager</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                  <span>Dock Terminal</span>
                  <span className="text-emerald-300 font-semibold">Zero Spillage Record</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out flex flex-col justify-end p-5 text-white transform translate-y-3 group-hover:translate-y-0">
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-2">
                  Quality Lead
                </span>
                <h3 className="text-lg font-bold text-white">Tariq Mehmood</h3>
                <p className="text-xs text-emerald-100 font-medium">Cold Storage & Chilled Milk Integrity</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">0 - 4°C Chillers</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Dipstick Audit</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Dock Inspection</span>
                </div>
                <Link
                  to="/supplier/intake"
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <span>View Milk Intake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Specialist 3: Rashid Minhas */}
            <div className="relative h-[440px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Rashid Minhas"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                src="/landing-images/rashid-ali-large.png"
              />
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Route Captain
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md">
                  ★ 4.92
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-400 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-5 left-5 right-5 z-10 transition-all duration-400 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
                <h3 className="text-lg font-bold text-white tracking-tight">Rashid Minhas</h3>
                <p className="text-xs text-slate-200 font-medium">Senior Motorbike Fleet Courier</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                  <span>Model Town Route</span>
                  <span className="text-emerald-300 font-semibold">100% On-Time Drops</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out flex flex-col justify-end p-5 text-white transform translate-y-3 group-hover:translate-y-0">
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-2">
                  Fleet Rider
                </span>
                <h3 className="text-lg font-bold text-white">Rashid Minhas</h3>
                <p className="text-xs text-emerald-100 font-medium">Morning & Evening Doorstep Delivery Lead</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Honda 125 (LEK-9122)</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">COD Collection</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Bottle Returns</span>
                </div>
                <Link
                  to="/delivery"
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <span>View Delivery Fleet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Specialist 4: Shahid Bilal */}
            <div className="relative h-[440px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Shahid Bilal"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
                src="/landing-images/maqsood-raza-large.png"
              />
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Khata Officer
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold shadow-md">
                  ★ 4.97
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-400 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-5 left-5 right-5 z-10 transition-all duration-400 group-hover:opacity-0 group-hover:translate-y-4 pointer-events-none">
                <h3 className="text-lg font-bold text-white tracking-tight">Shahid Bilal</h3>
                <p className="text-xs text-slate-200 font-medium">Customer Accounts & Khata Auditor</p>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/15 text-[11px] text-slate-300">
                  <span>Finance Desk</span>
                  <span className="text-emerald-300 font-semibold">100% Recovery Rate</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out flex flex-col justify-end p-5 text-white transform translate-y-3 group-hover:translate-y-0">
                <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-2 py-0.5 rounded-full border border-[#5BBB7B]/30 w-fit mb-2">
                  Accountant
                </span>
                <h3 className="text-lg font-bold text-white">Shahid Bilal</h3>
                <p className="text-xs text-emerald-100 font-medium">Ledger Reconciliation & Monthly Billing</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Customer Khata</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">Daily Closing P&L</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/15 text-[10px] font-medium text-slate-100">WhatsApp Invoices</span>
                </div>
                <Link
                  to="/customer-khata-ledger"
                  className="mt-4 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <span>Open Khata Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TRANSPARENT COMMERCIAL SAAS PRICING MATRIX
      ========================================================================= */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3 mb-3">
              Simple, Predictable Plans For Every Dairy Scale
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6">
              All plans include complete offline localStorage resilience, Richmond SNF & FAT testing lab, and 100% zero-shrinkage reconciliation.
            </p>

            {/* Billing Toggle (Monthly vs Annual) */}
            <div className="inline-flex items-center p-1.5 bg-white rounded-full border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
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
                className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-[#00a86b] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plan 1: Starter Dairy */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Small Dairy / Single Shop
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Starter Farm</h3>
                <p className="text-xs text-slate-500 mt-2">
                  Perfect for local dairy shops and single-shed herds managing up to 50 cattle.
                </p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    Rs. {billingCycle === "annual" ? "7,500" : "9,999"}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Up to 50 Registered Cows/Buffaloes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Touch POS Counter Sales
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Customer Khata Ledger (Up to 200 accounts)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Daily Mass-Balance Dipstick Audit
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 text-center font-bold">—</span> Up to 3 Delivery Riders
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 w-full py-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition text-center block"
              >
                Start Free 14-Day Trial
              </Link>
            </div>

            {/* Plan 2: Commercial Station (Featured) */}
            <div className="bg-[#1F4B3F] text-white rounded-3xl p-8 border-2 border-[#00a86b] shadow-2xl relative flex flex-col justify-between transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00a86b] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Commercial Milk Station
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">Commercial Pro</h3>
                <p className="text-xs text-emerald-100 mt-2">
                  Designed for high-throughput milk bars, dock suppliers, and fleet deliveries.
                </p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-white">
                    Rs. {billingCycle === "annual" ? "14,500" : "18,999"}
                  </span>
                  <span className="text-xs text-emerald-200"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Unlimited Cattle & Milking Logs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Full Milk Intake Dock & Richmond FAT/SNF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Dahi Processing & Batching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Up to 15 Delivery Riders + Fuel Logging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Unlimited Khata Accounts & WhatsApp Statements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" /> Daily Closing P&L & Cash Drawer Audit
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 w-full py-3 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition text-center shadow-lg block cursor-pointer"
              >
                Get Started Now
              </Link>
            </div>

            {/* Plan 3: Enterprise Multi-Branch */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Multi-Branch Dairy Chains
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Enterprise Multi-Branch</h3>
                <p className="text-xs text-slate-500 mt-2">
                  For dairy operations managing multiple regional chiller plants, shops, and fleets.
                </p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    Rs. {billingCycle === "annual" ? "28,000" : "34,999"}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Multi-Branch Centralized Dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Unlimited Fleet Riders & Custom Routes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Tamper-Proof Transaction Audit Logs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> Custom Thermal Slip & Brand Logo Config
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00a86b]" /> 24/7 Dedicated Account Manager & Training
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-8 w-full py-3 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition text-center block"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. REAL FARM OWNER TESTIMONIALS & REVIEWS
      ========================================================================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Customer Success
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
              Trusted By Over 40+ Commercial Dairy Operations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read how farm owners eliminated shrinkage and automated their daily Khata reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {"★★★★★"}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Earlier we lost 20 to 30 liters daily due to unrecorded walk-ins and bad calculation. Pure Milk Bar's mass-balance audit brought our shrinkage down to zero within the first week."
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  MA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Malik Asif Dairy Farm</h4>
                  <p className="text-[11px] text-slate-500">Model Town, Lahore</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {"★★★★★"}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "The Richmond formula grading for milk suppliers saved us thousands in wrongful milk pricing. Plus, sending WhatsApp Khata statements solved all disputes with customers."
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  CK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Chaudhry Kamran Milk Bar</h4>
                  <p className="text-[11px] text-slate-500">Faisalabad</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {"★★★★★"}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Our 12 delivery riders now log fuel KM and bottle returns directly. The sub-second POS checkout is so smooth that even our rush-hour lines clear in minutes."
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  HA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Haji Akram Dairy & Dahi</h4>
                  <p className="text-[11px] text-slate-500">Rawalpindi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FREQUENTLY ASKED QUESTIONS (Accordion)
      ========================================================================= */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Does Pure Milk Bar ERP work offline when internet is down?",
                a: "Yes! The system is built with complete client-side localStorage persistence. You can continue ringing POS sales, taking milk intake, and updating Khata records offline without interruption.",
              },
              {
                q: "How does the Richmond SNF & FAT calculation work?",
                a: "The system implements the industry-standard Richmond formula: SNF% = (LR / 4) + (0.21 × FAT%) + 0.36. Based on your configured base rate and FAT multiplier, supplier purchase rates are computed automatically in milliseconds.",
              },
              {
                q: "Can we print thermal receipts and WhatsApp bills to customers?",
                a: "Yes. The POS and Customer Khata modules support standard 80mm/58mm ESC/POS thermal printing as well as 1-click formatted WhatsApp payment ledger sharing.",
              },
              {
                q: "How is Mass-Balance closing calculated?",
                a: "The ERP automatically calculates: Opening Chiller Tank + Herd Yield + Sourcer Dock Intake - POS Sales - Delivery Dispatches - Spillage. It compares this against your physical dipstick reading to catch any discrepancies immediately.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. HIGH-CONVERSION CALL TO ACTION BANNER
      ========================================================================= */}
      <section className="py-16 bg-[#1F4B3F] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#5BBB7B]" /> Live Operating System Ready
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Ready to streamline your dairy operations with zero shrinkage?
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto">
            Launch the live ERP dashboard right now. No lengthy setup required—all core dairy modules are pre-configured.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-[#00a86b] hover:bg-[#008f5b] text-white text-sm font-bold px-8 py-3.5 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Live ERP Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pos"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#5BBB7B]" />
              <span>Open POS Counter</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. COMPREHENSIVE MULTI-COLUMN FOOTER
      ========================================================================= */}
      <footer className="bg-[#163E34] text-slate-300 text-xs border-t border-[#2A4D47] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00a86b] flex items-center justify-center text-white">
                  <Milk className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Pure Milk Bar ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The all-in-one digital operating engine for commercial dairy farms, bulk milk procurement stations, POS retail counters, and fleet logistics.
              </p>
              <div className="flex items-center space-x-3 text-emerald-300 font-semibold">
                <span>Lahore</span> &bull; <span>Faisalabad</span> &bull; <span>Islamabad</span> &bull; <span>Rawalpindi</span>
              </div>
            </div>

            {/* Farm & Intake */}
            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Farm & Procurement
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/farm/animals" className="hover:text-white transition">Cattle Herd Register</Link></li>
                <li><Link to="/farm/milking" className="hover:text-white transition">Milking Shifts & Yield</Link></li>
                <li><Link to="/supplier/directory" className="hover:text-white transition">Supplier Directory</Link></li>
                <li><Link to="/supplier/intake" className="hover:text-white transition">FAT & SNF Testing Lab</Link></li>
                <li><Link to="/proccessing" className="hover:text-white transition">Pot Dahi Processing</Link></li>
              </ul>
            </div>

            {/* Sales & Logistics */}
            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Sales & Logistics
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/pos" className="hover:text-white transition">Touch POS Counter</Link></li>
                <li><Link to="/delivery" className="hover:text-white transition">Rider Delivery Dispatch</Link></li>
                <li><Link to="/customer" className="hover:text-white transition">Customer Accounts</Link></li>
                <li><Link to="/customer-khata-ledger" className="hover:text-white transition">Khata Credit Ledger</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Product Inventory</Link></li>
              </ul>
            </div>

            {/* Finance & System */}
            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Finance & System
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/finance/daily-closing" className="hover:text-white transition">Daily Mass-Balance Closing</Link></li>
                <li><Link to="/finance/audit-log" className="hover:text-white transition">Transaction Audit Trail</Link></li>
                <li><Link to="/staff" className="hover:text-white transition">Staff & Rider Payroll</Link></li>
                <li><Link to="/settings" className="hover:text-white transition">Global ERP Settings</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Executive CommandCenter</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2A4D47] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              &copy; {new Date().getFullYear()} Pure Milk Bar Dairy ERP SaaS. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
              <Link to="/pos" className="hover:text-white transition">POS</Link>
              <Link to="/farm" className="hover:text-white transition">Farm</Link>
              <Link to="/settings" className="hover:text-white transition">Settings</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
