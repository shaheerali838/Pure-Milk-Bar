import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Supplier() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800 font-display">Supplier &amp; Farmer Ledger</h3>
        <p className="text-sm text-slate-500">Manage dairy suppliers, routes, and milk procurement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Registered Farmers</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2 tabular">48 Farmers</p>
        </Card>

        <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Monthly Procurement Volume</p>
          <p className="text-3xl font-bold text-blue-600 mt-2 tabular">74,200 Liters</p>
        </Card>

        <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending Settlement</p>
          <p className="text-3xl font-bold text-amber-600 mt-2 tabular">$1,440.00</p>
        </Card>
      </div>

      <Card className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4 font-display">Supplier Directory</h4>
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-sm">
            <TableHeader className="bg-slate-50 text-slate-600 uppercase text-xs">
              <TableRow>
                <TableHead className="p-3">Supplier ID</TableHead>
                <TableHead className="p-3">Farmer Name</TableHead>
                <TableHead className="p-3">Route / Village</TableHead>
                <TableHead className="p-3">Daily Avg (L)</TableHead>
                <TableHead className="p-3">Rate / Liter</TableHead>
                <TableHead className="p-3">Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-slate-700">
              <TableRow>
                <TableCell className="p-3 font-semibold text-slate-900 tabular">SUP-101</TableCell>
                <TableCell className="p-3 font-medium font-display">Rahim Ullah Dairy</TableCell>
                <TableCell className="p-3">Green Meadows</TableCell>
                <TableCell className="p-3 font-semibold tabular">45.0 L</TableCell>
                <TableCell className="p-3 tabular">$1.20</TableCell>
                <TableCell className="p-3"><span className="text-emerald-600 font-semibold">Settled</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="p-3 font-semibold text-slate-900 tabular">SUP-102</TableCell>
                <TableCell className="p-3 font-medium font-display">Gulzar Agro Farms</TableCell>
                <TableCell className="p-3">North Valley</TableCell>
                <TableCell className="p-3 font-semibold tabular">65.0 L</TableCell>
                <TableCell className="p-3 tabular">$1.35</TableCell>
                <TableCell className="p-3"><span className="text-amber-600 font-semibold">Pending</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="p-3 font-semibold text-slate-900 tabular">SUP-103</TableCell>
                <TableCell className="p-3 font-medium font-display">Highland Pure Milk Co.</TableCell>
                <TableCell className="p-3">Highland Farms</TableCell>
                <TableCell className="p-3 font-semibold tabular">80.0 L</TableCell>
                <TableCell className="p-3 tabular">$1.25</TableCell>
                <TableCell className="p-3"><span className="text-emerald-600 font-semibold">Settled</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

