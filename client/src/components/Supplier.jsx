import React from 'react';

export default function Supplier() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-bold text-slate-800">Supplier & Farmer Ledger</h3>
        <p className="text-sm text-slate-500">Manage dairy suppliers, routes, and milk procurement</p>
      </div>

      {/* Supplier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Registered Farmers</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">48 Farmers</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Monthly Procurement Volume</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">74,200 Liters</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending Settlement</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">$1,440.00</p>
        </div>
      </div>

      {/* Supplier Directory Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4">Supplier Directory</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-3">Supplier ID</th>
                <th className="p-3">Farmer Name</th>
                <th className="p-3">Route / Village</th>
                <th className="p-3">Daily Avg (L)</th>
                <th className="p-3">Rate / Liter</th>
                <th className="p-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-semibold text-slate-900">SUP-101</td>
                <td className="p-3 font-medium">Rahim Ullah Dairy</td>
                <td className="p-3">Green Meadows</td>
                <td className="p-3 font-semibold">45.0 L</td>
                <td className="p-3">$1.20</td>
                <td className="p-3"><span className="text-emerald-600 font-semibold">Settled</span></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">SUP-102</td>
                <td className="p-3 font-medium">Gulzar Agro Farms</td>
                <td className="p-3">North Valley</td>
                <td className="p-3 font-semibold">65.0 L</td>
                <td className="p-3">$1.35</td>
                <td className="p-3"><span className="text-amber-600 font-semibold">Pending</span></td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">SUP-103</td>
                <td className="p-3 font-medium">Highland Pure Milk Co.</td>
                <td className="p-3">Highland Farms</td>
                <td className="p-3 font-semibold">80.0 L</td>
                <td className="p-3">$1.25</td>
                <td className="p-3"><span className="text-emerald-600 font-semibold">Settled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
