import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import posService from '@/services/posService.js';
import { broadcastSync } from '@/utils/syncBroadcaster';
import { isLegacyDummySale, isObjectId } from './posHelpers';

export function usePOSOrders({
  cartState,
  productsState,
  directOpsState,
  farmContexts,
  setFarmStock,
  setSupplierStock,
  setPosSyncVersion,
  getMetrics,
  remainingFarmBuffaloMilk = 0,
  remainingFarmMilk = 0,
  resolveItemSourceAndRatios,
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
          const dateStr = order.date ? (typeof order.date === 'string' && order.date.includes('T') ? order.date.split('T')[0] : String(order.date).slice(0, 10)) : (order.createdAt ? order.createdAt.split('T')[0] : '');

          return {
              ...order,
              invoiceId: order.receiptNumber || order.orderNumber || order.invoiceId || (order._id ? `INV-${String(order._id).slice(-6)}` : `INV-${Date.now()}`),
              id: order._id || order.id,
              date: dateStr,
              timestamp: order.createdAt || order.date || new Date().toISOString(),
              formattedTime: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              formattedDate: dateStr || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''),
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
      setSalesHistory(normalized);
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

    setIsSaleRefreshing(true);

    try {
      const liveMetrics = typeof getMetrics === 'function' ? getMetrics() : {};
      const activeRemainingFarmBuffalo = Number(liveMetrics?.remainingFarmBuffaloMilk ?? liveMetrics?.inventoryMetrics?.rawFarmBuffaloMilkStock ?? remainingFarmBuffaloMilk) || 0;
      const activeRemainingFarm = Number(liveMetrics?.inventoryMetrics?.rawFarmMilkStock ?? remainingFarmMilk) || 0;
      const activeResolver = liveMetrics?.resolveItemSourceAndRatios || resolveItemSourceAndRatios;

      const invoiceId = `INV-${1001 + salesHistory.length}`;
      const todayDate = new Date().toISOString().split('T')[0];
      const itemSummary = cart
        .map((i) => `${i.quantity} ${i.unit || 'unit'} ${i.name} (@Rs. ${i.price})`)
        .join(' + ');

      const isRegisteredWalkin = saleCategory === 'walkin' && walkinCustomerType === 'registered';
      const isLegacyCustomerSale = saleCategory === 'customer';

      const saleRecord = {
        invoiceId,
        date: todayDate,
        timestamp: new Date().toISOString(),
        formattedDate: todayDate,
        items: cart.flatMap((i) => {
          const qty = Number(i.quantity) || 0;
          const rate = Number(i.price) || 0;
          const lineSubtotal = Math.round(qty * rate);
          const name = (i.name || '').toLowerCase();
          const category = (i.category || '').toLowerCase();
          const isBuffalo = name.includes('buffalo');
          const isCow = name.includes('cow');
          const isMilk = name.includes('milk') || category.includes('milk');
          const isGenericMilk = isMilk && !isBuffalo && !isCow;

          // The cashier's POS selection (source: 'Farm' | 'Supplier' | 'Mixed') is the single
          // source of truth. Stock is deducted ONLY from the selected entity.
          const explicitSource = (i.source || '').toLowerCase();
          const isExplicitFarm = explicitSource === 'farm';
          const isExplicitSupplier = explicitSource === 'supplier';
          const isExplicitMixed = explicitSource === 'mixed' || explicitSource.includes('both');

          if (isExplicitMixed) {
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

          if (isExplicitFarm || (isCow && !isExplicitSupplier)) {
            return [{
              ...i,
              quantity: qty,
              price: rate,
              cost: Number(i.cost) || 0,
              source: 'Farm',
              farmRatio: 1,
              supplierRatio: 0,
              farmRevenue: lineSubtotal,
              supplierRevenue: 0,
              farmQuantity: qty,
              supplierQuantity: 0,
              subtotal: lineSubtotal,
            }];
          }

          if (isExplicitSupplier) {
            return [{
              ...i,
              quantity: qty,
              price: rate,
              cost: Number(i.cost) || 0,
              source: 'Supplier',
              farmRatio: 0,
              supplierRatio: 1,
              farmRevenue: 0,
              supplierRevenue: lineSubtotal,
              farmQuantity: 0,
              supplierQuantity: qty,
              subtotal: lineSubtotal,
            }];
          }

          if (isBuffalo || isGenericMilk) {
            const availableFarm = isBuffalo ? Math.max(0, Number(activeRemainingFarmBuffalo) || 0) : Math.max(0, Number(activeRemainingFarm) || 0);
            const farmQty = Math.min(availableFarm, qty);
            const supQty = Math.max(0, Number((qty - farmQty).toFixed(2)));

            const farmRev = Math.round(farmQty * rate);
            const supRev = lineSubtotal - farmRev;

            const baseName = isBuffalo ? 'Buffalo Milk' : (i.name || 'Milk');

            if (farmQty > 0 && supQty > 0) {
              return [
                {
                  ...i,
                  name: `${baseName} (Farm Share)`,
                  source: 'Farm',
                  quantity: Number(farmQty.toFixed(2)),
                  price: rate,
                  cost: Number(i.cost) || 0,
                  subtotal: farmRev,
                  farmRatio: 1,
                  supplierRatio: 0,
                  farmRevenue: farmRev,
                  supplierRevenue: 0,
                  farmQuantity: Number(farmQty.toFixed(2)),
                  supplierQuantity: 0,
                },
                {
                  ...i,
                  name: `${baseName} (Supplier Share)`,
                  source: 'Supplier',
                  quantity: Number(supQty.toFixed(2)),
                  price: rate,
                  cost: Number(i.cost) || 0,
                  subtotal: supRev,
                  farmRatio: 0,
                  supplierRatio: 1,
                  farmRevenue: 0,
                  supplierRevenue: supRev,
                  farmQuantity: 0,
                  supplierQuantity: Number(supQty.toFixed(2)),
                },
              ];
            }

            if (farmQty > 0) {
              return [{
                ...i,
                name: baseName,
                source: 'Farm',
                quantity: Number(farmQty.toFixed(2)),
                price: rate,
                cost: Number(i.cost) || 0,
                subtotal: farmRev,
                farmRatio: 1,
                supplierRatio: 0,
                farmRevenue: farmRev,
                supplierRevenue: 0,
                farmQuantity: Number(farmQty.toFixed(2)),
                supplierQuantity: 0,
              }];
            }

            return [{
              ...i,
              name: baseName,
              source: 'Supplier',
              quantity: Number(supQty.toFixed(2)),
              price: rate,
              cost: Number(i.cost) || 0,
              subtotal: supRev,
              farmRatio: 0,
              supplierRatio: 1,
              farmRevenue: 0,
              supplierRevenue: supRev,
              farmQuantity: 0,
              supplierQuantity: Number(supQty.toFixed(2)),
            }];
          }

          const resolved = activeResolver ? activeResolver(i) : { source: i.source || 'Farm', farmRatio: 1, supplierRatio: 0 };
          const farmRatio = resolved.farmRatio !== undefined ? resolved.farmRatio : (i.source === 'Farm' ? 1 : 0);
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
            source: resolved.source || i.source || 'Farm',
            farmRatio,
            supplierRatio,
            farmRevenue: farmRev,
            supplierRevenue: supRev,
            farmQuantity: farmQty,
            supplierQuantity: supQty,
            subtotal: lineSubtotal,
          }];
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

      let calculatedPaidAmount = netPayable;
      let calculatedRemainingAmount = 0;

      if (saleCategory === 'walkin' && isRegisteredWalkin && activeCustomer) {
        if (khataPaymentOption === 'cash' || paymentMethod === 'cash' || paymentMethod === 'online') {
          calculatedPaidAmount = netPayable;
          calculatedRemainingAmount = 0;
        } else if (khataPaymentOption === 'partial') {
          calculatedPaidAmount = Math.min(netPayable, Math.max(0, parseFloat(partialPaidAmount) || 0));
          calculatedRemainingAmount = Math.max(0, netPayable - calculatedPaidAmount);
        } else {
          calculatedPaidAmount = 0;
          calculatedRemainingAmount = netPayable;
        }
      } else if (saleCategory === 'delivery') {
        calculatedPaidAmount = 0;
        calculatedRemainingAmount = netPayable;
      }

      let backendPaymentMethod = 'CASH';
      let splitPaymentMeta = null;

      if (saleCategory === 'delivery') {
        backendPaymentMethod = 'COD';
      } else if (calculatedPaidAmount >= netPayable) {
        backendPaymentMethod = paymentMethod === 'online' ? 'ONLINE' : 'CASH';
      } else if (calculatedPaidAmount <= 0) {
        backendPaymentMethod = 'KHATA';
      } else {
        backendPaymentMethod = 'SPLIT';
        splitPaymentMeta = {
          cashAmount: paymentMethod === 'online' ? 0 : calculatedPaidAmount,
          onlineAmount: paymentMethod === 'online' ? calculatedPaidAmount : 0,
          khataAmount: calculatedRemainingAmount,
        };
      }

      // Ledger Sync for Active Customers (Walk-in Registered & Monthly Delivery Customers)
      const { addLedgerEntry, fetchCustomerLedger, addDelivery, addFuelLog, refreshCustomers, animalCtx, intakeCtx } = farmContexts || {};

      const validCustomerId = activeCustomer?._id || activeCustomer?.id || null;

      if (activeCustomer) {
        const isDelivery = saleCategory === 'delivery';
        const isFullPaid = calculatedPaidAmount >= netPayable;
        const isPartialPaid = calculatedPaidAmount > 0 && calculatedPaidAmount < netPayable;

        const fulfillmentLabel = isDelivery ? 'Doorstep Delivery' : 'Walk-in Counter';
        const payMethodLabel = isDelivery
          ? 'Khata Credit'
          : paymentMethod === 'online'
          ? 'Online Payment'
          : paymentMethod === 'khata'
          ? 'Khata Credit'
          : 'Cash';

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
              date: todayDate,
              orderTotal: netPayable,
              paidAmount: calculatedPaidAmount,
              remainingAmount: calculatedRemainingAmount,
              fulfillmentType: fulfillmentLabel,
              paymentMethod: payMethodLabel,
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
                date: todayDate,
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
            date: todayDate,
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
            date: todayDate,
            liters: Number(fuelLog.liters),
            amount: Number(fuelLog.amount),
            distanceKm: Number(fuelLog.distanceKm) || 0,
            notes: fuelLog.notes ? fuelLog.notes.trim() : '',
          });
        }
      }

      setSalesHistory((prev) => [saleRecord, ...prev]);

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
                farmRevenue: Number(i.farmRevenue ?? (i.source === 'Farm' ? lineSub : 0)),
                supplierRevenue: Number(i.supplierRevenue ?? (i.source === 'Supplier' ? lineSub : 0)),
                farmQuantity: Number(i.farmQuantity ?? (i.source === 'Farm' ? qty : 0)),
                supplierQuantity: Number(i.supplierQuantity ?? (i.source === 'Supplier' ? qty : 0)),
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
