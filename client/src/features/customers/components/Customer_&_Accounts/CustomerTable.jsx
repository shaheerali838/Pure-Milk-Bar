import React from 'react';
import { Eye, Edit2, Smartphone, Milk } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerTable() {
  const { customers } = useCustomerContext();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-320px)]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-5 py-3.5">CUSTOMER</th>
              <th className="px-5 py-3.5">PHONE &amp; ONLINE ACCOUNT</th>
              <th className="px-5 py-3.5">DAILY SUBSCRIPTION</th>
              <th className="px-5 py-3.5">CREDIT LIMIT</th>
              <th className="px-5 py-3.5">KHATA BALANCE</th>
              <th className="px-5 py-3.5">PAYMENT MODE</th>
              <th className="px-5 py-3.5">STATUS</th>
              <th className="px-4 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-medium">
                  No customers found. Click "+ Add New Customer" to add one!
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const initial = c.name ? c.name.charAt(0).toUpperCase() : 'C';
                const khataPercent = Math.min(
                  100,
                  Math.round(((c.khataBalance || 0) / (c.creditLimit || 10000)) * 100)
                );

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.area || 'Model Town'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone & Online Account */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{c.phone}</div>
                      {c.onlineAccount && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                          <Smartphone className="w-2.5 h-2.5" />
                          Online: {c.onlineAccount}
                        </div>
                      )}
                    </td>

                    {/* Daily Subscription */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200/60">
                        <Milk className="w-3 h-3 text-slate-500" />
                        {c.subscription || '2 L Cow Milk'}
                      </span>
                    </td>

                    {/* Credit Limit */}
                    <td className="px-5 py-4 font-bold text-slate-800">
                      Rs. {(c.creditLimit || 0).toLocaleString()}
                    </td>

                    {/* Khata Balance */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">
                        Rs. {(c.khataBalance || 0).toLocaleString()}
                      </div>
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${khataPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Payment Mode */}
                    <td className="px-5 py-4">
                      {c.paymentMode === 'Online Payment' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                          Online Payment
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200/60">
                          Khata
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
