import React, { useState } from 'react';
import { ArrowLeft, Eye, Receipt, Search, User, Phone, Package } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

const getCustomer = (sale) => sale.customer || sale.walkinCustomer || { name: 'Walk-in Customer', phone: 'N/A' };
const getSaleItems = (sale) => sale.items || [];
const getItemTotal = (item) => Number(item.subtotal ?? ((Number(item.quantity) || 0) * (Number(item.price ?? item.unitPrice) || 0)));
const getTotal = (sale) => Number(sale.netPayable ?? sale.grandTotal ?? 0);

function SaleDetail({ sale, onBack }) {
  const customer = getCustomer(sale);
  const items = getSaleItems(sale);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sales
        </button>
        <span className="font-mono text-xs font-bold">{sale.invoiceId}</span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Customer</div>
            <div className="mt-1 text-sm font-black text-slate-900">{customer.name || 'Walk-in Customer'}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {customer.phone || 'N/A'}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Date & time</div>
            <div className="mt-1 text-sm font-bold text-slate-900">{sale.formattedDate || new Date(sale.timestamp || sale.date).toLocaleDateString()}</div>
            <div className="text-xs text-slate-500 mt-1">{sale.formattedTime || new Date(sale.timestamp || sale.date).toLocaleTimeString()}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Payment</div>
            <div className="mt-1 text-sm font-black text-slate-900 uppercase">{sale.paymentMethod || 'Cash'}</div>
            <div className="text-xs text-slate-500 mt-1">{sale.saleCategory || 'walkin'} sale</div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500"><Package className="w-3.5 h-3.5" /> Items sold</div>
          <div className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <div key={`${item.id || item.name}-${index}`} className="px-3 py-2.5 flex items-center justify-between gap-3 text-xs">
                <div><div className="font-bold text-slate-800">{item.name || 'Dairy item'}</div><div className="text-slate-400">{item.quantity} x Rs. {Number(item.price ?? item.unitPrice ?? 0).toLocaleString()}</div></div>
                <div className="font-black text-slate-900">Rs. {getItemTotal(item).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="px-3 py-3 border-t border-slate-200 flex items-center justify-between"><span className="text-xs font-bold text-slate-500">Net payable</span><span className="text-base font-black text-emerald-700">Rs. {getTotal(sale).toLocaleString()}</span></div>
        </div>
        {sale.notes && <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"><strong>Notes:</strong> {sale.notes}</div>}
      </div>
    </div>
  );
}

export default function POSSalesHistory({ compact = false }) {
  const { salesHistory = [] } = usePOSContext();
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  if (selectedSale) return <SaleDetail sale={selectedSale} onBack={() => setSelectedSale(null)} />;

  const filteredSales = salesHistory.filter((sale) => {
    const customer = getCustomer(sale);
    const term = search.trim().toLowerCase();
    return !term || String(sale.invoiceId || '').toLowerCase().includes(term) || String(customer.name || '').toLowerCase().includes(term) || String(customer.phone || '').toLowerCase().includes(term);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-emerald-600" /> POS sales</h2><p className="text-[11px] text-slate-500 mt-0.5">Milk sales and customer details saved at checkout.</p></div>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5"><Search className="w-3.5 h-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or customer" className="w-44 bg-transparent outline-none text-xs" /></div>
      </div>
      {filteredSales.length === 0 ? <div className="py-10 text-center text-xs text-slate-400">No POS sales recorded yet.</div> : <div className={compact ? 'max-h-72 overflow-y-auto' : 'overflow-x-auto'}><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-2">Invoice</th><th className="px-4 py-2">Customer</th><th className="px-4 py-2">Items</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredSales.map((sale) => { const customer = getCustomer(sale); return <tr key={sale.invoiceId} className="hover:bg-emerald-50/40"><td className="px-4 py-2.5 font-mono font-bold text-slate-700">{sale.invoiceId}</td><td className="px-4 py-2.5"><div className="font-bold text-slate-800 flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {customer.name}</div><div className="text-[10px] text-slate-400">{customer.phone || 'N/A'}</div></td><td className="px-4 py-2.5 text-slate-500">{getSaleItems(sale).map((item) => item.name).join(', ') || 'Dairy item'}</td><td className="px-4 py-2.5 text-right font-black text-emerald-700">Rs. {getTotal(sale).toLocaleString()}</td><td className="px-4 py-2.5 text-right"><button type="button" title="View sale details" onClick={() => setSelectedSale(sale)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white cursor-pointer"><Eye className="w-3.5 h-3.5" /> View</button></td></tr>; })}</tbody></table></div>}
    </div>
  );
}
