import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LandingTestimonialsFAQ() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-10 lg:py-16 bg-slate-50 border-t border-slate-200/80" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Testimonials Column */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
                Customer Success
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
                Trusted by Dairy Owners
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Over 40+ commercial dairy operations eliminated shrinkage and automated Khata.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 space-y-2.5 shadow-xs hover:shadow-md transition">
                <div className="flex items-center gap-1 text-amber-500 text-xs sm:text-sm">
                  {"★★★★★"}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "Pure Milk Bar's mass-balance audit brought our 30L daily shrinkage down to zero within the first week."
                </p>
                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                    MA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Malik Asif Dairy Farm</h4>
                    <p className="text-[10px] text-slate-500">Model Town, Lahore</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 space-y-2.5 shadow-xs hover:shadow-md transition">
                <div className="flex items-center gap-1 text-amber-500 text-xs sm:text-sm">
                  {"★★★★★"}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "The automated supplier milk pricing and instant voucher calculation saved us thousands in billing errors and WhatsApp Khata ended all ledger disputes."
                </p>
                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                    CK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Chaudhry Kamran Milk Bar</h4>
                    <p className="text-[10px] text-slate-500">Faisalabad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: FAQ Accordion Column */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a86b] bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200/60">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2.5">
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
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-4 py-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-3.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
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
  );
}
