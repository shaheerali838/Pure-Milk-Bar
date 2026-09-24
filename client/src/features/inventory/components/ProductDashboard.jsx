import React, { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Layers,
  CheckCircle,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function ProductDashboard({ onAdd, onDetail, onEdit }) {
  const { products = [], deleteProduct } = usePOSContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Calculate the 4 summary cards dynamically from product catalog data
  const totalProducts = products.length;
  const activeCount = products.filter((p) => p.status !== 'Inactive').length;

  const avgPrice =
    products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / products.length)
      : 0;

  const lowestPrice =
    products.length > 0
      ? Math.min(...products.map((p) => Number(p.price) || 0))
      : 0;

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete ${productName}?`)) {
      deleteProduct(productId);
    }
  };

  const handleAddClick = () => {
    if (onAdd) {
      onAdd();
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleDetailClick = (product) => {
    if (onDetail) {
      onDetail(product);
    } else {
      setSelectedProductForDetail(product);
    }
  };

  const handleEditClick = (product) => {
    if (onEdit) {
      onEdit(product);
    } else {
      setProductToEdit(product);
      setIsEditModalOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
            Products &amp; Pricing
          </h1>
          <p className="text-xs text-slate-500">
            Catalog of dairy products, unit rates, and pricing rules
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#009966] hover:bg-[#008055] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          + Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          {
            id: 'total_products',
            title: 'Total Products',
            amount: totalProducts,
            sub: 'All registered items',
            icon: Layers,
            color: '#009966',
            badge: 'Inventory',
          },
          {
            id: 'active_items',
            title: 'Active Items',
            amount: activeCount,
            sub: 'Available for sale',
            icon: CheckCircle,
            color: '#155dfc',
            badge: 'Ready POS',
          },
          {
            id: 'avg_price',
            title: 'Avg Price/KG',
            amount: `Rs. ${avgPrice.toLocaleString()}`,
            sub: 'Per unit catalog',
            icon: TrendingUp,
            color: '#8b5cf6',
            badge: 'Catalog Rate',
          },
          {
            id: 'lowest_price',
            title: 'Lowest Price',
            amount: `Rs. ${lowestPrice.toLocaleString()}`,
            sub: 'Entry level rate',
            icon: Tag,
            color: '#f59e0b',
            badge: 'Min Rate',
          },
        ].map(({ id, title, amount, sub, icon: Icon, color, badge }) => (
          <div
            key={id}
            className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all duration-200"
            style={{ borderTop: `4px solid ${color}` }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ background: `${color}15` }}
              >
                <Icon style={{ width: 16, height: 16, color }} />
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
                {badge}
              </span>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
                {amount}
              </p>
              <p className="text-xs font-bold text-slate-700">{title}</p>
              <p className="text-[11px] font-medium text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 w-full sm:w-72 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
          />
        </div>

        <div className="block bg-slate-100 rounded-full px-2 py-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'milk', label: 'Milk' },
            { id: 'dahi', label: 'Dahi' },
            { id: 'lassi', label: 'Lassi' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl shadow-2xs">
            🥛
          </div>
          <h3 className="text-sm font-bold text-slate-800 font-display">
            {products.length === 0 ? 'No Products in Inventory' : 'No Matching Products Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {products.length === 0
              ? 'Click "+ Add Product" above to create your first dairy product and configure unit pricing.'
              : 'Try changing your search keyword or selecting a different category filter.'}
          </p>
          {products.length === 0 && (
            <button
              type="button"
              onClick={handleAddClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredProducts.map((p, idx) => {
            const prodKey = p.id || p._id || p.sku || `prod-${idx}`;
            const salePrice = Number(p.price) || 0;
            const costPrice = Number(p.cost) || 0;
            const profitMargin = salePrice - costPrice;
            const marginPercent = costPrice > 0 ? Math.round((profitMargin / costPrice) * 100) : 0;
            const categoryLower = (p.category || '').toLowerCase();

            const isMilk = categoryLower.includes('milk') || !categoryLower;
            const isDahi = categoryLower.includes('dahi');
            const isLassi = categoryLower.includes('lassi');

            const emoji = isDahi ? '🥣' : isLassi ? '🧃' : isMilk ? '🥛' : '🧈';
            const accentColor = isDahi ? '#f59e0b' : isLassi ? '#2563eb' : '#00a86b';

            return (
              <div
                key={prodKey}
                onClick={() => handleDetailClick(p)}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group relative"
                style={{ borderTop: `4px solid ${accentColor}` }}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        {emoji}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider block w-fit">
                          {p.category || 'Dairy'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status === 'Inactive'
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'Inactive' ? 'bg-slate-400' : 'bg-emerald-500'
                        }`}
                      />
                      {p.status || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-display line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      SKU: #{p.sku || p.id}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Sale Price</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-emerald-700 font-display tabular">
                          Rs. {salePrice.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          / {p.unit || 'unit'}
                        </span>
                      </div>
                    </div>

                    {costPrice > 0 && (
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-400 font-medium">Cost: Rs. {costPrice.toLocaleString()}</span>
                        <span className={`font-bold ${profitMargin >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {profitMargin >= 0 ? `+Rs. ${profitMargin} (${marginPercent}%)` : `-Rs. ${Math.abs(profitMargin)}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleDetailClick(p)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Specs</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditClick(p)}
                      title="Edit Product"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      title="Delete Product"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
