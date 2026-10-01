import React, { useState, useEffect } from "react";
import { Layers, Plus, Search, CheckCircle2, Clock, XCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import farmService from "../../../services/farmService.js";
import { toast } from "sonner";

export default function DahiProcessing() {
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    product: "Dahi (Plain)",
    source: "Both (Mixed)",
    milkUsed: "",
    farmMilkUsed: "",
    supplierMilkUsed: "",
    output: "",
    fat: "4.5",
    date: new Date().toISOString().split("T")[0],
    status: "Completed",
  });

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const data = await farmService.getProcessingBatches();
      const list = Array.isArray(data) ? data : data?.batches || [];
      setBatches(list);
    } catch (e) {
      console.warn("Failed to fetch processing batches from API:", e);
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleAddBatch = async (e) => {
    e.preventDefault();

    const rawMilkNum = Number(newBatch.milkUsed) || 0;
    const farmPortion = newBatch.source === 'Farm Milk' 
      ? rawMilkNum 
      : newBatch.source === 'Supplier Milk' 
        ? 0 
        : (parseFloat(newBatch.farmMilkUsed) || 0);
    const supPortion = newBatch.source === 'Supplier Milk' 
      ? rawMilkNum 
      : newBatch.source === 'Farm Milk' 
        ? 0 
        : (parseFloat(newBatch.supplierMilkUsed) || 0);

    const totalUsed = farmPortion + supPortion || rawMilkNum;
    let farmRatio = 1;
    let supplierRatio = 0;
    if (newBatch.source === 'Farm Milk') {
      farmRatio = 1;
      supplierRatio = 0;
    } else if (newBatch.source === 'Supplier Milk') {
      farmRatio = 0;
      supplierRatio = 1;
    } else {
      farmRatio = totalUsed > 0 ? Number((farmPortion / totalUsed).toFixed(4)) : 0.5;
      supplierRatio = totalUsed > 0 ? Number((supPortion / totalUsed).toFixed(4)) : 0.5;
    }

    const payload = {
      product: newBatch.product,
      source: newBatch.source || "Both (Mixed)",
      farmMilkUsed: farmPortion,
      supplierMilkUsed: supPortion,
      farmRatio,
      supplierRatio,
      milkUsed: rawMilkNum,
      milkUsedLiters: rawMilkNum,
      milkUsedQuantity: rawMilkNum,
      output: newBatch.output || `${Math.round(rawMilkNum * 0.9)} kg`,
      outputQuantity: parseFloat(newBatch.output) || Math.round(rawMilkNum * 0.9),
      fat: Number(newBatch.fat) || 4.5,
      fatPercentage: Number(newBatch.fat) || 4.5,
      date: newBatch.date || new Date().toISOString().split("T")[0],
      status: newBatch.status || "Completed",
      stage: newBatch.status === "In Progress" ? "incubating" : "pos",
    };

    setIsSubmittingBatch(true);
    try {
      const created = await farmService.createProcessingBatch(payload);
      const normalized = {
        ...created,
        id: created.batchNumber || created.id || created._id || `DAH-${Date.now()}`,
        source: payload.source,
        farmMilkUsed: payload.farmMilkUsed,
        supplierMilkUsed: payload.supplierMilkUsed,
        farmRatio: payload.farmRatio,
        supplierRatio: payload.supplierRatio,
        milkUsed: `${payload.milkUsed} L`,
        output: payload.output,
        fat: `${payload.fat}%`,
        date: payload.date,
        status: payload.status,
        stage: payload.stage,
      };

      setBatches((prev) => [normalized, ...prev]);
      window.dispatchEvent(new Event('pure_milk_bar_dahi_updated'));
      toast.success(`Processing batch for ${payload.product} created successfully!`);

      setIsModalOpen(false);
      setNewBatch({
        product: "Dahi (Plain)",
        source: "Both (Mixed)",
        milkUsed: "",
        farmMilkUsed: "",
        supplierMilkUsed: "",
        output: "",
        fat: "4.5",
        date: new Date().toISOString().split("T")[0],
        status: "Completed",
      });
    } catch (err) {
      console.error("Failed to create batch via API:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to create processing batch in database");
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const filtered = batches.filter(
    (b) =>
      b.product.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-800 mb-0.5">
            Dahi Processing
          </h3>
          <p className="text-sm text-slate-500">
            Track all dahi production batches, milk inputs, and yields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 h-8.5 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search dahi batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none bg-transparent text-[13px] text-slate-700 w-45"
            />
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 h-8.5 rounded-full text-white text-[13px] font-semibold cursor-pointer shadow-xs hover:opacity-90 transition-all"
            style={{ background: "#009689" }}
          >
            <Plus className="w-3.5 h-3.5" /> New Batch
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
        <Table className="w-full border-collapse text-[13px]">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              {["Batch ID", "Product", "Milk Used", "Output", "Fat %", "Date", "Status"].map((h) => (
                <TableHead
                  key={h}
                  className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs font-medium">
                  No dahi processing batches recorded yet. Click <strong>New Batch</strong> to start a dahi production run.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow
                  key={b.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                >
                  <TableCell className="px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 tabular">
                      <Layers className="w-3 h-3" style={{ color: "#009689" }} />
                      {b.id}
                    </span>
                  </TableCell>
                  <TableCell className="px-3.5 py-2.5 font-bold text-slate-900">{b.product}</TableCell>
                  <TableCell className="px-3.5 py-2.5 text-slate-600 tabular">{b.milkUsed}</TableCell>
                  <TableCell className="px-3.5 py-2.5 font-bold text-slate-900 tabular">{b.output}</TableCell>
                  <TableCell className="px-3.5 py-2.5 font-semibold text-blue-600 tabular">{b.fat}</TableCell>
                  <TableCell className="px-3.5 py-2.5 text-slate-600 tabular">{b.date}</TableCell>
                  <TableCell className="px-3.5 py-2.5">
                    <Badge
                      variant="outline"
                      className={
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border-0 " +
                        (statusStyle[b.status] || "bg-slate-100 text-slate-600")
                      }
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Create New Dahi Batch</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-3">
              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Dahi Type / Variant</label>
                <select
                  value={newBatch.product}
                  onChange={(e) => setNewBatch({ ...newBatch, product: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="Dahi (Plain)">Dahi (Plain)</option>
                  <option value="Dahi (Sweet / Meethi)">Dahi (Sweet / Meethi)</option>
                  <option value="Dahi (Special / Matka)">Dahi (Special / Matka)</option>
                  <option value="Dahi (Low Fat / Skimmed)">Dahi (Low Fat / Skimmed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Milk Sourcing <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newBatch.source}
                  onChange={(e) => {
                    const src = e.target.value;
                    const tot = parseFloat(newBatch.milkUsed) || 0;
                    let f = '0';
                    let s = '0';
                    if (src === 'Farm Milk') {
                      f = String(tot);
                      s = '0';
                    } else if (src === 'Supplier Milk') {
                      f = '0';
                      s = String(tot);
                    } else {
                      f = String(Math.round(tot / 2));
                      s = String(Math.max(0, tot - Math.round(tot / 2)));
                    }
                    setNewBatch({ ...newBatch, source: src, farmMilkUsed: f, supplierMilkUsed: s });
                  }}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="Both (Mixed)">Both (Mixed) — Proportional P&amp;L Ratio</option>
                  <option value="Farm Milk">Farm Milk (100% to Farm P&amp;L)</option>
                  <option value="Supplier Milk">Supplier Milk (100% to Supplier P&amp;L)</option>
                </select>
              </div>

              {/* Conditional mixed breakout fields */}
              {(newBatch.source === 'Both (Mixed)' || newBatch.source === 'Farm & Supplier Mix') && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-700">Enter Ratio Liters:</span>
                    {parseFloat(newBatch.milkUsed) > 0 && (
                      <span className="text-teal-700 text-[10.5px]">
                        Farm: {Math.round(((parseFloat(newBatch.farmMilkUsed) || 0) / (parseFloat(newBatch.milkUsed) || 1)) * 100)}% | 
                        Supplier: {Math.round(((parseFloat(newBatch.supplierMilkUsed) || 0) / (parseFloat(newBatch.milkUsed) || 1)) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-emerald-800 mb-0.5">Farm Milk (L)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 50"
                        value={newBatch.farmMilkUsed}
                        onChange={(e) => {
                          const f = parseFloat(e.target.value) || 0;
                          const s = parseFloat(newBatch.supplierMilkUsed) || 0;
                          const tot = f + s;
                          setNewBatch({
                            ...newBatch,
                            farmMilkUsed: e.target.value,
                            milkUsed: tot > 0 ? String(tot) : '',
                            output: tot > 0 ? `${Math.round(tot * 0.9)} kg` : '',
                          });
                        }}
                        className="w-full h-8 px-2 text-xs border border-emerald-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] font-bold text-blue-800 mb-0.5">Supplier Milk (L)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 50"
                        value={newBatch.supplierMilkUsed}
                        onChange={(e) => {
                          const s = parseFloat(e.target.value) || 0;
                          const f = parseFloat(newBatch.farmMilkUsed) || 0;
                          const tot = f + s;
                          setNewBatch({
                            ...newBatch,
                            supplierMilkUsed: e.target.value,
                            milkUsed: tot > 0 ? String(tot) : '',
                            output: tot > 0 ? `${Math.round(tot * 0.9)} kg` : '',
                          });
                        }}
                        className="w-full h-8 px-2 text-xs border border-blue-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Total Milk Input (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 100"
                    value={newBatch.milkUsed}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseFloat(val) || 0;
                      if (newBatch.source === 'Farm Milk') {
                        setNewBatch({ ...newBatch, milkUsed: val, farmMilkUsed: val, supplierMilkUsed: '0', output: `${Math.round(num * 0.9)} kg` });
                      } else if (newBatch.source === 'Supplier Milk') {
                        setNewBatch({ ...newBatch, milkUsed: val, farmMilkUsed: '0', supplierMilkUsed: val, output: `${Math.round(num * 0.9)} kg` });
                      } else {
                        const f = Math.round(num / 2);
                        setNewBatch({ ...newBatch, milkUsed: val, farmMilkUsed: String(f), supplierMilkUsed: String(Math.max(0, num - f)), output: `${Math.round(num * 0.9)} kg` });
                      }
                    }}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Estimated Output (kg)</label>
                  <input
                    type="text"
                    placeholder="e.g. 90 kg"
                    value={newBatch.output}
                    onChange={(e) => setNewBatch({ ...newBatch, output: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">FAT Content (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="4.5"
                    value={newBatch.fat}
                    onChange={(e) => setNewBatch({ ...newBatch, fat: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Batch Date</label>
                  <input
                    type="date"
                    value={newBatch.date}
                    onChange={(e) => setNewBatch({ ...newBatch, date: e.target.value })}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">Batch Status</label>
                <select
                  value={newBatch.status}
                  onChange={(e) => setNewBatch({ ...newBatch, status: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmittingBatch}
                  className="text-xs disabled:opacity-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingBatch}
                  className="text-xs font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                  style={{ background: "#009689" }}
                >
                  {isSubmittingBatch ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Batch...</span>
                    </>
                  ) : (
                    'Save Batch'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
