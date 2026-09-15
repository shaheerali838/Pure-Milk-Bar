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

  // Calculate the 4 summary cards dynamically from localStorage data
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
      {/* 1. Header (image_ce0e25.png) */}
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

      {/* 2. 4 Summary Cards (matching POS / Farm Card design with borderTop and badge) */}
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

      {/* 3. Filter Bar (matching POS pill design) */}
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

      {/* 4. Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-2.5 px-4">PRODUCT</th>
                <th className="py-2.5 px-4">CATEGORY</th>
                <th className="py-2.5 px-4">UNIT</th>
                <th className="py-2.5 px-4">SALE PRICE</th>
                <th className="py-2.5 px-4">EST. COST</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                    {products.length === 0
                      ? 'No products in inventory yet. Click "+ Add Product" above to create your first product.'
                      : 'No products match your search/filter.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleDetailClick(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm shrink-0">
                          {p.category.toLowerCase().includes('dahi')
                            ? '🥣'
                            : p.category.toLowerCase().includes('lassi')
                            ? '🧃'
                            : '🥛'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {p.name}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-400">
                            #{p.sku || p.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">{p.unit}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 font-mono tabular">
                      Rs. {Number(p.price || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 tabular">
                      Rs. {Number(p.cost || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        {/* Detail (Eye) */}
                        <button
                          type="button"
                          onClick={() => handleDetailClick(p)}
                          title="View Specifications"
                          className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit (Pencil) */}
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete (Trash) */}
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
