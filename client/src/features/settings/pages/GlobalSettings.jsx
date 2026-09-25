import React, { useState, useEffect } from "react";
import {
  Building2,
  Bike,
  Package,
  Banknote,
  Shield,
  Bell,
  Check,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettingsContext } from "@/context/SettingsContext";
import { useProductContext } from "@/context/ProductContext";
import { useCustomerContext } from "@/context/CustomerContext";
import { Typography } from "@/components/common/Typography";

// Tab Components
import BusinessInfoTab from "../components/BusinessInfoTab";
import FleetTab from "../components/FleetTab";
import ProductDefaultsTab from "../components/ProductDefaultsTab";
import PricingTab from "../components/PricingTab";
import RolesTab from "../components/RolesTab";
import NotificationsTab from "../components/NotificationsTab";

export default function GlobalSettings() {
  const { settings, updateSettingsSection } = useSettingsContext();
  const productCtx = useProductContext();
  const products = productCtx?.products || [];
  const batchUpdateProducts = productCtx?.batchUpdateProducts;
  const updateProduct = productCtx?.updateProduct;
  const customerCtx = useCustomerContext();
  const updateCreditLimitBatch = customerCtx?.updateCreditLimitBatch;

  const [activeTab, setActiveTab] = useState("business");
  const [showSavedAlert, setShowSavedAlert] = useState(false);

  // Local draft state for draft/save pattern
  const [draft, setDraft] = useState(() => ({
    business: { ...(settings?.business || {}) },
    productDefaults: { ...(settings?.productDefaults || {}) },
    pricing: { ...(settings?.pricing || {}) },
    notifs: { ...(settings?.notifs || {}) },
  }));

  // Sync draft when settings change from outside
  useEffect(() => {
    if (settings) {
      setDraft({
        business: { ...(settings.business || {}) },
        productDefaults: { ...(settings.productDefaults || {}) },
        pricing: { ...(settings.pricing || {}) },
        notifs: { ...(settings.notifs || {}) },
      });
    }
  }, [settings]);

  // Handlers for draft changes
  const handleBusinessChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      business: { ...prev.business, [field]: value },
    }));
  };

  const handleProductDefaultsChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      productDefaults: { ...prev.productDefaults, [field]: value },
    }));
  };

  const handlePricingChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  };

  const handleNotifsChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      notifs: { ...prev.notifs, [field]: value },
    }));
  };

  // Save changes handler with real Pricing → Products sync
  const handleSaveChanges = () => {
    // 1. Persist draft sections to SettingsContext & Database Backend
    updateSettingsSection("business", draft.business);
    updateSettingsSection("productDefaults", draft.productDefaults);
    updateSettingsSection("pricing", draft.pricing);
    updateSettingsSection("notifs", draft.notifs);

    const cowRate = Number(draft.pricing.defaultCowMilkRate) || 0;
    const buffaloRate = Number(draft.pricing.defaultBuffaloMilkRate) || 0;
    const maxCredit = Number(draft.pricing.maxCustomerCreditLimit) || 0;

    // 2. Real cross-context sync: Pricing → Products
    if (batchUpdateProducts) {
      batchUpdateProducts((prevProducts) => {
        let list = Array.isArray(prevProducts) ? [...prevProducts] : [];
        let cowMatched = false;
        let buffaloMatched = false;

        list = list.map((p) => {
          const nameLower = (p.name || "").toLowerCase();
          const catLower = (p.category || "").toLowerCase();

          // Cow milk match (by name or category containing 'cow')
          if (
            cowRate > 0 &&
            (nameLower.includes("cow") || catLower.includes("cow"))
          ) {
            cowMatched = true;
            return {
              ...p,
              price: cowRate,
            };
          }

          // Buffalo milk match (by name or category containing 'buffalo')
          if (
            buffaloRate > 0 &&
            (nameLower.includes("buffalo") || catLower.includes("buffalo"))
          ) {
            buffaloMatched = true;
            return {
              ...p,
              price: buffaloRate,
            };
          }

          return p;
        });

        const defaultUnit =
          draft.productDefaults?.defaultUnit === "kg" ? "per kg" : "per liter";

        // If no cow product exists in list yet, but cowRate is specified (>0), create one
        if (cowRate > 0 && !cowMatched) {
          list.push({
            id: "PRD-COW-01",
            sku: "PRD-COW-01",
            name: "Pure Cow Milk",
            category: "Milk",
            unit: defaultUnit,
            price: cowRate,
            cost: Math.round(cowRate * 0.8),
            status: "Active",
            barcode: "890100101",
            storage: "Refrigerated Chiller (0 - 4 °C)",
            frequency: "Daily Morning & Evening Batches",
            description: "Fresh pure cow milk",
          });
        }

        // If no buffalo product exists in list yet, but buffaloRate is specified (>0), create one
        if (buffaloRate > 0 && !buffaloMatched) {
          list.push({
            id: "PRD-BUF-01",
            sku: "PRD-BUF-01",
            name: "Pure Buffalo Milk",
            category: "Milk",
            unit: defaultUnit,
            price: buffaloRate,
            cost: Math.round(buffaloRate * 0.8),
            status: "Active",
            barcode: "890100102",
            storage: "Refrigerated Chiller (0 - 4 °C)",
            frequency: "Daily Morning & Evening Batches",
            description: "High fat fresh buffalo milk",
          });
        }

        return list;
      });
    } else if (
      updateProduct &&
      Array.isArray(products) &&
      products.length > 0
    ) {
      // Fallback if batch updater not available
      products.forEach((p) => {
        const nameLower = (p.name || "").toLowerCase();
        const catLower = (p.category || "").toLowerCase();
        if (
          cowRate > 0 &&
          (nameLower.includes("cow") || catLower.includes("cow"))
        ) {
          updateProduct({ ...p, price: cowRate });
        }
        if (
          buffaloRate > 0 &&
          (nameLower.includes("buffalo") || catLower.includes("buffalo"))
        ) {
          updateProduct({ ...p, price: buffaloRate });
        }
      });
    }

    // 3. Customer credit limit sync
    if (updateCreditLimitBatch && maxCredit > 0) {
      updateCreditLimitBatch(maxCredit);
    }

    // 4. Trigger notification
    setShowSavedAlert(true);
    setTimeout(() => setShowSavedAlert(false), 4000);
    toast.success(
      "Changes saved! Global settings & configurations updated successfully.",
    );
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Success Notification Banner */}
      {showSavedAlert && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-emerald-900 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>
              <strong>Changes Saved:</strong> Global configurations and prices
              have been saved and applied across the entire system.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSavedAlert(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Typography
              variant="h3"
              className="font-bold text-slate-900 tracking-tight text-xl font-display"
            >
              Global ERP Settings
            </Typography>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Config
            </span>
          </div>
          <Typography
            variant="bodySmall"
            color="muted"
            className="text-xs text-slate-500"
          >
            Configure business info, product defaults, live delivery fleet,
            pricing rules, and notification alerts
          </Typography>
        </div>

        <Button
          type="button"
          onClick={handleSaveChanges}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00a86b] hover:bg-[#008f5a] text-white text-xs font-bold shadow-xs transition-all duration-150 cursor-pointer h-8 shrink-0"
        >
          <Save className="w-3.5 h-3.5 stroke-[2.5]" />
          Save Changes
        </Button>
      </div>

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-3"
      >
        <TabsList className="bg-slate-100 p-0.5 rounded-xl h-auto flex flex-wrap gap-1 border border-slate-200/60 justify-start">
          <TabsTrigger
            value="business"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Business Info</span>
          </TabsTrigger>

          <TabsTrigger
            value="fleet"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery Fleet</span>
          </TabsTrigger>

          <TabsTrigger
            value="products"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Defaults</span>
          </TabsTrigger>

          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Pricing &amp; Credit</span>
          </TabsTrigger>

          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>User Roles</span>
          </TabsTrigger>

          <TabsTrigger
            value="notifs"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-xs font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Business Info */}
        <TabsContent
          value="business"
          className="mt-0 focus-visible:outline-none"
        >
          <BusinessInfoTab
            data={draft.business}
            onChange={handleBusinessChange}
          />
        </TabsContent>

        {/* Tab 2: Delivery Fleet */}
        <TabsContent value="fleet" className="mt-0 focus-visible:outline-none">
          <FleetTab />
        </TabsContent>

        {/* Tab 3: Product Defaults */}
        <TabsContent
          value="products"
          className="mt-0 focus-visible:outline-none"
        >
          <ProductDefaultsTab
            data={draft.productDefaults}
            onChange={handleProductDefaultsChange}
          />
        </TabsContent>

        {/* Tab 4: Pricing & Credit */}
        <TabsContent
          value="pricing"
          className="mt-0 focus-visible:outline-none"
        >
          <PricingTab data={draft.pricing} onChange={handlePricingChange} />
        </TabsContent>

        {/* Tab 5: User Roles */}
        <TabsContent value="roles" className="mt-0 focus-visible:outline-none">
          <RolesTab />
        </TabsContent>

        {/* Tab 6: Notifications */}
        <TabsContent value="notifs" className="mt-0 focus-visible:outline-none">
          <NotificationsTab data={draft.notifs} onChange={handleNotifsChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
