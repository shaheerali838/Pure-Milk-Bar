import React from "react";
import { Users, Plus } from "lucide-react";
import { useCustomerContext } from "../../../../context/CustomerContext";
import CustomerDeliveryNav from "../CustomerDeliveryNav";

export default function CustomerHeader({
  onOpenAddModal,
  title = "Customers & Accounts Management",
  subtitle,
  badge = "Active Directory",
  icon: Icon = Users,
  iconBg = "bg-purple-600",
  showAddButton = true,
  showNav = true,
}) {
  const { allCustomersCount = 0, totalKhataReceivable = 0 } =
    useCustomerContext() || {};

  const displaySubtitle =
    subtitle ||
    `${allCustomersCount} Accounts · Rs. ${totalKhataReceivable.toLocaleString()} Khata`;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {displaySubtitle}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                {badge}
              </span>
            </div>
          </div>
        </div>

        {showAddButton && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-3" />
            <span>Add New Customer</span>
          </button>
        )}
      </div>

      {/* Navigation pills directly below the heading */}
      {showNav && <CustomerDeliveryNav />}
    </div>
  );
}
