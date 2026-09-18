import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export default function LandingPage() {
  // Hero Interactive Preview Tab State
  const [activeHeroTab, setActiveHeroTab] = useState("pos");

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
  const calculatedPricePerLiter = Math.max(100, Math.round(baseMilkRate * priceMultiplier + lrBonus));

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2 relative z-50 shadow-xs">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-emerald-200 animate-pulse" /> Pure Milk Bar SaaS v2.4
        </span>
        <span className="hidden sm:inline text-emerald-50">
          The all-in-one cloud platform for livestock, procurement dock, POS, fleet, & mass-balance.
        </span>
        <Link
          to="/dashboard"
          className="font-bold underline text-white hover:text-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer ml-1"
        >
          Launch Live App <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sticky SaaS Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[#00a86b] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Pure Milk Bar
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ERP SaaS
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold leading-none">
                Dairy Operations Engine
              </p>
            </div>
          </Link>

          {/* SaaS Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors cursor-pointer">
              Product Features
            </a>
            <a href="#simulators" className="hover:text-emerald-600 transition-colors cursor-pointer">
              Interactive Engines
            </a>
            <a href="#architecture" className="hover:text-emerald-600 transition-colors cursor-pointer">
              Architecture
            </a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors cursor-pointer">
              Pricing Plans
            </a>
            <a href="#roi" className="hover:text-emerald-600 transition-colors cursor-pointer">
              ROI Calculator
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors cursor-pointer">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/pos">
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                <span>Counter POS</span>
              </button>
            </Link>

            <Link to="/dashboard">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#00a86b] hover:bg-[#00925d] text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all cursor-pointer transform active:scale-95"
              >
                <span>Launch ERP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
        {/* Subtle Background Radial Highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Social Proof Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-xs font-bold text-emerald-800">
                #1 SaaS ERP for Commercial Dairy Farms & Retail Milk Bars
              </span>
            </div>

            {/* SaaS Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              The All-in-One Dairy ERP to{" "}
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Scale Your Milk Business
              </span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Stop milk shrinkage, automate farmer procurement with ultrasonic FAT/LR testing, accelerate counter POS billing,
              streamline doorstep delivery routes, and achieve <strong>100% accurate nightly mass-balance reconciliation</strong>.
            </p>

            {/* Hero CTA Group */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link to="/dashboard">
                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[#00a86b] hover:bg-[#00925d] text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
                >
                  <Activity className="w-4 h-4" />
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <a href="#simulators">
                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/80 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Try Live Simulators</span>
                </button>
              </a>

              <Link to="/pos">
                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>Live POS Terminal</span>
                </button>
              </Link>
            </div>

            <p className="text-xs text-slate-400 font-medium pt-1">
              ✨ No credit card required • Instant cloud deployment • Works on mobile, tablet & desktop
            </p>
          </div>

          {/* High-Impact SaaS Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Daily Milk Volume</span>
                <Droplets className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular">14,850+ L</div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Herd + Sourcer Intake
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Mass-Balance Lock</span>
                <Gauge className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular">±0.00%</div>
              <p className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 23:59 Dipstick Audit
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>POS Billing Speed</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular">&lt; 1.8s</div>
              <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                <Printer className="w-3 h-3" /> Thermal ESC/POS Print
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Khata Debt Recovery</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular">99.6%</div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Double-Entry Ledger
              </p>
            </div>
          </div>

          {/* Interactive SaaS Browser Frame Product Showcase */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Browser Chrome Header */}
              <div className="bg-slate-100/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div className="ml-2 bg-white px-3 py-1 rounded-md border border-slate-200 text-xs font-mono text-slate-500 flex items-center gap-1.5 shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>app.puremilkbar.com/dashboard</span>
                  </div>
                </div>

                {/* Live Tab Switcher */}
                <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab("pos")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeHeroTab === "pos"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    POS Terminal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab("massBalance")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeHeroTab === "massBalance"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Mass Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab("fatPricing")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeHeroTab === "fatPricing"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    FAT/LR Intake
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab("fleet")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      activeHeroTab === "fleet"
                        ? "bg-white text-emerald-800 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Fleet Logistics
                  </button>
                </div>
              </div>

              {/* Showcase Window Body */}
              <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[320px] flex items-center justify-center">
                {activeHeroTab === "pos" && (
                  <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-900 text-sm">Counter POS Checkout #PMB-8492</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          REAL-TIME TILL
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                          <div>
                            <p className="font-bold text-slate-800">Fresh Buffalo Milk (Chilled)</p>
                            <p className="text-[11px] text-slate-500">5.0 Liters @ PKR 220.00 / L</p>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-sm">PKR 1,100.00</span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                          <div>
                            <p className="font-bold text-slate-800">Sweet Dahi (Clay Matka Pack)</p>
                            <p className="text-[11px] text-slate-500">2.0 kg @ PKR 260.00 / kg</p>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-sm">PKR 520.00</span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                          <div>
                            <p className="font-bold text-slate-800">Pure Organic Desi Ghee</p>
                            <p className="text-[11px] text-slate-500">0.5 kg @ PKR 1,800.00 / kg</p>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-sm">PKR 900.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                          Order Summary & Till
                        </span>
                        <div className="mt-2 space-y-1.5 text-slate-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-mono">PKR 2,520.00</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Khata Balance</span>
                            <span className="font-mono">PKR 0.00</span>
                          </div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-extrabold text-sm">
                            <span>Grand Total</span>
                            <span className="font-mono text-emerald-600">PKR 2,520.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                            Cash: PKR 3,000
                          </div>
                          <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-700">
                            Change: PKR 480
                          </div>
                        </div>
                        <Link to="/pos" className="w-full block">
                          <button
                            type="button"
                            className="w-full py-2 rounded-lg bg-[#00a86b] hover:bg-[#00925d] text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Thermal Receipt</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {activeHeroTab === "massBalance" && (
                  <div className="w-full space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Daily Milk Mass-Balance Reconciliation Engine
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                        23:59 EOD DIPSTICK AUDIT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-semibold">Opening Tank</span>
                        <div className="font-mono font-bold text-slate-900 text-sm">1,200.0 L</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-emerald-600 font-semibold">+ Farm Milking</span>
                        <div className="font-mono font-bold text-emerald-700 text-sm">850.0 L</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-emerald-600 font-semibold">+ Sourcer Intake</span>
                        <div className="font-mono font-bold text-emerald-700 text-sm">3,400.0 L</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-rose-600 font-semibold">- Retail Sales</span>
                        <div className="font-mono font-bold text-rose-700 text-sm">1,650.0 L</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-rose-600 font-semibold">- Deliveries</span>
                        <div className="font-mono font-bold text-rose-700 text-sm">3,600.0 L</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] text-amber-600 font-semibold">- Spillage</span>
                        <div className="font-mono font-bold text-amber-700 text-sm">15.0 L</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">Calculated Book Balance: 185.0 L</p>
                        <p className="text-[11px] text-slate-600">
                          Actual Physical Dipstick: 185.0 L &nbsp;|&nbsp; Variance: 0.0 L (0.00% Zero-Shrinkage)
                        </p>
                      </div>
                      <Link to="/finance/daily-closing">
                        <button type="button" className="px-3.5 py-1.5 rounded-lg bg-[#00a86b] text-white font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-[#00925d] cursor-pointer">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconcile EOD Books
                        </button>
                      </Link>
                    </div>
                  </div>
                )}

                {activeHeroTab === "fatPricing" && (
                  <div className="w-full space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Ultrasonic FAT% & LR Hydrometer Intake Dock
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                        RICHMOND SNF SOLVER
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 text-[11px] font-semibold">FAT % (Ultrasonic)</span>
                        <div className="text-xl font-bold font-mono text-emerald-700 mt-1">6.8 %</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">High Density Buffalo Standard</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 text-[11px] font-semibold">LR (Lactometer Reading)</span>
                        <div className="text-xl font-bold font-mono text-blue-700 mt-1">29.5 LR</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Specific Gravity @ 20°C</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 text-[11px] font-semibold">Computed SNF %</span>
                        <div className="text-xl font-bold font-mono text-teal-700 mt-1">9.16 %</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Richmond Formula Standard</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 text-[11px] font-medium">Auto-Indexed Purchase Price:</span>
                        <span className="text-slate-900 font-extrabold font-mono text-sm ml-2">PKR 206.25 / Liter</span>
                      </div>
                      <Link to="/supplier" className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 cursor-pointer">
                        Open Supplier Intake <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeHeroTab === "fleet" && (
                  <div className="w-full space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900 text-sm">
                          Doorstep Morning Run Sheet & Inline Fuel Logging (ADR-002)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                        SHIFT: 05:30 AM
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900">Route #3: Model Town & Gulberg</span>
                          <span className="text-emerald-700 font-bold">14 / 14 Drops</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">Rider: Tariq Mehmood (Bike #LEB-4920)</p>
                        <p className="text-slate-500 text-[11px]">Payload: 140.0 Liters Fresh Buffalo Milk</p>
                        <div className="pt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            DELIVERED (100%)
                          </span>
                          <span className="text-slate-500 text-[10px]">Bottle Return: 28/28</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-900">Route #5: DHA Phase 5 & 6</span>
                          <span className="text-amber-700 font-bold">18 / 22 Drops</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">Rider: Usman Ali (Bike #LEA-8812)</p>
                        <p className="text-slate-500 text-[11px]">Payload: 210.0 Liters Pasteurized Milk</p>
                        <div className="pt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            IN ROUTE (82%)
                          </span>
                          <span className="text-slate-500 text-[10px]">Fuel Logged: PKR 650 (ADR-002)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Feature Bento Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            Complete ERP Capability
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Everything You Need to Run Your Dairy Business
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A unified suite connecting farm cattle, village sourcers, retail counters, and fleet logistics.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Herd Management */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00a86b] flex items-center justify-center font-bold">
                <Tractor className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Herd & Milking Registers</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ear-tag RFID indexing for Nili Ravi, Sahiwal, and Friesian breeds. Track morning and evening milk yield per animal, feed costs, and health cycles.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/farm" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 cursor-pointer">
                <span>Explore Herd Portal</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Procurement & Quality Dock */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ultrasonic FAT/LR Quality Dock</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automated milk collection integrating ultrasonic analyzers. Real-time Richmond SNF pricing and supplier credit balances.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/supplier" className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1.5 cursor-pointer">
                <span>Explore Intake Dock</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Counter POS */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Split-Second Retail POS</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Barcode scanning, instant Walk-in vs Monthly Khata splits, quick cash tendered chips, and ESC/POS thermal receipt printing.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/pos" className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5 cursor-pointer">
                <span>Explore POS Terminal</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Processing & Dahi */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dahi & Desi Ghee Processing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Transform raw milk into high-margin Dahi, Butter, Pure Desi Ghee, Paneer, and Khoya with real-time batch conversion and yield tracking.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/proccessing" className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 cursor-pointer">
                <span>Explore Processing Hub</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 5: Fleet & ADR-002 Fuel */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Doorstep Fleet & ADR-002 Fuel</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Morning (05:30 AM) & Evening (05:00 PM) delivery run sheets with inline fleet fuel logging (ADR-002) and bottle return audits.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/delivery" className="text-xs font-bold text-indigo-700 hover:text-indigo-800 inline-flex items-center gap-1.5 cursor-pointer">
                <span>Explore Fleet Hub</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 6: Double-Entry Khata Ledgers */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Double-Entry Khata Accounts</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Immutable running credit ledgers with 0-30d, 31-60d, 60d+ debt aging risk analysis, payment receipts, and 1-click WhatsApp bill sharing.
              </p>
            </div>
            <div className="pt-6">
              <Link to="/customer-khata-ledger" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5 cursor-pointer">
                <span>Explore Khata Ledger</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Domain Simulators */}
      <section id="simulators" className="py-24 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              Live Domain Sandbox
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Test Real ERP Domain Mathematical Engines
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Interact with the live mathematical solvers built into Pure Milk Bar's core backend architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Simulator 1: Richmond SNF Solver */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#00a86b] flex items-center justify-center font-bold">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">FAT/LR Quality & Richmond SNF Solver</h3>
                    <p className="text-xs text-slate-500">Dynamic Procurement Rate Indexation</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold">
                  Formula Engine
                </span>
              </div>

              {/* FAT Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-700 font-bold">Observed FAT % (Ultrasonic)</label>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{fatValue.toFixed(1)} %</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={fatValue}
                  onChange={(e) => setFatValue(parseFloat(e.target.value))}
                  className="w-full accent-[#00a86b] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>3.0% (Cow Standard)</span>
                  <span>6.0% (Buffalo Reference)</span>
                  <span>10.0% (Heavy Cream)</span>
                </div>
              </div>

              {/* LR Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-700 font-bold">Lactometer Reading (LR @ 20°C)</label>
                  <span className="font-mono font-bold text-blue-700 text-sm">{lrValue.toFixed(1)} LR</span>
                </div>
                <input
                  type="range"
                  min="20.0"
                  max="34.0"
                  step="0.5"
                  value={lrValue}
                  onChange={(e) => setLrValue(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>20 LR (Diluted Risk)</span>
                  <span>28 LR (Standard Density)</span>
                  <span>34 LR (Dense Milk)</span>
                </div>
              </div>

              {/* Base Rate Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-700 font-bold">Base Milk Rate (PKR / Liter)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={baseMilkRate}
                    onChange={(e) => setBaseMilkRate(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 shrink-0">PKR @ 6.0% FAT / 28 LR</span>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium">Richmond SNF %</span>
                  <div className="text-2xl font-black font-mono text-teal-700 mt-1">{calculatedSNF} %</div>
                  <span className="text-[10px] text-slate-400">SNF = (LR/4) + (0.21*FAT) + 0.36</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-semibold">Indexed Purchase Price</span>
                  <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                    PKR {calculatedPricePerLiter}
                    <span className="text-xs font-normal text-emerald-800"> / L</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">Dynamic Rate Card</span>
                </div>
              </div>
            </div>

            {/* Simulator 2: Mass Balance Reconciliation Engine */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Daily Milk Mass-Balance Solver</h3>
                    <p className="text-xs text-slate-500">Nightly Zero-Shrinkage Dipstick Audit</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-mono font-bold">
                  Mass Equation
                </span>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Opening Tank (L)</label>
                  <input
                    type="number"
                    value={openingTank}
                    onChange={(e) => setOpeningTank(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-emerald-700 block mb-1 font-semibold">+ Herd Yield (L)</label>
                  <input
                    type="number"
                    value={herdYield}
                    onChange={(e) => setHerdYield(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-emerald-700 block mb-1 font-semibold">+ Intake (L)</label>
                  <input
                    type="number"
                    value={sourcerIntake}
                    onChange={(e) => setSourcerIntake(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-rose-700 block mb-1 font-semibold">- POS Sales (L)</label>
                  <input
                    type="number"
                    value={retailSales}
                    onChange={(e) => setRetailSales(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-rose-700 block mb-1 font-semibold">- Deliveries (L)</label>
                  <input
                    type="number"
                    value={deliveriesTotal}
                    onChange={(e) => setDeliveriesTotal(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-amber-700 block mb-1 font-semibold">- Spillage (L)</label>
                  <input
                    type="number"
                    value={spillageLoss}
                    onChange={(e) => setSpillageLoss(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Dipstick Reading */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-700 font-bold">Physical Tank Dipstick Reading (L)</label>
                  <span className="font-mono font-bold text-slate-900">{actualDipstick} Liters</span>
                </div>
                <input
                  type="number"
                  value={actualDipstick}
                  onChange={(e) => setActualDipstick(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Mass Balance Audit Status Card */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  isBalanceWithinTolerance
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isBalanceWithinTolerance ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm">
                      {isBalanceWithinTolerance
                        ? "Mass-Balance Verified (Within ±1.5L Tolerance)"
                        : "Shrinkage / Loss Alert!"}
                    </span>
                  </div>
                  <span className="font-mono font-black text-sm">
                    Variance: {massBalanceVariance > 0 ? `+${massBalanceVariance}` : massBalanceVariance} L
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Expected Book Balance: <span className="font-mono font-bold text-slate-900">{calculatedExpectedStock} L</span>{" "}
                  vs Physical Dipstick: <span className="font-mono font-bold text-slate-900">{actualDipstick} L</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Plans Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            Transparent SaaS Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Plans Built for Every Dairy Scale
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From single-farm herds to multi-collection docks and industrial processing plants.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-[#00a86b] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 text-white font-extrabold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter Dairy */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Starter Dairy</span>
              <h3 className="text-2xl font-black text-slate-900">Farm & Procurement</h3>
              <p className="text-xs text-slate-500">For small livestock herds & single milk collection points.</p>
              <div className="pt-2">
                <div className="text-4xl font-black text-slate-900 font-mono">
                  PKR {billingCycle === "annual" ? "10,000" : "12,500"}
                  <span className="text-xs font-normal text-slate-500 font-sans"> / month</span>
                </div>
                {billingCycle === "annual" && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Billed annually (PKR 120,000/yr)</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 100 Livestock Cattle Ear-Tags</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Morning & Evening Milking Register</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Supplier Intake Dock (FAT% / LR Grading)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Farm P&L & Expense Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Check className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Counter POS Billing (Add-on)</span>
                </div>
              </div>
            </div>

            <Link to="/dashboard">
              <button
                type="button"
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                Choose Starter
              </button>
            </Link>
          </div>

          {/* Plan 2: Professional All-in-One (Featured) */}
          <div className="bg-gradient-to-b from-emerald-900 to-slate-950 text-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl flex flex-col justify-between space-y-6 relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00a86b] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              MOST POPULAR CHOICE
            </div>

            <div className="space-y-4 pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Professional SaaS</span>
              <h3 className="text-2xl font-black text-white">Full Enterprise ERP</h3>
              <p className="text-xs text-emerald-100/80">Complete farm-to-table platform for commercial dairies.</p>
              <div className="pt-2">
                <div className="text-4xl font-black text-white font-mono">
                  PKR {billingCycle === "annual" ? "22,400" : "28,000"}
                  <span className="text-xs font-normal text-emerald-200 font-sans"> / month</span>
                </div>
                {billingCycle === "annual" && (
                  <p className="text-[11px] text-emerald-300 font-semibold mt-1">Billed annually (PKR 268,800/yr)</p>
                )}
              </div>

              <div className="border-t border-emerald-800/60 pt-5 space-y-3 text-xs text-emerald-50">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Livestock Herd Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Supplier Intake Dock with Richmond SNF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-Velocity Counter POS & Receipt Print</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Doorstep Fleet Delivery & ADR-002 Fuel Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Double-Entry Khata Ledgers & WhatsApp Bills</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>23:59 EOD Mass-Balance Reconciliation</span>
                </div>
              </div>
            </div>

            <Link to="/dashboard">
              <button
                type="button"
                className="w-full py-3.5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
              >
                Start Free 14-Day Trial
              </button>
            </Link>
          </div>

          {/* Plan 3: Multi-Branch Enterprise */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6 hover:border-slate-300 transition-all">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Enterprise Cloud</span>
              <h3 className="text-2xl font-black text-slate-900">Multi-Branch & Hubs</h3>
              <p className="text-xs text-slate-500">For industrial processing plants, cold chains & franchises.</p>
              <div className="pt-2">
                <div className="text-4xl font-black text-slate-900 font-mono">
                  PKR {billingCycle === "annual" ? "52,000" : "65,000"}
                  <span className="text-xs font-normal text-slate-500 font-sans"> / month</span>
                </div>
                {billingCycle === "annual" && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Billed annually (PKR 624,000/yr)</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All Professional Plan Capabilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Branch Cold Storage Tanks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dahi & Desi Ghee Batch Conversion Yields</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Role-Based Permissions & Audit Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated Account Manager & 24/7 Support</span>
                </div>
              </div>
            </div>

            <Link to="/dashboard">
              <button
                type="button"
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ROI & Shrinkage Savings Calculator */}
      <section id="roi" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl border border-slate-800 p-8 sm:p-12 shadow-xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                SaaS ROI Calculator
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Calculate Your Projected Monthly ROI
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                See how much revenue Pure Milk Bar recovers every month by stopping unmeasured milk shrinkage, preventing Khata credit defaults, and accurately indexing FAT/LR milk pricing.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-semibold">Daily Milk Throughput (Liters / Day)</label>
                  <span className="font-mono font-bold text-emerald-400 text-base">{dailyVolume.toLocaleString()} Liters</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={dailyVolume}
                  onChange={(e) => setDailyVolume(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>500 L (Local Dairy)</span>
                  <span>10,000 L (Commercial)</span>
                  <span>30,000 L (Industrial)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estimated Monthly Value Recovered
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">Shrinkage & Spillage Avoided (~2.5%)</span>
                  <span className="font-mono font-bold text-white">PKR {monthlyShrinkageSaved.toLocaleString()}</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">Khata Debt Defaults Prevented</span>
                  <span className="font-mono font-bold text-white">PKR {monthlyKhataDebtRecovered.toLocaleString()}</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-300">FAT/LR Quality Pricing Accuracy</span>
                  <span className="font-mono font-bold text-white">PKR {monthlyQualityTestingSavings.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Monthly Recovered:</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    PKR {totalMonthlySavings.toLocaleString()}
                  </div>
                </div>
                <Link to="/dashboard">
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00a86b] hover:bg-[#00925d] text-white transition-colors cursor-pointer"
                  >
                    Deploy ERP
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Layer Clean Architecture Section */}
      <section id="architecture" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Full-Stack Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              5-Layer Clean Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Decoupled, high-concurrency architecture built with React 19, Express.js REST APIs, and MongoDB Enterprise v7.0.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-emerald-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#00a86b] flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">1. Client Layer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                React 19 + Vite + Tailwind CSS v4. Modular context state stores, Lucide icons, and tabular numbers with ESC/POS print styling.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-teal-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2. Express Gateway</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                REST API routes with JWT authentication guards, role-based authorization, rate-limiting, and centralized error middleware.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">3. Domain Services</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Business math models: Richmond SNF solver, mass-balance tolerance checker, double-entry ledger calculation, and ADR-002 fuel allocator.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">4. MongoDB DataStore</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                MongoDB Enterprise v7.0 with ACID session transactions, compound indexes for fast customer/supplier queries, and tamper-evident audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            Knowledge Base
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Answers to common questions about deployment, hardware support, and features.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does the Milk Mass-Balance engine prevent operational shrinkage?",
              a: "Every single drop of milk is mathematically reconciled in real time: Opening Tank + Herd Milking + Sourcer Procurement - POS Counter Sales - Fleet Deliveries - Approved Spillage. At 23:59 daily closing, the physical tank dipstick must reconcile within a ±1.0L tolerance lock before the books can close.",
            },
            {
              q: "What hardware and peripherals are compatible with Pure Milk Bar?",
              a: "Pure Milk Bar natively supports 58mm and 80mm ESC/POS thermal receipt printers, USB/Bluetooth barcode & QR scanners, ultrasonic milk analyzers (Master Classic, Lactoscan, Ekomilk), digital weighing scales, and Android/iOS rider tablets for delivery fulfillment.",
            },
            {
              q: "How does the double-entry Khata credit ledger work?",
              a: "Every transaction produces immutable, double-entry credit/debit records. Customers can purchase on credit at the POS counter, receive automated WhatsApp statement receipts, and make partial cash payments with live running balances and aging risk categorization (0-30d, 31-60d, 60d+).",
            },
            {
              q: "What is ADR-002 inline fuel logging?",
              a: "Under Architectural Decision Record 002 (ADR-002), dispatch managers can record fuel allowances directly during delivery dispatch in a single unified workflow, automatically allocating logistics costs to specific routes and updating rider financial ledgers.",
            },
            {
              q: "Is Pure Milk Bar deployable across multiple farm collection centers and retail branches?",
              a: "Yes. Pure Milk Bar's decoupled MERN architecture with MongoDB Enterprise allows multiple collection docks and retail POS counters to synchronize seamlessly to a central database cluster.",
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SaaS Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white relative z-10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ready to Streamline Your Dairy Business?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Experience the precision of Pure Milk Bar ERP. Open your live operations workspace and start managing your herd, intake, and sales today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard">
              <button
                type="button"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:bg-slate-100 text-emerald-800 shadow-lg shadow-black/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Main Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link to="/pos">
              <button
                type="button"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-emerald-900/50 hover:bg-emerald-900/80 text-white border border-emerald-500/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-300" />
                <span>Open Counter POS</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main SaaS Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00a86b] text-white flex items-center justify-center font-bold">
                <Milk className="w-5 h-5" />
              </div>
              <span className="text-base font-black text-white">Pure Milk Bar</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Enterprise Dairy Business Management System (DBMS) & SaaS ERP powered by modern MERN stack, real-time mass-balance reconciliation, and double-entry Khata accounting.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>All 12 Modules Online & Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Farm & Dock</h4>
            <ul className="space-y-2">
              <li><Link to="/farm" className="hover:text-emerald-400 transition-colors">Farm Dashboard</Link></li>
              <li><Link to="/farm/animals" className="hover:text-emerald-400 transition-colors">Livestock Herd</Link></li>
              <li><Link to="/farm/milking" className="hover:text-emerald-400 transition-colors">Milking Register</Link></li>
              <li><Link to="/supplier" className="hover:text-emerald-400 transition-colors">Milk Procurement</Link></li>
              <li><Link to="/supplier/directory" className="hover:text-emerald-400 transition-colors">Supplier Directory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Sales & Logistics</h4>
            <ul className="space-y-2">
              <li><Link to="/pos" className="hover:text-emerald-400 transition-colors">Counter POS</Link></li>
              <li><Link to="/delivery" className="hover:text-emerald-400 transition-colors">Doorstep Delivery</Link></li>
              <li><Link to="/finance/delivery" className="hover:text-emerald-400 transition-colors">Rider Finance</Link></li>
              <li><Link to="/proccessing" className="hover:text-emerald-400 transition-colors">Processing & Dahi</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Products Catalog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Accounts & Audit</h4>
            <ul className="space-y-2">
              <li><Link to="/customer" className="hover:text-emerald-400 transition-colors">Customers & Accounts</Link></li>
              <li><Link to="/customer-khata-ledger" className="hover:text-emerald-400 transition-colors">Customer Khata Ledger</Link></li>
              <li><Link to="/finance/daily-closing" className="hover:text-emerald-400 transition-colors">Daily Closing & Dipstick</Link></li>
              <li><Link to="/audit" className="hover:text-emerald-400 transition-colors">Audit Trail Logs</Link></li>
              <li><Link to="/settings" className="hover:text-emerald-400 transition-colors">Global Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Pure Milk Bar DBMS. Enterprise Dairy ERP SaaS Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>5-Layer Clean Architecture</span>
            <span>•</span>
            <span>MongoDB v7.0 ACID</span>
            <span>•</span>
            <span>React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
