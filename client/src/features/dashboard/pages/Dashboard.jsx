import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-bold text-slate-800">Dashboard Overview</h3>
        <p className="text-sm text-slate-500">Welcome to Pur Milk Bar daily dairy metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Milk Collected Today</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">3,840 Liters</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Average Fat Content</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">4.2%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Suppliers Today</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">48 Farmers</p>
        </div>
      </div>

      {/* Recent Collections Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4">Recent Milk Collections</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-3">Farmer Name</th>
                <th className="p-3">Milk Type</th>
                <th className="p-3">Quantity (L)</th>
                <th className="p-3">Fat %</th>
                <th className="p-3">Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-medium">Rahim Ullah</td>
                <td className="p-3">Cow</td>
                <td className="p-3 font-semibold">45.0 L</td>
                <td className="p-3">4.3%</td>
                <td className="p-3">Morning</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Gulzar Agro Farms</td>
                <td className="p-3">Buffalo</td>
                <td className="p-3 font-semibold">65.0 L</td>
                <td className="p-3">6.8%</td>
                <td className="p-3">Morning</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Highland Pure Milk</td>
                <td className="p-3">Cow</td>
                <td className="p-3 font-semibold">80.0 L</td>
                <td className="p-3">4.5%</td>
                <td className="p-3">Morning</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
