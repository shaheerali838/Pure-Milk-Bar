import React from 'react';
import { 
  Download
} from 'lucide-react';
import { ExecationOperation } from '../components/businesOperation/ExecationOperation';

export default function Dashboard() {
  // const stats = [
  //   {
  //     title: 'Total Milk Today',
  //     value: '3,840 L',
  //     change: '+6.2% vs yesterday',
  //     isPositive: true,
  //     iconColor: 'text-emerald-600',
  //     iconBg: 'bg-emerald-100',
  //     borderColor: 'border-emerald-200',
  //   },
  //   {
  //     title: 'Morning Shift',
  //     value: '2,150 L',
  //     change: '56% of total',
  //     isPositive: true,
  //     iconColor: 'text-amber-600',
  //     iconBg: 'bg-amber-100',
  //     borderColor: 'border-amber-200',
  //   },
  //   {
  //     title: 'Evening Shift',
  //     value: '1,690 L',
  //     change: '44% of total',
  //     isPositive: true,
  //     iconColor: 'text-indigo-600',
  //     iconBg: 'bg-indigo-100',
  //     borderColor: 'border-indigo-200',
  //   },
  //   {
  //     title: 'Average Fat %',
  //     value: '4.25%',
  //     change: '+0.15% quality score',
  //     isPositive: true,
  //     iconColor: 'text-blue-600',
  //     iconBg: 'bg-blue-100',
  //     borderColor: 'border-blue-200',
  //   },
  //   {
  //     title: 'Average SNF %',
  //     value: '8.62%',
  //     change: 'Optimal standard',
  //     isPositive: true,
  //     iconColor: 'text-purple-600',
  //     iconBg: 'bg-purple-100',
  //     borderColor: 'border-purple-200',
  //   },
  //   {
  //     title: 'Active Suppliers',
  //     value: '2 worker',
  //     change: '4 new this week',
  //     isPositive: true,
  //     iconColor: 'text-teal-600',
  //     iconBg: 'bg-teal-100',
  //     borderColor: 'border-teal-200',
  //   },
  // ];

  // const recentCollections = [
  //   {
  //     id: 'COL-8921',
  //     farmer: 'Rahim Ullah',
  //     contact: '+92 300 1234567',
  //     milkType: 'Cow Milk',
  //     quantity: '45.0 L',
  //     fat: '4.3%',
  //     snf: '8.7%',
  //     rate: 'Rs. 185 / L',
  //     totalAmount: 'Rs. 8,325',
  //     shift: 'Morning',
  //     status: 'Verified',
  //     time: '07:45 AM',
  //   },
  //   {
  //     id: 'COL-8922',
  //     farmer: 'Gulzar Agro Farms',
  //     contact: '+92 312 9876543',
  //     milkType: 'Buffalo Milk',
  //     quantity: '65.0 L',
  //     fat: '6.8%',
  //     snf: '9.1%',
  //     rate: 'Rs. 220 / L',
  //     totalAmount: 'Rs. 14,300',
  //     shift: 'Morning',
  //     status: 'Verified',
  //     time: '08:10 AM',
  //   },
  //   {
  //     id: 'COL-8923',
  //     farmer: 'Highland Pure Milk',
  //     contact: '+92 333 4567890',
  //     milkType: 'Cow Milk',
  //     quantity: '80.0 L',
  //     fat: '4.5%',
  //     snf: '8.6%',
  //     rate: 'Rs. 190 / L',
  //     totalAmount: 'Rs. 15,200',
  //     shift: 'Morning',
  //     status: 'Verified',
  //     time: '08:35 AM',
  //   },
  //   {
  //     id: 'COL-8924',
  //     farmer: 'Bismillah Dairy Farm',
  //     contact: '+92 301 6543210',
  //     milkType: 'Buffalo Milk',
  //     quantity: '52.5 L',
  //     fat: '6.5%',
  //     snf: '9.0%',
  //     rate: 'Rs. 215 / L',
  //     totalAmount: 'Rs. 11,287',
  //     shift: 'Evening',
  //     status: 'Verified',
  //     time: '04:20 PM',
  //   },
  //   {
  //     id: 'COL-8925',
  //     farmer: 'Tariq Mehmood',
  //     contact: '+92 345 7891234',
  //     milkType: 'Cow Milk',
  //     quantity: '38.0 L',
  //     fat: '4.1%',
  //     snf: '8.5%',
  //     rate: 'Rs. 180 / L',
  //     totalAmount: 'Rs. 6,840',
  //     shift: 'Evening',
  //     status: 'Pending Test',
  //     time: '05:05 PM',
  //   },
  // ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time dairy collection, livestock metrics, and daily distribution records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button" 
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      <ExecationOperation/>
      {/* Summary Stat Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 text-center">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="bg-white p-2  rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow "
            >
              <div className=" justify-center">
                <span className="text-sm font-semibold text-slate-600">
                  {stat.title}
                </span>
              </div>
              <div>
                <div className="text-2xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div> */}

      {/* Collections Overview Table */}
      {/* <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">
              Recent Milk Collections
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Live entries submitted from collection counters today
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2 px-4">Farmer / Supplier</th>
                <th className="py-2 px-4">Milk Type</th>
                <th className="py-2 px-4">Quantity</th>
                <th className="py-2 px-4">Fat & SNF</th>
                <th className="py-2 px-4">Rate / Total</th>
                <th className="py-2 px-4">Shift & Time</th>
                <th className="py-2 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentCollections.map((col) => (
                <tr key={col.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-800 text-base">{col.farmer}</div>
                    <div className="text-xs text-slate-400 font-medium">{col.contact} • {col.id}</div>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                      col.milkType.includes('Buffalo') 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {col.milkType}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-extrabold text-slate-900 text-base">{col.quantity}</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-sm font-semibold text-slate-700">
                      <span className="text-blue-600 font-bold">{col.fat}</span> Fat
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {col.snf} SNF
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-900 text-sm">{col.totalAmount}</div>
                    <div className="text-xs text-slate-400 font-medium">{col.rate}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-700 text-sm">{col.shift}</div>
                    <div className="text-xs text-slate-400">{col.time}</div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                      col.status === 'Verified'
                        ? 'bg-emerald-100/70 text-emerald-700'
                        : 'bg-amber-100/70 text-amber-700'
                    }`}>
                      {col.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
}
