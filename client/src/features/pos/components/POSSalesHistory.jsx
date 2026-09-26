import React, { useState, useMemo } from 'react';
import { ArrowLeft, Eye, Receipt, Search, User, Phone, Package, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

const getCustomer = (sale) => sale.customer || sale.walkinCustomer || { name: 'Walk-in Customer', phone: 'N/A' };
const getSaleItems = (sale) => sale.items || [];
const getItemTotal = (item) => Number(item.subtotal ?? ((Number(item.quantity) || 0) * (Number(item.price ?? item.unitPrice) || 0)));
const getTotal = (sale) => Number(sale.netPayable ?? sale.grandTotal ?? 0);

function SaleDetail({ sale, onBack }) {
  const customer = getCustomer(sale);
  const items = getSaleItems(sale);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-in fade-in duration-150">
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
  const [dateFilter, setDateFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'walkin' | 'delivery'

  const filteredByDate = useMemo(() => {
    let list = [...salesHistory].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    
    if (channelFilter === 'walkin') {
      list = list.filter(s => s.saleCategory === 'walkin' || s.fulfillmentType === 'COUNTER' || s.fulfillmentMode === 'counter' || !s.saleCategory);
    } else if (channelFilter === 'delivery') {
      list = list.filter(s => s.saleCategory === 'delivery' || s.fulfillmentType === 'DOORSTEP' || s.fulfillmentMode === 'doorstep');
    }

    if (dateFilter === 'today') {
      const todayStr = new Date().toDateString();
      return list.filter(sale => new Date(sale.timestamp || sale.date).toDateString() === todayStr);
    }
    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return list.filter(sale => new Date(sale.timestamp || sale.date) >= weekAgo);
    }
    return list;
  }, [salesHistory, dateFilter, channelFilter]);

  const filteredSales = filteredByDate.filter((sale) => {
    const customer = getCustomer(sale);
    const term = search.trim().toLowerCase();
    return !term || String(sale.invoiceId || '').toLowerCase().includes(term) || String(customer.name || '').toLowerCase().includes(term) || String(customer.phone || '').toLowerCase().includes(term);
  });

  const totals = useMemo(() => {
    let income = 0;
    let itemsSold = 0;
    const uniqueCustomers = new Set();

    filteredSales.forEach((sale) => {
      income += getTotal(sale);
      const items = getSaleItems(sale);
      itemsSold += items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const customer = getCustomer(sale);
      if (customer.phone && customer.phone !== 'N/A') {
        uniqueCustomers.add(customer.phone);
      } else if (customer.name && customer.name !== 'Walk-in Customer') {
        uniqueCustomers.add(customer.name);
      }
    });

    return {
      income,
      itemsSold,
      invoices: filteredSales.length,
      customers: uniqueCustomers.size
    };
  }, [filteredSales]);

  if (selectedSale) return <SaleDetail sale={selectedSale} onBack={() => setSelectedSale(null)} />;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {!compact && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-emerald-600" />
              POS Sales Finance Report
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comprehensive overview of total sales, income, and customer data.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Channel Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'walkin', label: '🥛 Walk-in Counter' },
                { id: 'delivery', label: '🚚 Doorstep Delivery' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChannelFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    channelFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['today', 'week', 'all'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    dateFilter === filter
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'today' ? 'Today' : filter === 'week' ? 'Last 7 Days' : 'All History'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!compact && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Income</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black font-mono text-emerald-700">Rs. {totals.income.toLocaleString()}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Revenue generated
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Sales (Invoices)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black font-mono text-slate-800">{totals.invoices}</span>
              <span className="text-xs font-semibold text-slate-500">Invoices</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Completed transactions</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Items Sold</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black font-mono text-slate-800">{totals.itemsSold.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-500">Items</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Total quantity sold</span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unique Customers</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black font-mono text-blue-700">{totals.customers}</span>
              <span className="text-xs font-semibold text-slate-500">Customers</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Registered customers served</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-emerald-600" /> POS sales</h2><p className="text-[11px] text-slate-500 mt-0.5">Milk sales and customer details saved at checkout.</p></div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5"><Search className="w-3.5 h-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or customer" className="w-44 bg-transparent outline-none text-xs" /></div>
        </div>
        {filteredSales.length === 0 ? <div className="py-10 text-center text-xs text-slate-400">No POS sales found.</div> : <div className={compact ? 'max-h-72 overflow-y-auto' : 'overflow-x-auto'}><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-2">Invoice</th><th className="px-4 py-2">Customer</th><th className="px-4 py-2">Items</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredSales.map((sale) => { const customer = getCustomer(sale); return <tr key={sale.invoiceId} className="hover:bg-emerald-50/40 transition-colors"><td className="px-4 py-2.5 font-mono font-bold text-slate-700">{sale.invoiceId}</td><td className="px-4 py-2.5"><div className="font-bold text-slate-800 flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {customer.name}</div><div className="text-[10px] text-slate-400">{customer.phone || 'N/A'}</div></td><td className="px-4 py-2.5 text-slate-500">{getSaleItems(sale).map((item) => item.name).join(', ') || 'Dairy item'}</td><td className="px-4 py-2.5 text-right font-black text-emerald-700">Rs. {getTotal(sale).toLocaleString()}</td><td className="px-4 py-2.5 text-right"><button type="button" title="View sale details" onClick={() => setSelectedSale(sale)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white cursor-pointer transition-colors"><Eye className="w-3.5 h-3.5" /> View</button></td></tr>; })}</tbody></table></div>}
      </div>
    </div>
  );
}

