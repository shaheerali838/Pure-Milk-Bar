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
