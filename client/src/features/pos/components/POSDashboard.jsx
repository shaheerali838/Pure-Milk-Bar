import React, { useState } from 'react';
import {
  Search,
  Eye,
  Plus,
  RotateCcw,
  ShoppingBag,
  Check,
  PackageX,
} from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';
import POSCardOverflow from './POSCardOverflow';
import POSSale from './POSSale';
import POSReceiptModal from './POSReceiptModal';
import ProductDetailModal from '@/features/inventory/components/ProductDetailModal';
import POSSalesSourceDetail from './POSSalesSourceDetail';

export default function POSDashboard() {
  const {
    products = [],
    cart = [],
    deleteProduct,
    handleAddToCart,
    handleAddToCartByRupees,
    handleClearCart,
    inventoryMetrics,
  } = usePOSContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Product detail view state
  const [productForDetail, setProductForDetail] = useState(null);

  // Sales source P&L detail view state ('farm' | 'supplier' | 'all' | null)
  const [selectedSalesSource, setSelectedSalesSource] = useState(null);

  // Filter products by search & category
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      !searchTerm.trim() ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat =
      selectedCategory === 'all' ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCat;
  });

  // Dynamically resolve real-time stock from live farm, supplier, and kitchen conversion metrics
  const getProductDisplayStock = (prod) => {
    const name = (prod.name || '').toLowerCase();
    const cat = (prod.category || '').toLowerCase();
    const src = (prod.source || '').toLowerCase();

    if (cat.includes('dahi') || name.includes('dahi')) {
      const liveDahi = Number(inventoryMetrics?.totalDahiStock);
      if (!isNaN(liveDahi) && liveDahi >= 0) return liveDahi;
      return Number(prod.stock) || 0;
    }

    if (cat.includes('milk') || name.includes('milk')) {
      if (src.includes('supplier')) {
        const liveSup = Number(inventoryMetrics?.supplierMilkStock);
        if (!isNaN(liveSup) && liveSup >= 0) return liveSup;
      }
      if (src.includes('farm')) {
        const liveFarm = Number(inventoryMetrics?.farmMilkStock);
        if (!isNaN(liveFarm) && liveFarm >= 0) return liveFarm;
      }
      const liveTot = Number(inventoryMetrics?.totalMilkStock);
      if (!isNaN(liveTot) && liveTot >= 0) return liveTot;
      return Number(prod.stock) || 0;
    }

    return Number(prod.stock) || 0;
  };

  // Handler for Detail (Eye) - Opens the detail page of the product
  const handleViewDetail = (e, product) => {
    e.stopPropagation();
    setProductForDetail(product);
  };

  // 0. PRODUCT DETAIL PAGE VIEW (opens on the right side of the fixed sidebar)
  if (productForDetail) {
    return (
      <ProductDetailModal
        product={productForDetail}
        backLabel="Back to POS"
        onBack={() => setProductForDetail(null)}
      />
    );
  }

  // 1. SALES SOURCE DETAIL PAGE VIEW (opens full profile layout like SupplierDetail)
  if (selectedSalesSource) {
    return (
      <POSSalesSourceDetail
        source={selectedSalesSource}
        onBack={() => setSelectedSalesSource(null)}
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 py-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-display">
              Point of Sale &amp; Counter Checkout
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Register
            </span>
          </div>

        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/70 transition shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Cart
            </button>
          )}
        </div>
      </div>

      <POSCardOverflow onSelectSource={setSelectedSalesSource} />



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-7 space-y-2 ">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="space-y-2.5 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-700 w-full sm:w-72 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search milk or dairy items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="block bg-slate-100 rounded-full px-2 py-2">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'milk', label: ' Milk' },
                  { id: 'dahi', label: 'Dahi' },
                  { id: 'lassi', label: 'Lassi' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
                  <PackageX className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {products.length === 0 ? 'No Products in Inventory' : 'No Matching Products'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  {products.length === 0
                    ? 'Products added in the Products Management page will automatically appear here.'
                    : 'Try adjusting your search query or category filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                  const cartItem = cart.find((i) => i.id === product.id);
                  const inCartQty = cartItem ? cartItem.quantity : 0;
                  const isMilk = product.category?.toLowerCase().includes('milk');
                  const isDahi = product.category?.toLowerCase().includes('dahi');
                  const displayStock = getProductDisplayStock(product);
                  const unitLabel = product.unit?.replace('per ', '') || (isMilk ? 'L' : 'kg');

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleAddToCart(product)}
                      className={`relative group bg-white border rounded-2xl p-3.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between ${inCartQty > 0
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                          : 'border-slate-200/90 hover:border-indigo-200'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isMilk
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : isDahi
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            }`}
                        >
                          {product.category || 'Dairy'}
                        </span>

                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={(e) => handleViewDetail(e, product)}
                            title="View Product Specifications"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 my-1">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs ${isMilk
                              ? 'bg-blue-50/80 border border-blue-100'
                              : isDahi
                                ? 'bg-amber-50/80 border border-amber-100'
                                : 'bg-purple-50/80 border border-purple-100'
                            }`}
                        >
                          {isDahi ? '' : product.category?.toLowerCase().includes('lassi') ? '🧃' : '🥛'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                            {product.name}
                          </h4>
                          <p className={`text-[10px] font-semibold mt-0.5 ${displayStock > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {displayStock > 0 ? `Stock: ${displayStock} ${unitLabel}` : '0 in stock'}
                          </p>
                        </div>
                      </div>

                     
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-slate-900 tracking-tight">
                            Rs. {Number(product.price || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 ml-1">
                            /{product.unit?.replace('per ', '') || 'kg'}
                          </span>
                        </div>

                        {inCartQty > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold shadow-2xs">
                            <Check className="w-3 h-3 stroke-3" />
                            {inCartQty} in cart
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span> Click any product card to add 1 unit to cart</span>
              <span className="font-semibold text-slate-500">Live POS Engine</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <POSSale />
        </div>
      </div>

      <POSReceiptModal />
    </div>
  );
}
