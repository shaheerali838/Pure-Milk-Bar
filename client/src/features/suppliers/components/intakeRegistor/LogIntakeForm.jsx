import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Droplets,
  Save,
  AlertCircle,
  Calendar,
  Clock,
  User,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import { useIntakeContext } from "@/context/IntakeContext";
import { useSupplierContext } from "@/context/SupplierContext";
import { Button } from "@/components/ui/button";

// Form to log or edit single supplier milk intake entries
export default function LogIntakeForm({ onCancel, editItem = null }) {
  const { addIntake, updateIntake } = useIntakeContext();
  const { suppliers = [] } = useSupplierContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFullyPaid = Boolean(
    editItem &&
      (editItem.settlement === "Paid" ||
        editItem.settlement === "Full" ||
        editItem.status === "Paid" ||
        (Number(editItem.totalCost || editItem.totalAmount || 0) > 0 &&
          Number(editItem.paidAmount || editItem.amountPaid || 0) >=
            Number(editItem.totalCost || editItem.totalAmount || 0)))
  );

  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    area: "",
    date: new Date().toISOString().split("T")[0],
    shift: "Morning",
    quantity: "",
    ratePerLiter: "228",
    fat: "4.5",
    lr: "28.5",
    settlement: "Pending",
    receivedBy: "Farhan (Lab Incharge)",
    notes: "",
  });

  // Prepopulate when editItem changes or on initial mount
  useEffect(() => {
    if (editItem) {
      setFormData({
        supplierId: editItem.supplierId || "",
        supplierName: editItem.supplierName || "",
        area: editItem.area || "",
        date: editItem.date || new Date().toISOString().split("T")[0],
        shift: editItem.shift || "Morning",
        quantity:
          editItem.quantity !== undefined ? String(editItem.quantity) : "",
        ratePerLiter:
          editItem.ratePerLiter !== undefined
            ? String(editItem.ratePerLiter)
            : "228",
        fat: editItem.fat !== undefined ? String(editItem.fat) : "4.5",
        lr: editItem.lr !== undefined ? String(editItem.lr) : "28.5",
        settlement: editItem.settlement || "Pending",
        receivedBy: editItem.receivedBy || "Farhan (Lab Incharge)",
        notes: editItem.notes || "",
      });
    } else {
      const firstSupplier =
        suppliers.find((s) => s.status === "Active") || suppliers[0];
      setFormData({
        supplierId: firstSupplier ? firstSupplier.id : "",
        supplierName: firstSupplier ? firstSupplier.name : "",
        area: firstSupplier ? firstSupplier.area : "",
        date: new Date().toISOString().split("T")[0],
        shift: "Morning",
        quantity: "",
        ratePerLiter:
          firstSupplier && firstSupplier.ratePerLiter
            ? String(firstSupplier.ratePerLiter)
            : "228",
        fat: "4.5",
        lr: "28.5",
        settlement: "Pending",
        receivedBy: "Farhan (Lab Incharge)",
        notes: "",
      });
    }
  }, [editItem, suppliers]);

  // Handle supplier dropdown selection
  const handleSupplierChange = (e) => {
    const chosenId = e.target.value;
    const matched = suppliers.find((s) => s.id === chosenId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        supplierId: matched.id,
        supplierName: matched.name,
        area: matched.area || "",
        ratePerLiter: matched.ratePerLiter
          ? String(matched.ratePerLiter)
          : prev.ratePerLiter,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        supplierId: chosenId,
        supplierName: chosenId,
      }));
    }
  };

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplierId);
  const expectedQuota = selectedSupplier
    ? formData.shift === "Evening"
      ? parseFloat(selectedSupplier.avgEvening) ||
        parseFloat(selectedSupplier.avgLiters) ||
        parseFloat(selectedSupplier.expectedLiters) ||
        0
      : parseFloat(selectedSupplier.avgMorning) ||
        parseFloat(selectedSupplier.avgLiters) ||
        parseFloat(selectedSupplier.expectedLiters) ||
        0
    : 0;

  const qty = parseFloat(formData.quantity) || 0;
  const rate = parseFloat(formData.ratePerLiter) || 0;
  const totalPurchaseCost = parseFloat((qty * rate).toFixed(2));

  const margin =
    expectedQuota > 0 && qty > 0
      ? parseFloat((qty - expectedQuota).toFixed(2))
      : 0;

  const handleAdjustQty = (delta) => {
    const current = parseFloat(formData.quantity) || expectedQuota || 0;
    const updated = Math.max(0.1, parseFloat((current + delta).toFixed(2)));
    setFormData((prev) => ({ ...prev, quantity: String(updated) }));
  };

  const handleSetExpected = () => {
    if (expectedQuota > 0) {
      setFormData((prev) => ({ ...prev, quantity: String(expectedQuota) }));
    }
  };

  const fatVal = parseFloat(formData.fat) || 0;
  const lrVal = parseFloat(formData.lr) || 0;
  const snfPreview = (lrVal / 4 + 0.25 * fatVal + 0.35).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplierName) {
      alert("Please select or specify a supplier.");
      return;
    }
    if (qty <= 0) {
      alert("Please enter a valid milk quantity in liters.");
      return;
    }

    const payload = {
      ...formData,
      quantity: qty,
      ratePerLiter: rate,
      totalCost: totalPurchaseCost,
      paidAmount: editItem ? editItem.paidAmount || 0 : 0,
      pendingAmount: editItem
        ? Math.max(0, totalPurchaseCost - (editItem.paidAmount || 0))
        : totalPurchaseCost,
      settlement: editItem ? editItem.settlement || "Pending" : "Pending",
    };

    setIsSubmitting(true);
    try {
      if (editItem) {
        updateIntake(editItem.id, payload);
      } else {
        addIntake(payload);
      }
      if (onCancel) onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 no-scrollbar">
      {/* Top action & header bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Intake Register
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              {editItem ? "Edit Intake Slip" : "Log Single Milk Intake"}
            </h1>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            editItem
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              editItem ? "bg-blue-500" : "bg-emerald-500 animate-pulse"
            }`}
          />
          {editItem ? "Editing Intake Slip" : "New Intake Slip"}
        </span>
      </div>

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-2xs no-scrollbar">
        <form
          id="log-intake-form"
          onSubmit={handleSubmit}
          className="space-y-4 w-full"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-slate-800 font-bold text-sm font-display">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Supplier Milk Collection Intake</span>
            </div>
            {formData.area && (
              <span className="text-xs text-slate-500 font-normal">
                Collection Route:{" "}
                <strong className="text-slate-800 font-semibold">
                  {formData.area}
                </strong>
              </span>
            )}
          </div>

          {isFullyPaid && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Fully Settled Intake Slip:</span> Payment for this delivery has already been completed in full (Rs. {Number(editItem.paidAmount || editItem.totalCost || 0).toLocaleString()}). Volume, rate, supplier, and shift fields are locked to prevent financial reconciliation discrepancies.
              </div>
            </div>
          )}

          {/* Row 1: Supplier, Date, and Shift */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Select Supplier (6 cols) */}
            <div className="md:col-span-6">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1 flex items-center justify-between">
                <span>Registered Supplier *</span>
                {isFullyPaid && <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Locked (Paid)</span>}
              </label>
              {suppliers.length === 0 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    No suppliers in directory yet. Please add a supplier first.
                  </span>
                </div>
              ) : (
                <select
                  required
                  disabled={isFullyPaid}
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  className={`w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold transition-colors shadow-2xs ${
                    isFullyPaid
                      ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "text-slate-900 bg-white outline-none focus:border-blue-600 cursor-pointer"
                  }`}
                >
                  <option value="" disabled>
                    -- Select Registered Supplier from Directory --
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} • Route: {s.area} • Agreed: Rs. {s.ratePerLiter}
                      /L
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Intake Date (3 cols) */}
            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Intake Date *
              </label>
              <div
                className={`flex items-center gap-2 border border-slate-200 rounded-xl px-3 h-10 ${
                  isFullyPaid ? "bg-slate-100 cursor-not-allowed" : "bg-slate-50"
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="date"
                  required
                  disabled={isFullyPaid}
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full bg-transparent border-none outline-none text-xs font-semibold ${
                    isFullyPaid ? "text-slate-500 cursor-not-allowed" : "text-slate-900 cursor-pointer"
                  }`}
                />
              </div>
            </div>

            {/* Collection Shift (3 cols) */}
            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Collection Shift *
              </label>
              <select
                disabled={isFullyPaid}
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
                className={`w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs ${
                  isFullyPaid
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "text-slate-900 bg-white outline-none focus:border-blue-600 cursor-pointer"
                }`}
              >
                <option value="Morning">Morning Shift (Early)</option>
                <option value="Evening">Evening Shift (Dusk)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity, Agreed Rate, Receiver, and Remarks (4 equal columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <span>Delivered Liters *</span>
                  {isFullyPaid && <Lock className="w-3 h-3 text-emerald-700" />}
                </label>
                {!isFullyPaid && expectedQuota > 0 && (
                  <button
                    type="button"
                    onClick={handleSetExpected}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    title="Click to fill supplier's standard expected quota"
                  >
                    Expected: {expectedQuota} L
                  </button>
                )}
              </div>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                disabled={isFullyPaid}
                readOnly={isFullyPaid}
                placeholder="e.g. 20.0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className={`w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-black shadow-2xs tabular ${
                  isFullyPaid
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "text-slate-900 bg-white outline-none focus:border-blue-600"
                }`}
              />

              {/* Quick +/- Margin Adjustment Chips & Variance Feedback */}
              <div className="mt-1.5 flex items-center justify-between gap-1 flex-wrap">
                {!isFullyPaid && (
                  <div className="flex items-center gap-1">
                    {[-1, -0.5, 0.5, 1].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => handleAdjustQty(delta)}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                          delta > 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {delta > 0 ? `+${delta}L` : `${delta}L`}
                      </button>
                    ))}
                  </div>
                )}

                {expectedQuota > 0 && qty > 0 && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      margin > 0
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : margin < 0
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}
                  >
                    {margin > 0
                      ? `+${margin}L More`
                      : margin < 0
                        ? `${margin}L Less`
                        : "Exact"}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1 flex items-center justify-between">
                <span>Agreed Rate (Rs. / L) *</span>
                {isFullyPaid && <Lock className="w-3 h-3 text-emerald-700" />}
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                disabled={isFullyPaid}
                readOnly={isFullyPaid}
                placeholder="Enter rate"
                value={formData.ratePerLiter}
                onChange={(e) =>
                  setFormData({ ...formData, ratePerLiter: e.target.value })
                }
                className={`w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm font-bold shadow-2xs tabular ${
                  isFullyPaid
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "text-slate-900 bg-white outline-none focus:border-blue-600"
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Received &amp; Tested By
              </label>
              <input
                type="text"
                placeholder="Enter receiver name"
                value={formData.receivedBy}
                onChange={(e) =>
                  setFormData({ ...formData, receivedBy: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="Enter notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Row 3: Full-Width Streamlined Delivery Cost Summary Banner */}
          <div className="p-3.5 rounded-xl bg-linear-to-r from-emerald-50 via-emerald-100/40 to-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Delivery Payable Amount
              </span>
              <p className="text-xs text-emerald-700 font-medium">
                {qty > 0 && rate > 0
                  ? `${qty} Liters × Rs. ${rate.toFixed(2)}/L • Total: Rs. ${totalPurchaseCost.toLocaleString()}`
                  : "Enter quantity and rate to calculate total"}
              </p>
            </div>
            {expectedQuota > 0 && qty > 0 && (
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Delivery Margin vs Expected ({expectedQuota} L)
                </span>
                <span
                  className={`text-xs font-bold ${
                    margin > 0
                      ? "text-emerald-700"
                      : margin < 0
                        ? "text-amber-700"
                        : "text-blue-700"
                  }`}
                >
                  {margin > 0
                    ? `+${margin} L (+${((margin / expectedQuota) * 100).toFixed(1)}% Surplus)`
                    : margin < 0
                      ? `${margin} L (${((margin / expectedQuota) * 100).toFixed(1)}% Shortage)`
                      : "0.0 L (Exact Quota Match)"}
                </span>
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{editItem ? "Updating Intake..." : "Saving Milk Intake..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{editItem ? "Update Intake Slip" : "Save Milk Intake"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
