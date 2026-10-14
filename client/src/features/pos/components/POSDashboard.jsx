import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Eye,
  Plus,
  RotateCcw,
  ShoppingBag,
  Check,
  PackageX,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePOSContext } from '@/context/POSContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import POSCardOverflow from './POSCardOverflow';
import POSSale from './POSSale';
import POSReceiptModal from './POSReceiptModal';
import ProductDetailModal from '@/features/inventory/components/ProductDetailModal';
import POSSalesSourceDetail from './POSSalesSourceDetail';
import POSWalkinHistoryModal from './POSWalkinHistoryModal';
import POSDoorstepOrdersModal from './POSDoorstepOrdersModal';
import POSProductCard from './POSProductCard';
import { getProductIcon, getProductMeta } from '@/features/inventory/components/AddProduct';
import DashboardDateFilterBar from '@/components/common/DashboardDateFilterBar';
import DayClosedLockOverlay from '@/components/common/DayClosedLockOverlay';

export default function POSDashboard() {
  const [searchParams] = useSearchParams();
  const [dateFilter, setDateFilter] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const context = usePOSContext() || {};
  const {
    isDayClosed = false,
    products = [],
    cart = [],
    deleteProduct,
    handleAddToCart,
    handleAddToCartByRupees,
    handleClearCart,
    inventoryMetrics = {},
    isSaleRefreshing = false,
  } = context;

  const { deliveries = [] } = useDeliveryContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Walk-in history modal state
  const [isWalkinHistoryOpen, setIsWalkinHistoryOpen] = useState(false);
  const [walkinHistorySearch, setWalkinHistorySearch] = useState('');

  // Auto-open Walk-in History modal if requested via URL
  useEffect(() => {
    const modalParam = searchParams.get('modal') || searchParams.get('open');
    const isWalkinParam =
      searchParams.get('walkinHistory') === 'true' ||
      searchParams.get('walkinhistory') === 'true';

    if (
      modalParam === 'walkin_history' ||
      modalParam === 'walkinhistory' ||
      modalParam === 'walkin' ||
      isWalkinParam
    ) {
      setIsWalkinHistoryOpen(true);
      const searchVal =
        searchParams.get('search') ||
        searchParams.get('invoice') ||
        searchParams.get('name') ||
        '';
      if (searchVal) {
        setWalkinHistorySearch(searchVal);
      }
    }
  }, [searchParams]);

  // Doorstep orders modal state & pending count for ON-TIME deliveries
  const [isDoorstepOrdersOpen, setIsDoorstepOrdersOpen] = useState(false);
  const isDeliveryOnTime = (d) => {
    return (
      d.deliverySubType === 'ontime' ||
      d.source === 'POS_ONE_TIME' ||
      d.deliveryType === 'ONTIME' ||
      d.isOneTime ||
      (!d.customerId && !d.customer?.monthlySubscription)
    );
  };
  const pendingDeliveriesCount = deliveries.filter((d) => d.status === 'PENDING' && isDeliveryOnTime(d)).length;

  // Product detail view state
  const [productForDetail, setProductForDetail] = useState(null);

  // Sales source P&L detail view state ('farm' | 'supplier' | 'all' | null)
  const [selectedSalesSource, setSelectedSalesSource] = useState(null);

  // Filter products by search & category, ensuring strictly ONE single combined card for Buffalo Milk
  const filteredProducts = useMemo(() => {
    const matched = products.filter((item) => {
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

    // Ensure strictly ONE single combined Buffalo Milk card is shown on POS screen
    let seenBuffalo = false;
    return matched.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const isBuff = name.includes('buffalo') || name.includes('bufflo') || name.includes('buff') || name.includes('bhains');
      if (isBuff) {
        if (seenBuffalo) return false;
        seenBuffalo = true;
      }
      return true;
    });
  }, [products, searchTerm, selectedCategory]);

  // Dynamically resolve real-time stock from live farm, supplier, and kitchen conversion metrics
  const getProductDisplayStock = (prod) => {
    if (context.getProductAvailableStock) {
      return context.getProductAvailableStock(prod);
    }
    const name = (prod.name || '').toLowerCase();
    const cat = (prod.category || '').toLowerCase();
    const isCow = name.includes('cow') || name.includes('gai');
    const isBuff = name.includes('buffalo') || name.includes('bufflo') || name.includes('buff') || name.includes('bhains');
    const catalogBaseStock = Math.max(0, Number(prod.currentStock ?? prod.stock) || 0);

    if (cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt') || cat.includes('curd') || name.includes('curd')) {
      const farmD = Number(inventoryMetrics?.rawFarmDahiStock ?? inventoryMetrics?.farmDahiStock) || 0;
      const supD = Number(inventoryMetrics?.rawSupplierDahiStock ?? inventoryMetrics?.supplierDahiStock) || 0;
      const batchSpecific = Number(inventoryMetrics?.productBatchStockMap?.[prod.name] || 0);
      return Number(Math.max(0, farmD + supD + batchSpecific).toFixed(2));
    }

    if (cat.includes('milk') || name.includes('milk')) {
      if (isCow) {
        const farmCow = Number(inventoryMetrics?.farmCowMilkStock ?? inventoryMetrics?.rawFarmCowMilkStock) || 0;
        const supCow = Number(inventoryMetrics?.supplierCowMilkStock ?? inventoryMetrics?.rawSupplierCowMilkStock) || 0;
        return Number(Math.max(0, farmCow + supCow).toFixed(1));
      }
      if (isBuff) {
        const farmBuff = Number(inventoryMetrics?.farmBuffaloMilkStock ?? inventoryMetrics?.rawFarmBuffaloMilkStock) || 0;
        const supBuff = Number(inventoryMetrics?.supplierBuffaloMilkStock ?? inventoryMetrics?.rawSupplierBuffaloMilkStock) || 0;
        return Number(Math.max(0, farmBuff + supBuff).toFixed(1));
      }
      const liveTot = Number(inventoryMetrics?.totalMilkStock ?? inventoryMetrics?.totalMilk ?? inventoryMetrics?.rawTotalMilkStock) || 0;
      return Number(Math.max(0, liveTot).toFixed(1));
    }

    const batchSpecificStock = Number(inventoryMetrics?.productBatchStockMap?.[prod.name] || 0);
    return Math.max(0, catalogBaseStock + batchSpecificStock);
  };

  // Temporary on-card warning state for zero stock / depleted stock
  const [stockWarningId, setStockWarningId] = useState(null);
  const [stockWarningMsg, setStockWarningMsg] = useState('');

  // Handle product click with strict stock validation
  const handleProductCardClick = (product) => {
    if (isDayClosed) {
      toast.error('🔒 Day is Closed. Open New Day to continue operations.');
      return;
    }
    if (isSaleRefreshing) return;
    const displayStock = getProductDisplayStock(product);
    const unitLabel = context.getProductUnitLabel
      ? context.getProductUnitLabel(product, true)
      : (product.unit?.replace('per ', '') || 'L');

    if (displayStock <= 0) {
      toast.error(`🚫 Out of Stock: Yeh item abhi dastiyab nahi hai.`, {
        description: `"${product.name}" ka recorded stock 0 ${unitLabel} hai. Please purchase intake or add stock.`,
        duration: 3500,
      });
      return;
    }

    const prodId = product.id || product._id || product.sku;
    const cartItem = cart.find((i) => i.id === prodId || (product.id && i.id === product.id));
    const inCartQty = cartItem ? Number(cartItem.quantity) || 0 : 0;

    if (inCartQty + 1 > displayStock) {
      toast.error(`🚫 Insufficient Stock! "${product.name}"`, {
        description: `Sirf ${displayStock} ${unitLabel} stock dastiyab hai (Already in cart: ${inCartQty} ${unitLabel}).`,
        duration: 3500,
      });
      return;
    }

    handleAddToCart(product);
    toast.success(`+1 ${unitLabel} ${product.name} added to cart`);
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
    <div className="h-[calc(100vh-4.2rem)] max-h-[calc(100vh-4.2rem)] flex flex-col overflow-hidden space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight font-display">
              Point of Sale &amp; Counter Checkout
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Register
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Doorstep Delivery Orders Button with Live Pending Blink */}
          <button
            type="button"
            onClick={() => setIsDoorstepOrdersOpen(true)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              pendingDeliveriesCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 ring-2 ring-amber-400/40 animate-pulse shadow-amber-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>Doorstep Orders</span>
            {pendingDeliveriesCount > 0 ? (
              <span className="flex items-center gap-1 bg-slate-950 text-white px-2 py-0.2 rounded-full text-[10px] font-black tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                {pendingDeliveriesCount} Pending
              </span>
            ) : (
              <span className="bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                0
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsWalkinHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition shadow-2xs cursor-pointer"
          >
            <span></span>
            <span>Walk-in History</span>
          </button>

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

      {/* Date Filter Bar */}
      <DashboardDateFilterBar
        dateFilter={dateFilter}
        onFilterChange={setDateFilter}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        theme="emerald"
      />

      {/* Main 2-Panel Split Layout: Left Panel (Cards + Items) & Right Panel (Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden">
        {/* LEFT PANEL: Summary Cards + Product Items */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-2 min-h-0 overflow-hidden h-full">
          {/* Summary Metric Cards at the Top of Left Panel */}
          <div className="shrink-0">
            <POSCardOverflow
              onSelectSource={setSelectedSalesSource}
              dateFilter={dateFilter}
              startDate={startDate}
              endDate={endDate}
            />
          </div>

          {/* Product Items Catalog Container */}
          <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs overflow-hidden">
            {isDayClosed && <DayClosedLockOverlay inline className="mb-2" />}
            {/* Search & Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 justify-between pb-2.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-sm text-slate-700 w-full sm:w-64 md:w-72 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search milk or dairy items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'milk', label: 'Milk' },
                  { id: 'dahi', label: 'Dahi' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-white text-emerald-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Product Items Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto py-2 pr-1">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {filteredProducts.map((product) => {
                    const displayStock = getProductDisplayStock(product);
                    return (
                      <POSProductCard
                        key={product.id || product._id || product.sku}
                        product={product}
                        cart={cart}
                        inventoryMetrics={inventoryMetrics}
                        displayStock={displayStock}
                        stockWarningId={stockWarningId}
                        stockWarningMsg={stockWarningMsg}
                        onCardClick={handleProductCardClick}
                        onDismissWarning={() => setStockWarningId(null)}
                        onViewDetail={handleViewDetail}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom info footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <span>Click any product card to add 1 unit to cart</span>
              <span className="font-semibold text-slate-500">Live POS Engine</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dedicated Checkout Workspace */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col min-h-0 h-full overflow-hidden">
          <POSSale />
        </div>
      </div>


      <POSReceiptModal />
      <POSWalkinHistoryModal
        isOpen={isWalkinHistoryOpen}
        onClose={() => {
          setIsWalkinHistoryOpen(false);
          setWalkinHistorySearch('');
        }}
        initialSearch={walkinHistorySearch}
      />
      <POSDoorstepOrdersModal
        mode="ontime"
        isOpen={isDoorstepOrdersOpen}
        onClose={() => setIsDoorstepOrdersOpen(false)}
      />

      {/* Full Page Sale Processing & Inventory Refresh Loading State */}
      {isSaleRefreshing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center animate-in fade-in duration-200 select-none pointer-events-auto">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-sm mx-4 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin flex items-center justify-center"></div>
              </div>
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Applying Sale &amp; Refreshing...
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Updating real-time inventory, sales register, and customer balances. Please wait...
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
