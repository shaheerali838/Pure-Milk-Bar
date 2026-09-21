import React, { useState, useEffect } from 'react';
import { ArrowLeft, PackagePlus, ChevronDown, Check } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import { useSettingsContext } from '@/context/SettingsContext';

export default function AddProduct({ onBack, product = null }) {
  const { products = [], addProduct, updateProduct } = usePOSContext();
  const { settings } = useSettingsContext();

  const isEditing = Boolean(product);
  const nextNumber = products.length + 1;
  const defaultSku = `PRD-${String(nextNumber).padStart(3, '0')}`;
  const defaultUnit = settings?.productDefaults?.defaultUnit === 'kg' ? 'per kg' : 'per liter';

  const [formData, setFormData] = useState({
    id: product ? product.id || product.sku || defaultSku : defaultSku,
    name: product ? product.name || '' : '',
    category: product ? product.category || 'Milk' : 'Milk',
    unit: product ? product.unit || 'per liter' : 'per liter',
    source: product ? product.source || 'Farm' : 'Farm',
    price: product ? product.price ?? '' : '',
    cost: product ? product.cost ?? '' : '',
    description: product ? product.description || '' : '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || product.sku || '',
        name: product.name || '',
        category: product.category || 'Milk',
        unit: product.unit || (product.category?.toLowerCase().includes('milk') ? 'per liter' : 'per kg'),
        source: product.source || 'Farm',
        price: product.price ?? '',
        cost: product.cost ?? '',
        description: product.description || '',
      });
    }
  }, [product?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditing) {
      updateProduct({
        ...product,
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit,
        source: formData.source || 'Farm',
        price: Number(formData.price) || 0,
        cost: Number(formData.cost) || 0,
        description: formData.description.trim(),
      });
    } else {
      const newProduct = {
        id: formData.id.trim() || `PRD-${Date.now()}`,
        sku: formData.id.trim() || `PRD-${Date.now()}`,
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit,
        source: formData.source || 'Farm',
        price: Number(formData.price) || 0,
        cost: Number(formData.cost) || 0,
        description: formData.description.trim(),
        status: 'Active',
      };
      addProduct(newProduct);
    }

    if (onBack) onBack();
  };

  return (
    <div className=" animate-in fade-in duration-150">
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              {isEditing ? `Edit Product — ${product.name}` : 'Add Product'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Update rates, categorization, and details for #${formData.id}`
                : 'Register a new dairy product with pricing rules and inventory specs'}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isEditing
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isEditing ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'
            }`}
          ></span>
          {isEditing ? `Editing #${formData.id}` : 'New Product Entry'}
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 font-display">
                Product Details &amp; Pricing Setup
              </h2>
              <p className="text-xs text-slate-400">
                All changes immediately sync to localStorage and POS counter register
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product ID / SKU
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="Enter code"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Unique barcode identifier</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Display title on POS screen and receipts</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer pr-10"
                >
                  <option value="Milk">🥛 Milk (Doodh)</option>
                  <option value="Dahi">🥣 Dahi (Yogurt)</option>
                  <option value="Lassi">🧃 Lassi</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Source Origin <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.source || 'Farm'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer pr-10"
                >
                  <option value="Farm">🌾 Farm (In-House Herd)</option>
                  <option value="Supplier">🚚 Supplier (Procured Sourcing)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Designates P&amp;L attribution &amp; sales card tracking</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Unit <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer pr-10"
                >
                  <option value="per kg">per kg</option>
                  <option value="per liter">per liter</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sale Price (RS) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="180"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono tabular"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Retail counter selling rate per unit</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cost / Unit (RS)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="115"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono tabular"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Estimated farm production or purchase cost</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description &amp; Storage Notes
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Fresh pure morning dairy batch, cold-filtered and unpasteurized..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer ${
                isEditing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#009966] hover:bg-[#008055]'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {isEditing ? 'Update Product' : 'Save & Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
