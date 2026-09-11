import React from 'react';
import { Eye, Edit2, Smartphone, Milk } from 'lucide-react';
import { useCustomerContext } from '../../../../context/CustomerContext';

export default function CustomerTable({ onViewCustomer, onEditCustomer }) {
  const { customers } = useCustomerContext();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto max-h-[calc(100vh-270px)]">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-3 py-2">CUSTOMER</th>
              <th className="px-3 py-2">PHONE &amp; ONLINE</th>
              <th className="px-3 py-2">SUBSCRIPTION</th>
              <th className="px-3 py-2">CREDIT LIMIT</th>
              <th className="px-3 py-2">KHATA BALANCE</th>
              <th className="px-3 py-2">PAYMENT MODE</th>
              <th className="px-3 py-2">STATUS</th>
              <th className="px-3 py-2 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400 font-medium">
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
                  <tr
                    key={c.id}
                    onClick={() => onViewCustomer && onViewCustomer(c)}
                    title={`Click to view details of ${c.name}`}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    {/* Customer */}
                    <td className="px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">{c.name}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{c.area || 'Model Town'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone & Online Account */}
                    <td className="px-3.5 py-2">
                      <div className="font-semibold text-slate-800 leading-tight">{c.phone}</div>
                      {c.onlineAccount && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                          <Smartphone className="w-2.5 h-2.5" />
                          {c.onlineAccount}
                        </div>
                      )}
                    </td>

                    {/* Daily Subscription */}
                    <td className="px-3.5 py-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200/60">
                        <Milk className="w-2.5 h-2.5 text-slate-500" />
                        {c.subscription || '2 L Cow Milk'}
                      </span>
                    </td>

                    {/* Credit Limit */}
                    <td className="px-3.5 py-2 font-bold text-slate-800">
                      Rs. {(c.creditLimit || 0).toLocaleString()}
                    </td>

                    {/* Khata Balance */}
                    <td className="px-3.5 py-2">
                      <div className="font-bold text-slate-900 leading-tight">
                        Rs. {(c.khataBalance || 0).toLocaleString()}
                      </div>
                      <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${khataPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Payment Mode */}
                    <td className="px-3.5 py-2">
                      {c.paymentMode === 'Online Payment' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                          Online Payment
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200/60">
                          Khata
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-2 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewCustomer) onViewCustomer(c);
                          }}
                          title="View Details"
                          className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditCustomer) onEditCustomer(c);
                          }}
                          title="Edit Customer"
                          className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded transition cursor-pointer"
                        >
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

