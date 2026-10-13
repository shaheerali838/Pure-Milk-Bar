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

/**
 * Flexible classifier for dairy items (tolerant to Buffalo/Bufflo, Cow/Gai, Dahi/Yogurt)
 */
export const isBuffaloVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return (
    s.includes('buffalo') ||
    s.includes('bufflo') ||
    s.includes('buff') ||
    s.includes('bhains') ||
    s.includes('bhais')
  );
};

export const isCowVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return s.includes('cow') || s.includes('gai') || s.includes('gae');
};

export const isDahiVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return s.includes('dahi') || s.includes('yogurt') || s.includes('curd');
};

export const isMilkVariant = (name = '', category = '') => {
  const s = `${name || ''} ${category || ''}`.toLowerCase();
  return (
    !isDahiVariant(name, category) &&
    (s.includes('milk') || s.includes('doodh') || isBuffaloVariant(name, category) || isCowVariant(name, category))
  );
};

/**
 * Robust product matcher between order/cart items and catalog products
 */
export const matchProductForOrderItem = (item, allProducts = []) => {
  if (!item || !Array.isArray(allProducts)) return null;

  // 1. By ID
  if (item.id || item._id || item.productId) {
    const targetId = String(item.productId || item.id || item._id);
    const byId = allProducts.find((p) => String(p.id || p._id) === targetId);
    if (byId) return byId;
  }

  // 2. By SKU
  if (item.sku) {
    const targetSku = String(item.sku).toUpperCase();
    const bySku = allProducts.find((p) => String(p.sku || '').toUpperCase() === targetSku);
    if (bySku) return bySku;
  }

  const rawName = String(item.name || '').trim();
  const cleanName = rawName.replace(/\s*\((Farm|Supplier)\s*Share\)/i, '').trim().toLowerCase();

  // 3. Exact name match
  const exact = allProducts.find((p) => String(p.name || '').trim().toLowerCase() === cleanName);
  if (exact) return exact;

  // 4. Buffalo variant match (handles "Bufflo milk", "Buffalo Milk", etc.)
  if (isBuffaloVariant(cleanName, item.category)) {
    const buff = allProducts.find((p) => isBuffaloVariant(p.name, p.category) || isBuffaloVariant(p.sku));
    if (buff) return buff;
  }

  // 5. Cow variant match
  if (isCowVariant(cleanName, item.category)) {
    const cow = allProducts.find((p) => isCowVariant(p.name, p.category) || isCowVariant(p.sku));
    if (cow) return cow;
  }

  // 6. Dahi variant match
  if (isDahiVariant(cleanName, item.category)) {
    const dahi = allProducts.find((p) => isDahiVariant(p.name, p.category) || isDahiVariant(p.sku));
    if (dahi) return dahi;
  }

  // 7. General milk
  if (cleanName.includes('milk') || cleanName.includes('doodh')) {
    const milk = allProducts.find((p) => isMilkVariant(p.name, p.category));
    if (milk) return milk;
  }

  return null;
};

/**
 * Calculates live available stock for a product, combining physical catalog stock
 * with real-time milking yields and supplier intake logs.
 */
export const resolveAvailableStock = (matchedProd, orderItem = {}, liveMetrics = {}) => {
  const name = `${matchedProd?.name || ''} ${orderItem?.name || ''}`.toLowerCase();
  const cat = `${matchedProd?.category || ''} ${orderItem?.category || ''}`.toLowerCase();
  const catalogStock = Math.max(0, Number(matchedProd?.currentStock ?? matchedProd?.stock ?? 0) || 0);

  // Read live inventory metrics from POSContext
  const inv = liveMetrics?.inventoryMetrics || liveMetrics || {};

  // Read localStorage fallback if inv is empty
  let localSaved = null;
  if (!Number(inv.rawFarmBuffaloMilkStock) && !Number(inv.farmBuffaloMilkStock) && typeof window !== 'undefined') {
    try {
      localSaved = JSON.parse(localStorage.getItem('pmb_inventory_stocks') || '{}');
    } catch (_) {}
  }

  if (isDahiVariant(name, cat)) {
    const farmDahi = Number(inv.rawFarmDahiStock) || Number(inv.farmDahiStock) || Number(localSaved?.farmDahiStock) || 0;
    const supDahi = Number(inv.rawSupplierDahiStock) || Number(inv.supplierDahiStock) || Number(localSaved?.supplierDahiStock) || 0;
    const totalDahi = Number(inv.rawTotalDahiStock) || Number(inv.totalDahiStock) || Number(inv.totalDahi) || Number(localSaved?.dahiStock) || (farmDahi + supDahi);
    const batchStock = Number(inv.productBatchStockMap?.[matchedProd?.name || orderItem?.name] || 0);
    if (totalDahi > 0) return Number(totalDahi.toFixed(2));
    return Math.max(catalogStock, batchStock);
  }

  if (isMilkVariant(name, cat)) {
    if (isBuffaloVariant(name, cat)) {
      const farmBuff = Number(inv.rawFarmBuffaloMilkStock) || Number(inv.farmBuffaloMilkStock) || Number(localSaved?.farmBuffaloMilk) || 0;
      const supBuff = Number(inv.rawSupplierBuffaloMilkStock) || Number(inv.supplierBuffaloMilkStock) || Number(localSaved?.supplierBuffaloMilk) || 0;
      const totalBuff = farmBuff + supBuff;
      if (totalBuff > 0) return Number(totalBuff.toFixed(1));
      // Fallback: If buffalo not segregated, use overall live milk stock
      const generalMilk = Number(inv.rawTotalMilkStock) || Number(inv.totalMilkStock) || Number(inv.totalMilk) || Number(inv.rawAvailableFarmStock) || Number(inv.availableFarmStock) || Number(localSaved?.totalMilkStock) || 0;
      if (generalMilk > 0) return Number(generalMilk.toFixed(1));
      return catalogStock;
    }
    if (isCowVariant(name, cat)) {
      const farmCow = Number(inv.rawFarmCowMilkStock) || Number(inv.farmCowMilkStock) || Number(localSaved?.farmCowMilk) || 0;
      const supCow = Number(inv.rawSupplierCowMilkStock) || Number(inv.supplierCowMilkStock) || Number(localSaved?.supplierCowMilk) || 0;
      const totalCow = farmCow + supCow;
      if (totalCow > 0) return Number(totalCow.toFixed(1));
      const generalMilk = Number(inv.rawTotalMilkStock) || Number(inv.totalMilkStock) || Number(inv.totalMilk) || Number(inv.rawAvailableFarmStock) || Number(inv.availableFarmStock) || Number(localSaved?.totalMilkStock) || 0;
      if (generalMilk > 0) return Number(generalMilk.toFixed(1));
      return catalogStock;
    }
    // General milk
    const farmMilk = Number(inv.rawFarmMilkStock) || Number(inv.farmMilkStock) || Number(inv.rawAvailableFarmStock) || Number(inv.availableFarmStock) || Number(localSaved?.farmMilkStock) || 0;
    const supMilk = Number(inv.rawSupplierMilkStock) || Number(inv.supplierMilkStock) || Number(localSaved?.supplierMilkStock) || 0;
    const totalMilk = Number(inv.rawTotalMilkStock) || Number(inv.totalMilkStock) || Number(inv.totalMilk) || Number(localSaved?.totalMilkStock) || (farmMilk + supMilk);
    if (totalMilk > 0) return Number(totalMilk.toFixed(1));
    return catalogStock;
  }

  const batchStock = Number(inv.productBatchStockMap?.[matchedProd?.name || orderItem?.name] || 0);
  return Math.max(0, catalogStock + batchStock);
};
