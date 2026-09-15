import React, { useState } from "react";
import { Layers, Plus, Search } from "lucide-react";
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

const batches = [
  { id: "DAH-2201", product: "Dahi (Plain)",  milkUsed: "120 L", output: "110 kg",     date: "2026-09-10", status: "Completed",   fat: "4.5%" },
  { id: "DAH-2202", product: "Lassi (Sweet)", milkUsed: "60 L",  output: "72 bottles", date: "2026-09-10", status: "In Progress", fat: "4.1%" },
  { id: "DAH-2203", product: "Paneer",        milkUsed: "45 L",  output: "9 kg",       date: "2026-09-09", status: "Completed",   fat: "5.0%" },
  { id: "DAH-2204", product: "Khoya / Mawa",  milkUsed: "80 L",  output: "16 kg",      date: "2026-09-09", status: "Completed",   fat: "6.2%" },
  { id: "DAH-2205", product: "Dahi (Plain)",  milkUsed: "100 L", output: "91 kg",      date: "2026-09-08", status: "Completed",   fat: "4.3%" },
];

const statusStyle = {
  "Completed":   "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "In Progress": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "Failed":      "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function DahiProcessing() {
  const [search, setSearch] = useState("");
  const filtered = batches.filter(b => b.product.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-800 mb-0.5">Dahi & Processing</h3>
          <p className="text-sm text-slate-500">Track all dahi, lassi and dairy product batches</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 h-[34px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search batch or product..." value={search} onChange={e => setSearch(e.target.value)} className="border-none outline-none bg-transparent text-[13px] text-slate-700 w-[160px]" />
          </div>
          <Button className="flex items-center gap-1.5 px-4 h-[34px] rounded-full text-white text-[13px] font-semibold" style={{ background: "#009689" }}>
            <Plus className="w-3.5 h-3.5" /> New Batch
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <Table className="w-full border-collapse text-[13px]">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              {["Batch ID", "Product", "Milk Used", "Output", "Fat %", "Date", "Status"].map(h => (
                <TableHead key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(b => (
              <TableRow key={b.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                <TableCell className="px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 tabular">
                    <Layers className="w-3 h-3" style={{ color: "#009689" }} />{b.id}
                  </span>
                </TableCell>
                <TableCell className="px-3.5 py-2.5 font-bold text-slate-900">{b.product}</TableCell>
                <TableCell className="px-3.5 py-2.5 text-slate-600 tabular">{b.milkUsed}</TableCell>
                <TableCell className="px-3.5 py-2.5 font-bold text-slate-900 tabular">{b.output}</TableCell>
                <TableCell className="px-3.5 py-2.5 font-semibold text-blue-600 tabular">{b.fat}</TableCell>
                <TableCell className="px-3.5 py-2.5 text-slate-600 tabular">{b.date}</TableCell>
                <TableCell className="px-3.5 py-2.5">
                  <Badge variant="outline" className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border-0 " + (statusStyle[b.status] || "bg-slate-100 text-slate-600")}>
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
