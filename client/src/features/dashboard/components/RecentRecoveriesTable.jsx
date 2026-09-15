import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useLedgerContext } from '@/context/LedgerContext';

export default function RecentRecoveriesTable() {
  const { customers = [], rawCustomers = [] } = useCustomerContext() || {};
  const { ledgers = {} } = useLedgerContext() || {};

  const allCusts = rawCustomers.length > 0 ? rawCustomers : customers;
  const customerMap = {};
  allCusts.forEach((c) => {
    customerMap[String(c.id)] = c;
  });

  // Extract all credit (payment recovery) entries across all customers
  const allRecoveries = [];

  Object.entries(ledgers).forEach(([customerId, entries]) => {
    if (Array.isArray(entries)) {
      const cust = customerMap[String(customerId)] || { name: `Customer #${customerId}`, phone: '' };
      entries.forEach((entry) => {
        if (Number(entry.credit) > 0) {
          allRecoveries.push({
            id: entry.id || `${customerId}-${entry.date}-${entry.credit}`,
            customerId,
            customerName: cust.name,
            customerPhone: cust.phone,
            date: entry.date || new Date().toISOString().split('T')[0],
            amount: Number(entry.credit) || 0,
            method: entry.method || 'Cash',
            description: entry.description || 'Payment Received',
          });
        }
      });
    }
  });

  // Sort newest first and take top 6
  allRecoveries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentList = allRecoveries.slice(0, 6);

  return (
    <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                Recent Recoveries
              </h3>
              <p className="text-[11px] text-slate-400">
                Latest customer payments &amp; dues collected
              </p>
            </div>
          </div>
          <Link
            to="/finance/customer"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto py-1">
          <Table className="w-full text-xs">
            <TableHeader>
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="py-2 px-2 text-left font-bold text-slate-400 text-[10px] uppercase">
                  Date
                </TableHead>
                <TableHead className="py-2 px-2 text-left font-bold text-slate-400 text-[10px] uppercase">
                  Customer
                </TableHead>
                <TableHead className="py-2 px-2 text-right font-bold text-slate-400 text-[10px] uppercase">
                  Amount
                </TableHead>
                <TableHead className="py-2 px-2 text-right font-bold text-slate-400 text-[10px] uppercase">
                  Method
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No customer recoveries recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentList.map((rec) => (
                  <TableRow key={rec.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60">
                    <TableCell className="py-2 px-2 font-mono text-[11px] text-slate-500 tabular">
                      {rec.date}
                    </TableCell>
                    <TableCell className="py-2 px-2 font-bold text-slate-800">
                      <div>{rec.customerName}</div>
                      {rec.customerPhone && (
                        <div className="text-[10px] text-slate-400 font-normal">{rec.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-2 px-2 text-right font-black text-emerald-700 tabular">
                      Rs. {rec.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2 px-2 text-right">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-50 border-slate-200 text-slate-600"
                      >
                        {rec.method}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {recentList.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Showing latest {recentList.length} recoveries</span>
          <Link
            to="/finance/customer"
            className="font-bold text-slate-700 hover:text-emerald-700 transition"
          >
            Open Customer Finance &rarr;
          </Link>
        </div>
      )}
    </Card>
  );
}
