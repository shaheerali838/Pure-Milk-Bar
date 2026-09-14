import React from "react";
import { FileText, Droplets, Receipt, Layers, Beef } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";

const today = new Date().toLocaleDateString("en-PK", {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
});

const sections = [
  {
    title: "Morning Milking", icon: Droplets, color: "#155dfc",
    rows: [["COW-1042","14.2 L","4.3% Fat","8.7% SNF"],["COW-1088","11.0 L","4.1% Fat","8.5% SNF"],["BUF-0212","7.1 L","6.8% Fat","9.1% SNF"]],
    footer: "Total Morning: 32.3 L",
  },
  {
    title: "Evening Milking", icon: Droplets, color: "#009966",
    rows: [["COW-1042","14.2 L","4.4% Fat","8.6% SNF"],["COW-1088","11.1 L","4.2% Fat","8.5% SNF"],["BUF-0212","7.1 L","6.9% Fat","9.0% SNF"]],
    footer: "Total Evening: 32.4 L",
  },
  {
    title: "Processing Done", icon: Layers, color: "#009689",
    rows: [["DAH-2201","Dahi (Plain)","120 L used","110 kg output"],["DAH-2202","Lassi (Sweet)","60 L used","72 bottles"]],
    footer: "Total milk processed: 180 L",
  },
  {
    title: "Today's Expenses", icon: Receipt, color: "#4f39f6",
    rows: [["EXP-001","Green fodder","500 kg","Rs. 12,500"],["EXP-002","Vaccination","20 animals","Rs. 8,000"]],
    footer: "Total expenses today: Rs. 20,500",
  },
];

export default function DailySheet() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display flex items-center gap-2 text-base font-bold text-slate-800 mb-0.5">
            <FileText className="w-[18px] h-[18px] text-amber-500" /> Daily Sheet
          </h3>
          <p className="text-sm text-slate-500">{today}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[12px] font-medium border-0 tabular">
            <Droplets className="w-3.5 h-3.5" /> Total Milk: <strong>64.7 L</strong>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[12px] font-medium border-0 tabular">
            <Beef className="w-3.5 h-3.5" /> Animals: <strong>6</strong>
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-[12px] font-medium border-0 tabular">
            <Receipt className="w-3.5 h-3.5" /> Expenses: <strong>Rs. 20,500</strong>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map(({ title, icon: Icon, color, rows, footer }) => (
          <Card key={title} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-none">
            <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-100 text-[13px] font-bold" style={{ color }}>
              <Icon className="w-[14px] h-[14px]" style={{ color }} /> {title}
            </div>
            <Table className="w-full text-[13px]">
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60">
                    {row.map((cell, j) => (
                      <TableCell key={j} className={"px-3.5 py-2 text-slate-700 tabular" + (j === 0 ? " font-mono text-[12px] font-bold text-slate-900" : "")}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[12px] font-bold tabular" style={{ color }}>{footer}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
