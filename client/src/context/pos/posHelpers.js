import { normalizeDateStr, getActiveBusinessDate, getLocalDate } from '../../utils/dateUtils';

// Helper to determine if a given date or timestamp matches today in local timezone
export const isTodayDate = (dateVal, activeBusinessDate = null) => {
  if (!dateVal) return false;
  const targetDate = activeBusinessDate || getLocalDate();
  const dStr = normalizeDateStr(dateVal);
  return Boolean(dStr && dStr === targetDate);
};

// Helper to identify and purge any legacy dummy sales records (e.g. INV-1025..1028, mock names)
export const isLegacyDummySale = (sale) => {
  if (!sale) return true;
  const invId = (sale.invoiceId || '').toUpperCase();
  const wName = (sale.walkinName || '').toLowerCase();
  const notes = (sale.notes || '').toLowerCase();
  const cName = (sale.customer?.name || '').toLowerCase();
  const isDummyId = ['INV-1025', 'INV-1026', 'INV-1027', 'INV-1028'].includes(invId);
  const isDummyCustomer =
    wName.includes('tariq mahmood') ||
    wName.includes('cafe gourmet') ||
    wName.includes('chaudhry akram') ||
    wName.includes('gulberg sweet') ||
    cName.includes('tariq mahmood') ||
    cName.includes('cafe gourmet') ||
    cName.includes('chaudhry akram') ||
    cName.includes('gulberg sweet') ||
    notes.includes('morning fresh farm delivery') ||
    notes.includes('commercial tea & breakfast') ||
    notes.includes('chilled milk dispatch');
  return isDummyId || isDummyCustomer;
};

// Helper to check MongoDB ObjectId
export const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

// Delivery Staff with Vehicle Types
export const deliveryRidersList = [];

export const defaultPOSContextValue = {
  products: [],
  cart: [],
  cartCount: 0,
  cartSubtotal: 0,
  netPayable: 0,
  discount: 0,
  deliveryCharge: 0,
  salesHistory: [],
  farmSalesHistory: [],
  supplierSalesHistory: [],
  inventoryMetrics: {
    availableFarmStock: 0,
    farmMilkStock: 0,
    farmCowMilkStock: 0,
    farmBuffaloMilkStock: 0,
    supplierCowMilkStock: 0,
    supplierBuffaloMilkStock: 0,
    totalMilkStock: 0,
    totalDahiStock: 0,
  },
  isSaleRefreshing: false,
  isDayClosed: false,
  activeDate: null,
  openingStock: {},
  dailyCloseHistory: [],
  closeDay: () => {},
  openNewDay: () => {},
  reopenDay: () => {},
  farmStock: null,
  setFarmStock: () => {},
  supplierStock: null,
  setSupplierStock: () => {},
  sellMilk: async () => ({ success: false }),
  convertToDahi: async () => ({ success: false }),
  recordDahiConversion: () => {},
  handleAddToCart: () => {},
  handleAddToCartByRupees: () => {},
  handleClearCart: () => {},
  deductStockAfterSale: () => {},
  handleCompleteSale: async () => null,
};

// Central helper to resolve real-time available stock across inventory metrics and catalog products
export const getProductAvailableStock = (prod, liveStock = {}, allProducts = []) => {
  if (!prod) return 0;
  const name = String(prod.name || '').toLowerCase();
  const cat = String(prod.category || '').toLowerCase();

  const isDahi =
    cat.includes('dahi') ||
    name.includes('dahi') ||
    cat.includes('yogurt') ||
    name.includes('yogurt') ||
    cat.includes('curd') ||
    name.includes('curd');

  const isCow =
    name.includes('cow') ||
    (cat.includes('cow') && (name.includes('milk') || cat.includes('milk')));

  const isBuff =
    name.includes('buffalo') ||
    (cat.includes('buffalo') && (name.includes('milk') || cat.includes('milk')));

  const isMilk = cat.includes('milk') || name.includes('milk');

  if (isDahi) {
    const farmD = Number(liveStock?.rawFarmDahiStock ?? liveStock?.farmDahiStock) || 0;
    const supD = Number(liveStock?.rawSupplierDahiStock ?? liveStock?.supplierDahiStock) || 0;
    const liveDahi = Number((farmD + supD).toFixed(2));
    if (liveDahi > 0) return liveDahi;
    return Math.max(0, Number(prod.currentStock ?? prod.stock) || liveDahi || 0);
  }

  if (isMilk) {
    if (isCow) {
      const farmCow = Number(liveStock?.farmCowMilkStock ?? liveStock?.rawFarmCowMilkStock) || 0;
      const supCow = Number(liveStock?.supplierCowMilkStock ?? liveStock?.rawSupplierCowMilkStock) || 0;
      const liveCow = Number((farmCow + supCow).toFixed(1));
      if (liveCow > 0) return liveCow;
      return Math.max(0, Number(prod.currentStock ?? prod.stock) || 0);
    }
    if (isBuff) {
      const farmBuff = Number(liveStock?.farmBuffaloMilkStock ?? liveStock?.rawFarmBuffaloMilkStock) || 0;
      const supBuff = Number(liveStock?.supplierBuffaloMilkStock ?? liveStock?.rawSupplierBuffaloMilkStock) || 0;
      const liveBuff = Number((farmBuff + supBuff).toFixed(1));
      if (liveBuff > 0) return liveBuff;
      return Math.max(0, Number(prod.currentStock ?? prod.stock) || 0);
    }
    const liveTot = Number(liveStock?.totalMilkStock ?? liveStock?.totalMilk ?? liveStock?.rawTotalMilkStock);
    if (!isNaN(liveTot) && liveTot > 0) return liveTot;
    return Math.max(0, Number(prod.currentStock ?? prod.stock) || 0);
  }

  const batchStock = Number(liveStock?.productBatchStockMap?.[prod.name] || 0);
  return Math.max(0, (Number(prod.currentStock ?? prod.stock) || 0) + batchStock);
};

// Dynamic unit label resolution (e.g. 'Liters (L)' vs 'Kilograms (kg)')
export const getProductUnitLabel = (prod, short = false) => {
  if (!prod) return short ? 'unit' : 'Units';
  const name = String(prod.name || '').toLowerCase();
  const cat = String(prod.category || '').toLowerCase();

  const isDahi =
    cat.includes('dahi') ||
    name.includes('dahi') ||
    cat.includes('yogurt') ||
    name.includes('yogurt') ||
    cat.includes('curd') ||
    name.includes('curd');

  const isMilk = cat.includes('milk') || name.includes('milk');

  if (isDahi) {
    return short ? 'kg' : 'Kilograms (kg)';
  }
  if (isMilk) {
    return short ? 'L' : 'Liters (L)';
  }

  const rawUnit = String(prod.unit || '').replace(/per\s*/i, '').trim();
  if (rawUnit.toLowerCase().includes('l')) return short ? 'L' : 'Liters (L)';
  if (rawUnit.toLowerCase().includes('kg')) return short ? 'kg' : 'Kilograms (kg)';
  return rawUnit || (short ? 'unit' : 'Units');
};

