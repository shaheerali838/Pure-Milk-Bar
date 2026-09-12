import React, { useState } from "react";
import { Droplets, Plus, Search } from "lucide-react";
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

const entries = [
  { id: "MLK-001", tag: "COW-1042", shift: "Morning", qty: 14.2, fat: "4.3%", snf: "8.7%", time: "06:30 AM", date: "2026-09-10" },
  { id: "MLK-002", tag: "COW-1088", shift: "Morning", qty: 11.0, fat: "4.1%", snf: "8.5%", time: "06:45 AM", date: "2026-09-10" },
  { id: "MLK-003", tag: "BUF-0212", shift: "Morning", qty: 7.1,  fat: "6.8%", snf: "9.1%", time: "07:00 AM", date: "2026-09-10" },
  { id: "MLK-004", tag: "COW-1042", shift: "Evening", qty: 14.2, fat: "4.4%", snf: "8.6%", time: "05:00 PM", date: "2026-09-10" },
  { id: "MLK-005", tag: "COW-1088", shift: "Evening", qty: 11.1, fat: "4.2%", snf: "8.5%", time: "05:15 PM", date: "2026-09-10" },
  { id: "MLK-006", tag: "BUF-0212", shift: "Evening", qty: 7.1,  fat: "6.9%", snf: "9.0%", time: "05:30 PM", date: "2026-09-10" },
];

export default function MilkingRegister() {
  const [search, setSearch] = useState("");
  const filtered = entries.filter(e => e.tag.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()));
  const total = entries.reduce((s, e) => s + e.qty, 0).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-800 mb-0.5">Milking Register</h3>
          <p className="text-sm text-slate-500">Total yield today: <strong className="tabular">{total} L</strong> across {entries.length} sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 h-[34px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search tag or ID..." value={search} onChange={e => setSearch(e.target.value)} className="border-none outline-none bg-transparent text-[13px] text-slate-700 w-[160px]" />
          </div>
          <Button className="flex items-center gap-1.5 px-4 h-[34px] rounded-full text-white text-[13px] font-semibold" style={{ background: "#155dfc" }}>
            <Plus className="w-3.5 h-3.5" /> Add Entry
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
        <Table className="w-full border-collapse text-[13px]">
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              {["Entry ID", "Animal Tag", "Shift", "Quantity", "Fat %", "SNF %", "Time", "Date"].map(h => (
                <TableHead key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => (
              <TableRow key={e.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
                <TableCell className="px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 font-mono text-[12px] font-bold text-slate-800 tabular">
                    <Droplets className="w-3 h-3" style={{ color: "#155dfc" }} />{e.id}
                  </span>
                </TableCell>
                <TableCell className="px-3.5 py-2.5 font-bold text-slate-900 tabular">{e.tag}</TableCell>
                <TableCell className="px-3.5 py-2.5">
                  <Badge variant="outline" className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold border-0 " + (e.shift === "Morning" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-100")}>
                    {e.shift}
                  </Badge>
                </TableCell>
                <TableCell className="px-3.5 py-2.5 font-bold text-slate-900 tabular">{e.qty} L</TableCell>
                <TableCell className="px-3.5 py-2.5 font-semibold text-blue-600 tabular">{e.fat}</TableCell>
                <TableCell className="px-3.5 py-2.5 font-semibold text-violet-600 tabular">{e.snf}</TableCell>
                <TableCell className="px-3.5 py-2.5 text-slate-600 tabular">{e.time}</TableCell>
                <TableCell className="px-3.5 py-2.5 text-slate-600 tabular">{e.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
