import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";

export default function LandingPOSSandbox() {
  const [posItems, setPosItems] = useState([
    { id: "cow", name: "Pure Cow Milk", rate: 260, qty: 2, unit: "L" },
    { id: "buff", name: "Pure Buffalo Milk", rate: 290, qty: 1, unit: "L" },
    { id: "dahi", name: "Fresh Pot Dahi", rate: 320, qty: 1, unit: "KG" },
  ]);
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");

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

  return (
    <section className="py-10 lg:py-16 bg-slate-50 border-b border-slate-200/80" id="pos-sandbox">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            Try Out The Sub-Second Milk Bar Checkout
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-2xl mx-auto leading-relaxed">
            Experience our ultra-fast POS counter interface: click dairy products, adjust quantities, select payment, and generate instant receipts.
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
                <span>Pure Milk Bar ERP &bull; Touch POS Terminal</span>
              </div>
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-sm sm:max-w-md mx-3 hidden md:flex items-center justify-center bg-[#1B3E35] border border-emerald-600/30 px-3 py-1 rounded-lg text-xs font-mono text-emerald-200 truncate">
              <span className="text-emerald-400/60 mr-1 select-none">https://</span>
              <span>puremilkbar.erp/pos/touch-counter</span>
            </div>

            {/* Actions: Direct Route Link */}
            <div className="flex items-center space-x-2">
              <Link
                to="/pos"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Live Route</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Window Interior Body */}
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/60">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              {/* Left: Product Catalog Grid */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Click Products to Add to Cart:
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">1-Touch Add</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { id: "cow", name: "Cow Milk", rate: 260, unit: "per liter", icon: "🥛", source: "Farm Herd" },
                    { id: "buff", name: "Buffalo Milk", rate: 290, unit: "per liter", icon: "🍶", source: "Farm Herd" },
                    { id: "dahi", name: "Fresh Dahi", rate: 320, unit: "per kg", icon: "🥣", source: "Chilled Pot" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addPosItem({ id: p.id, name: p.name, rate: p.rate, unit: p.unit.includes("kg") ? "KG" : "L" })}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#00a86b] hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00a86b] border border-emerald-200/60">
                          {p.source}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#00a86b] transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-xs sm:text-sm font-extrabold text-[#00a86b] mt-0.5">
                          Rs. {p.rate} <span className="text-[10px] font-normal text-slate-400">/{p.unit}</span>
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-[#00a86b]">
                        <span>+ Add Item</span>
                        <Plus className="w-3.5 h-3.5 text-[#00a86b]" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Rupee-First Quick Add Pills */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                    Quick Amount Presets (Instant Conversion):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[50, 100, 200, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => addPosItem({ id: "cow", name: `Cow Milk (Rs. ${amt})`, rate: amt, unit: "Fix" })}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-[#00a86b] hover:border-emerald-200 text-xs font-bold text-slate-700 transition cursor-pointer border border-transparent"
                      >
                        Rs. {amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Live Cart & Invoice Simulator */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-[#00a86b] border border-emerald-200/60 flex items-center justify-center font-bold text-sm">
                      🧾
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Live POS Bill Checkout</h3>
                      <p className="text-[10.5px] text-slate-400">Invoice #INV-DEMO-01</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPosItems([])}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {posItems.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Cart is empty. Click a product on the left to add items.
                    </div>
                  ) : (
                    posItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-[10.5px] text-slate-500">
                            Rs. {item.rate} &times; {item.qty} {item.unit} = <strong className="text-slate-900">Rs. {item.rate * item.qty}</strong>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updatePosQty(item.id, -1)}
                            className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-700 text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold w-4 text-center text-xs text-slate-900">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updatePosQty(item.id, 1)}
                            className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-slate-700 text-xs cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removePosItem(item.id)}
                            className="text-slate-400 hover:text-rose-500 ml-1.5 text-sm cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Payment Method:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {["cash", "khata", "online"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPosPaymentMethod(m)}
                        className={`py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                          posPaymentMethod === m
                            ? "bg-[#00a86b] text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {m === "online" ? "JazzCash" : m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-800 font-semibold block">Total Payable</span>
                    <span className="text-2xl font-extrabold text-[#00a86b] font-mono">
                      Rs. {posSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to="/pos"
                    className="bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Full POS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
