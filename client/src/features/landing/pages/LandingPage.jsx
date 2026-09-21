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
  CheckCircle,
  Radio,
  Plus,
  Minus,
  Trash2,
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

  // Interactive Live POS Simulator State
  const [posItems, setPosItems] = useState([
    { id: "cow", name: "Pure Cow Milk", rate: 260, qty: 2, unit: "L" },
    { id: "buff", name: "Pure Buffalo Milk", rate: 290, qty: 1, unit: "L" },
    { id: "dahi", name: "Fresh Pot Dahi", rate: 320, qty: 1, unit: "KG" },
  ]);
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash"); // "cash" | "khata" | "online"

  const updatePosQty = (id, delta) => {
    setPosItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const addPosItem = (itemToAdd) => {
    setPosItems((prev) => {
      const exists = prev.find((i) => i.id === itemToAdd.id);
      if (exists) {
        return prev.map((i) =>
          i.id === itemToAdd.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...itemToAdd, qty: 1 }];
    });
  };

  const removePosItem = (id) => {
    setPosItems((prev) => prev.filter((i) => i.id !== id));
  };

  const posSubtotal = posItems.reduce(
    (acc, curr) => acc + curr.rate * curr.qty,
    0
  );

  // Simulator 1: Daily Milk Yield & Revenue Profit Engine State
  const [dailyYieldLiters, setDailyYieldLiters] = useState(850);
  const [sellingRatePerLiter, setSellingRatePerLiter] = useState(260);
  const [dailyFeedCost, setDailyFeedCost] = useState(65000);

  const calculatedDailyRevenue = dailyYieldLiters * sellingRatePerLiter;
  const calculatedDailyNetProfit = calculatedDailyRevenue - dailyFeedCost;
  const calculatedMonthlyProjected = calculatedDailyNetProfit * 30;

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
      } else if (
        q.includes("farm") ||
        q.includes("cow") ||
        q.includes("buff") ||
        q.includes("herd") ||
        q.includes("milk")
      ) {
        navigate("/farm");
      } else if (
        q.includes("suppl") ||
        q.includes("intake") ||
        q.includes("fat") ||
        q.includes("snf") ||
        q.includes("sourc")
      ) {
        navigate("/supplier");
      } else if (
        q.includes("deliv") ||
        q.includes("rider") ||
        q.includes("fuel") ||
        q.includes("fleet")
      ) {
        navigate("/delivery");
      } else if (
        q.includes("khata") ||
        q.includes("cust") ||
        q.includes("ledger") ||
        q.includes("credit")
      ) {
        navigate("/customer-khata-ledger");
      } else if (
        q.includes("clos") ||
        q.includes("reconcil") ||
        q.includes("profit") ||
        q.includes("finance")
      ) {
        navigate("/finance/daily-closing");
      } else if (
        q.includes("staff") ||
        q.includes("pay") ||
        q.includes("salary")
      ) {
        navigate("/staff");
      } else {
        navigate("/dashboard");
      }
    }
  };

  // All 8 Core ERP Modules with Complete Functional Details & Actual Images
  const erpModules = [
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
        "Automated milking records with morning and evening batch breakdowns, chiller temperature logs (0-4°C), and automated tank additions.",
      features: [
        "Shift-wise batch volume reconciliation",
        "Direct bulk chiller tank synchronization",
        "Milker attribution & parlor performance",
        "Daily herd production yield graphs",
      ],
      kpi: "2 Shifts Daily",
      kpiLabel: "Milking Parlor",
    },
    {
      id: "supplier",
      category: "supplier",
      title: "Milk Procurement & Quality Dock",
      badge: "Milk Procurement Dock",
      route: "/supplier/intake",
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

  const filteredModules =
    activeModuleFilter === "all"
      ? erpModules
      : erpModules.filter((m) => m.category === activeModuleFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#00a86b] selection:text-white font-sans antialiased overflow-x-hidden no-scrollbar">
      {/* =========================================================================
          1. TOP SLIM UTILITY BAR (Ultra-Slim 24px)
      ========================================================================= */}
      <aside className="bg-[#14332D] text-[#A2B8B3] text-[9.5px] border-b border-[#234941] py-0.5 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00a86b]/20 text-[#5BBB7B] border border-[#00a86b]/30">
              <ShieldCheck className="w-2.5 h-2.5 mr-1 text-[#5BBB7B]" /> Verified Dairy ERP
            </span>
            <span className="text-slate-300 hidden md:inline">
              Active Hubs: Lahore · Faisalabad · Twin Cities
            </span>
            <span className="text-emerald-400/80 font-medium hidden lg:inline">
              • ISO 22000 Compliant
            </span>
          </div>
          <div className="flex items-center space-x-3.5 text-slate-300">
            <span className="hidden sm:inline">
              Live Milk Index:{" "}
              <strong className="text-white font-semibold">
                Rs. 260/L (Cow) · Rs. 290/L (Buff)
              </strong>
            </span>
            <Link
              to="/dashboard"
              className="hover:text-white transition-colors font-medium hidden sm:inline"
            >
              Help Center
            </Link>
            <span className="hover:text-white transition-colors flex items-center gap-1 font-medium text-[9px]">
              <Globe className="w-2.5 h-2.5" /> English / اردو
            </span>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. STICKY MAIN NAVBAR (Slim 52px)
      ========================================================================= */}
      <header className="bg-[#1B3E35]/95 border-b border-white/10 sticky top-0 z-50 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Categories Button */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 group" title="Pure Milk Bar ERP">
              <div className="w-7.5 h-7.5 rounded-lg bg-[#00a86b] flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
                <Milk className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white">
                    Pure Milk Bar
                  </span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-[#5BBB7B]/20 text-[#5BBB7B] border border-[#5BBB7B]/30 uppercase">
                    ERP SaaS
                  </span>
                </div>
                <p className="text-[8.5px] text-emerald-200/80 font-medium leading-none">
                  Dairy Operations &amp; Supply Chain
                </p>
              </div>
            </Link>

            {/* Categories / Modules Dropdown Button */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-white/15 transition cursor-pointer"
              >
                <Layers className="w-2.5 h-2.5 text-[#5BBB7B]" />
                <span>Modules</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Functional Pillars
                  </div>
                  <Link
                    to="/farm"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <Tractor className="w-3.5 h-3.5 text-emerald-600" /> Farm &amp; Livestock Herd
                  </Link>
                  <Link
                    to="/supplier"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-600" /> Milk Intake &amp; FAT Lab
                  </Link>
                  <Link
                    to="/pos"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" /> POS &amp; Retail Counter
                  </Link>
                  <Link
                    to="/delivery"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-600" /> Delivery Fleet &amp; Fuel Logs
                  </Link>
                  <Link
                    to="/customer-khata-ledger"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Customer Khata Ledger
                  </Link>
                  <Link
                    to="/finance/daily-closing"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-slate-800 hover:text-emerald-700 transition"
                  >
                    <Scale className="w-3.5 h-3.5 text-emerald-600" /> Daily Closing &amp; Mass Balance
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-5 text-[11px] font-semibold text-slate-200">
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#modules" className="hover:text-white transition">Modules</a>
            <a href="#pos-sandbox" className="hover:text-white transition">POS Sandbox</a>
            <a href="#simulators" className="hover:text-white transition">Simulators</a>
            <a href="#farms" className="hover:text-white transition">Enrolled Farms</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center space-x-2 shrink-0">
            <Link
              to="/pos"
              className="hidden sm:flex items-center gap-1 text-[10.5px] font-bold text-[#5BBB7B] bg-[#5BBB7B]/15 hover:bg-[#5BBB7B]/25 border border-[#5BBB7B]/30 px-2.5 py-1 rounded-full transition"
            >
              <ShoppingCart className="w-2.5 h-2.5" /> POS
            </Link>
            <Link
              to="/dashboard"
              className="bg-[#00a86b] hover:bg-[#008f5b] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-md shadow-emerald-900/30 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch ERP</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          3. HERO SECTION (Strict 1-Screen Viewport Fit - Centered Hero with Background)
      ========================================================================= */}
      <section
        id="home"
        className="text-white min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center relative overflow-hidden py-4 sm:py-6 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(15, 38, 33, 0.90) 0%, rgba(20, 51, 45, 0.85) 50%, rgba(15, 38, 33, 0.92) 100%), url('/images/dairyfarm.jpeg')",
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-center my-auto text-center items-center">
          <div className="space-y-3.5 sm:space-y-4 max-w-3xl mx-auto flex flex-col items-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-semibold text-emerald-200 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-[#5BBB7B] animate-pulse" />
              <span>Next-Gen Operating System for Commercial Dairy Farms &amp; Milk Bars</span>
            </div>

            {/* Centered Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              From cow yield to doorstep delivery,{" "}
              <span className="text-[#5BBB7B]">manage your entire dairy</span> in real-time.
            </h1>

            {/* Centered Subtitle */}
            <p className="text-slate-200 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Automate herd logs, bulk milk procurement intake, sub-second POS counter sales, rider fleet fuel tracking, and daily mass-balance reconciliation.
            </p>

            {/* Clean Centered CTAs (Replaced Searchbar) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Live ERP Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/pos"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#5BBB7B]" />
                <span>Open POS Counter</span>
              </Link>
            </div>

            {/* Centered Popular Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] text-slate-300 pt-1">
              <span className="font-semibold text-white">Popular Modules:</span>
              <Link
                to="/pos"
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
              >
                ⚡ Touch POS
              </Link>
              <Link
                to="/farm"
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
              >
                🐄 Herd &amp; Milking Log
              </Link>
              <Link
                to="/customer-khata-ledger"
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/10 transition"
              >
                📒 Customer Khata
              </Link>
              <Link
                to="/finance/daily-closing"
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
      {/* =========================================================================
          4. "HOW IT WORKS" 4-STEP COMPLETE DAIRY LIFECYCLE (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-white border-b border-slate-200/80 overflow-hidden" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="text-center max-w-3xl mx-auto mb-5 lg:mb-7">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              End-to-End Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mt-1 mb-1">
              How Pure Milk Bar ERP Powers Your Daily Operations
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              From morning herd milking to evening financial closing, every drop of milk is accounted for across 4 automated steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Log Herd & Intake */}
            <Link
              to="/farm"
              className="border border-slate-200/80 rounded-2xl p-4 hover:shadow-lg hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-3 group-hover:scale-105 transition-transform bg-slate-100">
                <img
                  alt="Log Herd & Milk Intake"
                  className="w-full h-full object-cover"
                  src="/images/animals.webp"
                />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[10px] font-bold mb-1">
                Step 1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Log Herd &amp; Intake</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed font-normal line-clamp-2">
                Morning/evening yields and dock supplier deliveries with digital volume verification.
              </p>
              <span className="mt-2.5 text-[11px] font-bold text-[#00a86b] flex items-center gap-1">
                Open Farm &amp; Intake <ChevronRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Step 2: Quality Grade & Batching */}
            <Link
              to="/supplier"
              className="border border-slate-200/80 rounded-2xl p-4 hover:shadow-lg hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-3 group-hover:scale-105 transition-transform bg-slate-100">
                <img
                  alt="Quality Grade & Batching"
                  className="w-full h-full object-cover"
                  src="/images/storage.webp"
                />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[10px] font-bold mb-1">
                Step 2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Grade &amp; Process Dahi</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed font-normal line-clamp-2">
                Compute formula milk rates, route into chilled bulk tanks, and batch fresh pot Dahi.
              </p>
              <span className="mt-2.5 text-[11px] font-bold text-[#00a86b] flex items-center gap-1">
                Explore FAT Lab <ChevronRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Step 3: POS Retail & Delivery Dispatch */}
            <Link
              to="/pos"
              className="border border-slate-200/80 rounded-2xl p-4 hover:shadow-lg hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-3 group-hover:scale-105 transition-transform bg-slate-100">
                <img
                  alt="POS Retail & Delivery Dispatch"
                  className="w-full h-full object-cover"
                  src="/images/delivery.jpeg"
                />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[10px] font-bold mb-1">
                Step 3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Sell &amp; Dispatch Fleet</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed font-normal line-clamp-2">
                Sub-second walk-in sales, customer monthly delivery runs, and rider vehicle fuel logging.
              </p>
              <span className="mt-2.5 text-[11px] font-bold text-[#00a86b] flex items-center gap-1">
                Launch POS Counter <ChevronRight className="w-3 h-3" />
              </span>
            </Link>

            {/* Step 4: Reconcile & Settle Khata */}
            <Link
              to="/finance/daily-closing"
              className="border border-slate-200/80 rounded-2xl p-4 hover:shadow-lg hover:border-[#00a86b] transition-all bg-slate-50/50 hover:bg-white text-center flex flex-col items-center group cursor-pointer"
            >
              <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-3 group-hover:scale-105 transition-transform bg-slate-100">
                <img
                  alt="Reconcile & Settle Khata"
                  className="w-full h-full object-cover"
                  src="/images/PnL.jpeg"
                />
              </div>
              <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-[#1F4B3F] text-[10px] font-bold mb-1">
                Step 4
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Reconcile &amp; Settle</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed font-normal line-clamp-2">
                Auto-update Customer Khata balances, audit physical dipsticks, and generate daily P&amp;L closing.
              </p>
              <span className="mt-2.5 text-[11px] font-bold text-[#00a86b] flex items-center gap-1">
                View Daily Closing <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMPLETE ERP SYSTEMS & MODULES SHOWCASE (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-slate-50 border-b border-slate-200/80 overflow-hidden" id="modules">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 lg:mb-6 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Complete ERP Suite
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Every System &amp; Module We Manage
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                Explore the 8 integrated functional pillars designed specifically for dairy business operations.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1">
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
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
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

          {/* Module Cards Grid (Compact 4-Card Presentation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredModules.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all duration-300 flex flex-col group"
              >
                {/* Card Visual / Image Section */}
                <div className="relative h-28 sm:h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1F4B3F] overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Floating Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                      {item.badge}
                    </span>
                  </div>

                  {/* Top Right KPI */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-white/95 text-slate-900 shadow-md">
                      {item.kpi}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-[#00a86b] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Bullet Highlights */}
                    <ul className="mt-2 space-y-1">
                      {item.features.slice(0, 2).map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[10.5px] text-slate-700 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#00a86b] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.kpiLabel}
                    </span>
                    <Link
                      to={item.route}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a86b] hover:text-[#008f5b] group-hover:translate-x-0.5 transition-all"
                    >
                      <span>Open Module</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* =========================================================================
          7. INTERACTIVE LIVE POS QUICK-ORDER SANDBOX (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-slate-50 border-b border-slate-200 overflow-hidden" id="pos-sandbox">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Interactive POS Sandbox
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Try Out The Sub-Second Milk Bar Checkout
            </h2>
            <p className="text-slate-500 text-xs sm:text-[13px] mt-0.5">
              Add dairy items, adjust liter quantities, and see how fast sales and invoices are generated.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-6xl mx-auto w-full">
            {/* Left: Product Catalog Grid */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Click Products to Add to Cart:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "cow", name: "Cow Milk", rate: 260, unit: "per liter", icon: "🥛", source: "Farm Herd" },
                  { id: "buff", name: "Buffalo Milk", rate: 290, unit: "per liter", icon: "🍶", source: "Farm Herd" },
                  { id: "dahi", name: "Fresh Dahi", rate: 320, unit: "per kg", icon: "🥣", source: "Chilled Pot" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPosItem({ id: p.id, name: p.name, rate: p.rate, unit: p.unit.includes("kg") ? "KG" : "L" })}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                        {p.source}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#00a86b]">
                        {p.name}
                      </h4>
                      <p className="text-[11px] font-extrabold text-[#00a86b] mt-0.5">
                        Rs. {p.rate} <span className="text-[9.5px] font-normal text-slate-400">/{p.unit}</span>
                      </p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>+ Add Item</span>
                      <Plus className="w-3 h-3 text-emerald-600" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Rupee-First Quick Add Pills */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Quick Amount Presets (Instant Conversion):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => addPosItem({ id: "cow", name: `Cow Milk (Rs. ${amt})`, rate: amt, unit: "Fix" })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-bold text-slate-700 transition"
                    >
                      Rs. {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Cart & Invoice Simulator */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    🧾
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Live POS Bill Checkout</h3>
                    <p className="text-[10px] text-slate-400">Invoice #INV-DEMO-01</p>
                  </div>
                </div>
                <button
                  onClick={() => setPosItems([])}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {posItems.length === 0 ? (
                  <div className="py-4 text-center text-[11px] text-slate-400">
                    Cart is empty. Click a product on the left to add items.
                  </div>
                ) : (
                  posItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Rs. {item.rate} &times; {item.qty} {item.unit} = <strong className="text-slate-900">Rs. {item.rate * item.qty}</strong>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updatePosQty(item.id, -1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-xs"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-3 text-center text-xs">{item.qty}</span>
                        <button
                          onClick={() => updatePosQty(item.id, 1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removePosItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 ml-1 text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase">
                  Payment Method:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {["cash", "khata", "online"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPosPaymentMethod(m)}
                      className={`py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                        posPaymentMethod === m
                          ? "bg-[#00a86b] text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {m === "online" ? "JazzCash" : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill Summary */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 font-semibold block">Total Payable</span>
                  <span className="text-xl font-extrabold text-[#00a86b] font-mono">
                    Rs. {posSubtotal.toLocaleString()}
                  </span>
                </div>
                <Link
                  to="/pos"
                  className="bg-[#00a86b] hover:bg-[#008f5b] text-white text-[11px] font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-1"
                >
                  <span>Open Full POS</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. LIVE INTERACTIVE SIMULATORS (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-white border-y border-slate-200/80 overflow-hidden" id="simulators">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Interactive Mathematical Domain Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Test Our Real-Time Dairy Calculation Engines
            </h2>
            <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed max-w-2xl mx-auto">
              Experience the algorithms running inside Pure Milk Bar ERP: herd profit &amp; yield projection and mass-balance tank audit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-6xl mx-auto w-full">
            {/* Simulator 1: Herd Yield & Profit Calculator */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      📈
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Herd Yield &amp; Profit Engine
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Net Profit = (Daily Liters × Milk Rate) - Total Feed Cost
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live Profit Engine
                  </span>
                </div>

                <div className="space-y-3 mt-3">
                  {/* Daily Yield Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>Daily Farm Herd Milk Yield (Liters):</span>
                      <span className="text-emerald-700 font-mono text-xs">{dailyYieldLiters.toLocaleString()} L</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="50"
                      value={dailyYieldLiters}
                      onChange={(e) => setDailyYieldLiters(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                    />
                  </div>

                  {/* Selling Rate Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>Market Selling Rate (PKR / Liter):</span>
                      <span className="text-emerald-700 font-mono text-xs">Rs. {sellingRatePerLiter}</span>
                    </div>
                    <input
                      type="range"
                      min="180"
                      max="350"
                      step="5"
                      value={sellingRatePerLiter}
                      onChange={(e) => setSellingRatePerLiter(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                    />
                  </div>

                  {/* Daily Feed Cost Slider */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>Daily Total Feed &amp; Fodder Cost (PKR):</span>
                      <span className="text-emerald-700 font-mono text-xs">Rs. {dailyFeedCost.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="200000"
                      step="2500"
                      value={dailyFeedCost}
                      onChange={(e) => setDailyFeedCost(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                    />
                  </div>
                </div>
              </div>

              {/* Calculation Output Box */}
              <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-200 shadow-xs grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Daily Revenue
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                    Rs. {calculatedDailyRevenue.toLocaleString()}
                  </span>
                  <span className="block text-[9px] text-slate-500">
                    Gross Inflow
                  </span>
                </div>
                <div className="border-x border-slate-100 px-1">
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Daily Net Profit
                  </span>
                  <span className={`text-sm sm:text-base font-extrabold font-mono ${calculatedDailyNetProfit >= 0 ? "text-[#00a86b]" : "text-rose-600"}`}>
                    Rs. {calculatedDailyNetProfit.toLocaleString()}
                  </span>
                  <span className="block text-[9px] text-emerald-600 font-semibold">
                    {calculatedDailyNetProfit >= 0 ? "✓ Positive" : "⚠ Negative"}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    30-Day Forecast
                  </span>
                  <span className={`text-sm sm:text-base font-extrabold font-mono ${calculatedMonthlyProjected >= 0 ? "text-[#00a86b]" : "text-rose-600"}`}>
                    Rs. {calculatedMonthlyProjected.toLocaleString()}
                  </span>
                  <span className="block text-[9px] text-slate-500">
                    Monthly Net
                  </span>
                </div>
              </div>
            </div>

            {/* Simulator 2: Mass Balance Reconciliation Simulator */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      ⚖️
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Mass-Balance Dipstick Audit
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Tank Opening + Inflow - Outflow = Dipstick
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Zero Shrinkage
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Opening Tank</label>
                    <input
                      type="number"
                      value={openingTank}
                      onChange={(e) => setOpeningTank(Number(e.target.value) || 0)}
                      className="w-full mt-0.5 font-bold text-slate-800 bg-transparent border-0 p-0 text-xs focus:ring-0 outline-none"
                    />
                    <span className="text-[9px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">+ Herd Yield</label>
                    <input
                      type="number"
                      value={herdYield}
                      onChange={(e) => setHerdYield(Number(e.target.value) || 0)}
                      className="w-full mt-0.5 font-bold text-emerald-600 bg-transparent border-0 p-0 text-xs focus:ring-0 outline-none"
                    />
                    <span className="text-[9px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">+ Sourcer Dock</label>
                    <input
                      type="number"
                      value={sourcerIntake}
                      onChange={(e) => setSourcerIntake(Number(e.target.value) || 0)}
                      className="w-full mt-0.5 font-bold text-emerald-600 bg-transparent border-0 p-0 text-xs focus:ring-0 outline-none"
                    />
                    <span className="text-[9px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">- POS Sales</label>
                    <input
                      type="number"
                      value={retailSales}
                      onChange={(e) => setRetailSales(Number(e.target.value) || 0)}
                      className="w-full mt-0.5 font-bold text-rose-600 bg-transparent border-0 p-0 text-xs focus:ring-0 outline-none"
                    />
                    <span className="text-[9px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">- Deliveries</label>
                    <input
                      type="number"
                      value={deliveriesTotal}
                      onChange={(e) => setDeliveriesTotal(Number(e.target.value) || 0)}
                      className="w-full mt-0.5 font-bold text-rose-600 bg-transparent border-0 p-0 text-xs focus:ring-0 outline-none"
                    />
                    <span className="text-[9px] text-slate-400">Liters</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Dipstick</label>
                    <input
                      type="number"
                      value={actualDipstick}
                      onChange={(e) => setActualDipstick(Number(e.target.value) || 0)}
                      className="w-full mt-0.5 font-bold text-slate-900 bg-transparent border-0 p-0 text-xs focus:ring-0 outline-none"
                    />
                    <span className="text-[9px] text-slate-400">Liters</span>
                  </div>
                </div>
              </div>

              {/* Reconciliation Status Alert Box */}
              <div
                className={`mt-3 p-3 rounded-xl border text-center transition-all ${
                  isBalanceWithinTolerance
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {isBalanceWithinTolerance ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span className="font-bold text-xs">
                    {isBalanceWithinTolerance
                      ? "Mass-Balance Reconciled (Within Tolerance)"
                      : "Discrepancy Detected (Audit Shrinkage)"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Expected:</span>
                    <strong className="font-mono text-xs">{calculatedExpectedStock} L</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Variance:</span>
                    <strong
                      className={`font-mono text-xs ${
                        massBalanceVariance === 0
                          ? "text-emerald-700"
                          : massBalanceVariance > 0
                          ? "text-blue-700"
                          : "text-rose-700"
                      }`}
                    >
                      {massBalanceVariance > 0 ? `+${massBalanceVariance}` : massBalanceVariance} L
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. ENROLLED COMMERCIAL FARMS & PRODUCER HUBS (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-slate-50 border-b border-slate-200 overflow-hidden" id="farms">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                Verified Dairy Producers
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Commercial Farms Enrolled With Pure Milk Bar ERP
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                Leading dairy farms and commercial milk producers managing daily herd milking, bulk chiller procurement, and distribution.
              </p>
            </div>
            <Link
              to="/farm"
              className="text-xs font-bold text-slate-700 hover:text-[#00a86b] flex items-center gap-1 transition cursor-pointer"
            >
              <span>Explore Farm Module</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Farm 1: Al-Noor Dairy & Cattle Farm */}
            <div className="relative h-[270px] sm:h-[310px] lg:h-[340px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Al-Noor Dairy Farm"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                src="/images/dairyfarm.jpeg"
              />
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active ERP Node
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold shadow-md">
                  ★ 4.98
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 right-3 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
                <h3 className="text-sm font-bold text-white tracking-tight">Al-Noor Dairy &amp; Cattle Farm</h3>
                <p className="text-[11px] text-slate-200 font-medium">Sahiwal &amp; HF Cattle Herd • Lahore</p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/15 text-[10px] text-slate-300">
                  <span>180 Head Herd</span>
                  <span className="text-emerald-300 font-semibold">3,200 L Daily Yield</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-3.5 text-white">
                <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-1.5 py-0.2 rounded-full border border-[#5BBB7B]/30 w-fit mb-1">
                  Tier-1 Commercial Producer
                </span>
                <h3 className="text-sm font-bold text-white">Al-Noor Dairy Farm</h3>
                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed">
                  Automated milking parlor with direct refrigerated chiller tank transfer and batch lactation logs.
                </p>
                <Link
                  to="/farm/animals"
                  className="mt-2.5 w-full py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-lg"
                >
                  <span>View Farm Herd</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Farm 2: Green Pastures Dairy Complex */}
            <div className="relative h-[270px] sm:h-[310px] lg:h-[340px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Green Pastures Dairy Complex"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                src="/images/animals.webp"
              />
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Inflow Dock
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold shadow-md">
                  ★ 4.95
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 right-3 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
                <h3 className="text-sm font-bold text-white tracking-tight">Green Pastures Dairy Complex</h3>
                <p className="text-[11px] text-slate-200 font-medium">Nili-Ravi Buffalo &amp; Cow Unit • Faisalabad</p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/15 text-[10px] text-slate-300">
                  <span>240 Head Herd</span>
                  <span className="text-emerald-300 font-semibold">4,500 L Daily Yield</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-3.5 text-white">
                <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-1.5 py-0.2 rounded-full border border-[#5BBB7B]/30 w-fit mb-1">
                  High-Volume Unit
                </span>
                <h3 className="text-sm font-bold text-white">Green Pastures Complex</h3>
                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed">
                  High-yield lactation logs with 100% automated feed formula allocation and veterinary schedules.
                </p>
                <Link
                  to="/farm/feeding"
                  className="mt-2.5 w-full py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-lg"
                >
                  <span>View Feed Formulations</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Farm 3: Bismillah Organic Milk Farm */}
            <div className="relative h-[270px] sm:h-[310px] lg:h-[340px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Bismillah Milk Farm"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                src="/images/milking-register.jpeg"
              />
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Chiller Dock Hub
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold shadow-md">
                  ★ 4.99
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 right-3 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
                <h3 className="text-sm font-bold text-white tracking-tight">Bismillah Organic Milk Farm</h3>
                <p className="text-[11px] text-slate-200 font-medium">Raw Milk Chilling Station • Sahiwal</p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/15 text-[10px] text-slate-300">
                  <span>120 Head Herd</span>
                  <span className="text-emerald-300 font-semibold">2,800 L Daily Yield</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-3.5 text-white">
                <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-1.5 py-0.2 rounded-full border border-[#5BBB7B]/30 w-fit mb-1">
                  Bulk Supplier Hub
                </span>
                <h3 className="text-sm font-bold text-white">Bismillah Milk Farm</h3>
                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed">
                  Zero-shrinkage mass-balance tank audit and automated supplier khata payout settlement.
                </p>
                <Link
                  to="/supplier"
                  className="mt-2.5 w-full py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-lg"
                >
                  <span>View Milk Procurement</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Farm 4: Royal Fresh Dairy Estate */}
            <div className="relative h-[270px] sm:h-[310px] lg:h-[340px] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group bg-slate-900 border border-slate-200/80 cursor-pointer">
              <img
                alt="Royal Fresh Dairy Estate"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                src="/images/storage.webp"
              />
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cold-Chain Certified
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold shadow-md">
                  ★ 4.96
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 right-3 z-10 transition-all duration-300 group-hover:opacity-0 pointer-events-none">
                <h3 className="text-sm font-bold text-white tracking-tight">Royal Fresh Dairy Estate</h3>
                <p className="text-[11px] text-slate-200 font-medium">Pasteurization &amp; Chilling • Multan</p>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/15 text-[10px] text-slate-300">
                  <span>310 Head Herd</span>
                  <span className="text-emerald-300 font-semibold">6,200 L Daily Yield</span>
                </div>
              </div>
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0e2923]/95 via-[#1F4B3F]/90 to-[#1F4B3F]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col justify-end p-3.5 text-white">
                <span className="text-[8.5px] font-bold uppercase tracking-wide text-[#5BBB7B] bg-[#5BBB7B]/20 px-1.5 py-0.2 rounded-full border border-[#5BBB7B]/30 w-fit mb-1">
                  Integrated Estate
                </span>
                <h3 className="text-sm font-bold text-white">Royal Fresh Estate</h3>
                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed">
                  Direct farm-to-counter distribution with real-time route fleet tracking and automated closing balances.
                </p>
                <Link
                  to="/delivery"
                  className="mt-2.5 w-full py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-lg"
                >
                  <span>View Delivery Fleet</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. TRANSPARENT COMMERCIAL SAAS PRICING MATRIX (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-white border-t border-slate-200/80 overflow-hidden" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Simple, Predictable Plans For Every Dairy Scale
            </h2>
            <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-3">
              All plans include complete offline localStorage resilience and automated supplier procurement.
            </p>

            {/* Billing Toggle (Monthly vs Annual) */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
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
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-[#00a86b] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  Save 25%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto w-full items-stretch">
            {/* Plan 1: Starter Dairy */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Small Dairy / Single Shop
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Starter Farm</h3>
                <div className="mt-2 mb-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Rs. {billingCycle === "annual" ? "7,500" : "9,999"}
                  </span>
                  <span className="text-xs text-slate-500"> / mo</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Up to 50 Registered Cattle
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Touch POS Counter Sales
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Customer Khata Ledger
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Mass-Balance Closing
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-4 w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition text-center block"
              >
                Start 14-Day Trial
              </Link>
            </div>

            {/* Plan 2: Commercial Station (Featured) */}
            <div className="bg-[#1F4B3F] text-white rounded-2xl p-5 border-2 border-[#00a86b] shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00a86b] text-white text-[9px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                Most Popular
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Commercial Milk Station
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Commercial Pro</h3>
                <div className="mt-2 mb-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    Rs. {billingCycle === "annual" ? "14,500" : "18,999"}
                  </span>
                  <span className="text-xs text-emerald-200"> / mo</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5BBB7B]" /> Unlimited Cattle Herd
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5BBB7B]" /> Milk Intake &amp; Dock Procurement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5BBB7B]" /> 15 Delivery Riders &amp; Fuel Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5BBB7B]" /> WhatsApp Khata Statements
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-4 w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition text-center shadow-lg block cursor-pointer"
              >
                Get Started Now
              </Link>
            </div>

            {/* Plan 3: Enterprise Multi-Branch */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Multi-Branch Dairy Chains
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Enterprise Multi-Branch</h3>
                <div className="mt-2 mb-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Rs. {billingCycle === "annual" ? "28,000" : "34,999"}
                  </span>
                  <span className="text-xs text-slate-500"> / mo</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Multi-Branch Centralized Hub
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Unlimited Fleet Riders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> Tamper-Proof Audit Trail
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00a86b]" /> 24/7 Dedicated Support
                  </li>
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="mt-4 w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition text-center block"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. TESTIMONIALS & FAQ SPLIT-SCREEN (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-center py-4 lg:py-6 bg-slate-50 border-t border-slate-200/80 overflow-hidden" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Testimonials Column */}
            <div className="lg:col-span-6 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Customer Success
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                  Trusted by Dairy Owners
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                  Over 40+ commercial dairy operations eliminated shrinkage and automated Khata.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {"★★★★★"}
                  </div>
                  <p className="text-[11.5px] text-slate-700 leading-relaxed italic">
                    "Pure Milk Bar's mass-balance audit brought our 30L daily shrinkage down to zero within the first week."
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px]">
                      MA
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">Malik Asif Dairy Farm</h4>
                      <p className="text-[9.5px] text-slate-500">Model Town, Lahore</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {"★★★★★"}
                  </div>
                  <p className="text-[11.5px] text-slate-700 leading-relaxed italic">
                    "The automated supplier milk pricing and instant voucher calculation saved us thousands in billing errors and WhatsApp Khata ended all ledger disputes."
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px]">
                      CK
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">Chaudhry Kamran Milk Bar</h4>
                      <p className="text-[9.5px] text-slate-500">Faisalabad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: FAQ Accordion Column */}
            <div className="lg:col-span-6 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Got Questions?
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-2">
                {[
                  {
                    q: "Does Pure Milk Bar ERP work offline when internet is down?",
                    a: "Yes! The system is built with client-side localStorage persistence so POS counter sales, milk intake, and Khata updates work seamlessly offline.",
                  },
                  {
                    q: "How does the Milk Procurement & Intake Dock work?",
                    a: "Log supplier delivery volumes, track supplier khata ledgers instantly, and route fresh milk directly to bulk chilling tanks or POS retail counters.",
                  },
                  {
                    q: "Can we print thermal receipts and WhatsApp bills?",
                    a: "Yes. The POS and Khata modules support 80mm/58mm ESC/POS thermal printing as well as 1-click formatted WhatsApp customer statements.",
                  },
                  {
                    q: "How is Mass-Balance closing calculated?",
                    a: "Opening Tank + Herd Yield + Sourcer Dock - POS Sales - Deliveries - Spillage is compared against physical dipsticks to catch shrinkage immediately.",
                  },
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-3.5 py-2.5 text-left font-bold text-xs text-slate-900 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {openFaq === idx ? (
                        <ChevronUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {openFaq === idx && (
                      <div className="px-3.5 pb-2.5 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. HIGH-CONVERSION CTA BANNER + COMPACT FOOTER (1-Screen Viewport Fit)
      ========================================================================= */}
      <section className="min-h-[calc(100vh-76px)] lg:h-[calc(100vh-76px)] lg:max-h-[calc(100vh-76px)] flex flex-col justify-between py-6 bg-[#163E34] text-slate-300 overflow-hidden" id="contact">
        {/* Top CTA Banner */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10.5px] font-semibold text-emerald-200">
            <Sparkles className="w-3 h-3 text-[#5BBB7B]" /> Live Operating System Ready
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Ready to streamline your dairy operations with zero shrinkage?
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm max-w-lg mx-auto">
            Launch the live ERP dashboard right now. No lengthy setup required—all core dairy modules are pre-configured.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Live ERP Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/pos"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-6 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#5BBB7B]" />
              <span>Open POS Counter</span>
            </Link>
          </div>
        </div>

        {/* Bottom Clean Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 border-t border-[#2A4D47]/80 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-[11px]">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-[#00a86b] flex items-center justify-center text-white">
                  <Milk className="w-3 h-3" />
                </div>
                <span className="font-bold text-white">Pure Milk Bar</span>
              </div>
              <p className="text-[10px] text-slate-400">Next-gen dairy farm &amp; milk bar ERP.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1 text-[10px] uppercase">Farm &amp; Dock</h4>
              <ul className="space-y-1 text-slate-400">
                <li><Link to="/farm/animals" className="hover:text-white">Cattle Herd Register</Link></li>
                <li><Link to="/supplier/intake" className="hover:text-white">Milk Intake Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1 text-[10px] uppercase">POS &amp; Fleet</h4>
              <ul className="space-y-1 text-slate-400">
                <li><Link to="/pos" className="hover:text-white">Touch POS Sales</Link></li>
                <li><Link to="/delivery" className="hover:text-white">Rider Fleet Logistics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1 text-[10px] uppercase">Finance</h4>
              <ul className="space-y-1 text-slate-400">
                <li><Link to="/customer-khata-ledger" className="hover:text-white">Khata Ledger</Link></li>
                <li><Link to="/finance/daily-closing" className="hover:text-white">Daily Mass-Balance</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t border-[#2A4D47]/40 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1">
            <div>&copy; {new Date().getFullYear()} Pure Milk Bar Dairy ERP SaaS. All rights reserved.</div>
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link to="/pos" className="hover:text-white">POS</Link>
              <Link to="/farm" className="hover:text-white">Farm</Link>
              <Link to="/settings" className="hover:text-white">Settings</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
