import React from 'react';

export default function Farm() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-bold text-slate-800">Farm & Livestock Management</h3>
        <p className="text-sm text-slate-500">Live herd monitoring and dairy cattle records</p>
      </div>

      {/* Farm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Cattle</p>
          <p className="text-3xl font-bold text-teal-600 mt-2">124 Head</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Milking Cows</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">86 Cows</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Average Daily Yield / Cow</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">22.8 Liters</p>
        </div>
      </div>

      {/* Cattle Roster Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4">Cattle Roster</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
              <tr>
                <th className="p-3">Tag ID</th>
                <th className="p-3">Breed</th>
                <th className="p-3">Status</th>
                <th className="p-3">Daily Yield</th>
                <th className="p-3">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-semibold text-slate-900">COW-1042</td>
                <td className="p-3">Holstein Friesian</td>
                <td className="p-3 text-emerald-600 font-semibold">Milking</td>
                <td className="p-3 font-semibold">28.4 L</td>
                <td className="p-3 text-emerald-700">Healthy</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">COW-1088</td>
                <td className="p-3">Jersey Pure</td>
                <td className="p-3 text-emerald-600 font-semibold">Milking</td>
                <td className="p-3 font-semibold">22.1 L</td>
                <td className="p-3 text-emerald-700">Healthy</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">COW-3051</td>
                <td className="p-3">Holstein Friesian</td>
                <td className="p-3 text-amber-600 font-semibold">Dry / Gestating</td>
                <td className="p-3 font-semibold">0.0 L</td>
                <td className="p-3 text-slate-600">Resting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
