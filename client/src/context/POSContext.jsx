import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useCustomerContext } from './CustomerContext';
import { useLedgerContext } from './LedgerContext';
import { useAnimalContext } from './AnimalContext';
import { useDeliveryContext } from './DeliveryContext';
import { useIntakeContext } from './IntakeContext';
import { useExpense } from './ExpenseContext';
import { useSourcExpenseContext } from './SourcExpenseContext';
import { useFuelLogContext } from './FuelLogContext';
import { useDeliveryStaffContext } from './DeliveryStaffContext';
import { subscribeToSync } from '@/utils/syncBroadcaster';

// Modular Sub-Hooks & Utilities
import { isTodayDate, isLegacyDummySale, deliveryRidersList, defaultPOSContextValue } from './pos/posHelpers';
import { usePOSProducts } from './pos/usePOSProducts';
import { usePOSCart } from './pos/usePOSCart';
import { usePOSDirectOperations } from './pos/usePOSDirectOperations';
import { usePOSOrders } from './pos/usePOSOrders';
import { usePOSMetrics } from './pos/usePOSMetrics';

export { isTodayDate, isLegacyDummySale, deliveryRidersList, defaultPOSContextValue };

const POSContext = createContext(defaultPOSContextValue);

export function POSProvider({ children }) {
  // Domain Contexts
  const { rawCustomers = [], customers = [], refreshCustomers } = useCustomerContext();
  const { addLedgerEntry, fetchCustomerLedger } = useLedgerContext() || {};
  const animalCtx = useAnimalContext();
  const animals = animalCtx?.animals || [];
  const milkingLogs = animalCtx?.milkingLogs || [];
  const deliveryCtx = useDeliveryContext();
  const addDelivery = deliveryCtx?.addDelivery;
  const fuelLogCtx = useFuelLogContext();
  const addFuelLog = fuelLogCtx?.addFuelLog;
  const deliveryStaffCtx = useDeliveryStaffContext();
  const staffList = deliveryStaffCtx?.staffList || [];
  const intakeCtx = useIntakeContext();
  const intakeLogs = intakeCtx?.intakeLogs || [];
  const expenseCtx = useExpense();
  const farmExpensesList = expenseCtx?.expenses || [];
  const sourcExpenseCtx = useSourcExpenseContext();
  const supplierExpensesList = sourcExpenseCtx?.expenses || [];

  const allCustomers = rawCustomers.length > 0 ? rawCustomers : customers;

  // Dynamic riders derived from live delivery staff context
  const dynamicRiders = useMemo(() => {
    if (Array.isArray(staffList) && staffList.length > 0) {
      return staffList.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone || s.mobile || '',
        vehicleType: s.type === 'WALKING' ? 'Walking Man' : 'Motorbike',
        vehicleName: s.vehicle || (s.type === 'WALKING' ? 'On Foot' : 'Motorbike'),
        plateNumber: s.vehicle || 'Standard',
        active: s.active !== false,
        badge: s.type === 'WALKING' ? 'Walking Courier' : 'Delivery Rider',
      }));
    }
    return [];
  }, [staffList]);

  // Version counter to trigger re-renders on local storage / broadcast sync events
  const [posSyncVersion, setPosSyncVersion] = useState(0);

  // Dynamic stock overrides for instant setter sync without page reload
  const [farmStock, setFarmStock] = useState(null);
  const [supplierStock, setSupplierStock] = useState(null);

  // 1. Modular Products Hook
  const productsState = usePOSProducts();

  // 2. Modular Direct Operations (Batches, sellMilk, convertToDahi, executeKhataPayment)
  const directOpsState = usePOSDirectOperations({
    products: productsState.products,
    setProducts: productsState.setProducts,
    setFarmStock,
    setSupplierStock,
    setPosSyncVersion,
    addLedgerEntry,
  });

  // 3. Modular Cart & Checkout State Hook
  const cartState = usePOSCart({
    processingBatches: directOpsState.processingBatches,
    allCustomers,
    dynamicRiders,
  });

  // 4. Modular Orders & Invoices Lifecycle Hook
  const ordersState = usePOSOrders({
    cartState,
    productsState,
    directOpsState,
    farmContexts: {
      addLedgerEntry,
      fetchCustomerLedger,
      addDelivery,
      addFuelLog,
      refreshCustomers,
      animalCtx,
      intakeCtx,
    },
    setFarmStock,
    setSupplierStock,
    setPosSyncVersion,
  });

  // Connect order receipt / history setters to directOpsState
  useEffect(() => {
    directOpsState.setSalesHistory = ordersState.setSalesHistory;
    directOpsState.setCompletedSaleReceipt = ordersState.setCompletedSaleReceipt;
  }, [ordersState.setSalesHistory, ordersState.setCompletedSaleReceipt]);

  // 5. Modular Inventory Metrics & P&L Attribution Hook
  const metricsState = usePOSMetrics({
    animals,
    milkingLogs,
    intakeLogs,
    products: productsState.products,
    salesHistory: ordersState.salesHistory,
    processingBatches: directOpsState.processingBatches,
    farmExpensesList,
    supplierExpensesList,
    expenseTotals: expenseCtx?.totals,
    farmStock,
    supplierStock,
    posSyncVersion,
  });

  // Wire remaining stock & attribution resolution into ordersState
  ordersState.remainingFarmBuffaloMilk = metricsState.remainingFarmBuffaloMilk;
  ordersState.remainingFarmMilk = metricsState.inventoryMetrics?.rawFarmMilkStock || 0;
  ordersState.resolveItemSourceAndRatios = metricsState.resolveItemSourceAndRatios;

  // Real-Time Event Sync Engine & Heartbeat
  const { fetchOrders } = ordersState;
  const { loadProcessingBatches } = directOpsState;
  const { loadProducts } = productsState;

  useEffect(() => {
    fetchOrders();
    loadProcessingBatches();
    loadProducts();

    const handleSync = () => {
      setPosSyncVersion((v) => v + 1);
      fetchOrders();
      loadProcessingBatches();
      loadProducts();
      if (typeof animalCtx?.refreshAnimals === 'function') {
        animalCtx.refreshAnimals();
      }
      if (typeof intakeCtx?.refreshIntakes === 'function') {
        intakeCtx.refreshIntakes();
      }
      if (typeof refreshCustomers === 'function') {
        refreshCustomers();
      }
    };

    const unsubscribeBroadcast = subscribeToSync(() => {
      handleSync();
    });

    window.addEventListener('pure_milk_bar_milking_updated', handleSync);
    window.addEventListener('pure_milk_bar_intake_updated', handleSync);
    window.addEventListener('pure_milk_bar_dahi_updated', handleSync);
    window.addEventListener('pure_milk_bar_sales_updated', handleSync);
    window.addEventListener('pure_milk_bar_pos_sale_completed', handleSync);
    window.addEventListener('pure_milk_bar_inventory_updated', handleSync);
    window.addEventListener('pure_milk_bar_daily_closing_updated', handleSync);
    window.addEventListener('focus', handleSync);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const heartbeatInterval = setInterval(() => {
      handleSync();
    }, 3000);

    return () => {
      clearInterval(heartbeatInterval);
      unsubscribeBroadcast();
      window.removeEventListener('pure_milk_bar_milking_updated', handleSync);
      window.removeEventListener('pure_milk_bar_intake_updated', handleSync);
      window.removeEventListener('pure_milk_bar_dahi_updated', handleSync);
      window.removeEventListener('pure_milk_bar_sales_updated', handleSync);
      window.removeEventListener('pure_milk_bar_pos_sale_completed', handleSync);
      window.removeEventListener('pure_milk_bar_inventory_updated', handleSync);
      window.removeEventListener('pure_milk_bar_daily_closing_updated', handleSync);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadProcessingBatches, fetchOrders, loadProducts, animalCtx, intakeCtx, refreshCustomers]);

  return (
    <POSContext.Provider
      value={{
        // Products
        products: productsState.products,
        setProducts: productsState.setProducts,
        editingProduct: productsState.editingProduct,
        setEditingProduct: productsState.setEditingProduct,
        addProduct: productsState.addProduct,
        updateProduct: productsState.updateProduct,
        editProduct: productsState.updateProduct,
        batchUpdateProducts: productsState.batchUpdateProducts,
        deleteProduct: productsState.deleteProduct,

        // Cart
        cart: cartState.cart,
        cartCount: cartState.cartCount,
        cartSubtotal: cartState.cartSubtotal,
        discount: cartState.discount,
        setDiscount: cartState.setDiscount,
        deliveryCharge: cartState.deliveryCharge,
        setDeliveryCharge: cartState.setDeliveryCharge,
        effectiveDeliveryCharge: cartState.effectiveDeliveryCharge,
        effectiveDiscount: cartState.effectiveDiscount,
        netPayable: cartState.netPayable,
        handleAddToCart: cartState.handleAddToCart,
        addToCart: cartState.handleAddToCart,
        handleAddToCartByRupees: cartState.handleAddToCartByRupees,
        addToCartByRupees: cartState.handleAddToCartByRupees,
        handleUpdateItemSource: cartState.handleUpdateItemSource,
        handleUpdateQuantity: cartState.handleUpdateQuantity,
        updateQuantity: cartState.handleUpdateQuantity,
        handleUpdateByRupees: cartState.handleUpdateByRupees,
        updateByRupees: cartState.handleUpdateByRupees,
        handleUpdatePrice: cartState.handleUpdatePrice,
        updateItemPrice: cartState.handleUpdatePrice,
        handleRemoveFromCart: cartState.handleRemoveFromCart,
        removeFromCart: cartState.handleRemoveFromCart,
        handleClearCart: cartState.handleClearCart,
        clearCart: cartState.handleClearCart,

        // Fulfillment & Sale Modes
        saleCategory: cartState.saleCategory,
        setSaleCategory: cartState.setSaleCategory,
        walkinCustomerType: cartState.walkinCustomerType,
        setWalkinCustomerType: cartState.setWalkinCustomerType,
        walkinSubType: cartState.walkinCustomerType,
        setWalkinSubType: cartState.setWalkinCustomerType,
        walkinName: cartState.walkinName,
        setWalkinName: cartState.setWalkinName,
        walkinPhone: cartState.walkinPhone,
        setWalkinPhone: cartState.setWalkinPhone,
        ontimeCustomerName: cartState.ontimeCustomerName,
        setOntimeCustomerName: cartState.setOntimeCustomerName,
        ontimeCustomerPhone: cartState.ontimeCustomerPhone,
        setOntimeCustomerPhone: cartState.setOntimeCustomerPhone,
        ontimeDeliveryArea: cartState.ontimeDeliveryArea,
        setOntimeDeliveryArea: cartState.setOntimeDeliveryArea,
        deliverySubType: cartState.deliverySubType,
        setDeliverySubType: cartState.setDeliverySubType,
        khataPaymentOption: cartState.khataPaymentOption,
        setKhataPaymentOption: cartState.setKhataPaymentOption,
        partialPaidAmount: cartState.partialPaidAmount,
        setPartialPaidAmount: cartState.setPartialPaidAmount,
        orderNotes: cartState.orderNotes,
        setOrderNotes: cartState.setOrderNotes,
        fulfillmentMode: cartState.fulfillmentMode,
        setFulfillmentMode: cartState.setFulfillmentMode,
        riders: dynamicRiders,
        selectedRiderId: cartState.selectedRiderId,
        setSelectedRiderId: cartState.setSelectedRiderId,
        activeRider: cartState.activeRider,
        customRiderName: cartState.customRiderName,
        setCustomRiderName: cartState.setCustomRiderName,
        deliverySlot: cartState.deliverySlot,
        setDeliverySlot: cartState.setDeliverySlot,
        deliveryLandmark: cartState.deliveryLandmark,
        setDeliveryLandmark: cartState.setDeliveryLandmark,
        dropAddress: cartState.dropAddress,
        setDropAddress: cartState.setDropAddress,
        collectEmptyBottles: cartState.collectEmptyBottles,
        setCollectEmptyBottles: cartState.setCollectEmptyBottles,

        // Fuel Log
        showFuelLog: cartState.showFuelLog,
        setShowFuelLog: cartState.setShowFuelLog,
        fuelLog: cartState.fuelLog,
        setFuelLog: cartState.setFuelLog,
        updateFuelLog: cartState.updateFuelLog,

        // Payment
        paymentMethod: cartState.paymentMethod,
        setPaymentMethod: cartState.setPaymentMethod,
        codPaymentOption: cartState.codPaymentOption,
        setCodPaymentOption: cartState.setCodPaymentOption,
        codPaidAmount: cartState.codPaidAmount,
        setCodPaidAmount: cartState.setCodPaidAmount,
        cashTendered: cartState.cashTendered,
        setCashTendered: cartState.setCashTendered,
        onlineDetails: cartState.onlineDetails,
        setOnlineDetails: cartState.setOnlineDetails,

        // Customer
        linkedCustomerId: cartState.linkedCustomerId,
        setLinkedCustomerId: cartState.setLinkedCustomerId,
        activeCustomer: cartState.activeCustomer,
        registeredCustomers: allCustomers,

        // Sales
        isSaleRefreshing: ordersState.isSaleRefreshing,
        sellMilk: directOpsState.sellMilk,
        handleCompleteSale: ordersState.handleCompleteSale,
        completeSale: ordersState.handleCompleteSale,
        completedSaleReceipt: ordersState.completedSaleReceipt,
        setCompletedSaleReceipt: ordersState.setCompletedSaleReceipt,
        salesHistory: ordersState.salesHistory,
        farmSalesHistory: metricsState.farmSalesHistory,
        supplierSalesHistory: metricsState.supplierSalesHistory,

        // Dahi Conversion & Real-time Stock Sync
        farmStock,
        setFarmStock,
        supplierStock,
        setSupplierStock,
        convertToDahi: directOpsState.convertToDahi,
        recordDahiConversion: directOpsState.recordDahiConversion,

        // Direct Khata
        executeKhataPayment: directOpsState.executeKhataPayment,

        // Inventory & Sales Metrics
        inventoryMetrics: metricsState.inventoryMetrics,
        farmSalesMetrics: metricsState.farmSalesMetrics,
        supplierSalesMetrics: metricsState.supplierSalesMetrics,
        businessFinancialMetrics: metricsState.businessFinancialMetrics,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

// Unified Aliases & Context Hooks
export const ProductContext = POSContext;
export const ProductProvider = POSProvider;

export function usePOSContext() {
  return useContext(POSContext) || defaultPOSContextValue;
}

export function useProductContext() {
  return useContext(POSContext);
}

export { POSContext };
export default POSProvider;
