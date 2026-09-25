import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink } from "lucide-react";

export default function LandingLiveSimulators() {
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

  return (
    <section className="py-10 lg:py-16 bg-white border-b border-slate-200/80" id="simulators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Test Our Real-Time Dairy Calculation Engines
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto mt-1.5">
            Experience the algorithms running inside Pure Milk Bar ERP: herd profit &amp; yield projection and mass-balance tank audit.
          </p>
        </div>

        {/* Webpage / Modern Browser Window Frame */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Top Window Chrome / Header (Theme Emerald Green #14332D) */}
          <div className="bg-[#14332D] px-4 py-2.5 flex items-center justify-between border-b border-[#234941]">
            {/* macOS Window Controls */}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <div className="hidden sm:flex items-center space-x-1.5 ml-3 pl-3 border-l border-emerald-800 text-emerald-200 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5BBB7B]" />
                <span>Pure Milk Bar ERP &bull; Calculation Engine Lab</span>
              </div>
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-sm sm:max-w-md mx-3 hidden md:flex items-center justify-center bg-[#1B3E35] border border-emerald-600/30 px-3 py-1 rounded-lg text-xs font-mono text-emerald-200 truncate">
              <span className="text-emerald-400/60 mr-1 select-none">https://</span>
              <span>puremilkbar.erp/analytics/calculation-engines</span>
            </div>

            {/* Actions: Direct Route Link */}
            <div className="flex items-center space-x-2">
              <Link
                to="/farm/pl"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Live Route</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Window Interior Body */}
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/60">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Simulator 1: Herd Yield & Profit Calculator */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-md flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-[#00a86b] border border-emerald-200/60 flex items-center justify-center font-bold text-sm">
                        📈
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Herd Yield &amp; Profit Engine
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Net Profit = (Daily Liters &times; Milk Rate) - Total Feed Cost
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#00a86b] border border-emerald-200/60">
                      Live Profit Engine
                    </span>
                  </div>

                  <div className="space-y-4 mt-4">
                    {/* Daily Yield Slider */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                        <span>Daily Farm Herd Milk Yield:</span>
                        <span className="text-[#00a86b] font-mono text-sm">{dailyYieldLiters.toLocaleString()} L</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="3000"
                        step="50"
                        value={dailyYieldLiters}
                        onChange={(e) => setDailyYieldLiters(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                      />
                    </div>

                    {/* Selling Rate Slider */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                        <span>Market Selling Rate:</span>
                        <span className="text-[#00a86b] font-mono text-sm">Rs. {sellingRatePerLiter} / L</span>
                      </div>
                      <input
                        type="range"
                        min="180"
                        max="350"
                        step="5"
                        value={sellingRatePerLiter}
                        onChange={(e) => setSellingRatePerLiter(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                      />
                    </div>

                    {/* Daily Feed Cost Slider */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                        <span>Daily Total Feed &amp; Fodder Cost:</span>
                        <span className="text-[#00a86b] font-mono text-sm">Rs. {dailyFeedCost.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="200000"
                        step="2500"
                        value={dailyFeedCost}
                        onChange={(e) => setDailyFeedCost(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00a86b]"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 shadow-xs grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Daily Revenue
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                      Rs. {calculatedDailyRevenue.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Gross Inflow
                    </span>
                  </div>
                  <div className="border-x border-slate-200 px-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Daily Net Profit
                    </span>
                    <span className={`text-base sm:text-lg font-extrabold font-mono ${calculatedDailyNetProfit >= 0 ? "text-[#00a86b]" : "text-rose-600"}`}>
                      Rs. {calculatedDailyNetProfit.toLocaleString()}
                    </span>
                    <span className={`block text-[10px] font-semibold mt-0.5 ${calculatedDailyNetProfit >= 0 ? "text-[#00a86b]" : "text-rose-600"}`}>
                      {calculatedDailyNetProfit >= 0 ? "✓ Positive" : "⚠ Negative"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      30-Day Forecast
                    </span>
                    <span className={`text-base sm:text-lg font-extrabold font-mono ${calculatedMonthlyProjected >= 0 ? "text-[#00a86b]" : "text-rose-600"}`}>
                      Rs. {calculatedMonthlyProjected.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Monthly Net
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulator 2: Mass Balance Reconciliation Simulator */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-md flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold text-sm">
                        ⚖️
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Mass-Balance Dipstick Audit
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Tank Opening + Inflow - Outflow = Dipstick
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                      Zero Shrinkage
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-xs mt-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">Opening Tank</label>
                      <input
                        type="number"
                        value={openingTank}
                        onChange={(e) => setOpeningTank(Number(e.target.value) || 0)}
                        className="w-full mt-1 font-bold text-slate-800 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                      />
                      <span className="text-[9.5px] text-slate-400">Liters</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">+ Herd Yield</label>
                      <input
                        type="number"
                        value={herdYield}
                        onChange={(e) => setHerdYield(Number(e.target.value) || 0)}
                        className="w-full mt-1 font-bold text-[#00a86b] bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                      />
                      <span className="text-[9.5px] text-slate-400">Liters</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">+ Sourcer Dock</label>
                      <input
                        type="number"
                        value={sourcerIntake}
                        onChange={(e) => setSourcerIntake(Number(e.target.value) || 0)}
                        className="w-full mt-1 font-bold text-[#00a86b] bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                      />
                      <span className="text-[9.5px] text-slate-400">Liters</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">- POS Sales</label>
                      <input
                        type="number"
                        value={retailSales}
                        onChange={(e) => setRetailSales(Number(e.target.value) || 0)}
                        className="w-full mt-1 font-bold text-rose-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                      />
                      <span className="text-[9.5px] text-slate-400">Liters</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">- Deliveries</label>
                      <input
                        type="number"
                        value={deliveriesTotal}
                        onChange={(e) => setDeliveriesTotal(Number(e.target.value) || 0)}
                        className="w-full mt-1 font-bold text-rose-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                      />
                      <span className="text-[9.5px] text-slate-400">Liters</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="text-[9.5px] font-bold text-slate-400 uppercase block">Physical Dipstick</label>
                      <input
                        type="number"
                        value={actualDipstick}
                        onChange={(e) => setActualDipstick(Number(e.target.value) || 0)}
                        className="w-full mt-1 font-bold text-slate-900 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                      />
                      <span className="text-[9.5px] text-slate-400">Liters</span>
                    </div>
                  </div>
                </div>

                {/* Reconciliation Status Alert Box */}
                <div
                  className={`mt-5 p-4 rounded-2xl border text-center transition-all ${
                    isBalanceWithinTolerance
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-rose-50 border-rose-200 text-rose-950"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isBalanceWithinTolerance ? (
                      <CheckCircle2 className="w-5 h-5 text-[#00a86b]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm">
                      {isBalanceWithinTolerance
                        ? "Mass-Balance Reconciled (Within Tolerance)"
                        : "Discrepancy Detected (Audit Shrinkage)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs">Expected Stock:</span>
                      <strong className="font-mono text-sm sm:text-base text-slate-900">{calculatedExpectedStock} L</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">Variance:</span>
                      <strong
                        className={`font-mono text-sm sm:text-base ${
                          massBalanceVariance === 0
                            ? "text-[#00a86b]"
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
        </div>
      </div>
    </section>
  );
}
