import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ArrowRight } from "lucide-react";

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
    <section className="py-10 lg:py-16 bg-slate-50 border-b border-slate-200" id="pos-sandbox">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
            Interactive POS Sandbox
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mt-2">
            Try Out The Sub-Second Milk Bar Checkout
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Add dairy items, adjust liter quantities, and see how fast sales and invoices are generated.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto w-full">
          {/* Left: Product Catalog Grid */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              Click Products to Add to Cart:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: "cow", name: "Cow Milk", rate: 260, unit: "per liter", icon: "🥛", source: "Farm Herd" },
                { id: "buff", name: "Buffalo Milk", rate: 290, unit: "per liter", icon: "🍶", source: "Farm Herd" },
                { id: "dahi", name: "Fresh Dahi", rate: 320, unit: "per kg", icon: "🥣", source: "Chilled Pot" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPosItem({ id: p.id, name: p.name, rate: p.rate, unit: p.unit.includes("kg") ? "KG" : "L" })}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {p.source}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#00a86b]">
                      {p.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-extrabold text-[#00a86b] mt-0.5">
                      Rs. {p.rate} <span className="text-[10px] font-normal text-slate-400">/{p.unit}</span>
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>+ Add Item</span>
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
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
                    onClick={() => addPosItem({ id: "cow", name: `Cow Milk (Rs. ${amt})`, rate: amt, unit: "Fix" })}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-bold text-slate-700 transition"
                  >
                    Rs. {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live Cart & Invoice Simulator */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  🧾
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Live POS Bill Checkout</h3>
                  <p className="text-[10.5px] text-slate-400">Invoice #INV-DEMO-01</p>
                </div>
              </div>
              <button
                onClick={() => setPosItems([])}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
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
                    className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10.5px] text-slate-500">
                        Rs. {item.rate} &times; {item.qty} {item.unit} = <strong className="text-slate-900">Rs. {item.rate * item.qty}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updatePosQty(item.id, -1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-4 text-center text-xs">{item.qty}</span>
                      <button
                        onClick={() => updatePosQty(item.id, 1)}
                        className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 text-xs cursor-pointer"
                      >
                        +
                      </button>
                      <button
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
                    onClick={() => setPosPaymentMethod(m)}
                    className={`py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      posPaymentMethod === m
                        ? "bg-[#00a86b] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {m === "online" ? "JazzCash" : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-semibold block">Total Payable</span>
                <span className="text-2xl font-extrabold text-[#00a86b] font-mono">
                  Rs. {posSubtotal.toLocaleString()}
                </span>
              </div>
              <Link
                to="/login"
                className="bg-[#00a86b] hover:bg-[#008f5b] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <span>Open Full POS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
