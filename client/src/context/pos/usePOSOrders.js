import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import posService from '@/services/posService.js';
import { broadcastSync } from '@/utils/syncBroadcaster';
import { isLegacyDummySale, isObjectId, matchProductForOrderItem, resolveAvailableStock } from './posHelpers';
import { sortByDateDesc, ensureValidDate, normalizeDateStr, getPktTodayString, formatStandardDate, getActiveBusinessDate, getLocalDate } from '@/utils/dateUtils';

export function usePOSOrders({
  cartState,
  productsState,
  directOpsState,
  farmContexts,
  setFarmStock,
  setSupplierStock,
  setPosSyncVersion,
  getMetrics,
  getLiveStock,
  remainingFarmBuffaloMilk = 0,
  remainingFarmMilk = 0,
  resolveItemSourceAndRatios,
  activeDate = null,
}) {
  const [salesHistory, setSalesHistory] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [completedSaleReceipt, setCompletedSaleReceipt] = useState(null);
  const [isSaleRefreshing, setIsSaleRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      const data = await posService.getOrders({ limit: 10000 });
      const list = Array.isArray(data) ? data : data?.orders || data?.data || [];
      const normalized = list
        .filter((order) => !isLegacyDummySale(order))
        .map((order) => {
          const items = (order.items || []).map((i) => {
            const qty = Number(i.quantity) || 0;
            const price = Number(i.unitPrice || i.price) || 0;
            const subtotal = Number(i.subtotal) || (qty * price);
            const source = i.source || 'Farm';
            const farmQty = i.farmQuantity !== undefined ? Number(i.farmQuantity) : (source === 'Farm' ? qty : 0);
            const supQty = i.supplierQuantity !== undefined ? Number(i.supplierQuantity) : (source === 'Supplier' ? qty : 0);
            const farmRev = i.farmRevenue !== undefined ? Number(i.farmRevenue) : (source === 'Farm' ? subtotal : 0);
            const supRev = i.supplierRevenue !== undefined ? Number(i.supplierRevenue) : (source === 'Supplier' ? subtotal : 0);
            const farmRatio = i.farmRatio !== undefined ? Number(i.farmRatio) : (source === 'Farm' ? 1 : 0);
            const supRatio = i.supplierRatio !== undefined ? Number(i.supplierRatio) : (source === 'Supplier' ? 1 : 0);

            return {
              ...i,
              id: i.productId || i._id || i.id,
              name: i.name,
              category: i.category || (i.name && i.name.toLowerCase().includes('dahi') ? 'Dahi' : (i.name && (i.name.toLowerCase().includes('milk') || i.name.toLowerCase().includes('cow') || i.name.toLowerCase().includes('buffalo')) ? 'Milk' : 'General')),
              quantity: qty,
              price: price,
              unitPrice: price,
              cost: Number(i.cost) || 0,
              source: source,
              farmQuantity: farmQty,
              supplierQuantity: supQty,
              farmRevenue: farmRev,
              supplierRevenue: supRev,
              farmRatio: farmRatio,
              supplierRatio: supRatio,
              subtotal: subtotal,
            };
          });

          const isDelivery =
            order.fulfillmentType === 'DELIVERY' ||
            order.fulfillmentType === 'DOORSTEP' ||
            Boolean(order.deliveryMeta && (order.deliveryMeta.riderName || order.deliveryMeta.dropAddress || order.deliveryMeta.riderId));
          const saleCategory = isDelivery ? 'delivery' : 'walkin';
          const fulfillmentType = order.fulfillmentType || (isDelivery ? 'DELIVERY' : 'COUNTER');
          const fulfillmentMode = isDelivery ? 'doorstep' : 'counter';
          const orderDate = normalizeDateStr(order.date || order.createdAt) || getLocalDate();
          const orderTimestamp = order.createdAt || order.timestamp || (orderDate ? new Date(orderDate).toISOString() : new Date().toISOString());

          return {
              ...order,
              invoiceId: order.receiptNumber || order.orderNumber || order.invoiceId || (order._id ? `INV-${String(order._id).slice(-6)}` : `INV-${Date.now()}`),
              id: order._id || order.id,
              date: orderDate,
              timestamp: orderTimestamp,
              formattedTime: orderTimestamp ? new Date(orderTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              formattedDate: formatStandardDate(orderDate),
              items,
              itemCount: items.reduce((c, i) => c + (Number(i.quantity) || 0), 0),
              subtotal: Number(order.subtotal) || 0,
              deliveryCharge: Number(order.deliveryFee) || 0,
              discount: Number(order.discountAmount) || 0,
              netPayable: Number(order.grandTotal || order.netPayable || 0),
              saleCategory,
              fulfillmentType,
              fulfillmentMode,
              deliveryMeta: order.deliveryMeta || null,
              rider: order.rider || (order.deliveryMeta?.riderName ? { name: order.deliveryMeta.riderName } : null),
              paymentMethod: (order.paymentMethod || 'cash').toLowerCase(),
              customer: order.customerId ? { id: order.customerId?._id || order.customerId, name: order.customerNameSnapshot } : null,
              walkinCustomer: order.walkinCustomer || (!order.customerId ? {
                name: order.customerNameSnapshot || 'Walk-in Customer',
                phone: order.customerPhoneSnapshot || 'N/A',
              } : null),
              notes: order.notes || '',
            };
          });
      setSalesHistory(sortByDateDesc(normalized, 'date'));
    } catch (err) {
      console.warn('POS live order fetch notice:', err.message);
      setSalesHistory([]);
    } finally {
      setIsLoadingSales(false);
    }
  }, []);

  const handleCompleteSale = async () => {
    const {
      cart = [],
      saleDate = cartState?.saleDate || activeDate || getLocalDate(),
      cartSubtotal = 0,
      effectiveDeliveryCharge = 0,
      effectiveDiscount = 0,
      netPayable = 0,
      saleCategory = 'walkin',
      walkinCustomerType = 'first_time',
      walkinName = '',
      walkinPhone = '',
      ontimeCustomerName = '',
      ontimeCustomerPhone = '',
      ontimeDeliveryArea = '',
      deliverySubType = 'ontime',
      khataPaymentOption = 'khata',
      partialPaidAmount = '',
      splitDetails = {},
      orderNotes = '',
      paymentMethod = 'cash',
      cashTendered = '',
      onlineDetails = {},
      activeCustomer = null,
      activeRider = null,
      customRiderName = '',
      deliverySlot = '',
      deliveryLandmark = '',
      dropAddress = '',
      collectEmptyBottles = false,
      showFuelLog = false,
      fuelLog = {},
      handleClearCart,
    } = cartState;

    if (cart.length === 0 || isSaleRefreshing) return null;

    if (saleCategory === 'delivery') {
      if (deliverySubType === 'ontime') {
        if (!ontimeDeliveryArea || !ontimeDeliveryArea.trim()) {
          toast.error('Delivery Area / Address is required for On-Time Delivery');
          return null;
        }
      } else if (deliverySubType === 'monthly') {
        if (!activeCustomer) {
          toast.error('Please select a registered monthly customer');
          return null;
        }
      }
    }

    // Strict inventory stock check: Prevent order if live stock is 0 or insufficient
    const allProds = productsState?.products || [];
    const liveMetrics = typeof getMetrics === 'function' ? getMetrics() : {};
    for (const cartItem of cart) {
      const reqQty = Number(cartItem.quantity) || 0;
      if (reqQty <= 0) continue;
      const prod = matchProductForOrderItem(cartItem, allProds);
      if (prod) {
        const avail = resolveAvailableStock(prod, cartItem, liveMetrics);
        if (avail <= 0 || reqQty > avail) {
          toast.error(`Cannot place sale: Insufficient stock for "${prod.name}". Available: ${avail} ${prod.unit || ''}, Requested: ${reqQty}`);
          return null;
        }
      }
    }

    setIsSaleRefreshing(true);

    try {
      const liveMetrics = typeof getMetrics === 'function' ? getMetrics() : {};
      const activeRemainingFarmBuffalo = Number(liveMetrics?.remainingFarmBuffaloMilk ?? liveMetrics?.inventoryMetrics?.rawFarmBuffaloMilkStock ?? remainingFarmBuffaloMilk) || 0;
      const activeRemainingFarm = Number(liveMetrics?.inventoryMetrics?.rawFarmMilkStock ?? remainingFarmMilk) || 0;
      const activeResolver = liveMetrics?.resolveItemSourceAndRatios || resolveItemSourceAndRatios;

      const invoiceId = `INV-${1001 + salesHistory.length}`;
      const effectiveSaleDate = ensureValidDate(saleDate) || getLocalDate();
      const effectiveTimestamp = effectiveSaleDate === getLocalDate()
        ? new Date().toISOString()
        : new Date(`${effectiveSaleDate}T12:00:00.000Z`).toISOString();
      const itemSummary = cart
        .map((i) => `${i.quantity} ${i.unit || 'unit'} ${i.name} (@Rs. ${i.price})`)
        .join(' + ');

      const isRegisteredWalkin = saleCategory === 'walkin' && walkinCustomerType === 'registered';
      const isLegacyCustomerSale = saleCategory === 'customer';

      // Retrieve current live stocks for cascading deduction
      const liveStock = typeof getLiveStock === 'function' ? getLiveStock() : {};
      let currentFarmBuffalo = Math.max(0, Number(liveStock.rawFarmBuffaloMilkStock ?? liveStock.farmBuffaloMilkStock ?? remainingFarmBuffaloMilk ?? 0));
      let currentFarmCow = Math.max(0, Number(liveStock.rawFarmCowMilkStock ?? liveStock.farmCowMilkStock ?? 0));
      let currentSupplierBuffalo = Math.max(0, Number(liveStock.rawSupplierBuffaloMilkStock ?? liveStock.supplierBuffaloMilkStock ?? 0));
      let currentSupplierCow = Math.max(0, Number(liveStock.rawSupplierCowMilkStock ?? liveStock.supplierCowMilkStock ?? 0));
      let currentFarmDahi = Math.max(0, Number(liveStock.rawFarmDahiStock ?? liveStock.farmDahiStock ?? 0));
      let currentSupplierDahi = Math.max(0, Number(liveStock.rawSupplierDahiStock ?? liveStock.supplierDahiStock ?? 0));
      let farmDahiStock = currentFarmDahi;
      let supplierDahiStock = currentSupplierDahi;

      // Dynamic fallback if liveStock was 0 but products catalog contains Dahi stock
      if (farmDahiStock === 0 && supplierDahiStock === 0 && Array.isArray(productsState?.products)) {
        productsState.products.forEach((p) => {
          const n = (p.name || '').toLowerCase();
          const c = (p.category || '').toLowerCase();
          if (c.includes('dahi') || n.includes('dahi') || n.includes('yogurt') || n.includes('curd')) {
            const pStock = Number(p.stock ?? p.currentStock) || 0;
            const pSrc = (p.source || '').toLowerCase();
            if (pSrc.includes('supplier')) {
              supplierDahiStock += pStock;
            } else {
              farmDahiStock += pStock;
            }
          }
        });
        currentFarmDahi = farmDahiStock;
        currentSupplierDahi = supplierDahiStock;
      }

      const saleRecord = {
        invoiceId,
        date: effectiveSaleDate,
        timestamp: effectiveTimestamp,
        formattedDate: formatStandardDate(effectiveSaleDate),
        formattedTime: new Date(effectiveTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: cart.flatMap((i) => {
          const qty = Number(i.quantity) || 0;
          const rate = Number(i.price) || 0;
          const lineSubtotal = Math.round(qty * rate);
          const name = (i.name || '').toLowerCase();
          const category = (i.category || '').toLowerCase();
          const explicitSource = (i.source || '').toLowerCase();

          // 1. Strict Item Type Isolation
          let itemType = 'other';
          const isDahi = category.includes('dahi') || name.includes('dahi') || category.includes('yogurt') || name.includes('yogurt') || category.includes('curd') || name.includes('curd');

          if (isDahi) {
            itemType = 'dahi';
          } else if (name.includes('buffalo') || category.includes('buffalo')) {
            itemType = 'buffalo';
          } else if (name.includes('cow') || category.includes('cow')) {
            itemType = 'cow';
          } else if (name.includes('milk') || category.includes('milk')) {
            itemType = 'buffalo';
          }

          if (itemType === 'dahi') {
            const dahiSaleQuantity = qty;
            let remainingSale = dahiSaleQuantity;
            let farmDeducted = 0;
            let supplierDeducted = 0;

            // Step A (Deduct from Farm first):
            if (farmDahiStock >= remainingSale) {
              farmDeducted = remainingSale;
              farmDahiStock -= remainingSale;
              remainingSale = 0;
            } else {
              farmDeducted = farmDahiStock;
              remainingSale -= farmDahiStock;
              farmDahiStock = 0;
            }

            // Step B (Deduct remaining from Supplier):
            if (remainingSale > 0) {
              supplierDeducted = remainingSale;
              supplierDahiStock -= remainingSale;
            }

            // Sync state tracking & round to 2 decimals
            farmDeducted = Number(farmDeducted.toFixed(2));
            supplierDeducted = Number(supplierDeducted.toFixed(2));
            farmDahiStock = Math.max(0, Number(farmDahiStock.toFixed(2)));
            supplierDahiStock = Math.max(0, Number(supplierDahiStock.toFixed(2)));
            currentFarmDahi = farmDahiStock;
            currentSupplierDahi = supplierDahiStock;

            // Step 3: Strict Revenue Splitting (Farm P&L vs Supplier P&L)
            const farmDahiRevenue = Math.round(farmDeducted * rate);
            const supplierRevenue = lineSubtotal - farmDahiRevenue;
            const baseName = i.name || 'Fresh Dahi (Plain)';

            if (farmDeducted > 0 && supplierDeducted > 0) {
              return [
                {
                  ...i,
                  name: `${baseName} (Farm Share)`,
                  category: 'dahi',
                  source: 'Farm',
                  quantity: farmDeducted,
                  price: rate,
                  cost: 0,
                  subtotal: farmDahiRevenue,
                  farmRatio: dahiSaleQuantity > 0 ? Number((farmDeducted / dahiSaleQuantity).toFixed(4)) : 1,
                  supplierRatio: 0,
                  farmRevenue: farmDahiRevenue,
                  farmDahiRevenue,
                  supplierRevenue: 0,
                  farmQuantity: farmDeducted,
                  farmDeducted,
                  supplierQuantity: 0,
                  supplierDeducted: 0,
                },
                {
                  ...i,
                  name: `${baseName} (Supplier Share)`,
                  category: 'dahi',
                  source: 'Supplier',
                  quantity: supplierDeducted,
                  price: rate,
                  cost: Number(i.cost) || 0,
                  subtotal: supplierRevenue,
                  farmRatio: 0,
                  supplierRatio: dahiSaleQuantity > 0 ? Number((supplierDeducted / dahiSaleQuantity).toFixed(4)) : 1,
                  farmRevenue: 0,
                  farmDahiRevenue: 0,
                  supplierRevenue,
                  farmQuantity: 0,
                  farmDeducted: 0,
                  supplierQuantity: supplierDeducted,
                  supplierDeducted,
                },
              ];
            } else if (farmDeducted > 0) {
              return [{
                ...i,
                name: baseName,
                category: 'dahi',
                source: 'Farm',
                quantity: farmDeducted,
                price: rate,
                cost: 0,
                subtotal: farmDahiRevenue,
                farmRatio: 1,
                supplierRatio: 0,
                farmRevenue: farmDahiRevenue,
                farmDahiRevenue,
                supplierRevenue: 0,
                farmQuantity: farmDeducted,
                farmDeducted,
                supplierQuantity: 0,
                supplierDeducted: 0,
              }];
            } else {
              return [{
                ...i,
                name: baseName,
                category: 'dahi',
                source: 'Supplier',
                quantity: supplierDeducted,
                price: rate,
                cost: Number(i.cost) || 0,
                subtotal: supplierRevenue,
                farmRatio: 0,
                supplierRatio: 1,
                farmRevenue: 0,
                farmDahiRevenue: 0,
                supplierRevenue,
                farmQuantity: 0,
                farmDeducted: 0,
                supplierQuantity: supplierDeducted,
                supplierDeducted,
              }];
            }
          }

          // Handle explicit mixed source for non-dahi items (e.g. custom raw milk split)
          if (explicitSource === 'mixed' || explicitSource.includes('both')) {
            const fRatio = Math.min(1, Math.max(0, Number(i.farmRatio) || 0));
            const farmQty = Number((qty * fRatio).toFixed(3));
            const supQty = Number((qty - farmQty).toFixed(3));
            const farmRev = Math.round(lineSubtotal * fRatio);
            const supRev = lineSubtotal - farmRev;
            const baseName = i.name || 'Milk';
            const parts = [];
            if (farmQty > 0) {
              parts.push({
                ...i,
                name: `${baseName} (Farm Share)`,
                source: 'Farm',
                milkType: itemType !== 'other' ? itemType : undefined,
                quantity: farmQty,
                price: rate,
                cost: 0,
                subtotal: farmRev,
                farmRatio: 1,
                supplierRatio: 0,
                farmRevenue: farmRev,
                supplierRevenue: 0,
                farmQuantity: farmQty,
                supplierQuantity: 0,
              });
            }
            if (supQty > 0) {
              parts.push({
                ...i,
                name: `${baseName} (Supplier Share)`,
                source: 'Supplier',
                milkType: itemType !== 'other' ? itemType : undefined,
                quantity: supQty,
                price: rate,
                cost: Number(i.cost) || 0,
                subtotal: supRev,
                farmRatio: 0,
                supplierRatio: 1,
                farmRevenue: 0,
                supplierRevenue: supRev,
                farmQuantity: 0,
                supplierQuantity: supQty,
              });
            }
            return parts;
          }

          // 2. Cascading Deduction Logic: Buffalo Milk Sale (Farm Buffalo -> Supplier Buffalo)
          if (itemType === 'buffalo') {
            let remainingToDeduct = qty;
            let farmBuffaloDeducted = 0;
            let supplierBuffaloDeducted = 0;

            // Step 1: Check Farm Buffalo stock
            if (currentFarmBuffalo > 0) {
              if (remainingToDeduct <= currentFarmBuffalo) {
                // All quantity deducted from Farm Buffalo
                farmBuffaloDeducted = remainingToDeduct;
                currentFarmBuffalo = Number((currentFarmBuffalo - remainingToDeduct).toFixed(2));
                remainingToDeduct = 0;
              } else {
                // Step 2: Sale quantity exceeds Farm Buffalo stock -> deduct all available Farm Buffalo
                farmBuffaloDeducted = currentFarmBuffalo;
                remainingToDeduct = Number((remainingToDeduct - currentFarmBuffalo).toFixed(2));
                currentFarmBuffalo = 0;
              }
            }

            // Step 3: Deduct remaining quantity strictly from Supplier Buffalo
            // Strict Rule: NEVER touch farmCowMilk or supplierCowMilk under any circumstances!
            if (remainingToDeduct > 0) {
              supplierBuffaloDeducted = remainingToDeduct;
              currentSupplierBuffalo = Math.max(0, Number((currentSupplierBuffalo - remainingToDeduct).toFixed(2)));
              remainingToDeduct = 0;
            }

            // 3. Revenue Splitting (Farm vs Supplier)
            const farmRevenue = Math.round(farmBuffaloDeducted * rate);
            const supplierRevenue = lineSubtotal - farmRevenue;
            const baseName = i.name || 'Buffalo Milk';

            if (farmBuffaloDeducted > 0 && supplierBuffaloDeducted > 0) {
              return [
                {
                  ...i,
                  name: `${baseName} (Farm Share)`,
                  milkType: 'buffalo',
                  source: 'Farm',
                  quantity: Number(farmBuffaloDeducted.toFixed(2)),
                  price: rate,
                  cost: 0,
                  subtotal: farmRevenue,
                  farmRatio: 1,
                  supplierRatio: 0,
                  farmRevenue: farmRevenue,
                  supplierRevenue: 0,
                  farmQuantity: Number(farmBuffaloDeducted.toFixed(2)),
                  supplierQuantity: 0,
                },
                {
                  ...i,
                  name: `${baseName} (Supplier Share)`,
                  milkType: 'buffalo',
                  source: 'Supplier',
                  quantity: Number(supplierBuffaloDeducted.toFixed(2)),
                  price: rate,
                  cost: Number(i.cost) || 0,
                  subtotal: supplierRevenue,
                  farmRatio: 0,
                  supplierRatio: 1,
                  farmRevenue: 0,
                  supplierRevenue: supplierRevenue,
                  farmQuantity: 0,
                  supplierQuantity: Number(supplierBuffaloDeducted.toFixed(2)),
                },
              ];
            } else if (farmBuffaloDeducted > 0) {
              return [{
                ...i,
                name: baseName,
                milkType: 'buffalo',
                source: 'Farm',
                quantity: Number(farmBuffaloDeducted.toFixed(2)),
                price: rate,
                cost: 0,
                subtotal: farmRevenue,
                farmRatio: 1,
                supplierRatio: 0,
                farmRevenue: farmRevenue,
                supplierRevenue: 0,
                farmQuantity: Number(farmBuffaloDeducted.toFixed(2)),
                supplierQuantity: 0,
              }];
            } else {
              return [{
                ...i,
                name: baseName,
                milkType: 'buffalo',
                source: 'Supplier',
                quantity: Number(supplierBuffaloDeducted.toFixed(2)),
                price: rate,
                cost: Number(i.cost) || 0,
                subtotal: supplierRevenue,
                farmRatio: 0,
                supplierRatio: 1,
                farmRevenue: 0,
                supplierRevenue: supplierRevenue,
                farmQuantity: 0,
                supplierQuantity: Number(supplierBuffaloDeducted.toFixed(2)),
              }];
            }
          }

          // 2. Cascading Deduction Logic: Cow Milk Sale (Farm Cow -> Supplier Cow)
          else if (itemType === 'cow') {
            let remainingToDeduct = qty;
            let farmCowDeducted = 0;
            let supplierCowDeducted = 0;

            // Step 1: Check Farm Cow stock
            if (currentFarmCow > 0) {
              if (remainingToDeduct <= currentFarmCow) {
                // All quantity deducted from Farm Cow
                farmCowDeducted = remainingToDeduct;
                currentFarmCow = Number((currentFarmCow - remainingToDeduct).toFixed(2));
                remainingToDeduct = 0;
              } else {
                // Step 2: Sale quantity exceeds Farm Cow stock -> deduct all available Farm Cow
                farmCowDeducted = currentFarmCow;
                remainingToDeduct = Number((remainingToDeduct - currentFarmCow).toFixed(2));
                currentFarmCow = 0;
              }
            }

            // Step 3: Deduct remaining quantity strictly from Supplier Cow
            // Strict Rule: NEVER touch farmBuffaloMilk or supplierBuffaloMilk under any circumstances!
            if (remainingToDeduct > 0) {
              supplierCowDeducted = remainingToDeduct;
              currentSupplierCow = Math.max(0, Number((currentSupplierCow - remainingToDeduct).toFixed(2)));
              remainingToDeduct = 0;
            }

            // 3. Revenue Splitting (Farm vs Supplier)
            const farmRevenue = Math.round(farmCowDeducted * rate);
            const supplierRevenue = lineSubtotal - farmRevenue;
            const baseName = i.name || 'Cow Milk';

            if (farmCowDeducted > 0 && supplierCowDeducted > 0) {
              return [
                {
                  ...i,
                  name: `${baseName} (Farm Share)`,
                  milkType: 'cow',
                  source: 'Farm',
                  quantity: Number(farmCowDeducted.toFixed(2)),
                  price: rate,
                  cost: 0,
                  subtotal: farmRevenue,
                  farmRatio: 1,
                  supplierRatio: 0,
                  farmRevenue: farmRevenue,
                  supplierRevenue: 0,
                  farmQuantity: Number(farmCowDeducted.toFixed(2)),
                  supplierQuantity: 0,
                },
                {
                  ...i,
                  name: `${baseName} (Supplier Share)`,
                  milkType: 'cow',
                  source: 'Supplier',
                  quantity: Number(supplierCowDeducted.toFixed(2)),
                  price: rate,
                  cost: Number(i.cost) || 0,
                  subtotal: supplierRevenue,
                  farmRatio: 0,
                  supplierRatio: 1,
                  farmRevenue: 0,
                  supplierRevenue: supplierRevenue,
                  farmQuantity: 0,
                  supplierQuantity: Number(supplierCowDeducted.toFixed(2)),
                },
              ];
            } else if (farmCowDeducted > 0) {
              return [{
                ...i,
                name: baseName,
                milkType: 'cow',
                source: 'Farm',
                quantity: Number(farmCowDeducted.toFixed(2)),
                price: rate,
                cost: 0,
                subtotal: farmRevenue,
                farmRatio: 1,
                supplierRatio: 0,
                farmRevenue: farmRevenue,
                supplierRevenue: 0,
                farmQuantity: Number(farmCowDeducted.toFixed(2)),
                supplierQuantity: 0,
              }];
            } else {
              return [{
                ...i,
                name: baseName,
                milkType: 'cow',
                source: 'Supplier',
                quantity: Number(supplierCowDeducted.toFixed(2)),
                price: rate,
                cost: Number(i.cost) || 0,
                subtotal: supplierRevenue,
                farmRatio: 0,
                supplierRatio: 1,
                farmRevenue: 0,
                supplierRevenue: supplierRevenue,
                farmQuantity: 0,
                supplierQuantity: Number(supplierCowDeducted.toFixed(2)),
              }];
            }
          }



          // Non-raw-milk and non-dahi items (packaged goods, general grocery products)
          else {
            const resolved = resolveItemSourceAndRatios ? resolveItemSourceAndRatios(i) : { source: i.source || 'Farm', farmRatio: 1, supplierRatio: 0 };
            const farmRatio = resolved.farmRatio !== undefined ? resolved.farmRatio : (i.source === 'Supplier' ? 0 : 1);
            const supplierRatio = resolved.supplierRatio !== undefined ? resolved.supplierRatio : (i.source === 'Supplier' ? 1 : 0);
            const farmRev = Math.round(lineSubtotal * farmRatio);
            const supRev = lineSubtotal - farmRev;
            const farmQty = Number((qty * farmRatio).toFixed(3));
            const supQty = Number((qty * supplierRatio).toFixed(3));

            return [{
              ...i,
              quantity: qty,
              price: rate,
              cost: Number(i.cost) || 0,
              source: resolved.source || (supplierRatio > farmRatio ? 'Supplier' : 'Farm'),
              farmRatio,
              supplierRatio,
              farmRevenue: farmRev,
              supplierRevenue: supRev,
              farmQuantity: farmQty,
              supplierQuantity: supQty,
              subtotal: lineSubtotal,
            }];
          }

        }),
        itemCount: cart.reduce((c, i) => c + (Number(i.quantity) || 0), 0),
        subtotal: cartSubtotal,
        deliveryCharge: effectiveDeliveryCharge,
        discount: effectiveDiscount,
        netPayable,
        saleCategory,
        fulfillmentType: saleCategory === 'delivery' ? 'DELIVERY' : 'COUNTER',
        walkinCustomerType: saleCategory === 'walkin' ? walkinCustomerType : null,
        deliverySubType: saleCategory === 'delivery' ? deliverySubType : null,
        fulfillmentMode: saleCategory === 'delivery' ? 'doorstep' : 'counter',
        paymentMethod:
          saleCategory === 'delivery'
            ? 'cod'
            : isRegisteredWalkin || isLegacyCustomerSale
            ? khataPaymentOption
            : paymentMethod,
        cashTendered: paymentMethod === 'cash' || (isRegisteredWalkin && khataPaymentOption === 'cash')
          ? Number(cashTendered) || netPayable
          : null,
        changeDue: paymentMethod === 'cash' || (isRegisteredWalkin && khataPaymentOption === 'cash')
          ? Math.max(0, (Number(cashTendered) || netPayable) - netPayable)
          : 0,
        onlineDetails: paymentMethod === 'online' ? { ...onlineDetails } : null,
        walkinCustomer:
          saleCategory === 'walkin' && walkinCustomerType === 'first_time'
            ? {
                name: walkinName.trim() || 'Walk-in Customer',
                phone: walkinPhone.trim() || 'N/A',
              }
            : null,
        ontimeCustomer:
          saleCategory === 'delivery' && deliverySubType === 'ontime'
            ? {
                name: ontimeCustomerName.trim() || 'On-Time Customer',
                phone: ontimeCustomerPhone.trim() || 'N/A',
                area: ontimeDeliveryArea.trim(),
              }
            : null,
        rider:
          saleCategory === 'delivery'
            ? (activeRider || customRiderName)
              ? {
                  ...(activeRider || {}),
                  name: customRiderName || (activeRider ? activeRider.name : ''),
                  customName: customRiderName || (activeRider ? activeRider.name : ''),
                  deliverySlot,
                  deliveryLandmark,
                  dropAddress: deliverySubType === 'ontime' ? ontimeDeliveryArea.trim() : dropAddress,
                  collectEmptyBottles,
                }
              : {
                  name: '',
                  customName: '',
                  deliverySlot,
                  deliveryLandmark,
                  dropAddress: deliverySubType === 'ontime' ? ontimeDeliveryArea.trim() : dropAddress,
                  collectEmptyBottles,
                }
            : null,
        customer:
          ((saleCategory === 'walkin' && walkinCustomerType === 'registered') ||
            isLegacyCustomerSale ||
            (saleCategory === 'delivery' && deliverySubType === 'monthly')) &&
          activeCustomer
            ? {
                id: activeCustomer.id,
                name: activeCustomer.name,
                phone: activeCustomer.phone,
                area: activeCustomer.area,
              }
            : null,
        notes: orderNotes || '',
      };

      const cartItemsSnapshot = cart.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: Number(i.quantity) || 0,
        unit: i.unit || 'per kg',
        price: Number(i.price) || 0,
        subtotal: Math.round((Number(i.quantity) || 0) * (Number(i.price) || 0)),
      }));

      let directCash = 0;
      let directEasyPaisa = 0;
      let directJazzCash = 0;
      let directOnline = 0;
      let calculatedRemainingAmount = 0;

      const isRegisteredCust = (saleCategory === 'walkin' && isRegisteredWalkin && activeCustomer) || isLegacyCustomerSale;

      if (saleCategory === 'delivery') {
        calculatedRemainingAmount = netPayable;
      } else if (isRegisteredCust) {
        if (khataPaymentOption === 'cash' || paymentMethod === 'cash') {
          directCash = netPayable;
        } else if (khataPaymentOption === 'easypaisa' || paymentMethod === 'easypaisa') {
          directEasyPaisa = netPayable;
        } else if (khataPaymentOption === 'jazzcash' || paymentMethod === 'jazzcash') {
          directJazzCash = netPayable;
        } else if (khataPaymentOption === 'online' || paymentMethod === 'online') {
          const prov = String(onlineDetails?.provider || '').toUpperCase();
          if (prov.includes('EASYPAISA')) directEasyPaisa = netPayable;
          else if (prov.includes('JAZZCASH')) directJazzCash = netPayable;
          else directOnline = netPayable;
        } else if (khataPaymentOption === 'split' || paymentMethod === 'split') {
          directCash = Number(splitDetails?.cash || 0);
          directEasyPaisa = Number(splitDetails?.easyPaisa || 0);
          directJazzCash = Number(splitDetails?.jazzCash || 0);
          const totalDirect = directCash + directEasyPaisa + directJazzCash;
          calculatedRemainingAmount = Math.max(0, netPayable - totalDirect);
        } else if (khataPaymentOption === 'partial') {
          directCash = Math.min(netPayable, Math.max(0, parseFloat(partialPaidAmount) || 0));
          calculatedRemainingAmount = Math.max(0, netPayable - directCash);
        } else {
          // khata
          calculatedRemainingAmount = netPayable;
        }
      } else {
        // Anonymous walk-in
        if (paymentMethod === 'easypaisa') {
          directEasyPaisa = netPayable;
        } else if (paymentMethod === 'jazzcash') {
          directJazzCash = netPayable;
        } else if (paymentMethod === 'online') {
          const prov = String(onlineDetails?.provider || '').toUpperCase();
          if (prov.includes('EASYPAISA')) directEasyPaisa = netPayable;
          else if (prov.includes('JAZZCASH')) directJazzCash = netPayable;
          else directOnline = netPayable;
        } else if (paymentMethod === 'split') {
          directCash = Number(splitDetails?.cash || 0);
          directEasyPaisa = Number(splitDetails?.easyPaisa || 0);
          directJazzCash = Number(splitDetails?.jazzCash || 0);
        } else {
          directCash = netPayable;
        }
      }

      const totalDirectPaid = directCash + directEasyPaisa + directJazzCash + directOnline;
      const calculatedPaidAmount = totalDirectPaid;

      let backendPaymentMethod = 'CASH';
      let splitPaymentMeta = null;
      let onlineTransferMeta = null;

      if (saleCategory === 'delivery') {
        backendPaymentMethod = 'COD';
      } else if (directCash > 0 && directEasyPaisa === 0 && directJazzCash === 0 && directOnline === 0 && calculatedRemainingAmount === 0) {
        backendPaymentMethod = 'CASH';
      } else if (directEasyPaisa > 0 && directCash === 0 && directJazzCash === 0 && directOnline === 0 && calculatedRemainingAmount === 0) {
        backendPaymentMethod = 'EASYPAISA';
        onlineTransferMeta = { provider: 'EasyPaisa', transactionReference: onlineDetails?.trxId || null, senderAccount: onlineDetails?.senderAccount || null };
      } else if (directJazzCash > 0 && directCash === 0 && directEasyPaisa === 0 && directOnline === 0 && calculatedRemainingAmount === 0) {
        backendPaymentMethod = 'JAZZCASH';
        onlineTransferMeta = { provider: 'JazzCash', transactionReference: onlineDetails?.trxId || null, senderAccount: onlineDetails?.senderAccount || null };
      } else if (directOnline > 0 && directCash === 0 && directEasyPaisa === 0 && directJazzCash === 0 && calculatedRemainingAmount === 0) {
        backendPaymentMethod = 'ONLINE';
        onlineTransferMeta = { provider: onlineDetails?.provider || 'Online Transfer', transactionReference: onlineDetails?.trxId || null, senderAccount: onlineDetails?.senderAccount || null };
      } else if (calculatedRemainingAmount >= netPayable && totalDirectPaid === 0) {
        backendPaymentMethod = 'KHATA';
      } else {
        backendPaymentMethod = 'SPLIT';
        splitPaymentMeta = {
          cashAmount: directCash,
          easyPaisaAmount: directEasyPaisa,
          jazzCashAmount: directJazzCash,
          onlineAmount: directOnline + directEasyPaisa + directJazzCash,
          khataAmount: calculatedRemainingAmount,
        };
        if (directEasyPaisa > 0 || directJazzCash > 0 || directOnline > 0) {
          onlineTransferMeta = {
            provider: directEasyPaisa > 0 && directJazzCash > 0 ? 'EasyPaisa + JazzCash' : directEasyPaisa > 0 ? 'EasyPaisa' : directJazzCash > 0 ? 'JazzCash' : (onlineDetails?.provider || 'Online Transfer'),
            transactionReference: onlineDetails?.trxId || null,
            senderAccount: onlineDetails?.senderAccount || null,
          };
        }
      }

      // Ledger Sync for Active Customers (Walk-in Registered & Monthly Delivery Customers)
      const { addLedgerEntry, fetchCustomerLedger, addDelivery, addFuelLog, refreshCustomers, animalCtx, intakeCtx } = farmContexts || {};

      const validCustomerId = activeCustomer?._id || activeCustomer?.id || null;

      if (activeCustomer) {
        const isDelivery = saleCategory === 'delivery';
        const isFullPaid = calculatedPaidAmount >= netPayable;
        const isPartialPaid = calculatedPaidAmount > 0 && calculatedPaidAmount < netPayable;

        const fulfillmentLabel = isDelivery ? 'Doorstep Delivery' : 'Walk-in Counter';
        let payMethodLabel = 'Cash Payment';
        if (isDelivery) {
          payMethodLabel = 'Khata Credit';
        } else if (backendPaymentMethod === 'EASYPAISA') {
          payMethodLabel = 'Online Payment (EasyPaisa)';
        } else if (backendPaymentMethod === 'JAZZCASH') {
          payMethodLabel = 'Online Payment (JazzCash)';
        } else if (backendPaymentMethod === 'ONLINE') {
          payMethodLabel = `Online Payment (${onlineDetails?.provider || 'Online Transfer'})`;
        } else if (backendPaymentMethod === 'SPLIT') {
          if (directCash > 0 && directEasyPaisa > 0 && directJazzCash === 0) payMethodLabel = 'Split Payment: Cash + EasyPaisa';
          else if (directCash > 0 && directJazzCash > 0 && directEasyPaisa === 0) payMethodLabel = 'Split Payment: Cash + JazzCash';
          else if (directEasyPaisa > 0 && directJazzCash > 0 && directCash === 0) payMethodLabel = 'Split Payment: EasyPaisa + JazzCash';
          else payMethodLabel = 'Split Payment';
        } else if (backendPaymentMethod === 'KHATA') {
          payMethodLabel = 'Khata Credit';
        }

        const noteMsg = isDelivery
          ? 'Scheduled Doorstep Delivery (Charged to Customer Khata)'
          : isFullPaid
          ? 'No Khata / Fully Paid in Full'
          : isPartialPaid
          ? `Partial Paid: Rs. ${calculatedPaidAmount.toLocaleString()}, Remaining Baqi: Rs. ${calculatedRemainingAmount.toLocaleString()}`
          : 'Charged to Khata (Full Baqi)';

        if (typeof addLedgerEntry === 'function') {
          addLedgerEntry(
            activeCustomer.id || activeCustomer._id,
            {
              description: `POS ${isDelivery ? 'Delivery Order' : 'Counter Buy'}: ${itemSummary}`,
              debit: netPayable,
              credit: 0,
              date: effectiveSaleDate,
              orderTotal: netPayable,
              paidAmount: calculatedPaidAmount,
              remainingAmount: calculatedRemainingAmount,
              fulfillmentType: fulfillmentLabel,
              paymentMethod: payMethodLabel,
              splitPaymentMeta,
              onlineTransferMeta,
              items: cartItemsSnapshot,
              invoiceId,
              notes: orderNotes ? `${noteMsg}. ${orderNotes}` : noteMsg,
            },
            true
          );
          if (calculatedPaidAmount > 0 && calculatedRemainingAmount > 0) {
            addLedgerEntry(
              activeCustomer.id || activeCustomer._id,
              {
                description: `Payment Received (Against Order #${invoiceId}) [${payMethodLabel}]`,
                debit: 0,
                credit: calculatedPaidAmount,
                date: effectiveSaleDate,
                orderTotal: netPayable,
                paidAmount: calculatedPaidAmount,
                remainingAmount: calculatedRemainingAmount,
                fulfillmentType: fulfillmentLabel,
                paymentMethod: paymentMethod === 'online' ? 'Online Payment' : 'Cash',
                invoiceId,
                notes: `Partial Settlement: Rs. ${calculatedPaidAmount.toLocaleString()} Received`,
              },
              true
            );
          }
        }
      }

      if (saleCategory === 'delivery') {
        if (typeof addDelivery === 'function') {
          const itemDesc = cart.map((i) => `${i.quantity}x ${i.name}`).join(', ');
          const totalQty = cart.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
          const formattedDeliveryItems = cart.map((i) => ({
            name: i.name || 'Product',
            quantity: Number(i.quantity) || 1,
            unit: i.unit || 'PIECE',
            unitPrice: Number(i.price) || 0,
            subtotal: (Number(i.quantity) || 1) * (Number(i.price) || 0),
          }));

          const resolvedCustomerName =
            deliverySubType === 'ontime'
              ? (ontimeCustomerName.trim() || 'One-Time Customer')
              : (activeCustomer ? activeCustomer.name : 'Registered Customer');

          const resolvedCustomerPhone =
            deliverySubType === 'ontime'
              ? (ontimeCustomerPhone.trim() || null)
              : (activeCustomer?.phone || null);

          const resolvedDeliveryAddress =
            deliverySubType === 'ontime'
              ? ontimeDeliveryArea.trim()
              : (dropAddress || activeCustomer?.address || activeCustomer?.area || 'Direct Drop Point');

          addDelivery({
            date: effectiveSaleDate,
            shift: activeCustomer?.shift || 'MORNING',
            route: deliverySubType === 'ontime' ? ontimeDeliveryArea.trim() : (activeCustomer?.area || deliveryLandmark || 'Standard Route'),
            riderNameSnapshot: customRiderName || activeRider?.name || null,
            riderId: activeRider?.id || null,
            staffType: activeRider?.vehicleType === 'Walking Man' ? 'WALKING_BOY' : (activeRider ? 'MOTORCYCLE_RIDER' : 'OTHER'),
            customerId: deliverySubType === 'monthly' ? (validCustomerId || undefined) : undefined,
            customerName: resolvedCustomerName,
            customerPhone: resolvedCustomerPhone,
            deliveryAddress: resolvedDeliveryAddress,
            deliverySubType: deliverySubType === 'monthly' ? 'monthly' : 'ontime',
            itemDescription: itemDesc,
            qtyLiters: totalQty,
            items: formattedDeliveryItems,
            amountPaid: 0,
            amountDue: netPayable,
            paymentStatus: 'UNPAID',
            paymentMode: 'KHATA',
            codAmountToCollect: netPayable,
            source: deliverySubType === 'monthly' ? 'SCHEDULED_ROUTE' : 'POS_ONE_TIME',
            receiptNumber: invoiceId,
            bottlesReturned: 0,
          });
        }

        if (
          showFuelLog &&
          fuelLog.liters &&
          Number(fuelLog.liters) > 0 &&
          fuelLog.amount &&
          Number(fuelLog.amount) > 0 &&
          typeof addFuelLog === 'function'
        ) {
          addFuelLog({
            staffName: activeRider?.name || customRiderName || 'Unassigned',
            date: effectiveSaleDate,
            liters: Number(fuelLog.liters),
            amount: Number(fuelLog.amount),
            distanceKm: Number(fuelLog.distanceKm) || 0,
            notes: fuelLog.notes ? fuelLog.notes.trim() : '',
          });
        }
      }

      setSalesHistory((prev) => sortByDateDesc([saleRecord, ...(prev || [])], 'date'));

      // Save order to live backend POS API
      try {
        const orderCustomerName =
          deliverySubType === 'ontime'
            ? (ontimeCustomerName.trim() || 'On-Time Customer')
            : (activeCustomer?.name || (saleCategory === 'walkin' ? (walkinName.trim() || 'Walk-in Customer') : 'Customer'));

        const orderCustomerPhone =
          deliverySubType === 'ontime'
            ? (ontimeCustomerPhone.trim() || null)
            : (activeCustomer?.phone || (saleCategory === 'walkin' ? (walkinPhone.trim() || null) : null));

        if (posService && posService.createOrder) {
          await posService.createOrder({
            date: effectiveSaleDate,
            customerId: deliverySubType === 'monthly' || saleCategory === 'walkin' ? validCustomerId : null,
            customerNameSnapshot: orderCustomerName,
            customerPhoneSnapshot: orderCustomerPhone,
            fulfillmentType: saleCategory === 'delivery' ? 'DELIVERY' : 'COUNTER',
            items: saleRecord.items.map((i) => {
              const qty = Number(i.quantity) || 1;
              const price = Number(i.price) || 0;
              const lineSub = Number(i.subtotal) || (qty * price);
              return {
                productId: isObjectId(i.id) ? i.id : null,
                name: i.name || 'Product',
                sku: i.sku || null,
                category: i.category || (i.name?.toLowerCase().includes('dahi') ? 'Dahi' : 'Milk'),
                unit: String(i.unit || 'PIECE').toUpperCase().includes('L') ? 'LITER' : String(i.unit || 'PIECE').toUpperCase().includes('KG') ? 'KG' : 'PIECE',
                quantity: qty,
                unitPrice: price,
                subtotal: lineSub,
                source: i.source,
                cost: Number(i.cost) || 0,
                farmRatio: i.farmRatio !== undefined ? Number(i.farmRatio) : (i.source === 'Farm' ? 1 : 0),
                supplierRatio: i.supplierRatio !== undefined ? Number(i.supplierRatio) : (i.source === 'Supplier' ? 1 : 0),
                farmRevenue: Number(i.farmRevenue ?? i.farmDahiRevenue ?? (i.source === 'Farm' ? lineSub : 0)),
                farmDahiRevenue: Number(i.farmDahiRevenue ?? (i.source === 'Farm' && (i.category === 'dahi' || i.name?.toLowerCase().includes('dahi')) ? lineSub : 0)),
                supplierRevenue: Number(i.supplierRevenue ?? (i.source === 'Supplier' ? lineSub : 0)),
                farmQuantity: Number(i.farmQuantity ?? i.farmDeducted ?? (i.source === 'Farm' ? qty : 0)),
                farmDeducted: Number(i.farmDeducted ?? (i.source === 'Farm' && (i.category === 'dahi' || i.name?.toLowerCase().includes('dahi')) ? qty : 0)),
                supplierQuantity: Number(i.supplierQuantity ?? i.supplierDeducted ?? (i.source === 'Supplier' ? qty : 0)),
                supplierDeducted: Number(i.supplierDeducted ?? (i.source === 'Supplier' && (i.category === 'dahi' || i.name?.toLowerCase().includes('dahi')) ? qty : 0)),
              };
            }),
            subtotal: cartSubtotal,
            discountAmount: effectiveDiscount || 0,
            deliveryFee: effectiveDeliveryCharge || 0,
            grandTotal: netPayable,
            amountReceived: calculatedPaidAmount,
            changeGiven: paymentMethod === 'cash' && calculatedPaidAmount > netPayable ? calculatedPaidAmount - netPayable : 0,
            paymentMethod: backendPaymentMethod,
            splitPaymentMeta,
            onlineTransferMeta,
            deliveryMeta: saleCategory === 'delivery' ? {
              riderId: activeRider?.id || null,
              riderName: customRiderName || activeRider?.name || null,
              riderNameSnapshot: customRiderName || activeRider?.name || null,
              dropAddress: deliverySubType === 'ontime' ? ontimeDeliveryArea.trim() : (dropAddress || activeCustomer?.address || activeCustomer?.area || null),
              deliveryAddress: deliverySubType === 'ontime' ? ontimeDeliveryArea.trim() : (dropAddress || activeCustomer?.address || activeCustomer?.area || null),
              deliverySubType: deliverySubType === 'monthly' ? 'MONTHLY' : 'ON_TIME',
              customerPhone: orderCustomerPhone,
            } : null,
            notes: orderNotes || '',
          });
        }
      } catch (e) {
        console.warn('POS API order sync error:', e);
      }

      // Deduct sold quantities from active products stock immediately via deductStockAfterSale
      if (typeof productsState?.deductStockAfterSale === 'function') {
        productsState.deductStockAfterSale(cart);
      } else if (productsState?.setProducts) {
        productsState.setProducts((prevProducts) =>
          prevProducts.map((prod) => {
            const prodBase = (prod.name || '').replace(/\s*\((Farm|Supplier)\s*Share\)/i, '').trim().toLowerCase();
            let totalSoldQty = 0;
            cart.forEach((i) => {
              const cartBase = (i.name || '').replace(/\s*\((Farm|Supplier)\s*Share\)/i, '').trim().toLowerCase();
              if (
                i.id === prod.id ||
                i.id === prod._id ||
                (prod._id && i.productId === prod._id) ||
                (prod.id && i.productId === prod.id) ||
                (prod.sku && i.sku === prod.sku) ||
                (prodBase && cartBase && prodBase === cartBase)
              ) {
                totalSoldQty += Number(i.quantity) || 0;
              }
            });

            if (totalSoldQty > 0) {
              const curStock = prod.stock !== undefined ? Number(prod.stock) : (prod.currentStock !== undefined ? Number(prod.currentStock) : 0);
              const nextStock = Math.max(0, Number((curStock - totalSoldQty).toFixed(2)));
              return {
                ...prod,
                stock: nextStock,
                currentStock: nextStock,
                quantity: nextStock,
              };
            }
            return prod;
          })
        );
      }

      // Real-time Context API stock setter update without page reload
      let saleFarmMilkSold = 0;
      let saleSupplierMilkSold = 0;
      (saleRecord.items || []).forEach((item) => {
        const isMilk = String(item.category || '').toLowerCase().includes('milk') || String(item.name || '').toLowerCase().includes('milk');
        if (isMilk) {
          saleFarmMilkSold += Number(item.farmQuantity ?? (item.source === 'Farm' ? item.quantity : 0)) || 0;
          saleSupplierMilkSold += Number(item.supplierQuantity ?? (item.source === 'Supplier' ? item.quantity : 0)) || 0;
        }
      });

      if (saleFarmMilkSold > 0 && setFarmStock) {
        setFarmStock((prev) => (prev !== null ? Math.max(0, Number((prev - saleFarmMilkSold).toFixed(1))) : null));
      }
      if (saleSupplierMilkSold > 0 && setSupplierStock) {
        setSupplierStock((prev) => (prev !== null ? Math.max(0, Number((prev - saleSupplierMilkSold).toFixed(1))) : null));
      }

      // Refresh all backend data in parallel and await completion
      await Promise.allSettled([
        fetchOrders(),
        productsState?.loadProducts ? productsState.loadProducts() : Promise.resolve(),
        directOpsState?.loadProcessingBatches ? directOpsState.loadProcessingBatches() : Promise.resolve(),
        validCustomerId && typeof fetchCustomerLedger === 'function' ? fetchCustomerLedger(validCustomerId) : Promise.resolve(),
        typeof refreshCustomers === 'function' ? refreshCustomers() : Promise.resolve(),
        typeof animalCtx?.refreshAnimals === 'function' ? animalCtx.refreshAnimals() : Promise.resolve(),
        typeof intakeCtx?.refreshIntakes === 'function' ? intakeCtx.refreshIntakes() : Promise.resolve(),
      ]);

      setCompletedSaleReceipt(saleRecord);
      if (handleClearCart) handleClearCart();
      if (setPosSyncVersion) setPosSyncVersion((v) => v + 1);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pure_milk_bar_pos_sale_completed'));
        window.dispatchEvent(new Event('pure_milk_bar_dahi_updated'));
        window.dispatchEvent(new Event('pure_milk_bar_inventory_updated'));
      }
      broadcastSync('pure_milk_bar_pos_sale_completed', { invoiceId, netPayable });
      broadcastSync('pure_milk_bar_sales_updated');
      broadcastSync('pure_milk_bar_dahi_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
      broadcastSync('pure_milk_bar_daily_closing_updated');

      await new Promise((resolve) => setTimeout(resolve, 350));

      return saleRecord;
    } catch (err) {
      console.error('Error completing sale:', err);
      toast.error('Failed to complete sale: ' + (err.message || 'Unknown error'));
      return null;
    } finally {
      setIsSaleRefreshing(false);
    }
  };

  return {
    salesHistory,
    setSalesHistory,
    isLoadingSales,
    fetchOrders,
    completedSaleReceipt,
    setCompletedSaleReceipt,
    isSaleRefreshing,
    setIsSaleRefreshing,
    handleCompleteSale,
  };
}
