import React from "react";
import { CheckCircle2, ShieldCheck, Activity, Zap } from "lucide-react";

export default function LandingTrustTicker() {
  return (
    <div className="bg-[#14332D] text-slate-200 py-3 border-y border-[#234941] text-xs font-semibold overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-around gap-4 text-center">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#5BBB7B]" />
          <span>50,000+ Liters Reconciled Daily</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5BBB7B]" />
          <span>99.98% Mass-Balance Precision</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#5BBB7B]" />
          <span>Zero Khata Bad Debts</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#5BBB7B]" />
          <span>100% Offline Resilience</span>
        </div>
      </div>
    </div>
  );
}
