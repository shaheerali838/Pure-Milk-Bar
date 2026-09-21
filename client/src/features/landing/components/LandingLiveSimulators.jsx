import React, { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

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
    <section className="py-10 lg:py-16 bg-white border-y border-slate-200/80" id="simulators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Interactive Mathematical Domain Engine
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mt-2">
            Test Our Real-Time Dairy Calculation Engines
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto mt-1">
            Experience the algorithms running inside Pure Milk Bar ERP: herd profit &amp; yield projection and mass-balance tank audit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
          {/* Simulator 1: Herd Yield & Profit Calculator */}
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
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
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Live Profit Engine
                </span>
              </div>

              <div className="space-y-4 mt-4">
                {/* Daily Yield Slider */}
                <div>
                  <div className="flex justify-between text-xs sm:text-[13px] font-bold text-slate-700 mb-1.5">
                    <span>Daily Farm Herd Milk Yield:</span>
                    <span className="text-emerald-700 font-mono text-sm">{dailyYieldLiters.toLocaleString()} L</span>
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
                    <span className="text-emerald-700 font-mono text-sm">Rs. {sellingRatePerLiter} / L</span>
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
                    <span className="text-emerald-700 font-mono text-sm">Rs. {dailyFeedCost.toLocaleString()}</span>
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
            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs grid grid-cols-3 gap-3 text-center">
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
              <div className="border-x border-slate-100 px-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Daily Net Profit
                </span>
                <span className={`text-base sm:text-lg font-extrabold font-mono ${calculatedDailyNetProfit >= 0 ? "text-[#00a86b]" : "text-rose-600"}`}>
                  Rs. {calculatedDailyNetProfit.toLocaleString()}
                </span>
                <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
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
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
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
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  Zero Shrinkage
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs mt-4">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block">Opening Tank</label>
                  <input
                    type="number"
                    value={openingTank}
                    onChange={(e) => setOpeningTank(Number(e.target.value) || 0)}
                    className="w-full mt-1 font-bold text-slate-800 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400">Liters</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block">+ Herd Yield</label>
                  <input
                    type="number"
                    value={herdYield}
                    onChange={(e) => setHerdYield(Number(e.target.value) || 0)}
                    className="w-full mt-1 font-bold text-emerald-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400">Liters</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block">+ Sourcer Dock</label>
                  <input
                    type="number"
                    value={sourcerIntake}
                    onChange={(e) => setSourcerIntake(Number(e.target.value) || 0)}
                    className="w-full mt-1 font-bold text-emerald-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400">Liters</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block">- POS Sales</label>
                  <input
                    type="number"
                    value={retailSales}
                    onChange={(e) => setRetailSales(Number(e.target.value) || 0)}
                    className="w-full mt-1 font-bold text-rose-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400">Liters</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block">- Deliveries</label>
                  <input
                    type="number"
                    value={deliveriesTotal}
                    onChange={(e) => setDeliveriesTotal(Number(e.target.value) || 0)}
                    className="w-full mt-1 font-bold text-rose-600 bg-transparent border-0 p-0 text-sm focus:ring-0 outline-none"
                  />
                  <span className="text-[9.5px] text-slate-400">Liters</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
                  <strong className="font-mono text-sm sm:text-base">{calculatedExpectedStock} L</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Variance:</span>
                  <strong
                    className={`font-mono text-sm sm:text-base ${
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
  );
}
