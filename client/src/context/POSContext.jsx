import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerContext } from './CustomerContext';
import { useLedgerContext } from './LedgerContext';
import { useAnimalContext } from './AnimalContext';
import { useDeliveryContext } from './DeliveryContext';

const POSContext = createContext();

// LocalStorage Keys - STRICT: No hardcoded dummy data
const STORAGE_KEY_PRODUCTS = 'pure_milk_bar_products';
const STORAGE_KEY_CART = 'pure_milk_bar_cart';
const STORAGE_KEY_SALES = 'pure_milk_bar_sales';

// Delivery Staff with Vehicle Types (conveyance)
export const deliveryRidersList = [
  {
    id: 'RDR-01',
    name: 'Shahid Rider',
    vehicleType: 'Motorbike',
    vehicleName: 'Honda CD 70',
    plateNumber: 'LER-4521',
    phone: '0304-9988771',
    badge: 'Motorbike Rider',
  },
  {
    id: 'RDR-02',
    name: 'Rashid Minhas',
    vehicleType: 'Motorbike',
    vehicleName: 'Honda 125',
    plateNumber: 'LEK-9122',
    phone: '0301-4455223',
    badge: 'Motorbike Rider',
  },
  {
    id: 'RDR-03',
    name: 'Aslam Cycle Boy',
    vehicleType: 'Bicycle',
    vehicleName: 'Heavy Delivery Bicycle',
    plateNumber: 'Carrier Cycle',
    phone: '0321-7788990',
    badge: 'Bicycle Delivery',
  },
  {
    id: 'RDR-04',
    name: 'Babu Lal',
    vehicleType: 'Walking Man',
    vehicleName: 'Foot Delivery (Neighbourhood)',
    plateNumber: 'Walk-in',
    phone: '0333-8822114',
    badge: 'Walking Delivery Man',
  },
];

export function POSProvider({ children }) {
  const { rawCustomers = [], customers = [] } = useCustomerContext();
  const { addLedgerEntry } = useLedgerContext();
  const { animals = [] } = useAnimalContext();
  const deliveryCtx = useDeliveryContext();
  const addDelivery = deliveryCtx?.addDelivery;

  // =========================================================================
  // 1. PRODUCTS STATE - STRICTLY FROM LOCAL STORAGE (Empty [] if not found)
  // =========================================================================
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
    }
    return []; // STRICT: Start empty if nothing in localStorage
  });

  // Track product being edited (null = adding new product)
  const [editingProduct, setEditingProduct] = useState(null);

  // Sync products with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  }, [products]);

  // A. Add Product
  const addProduct = (newProduct) => {
    const nextNumber = products.length + 1;
    const generatedSku = `PRD-${String(nextNumber).padStart(3, '0')}`;

    const item = {
      id: newProduct.id ? newProduct.id.trim() : generatedSku,
      sku: newProduct.sku ? newProduct.sku.trim() : generatedSku,
      name: newProduct.name || 'Unnamed Product',
      category: newProduct.category || 'Milk',
      unit: newProduct.unit || 'per kg',
      price: Number(newProduct.price) || 0,
      cost: Number(newProduct.cost) || 0,
      status: 'Active',
      barcode: newProduct.barcode || `890100${100 + nextNumber}`,
      storage: newProduct.storage || 'Refrigerated Chiller (0 - 4 °C)',
      frequency: newProduct.frequency || 'Daily Morning & Evening Batches',
      description: newProduct.description || '',
    };

    const updated = [item, ...products];
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    return item;
  };

  // B. Edit / Update Product
  const updateProduct = (updatedProduct) => {
    const updated = products.map((item) => {
      if (item.id === updatedProduct.id) {
        return {
          ...item,
          ...updatedProduct,
          price: Number(updatedProduct.price) || item.price,
          cost: Number(updatedProduct.cost) || item.cost,
        };
      }
      return item;
    });

    setProducts(updated);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    setEditingProduct(null);

    // Also update price and name in active cart if present
    setCart((prev) =>
      prev.map((cartItem) => {
        if (cartItem.id === updatedProduct.id) {
          return {
            ...cartItem,
            name: updatedProduct.name,
            price: Number(updatedProduct.price) || cartItem.price,
            unit: updatedProduct.unit,
            category: updatedProduct.category,
          };
        }
        return cartItem;
      })
    );
  };

  // C. Delete Product
  const deleteProduct = (productId) => {
    const updated = products.filter((item) => item.id !== productId);
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));

    if (editingProduct && editingProduct.id === productId) {
      setEditingProduct(null);
    }

    // Remove from cart if present
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // =========================================================================
  // 2. CART & CHECKOUT STATE - STRICTLY FROM LOCAL STORAGE
  // =========================================================================
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return []; // Empty cart
  });

  // Sync cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [fulfillmentMode, setFulfillmentMode] = useState('counter'); // 'counter' | 'doorstep'
  
  // 2 Primary Sale Categories: 'walkin' | 'delivery'
  const [saleCategory, setSaleCategory] = useState('walkin');

  // Walk-in Customer Type: 'first_time' | 'registered'
  const [walkinCustomerType, setWalkinCustomerType] = useState('first_time');

  // Walk-in Customer Info (for first_time / guest)
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');

  // Delivery Sub-Types: 'ontime' | 'monthly'
  const [deliverySubType, setDeliverySubType] = useState('ontime');

  // Registered Customer Khata Options: 'khata' | 'cash' | 'partial'
  const [khataPaymentOption, setKhataPaymentOption] = useState('khata');
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'khata' | 'online' | 'cod'
  const [cashTendered, setCashTendered] = useState('');

  const [onlineDetails, setOnlineDetails] = useState({
    provider: 'JazzCash',
    senderAccount: '',
    trxId: '',
  });

  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [customRiderName, setCustomRiderName] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('⚡ Instant Dispatch (30 mins)');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [collectEmptyBottles, setCollectEmptyBottles] = useState(false);
  const [linkedCustomerId, setLinkedCustomerId] = useState('');

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          unit: product.unit || 'per kg',
          category: product.category || 'Milk',
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleUpdatePrice = (productId, newPrice) => {
    const validPrice = Math.max(0, Number(newPrice) || 0);
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, price: validPrice } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    setDeliveryCharge(0);
    setCashTendered('');
    setWalkinName('');
    setWalkinPhone('');
    setOrderNotes('');
    setPartialPaidAmount('');
    setLinkedCustomerId('');
    setSelectedRiderId('');
    setCustomRiderName('');
    setWalkinCustomerType('first_time');
    setOnlineDetails({ provider: 'JazzCash', senderAccount: '', trxId: '' });
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const effectiveDeliveryCharge = saleCategory === 'delivery' ? Number(deliveryCharge) || 0 : 0;
  const effectiveDiscount = Math.min(cartSubtotal, Math.max(0, Number(discount) || 0));
  const netPayable = Math.max(0, cartSubtotal + effectiveDeliveryCharge - effectiveDiscount);

  // Auto-sync cash tendered
  useEffect(() => {
    if (paymentMethod === 'cash' && cart.length > 0 && (!cashTendered || cashTendered === '0')) {
      setCashTendered(String(netPayable));
    }
  }, [netPayable, paymentMethod, cart.length]);

  const allCustomers = rawCustomers.length > 0 ? rawCustomers : customers;
  const activeCustomer = allCustomers.find((c) => String(c.id) === String(linkedCustomerId)) || null;
  const activeRider = selectedRiderId ? (deliveryRidersList.find((r) => r.id === selectedRiderId) || null) : null;

  // =========================================================================
  // 3. SALES & INVOICES - STRICTLY FROM LOCAL STORAGE
  // =========================================================================
  const [salesHistory, setSalesHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SALES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.error('Error loading sales from localStorage:', error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(salesHistory));
    } catch (error) {
      console.error('Error saving sales to localStorage:', error);
    }
  }, [salesHistory]);

  const [completedSaleReceipt, setCompletedSaleReceipt] = useState(null);

  const handleCompleteSale = () => {
    if (cart.length === 0) return null;

    const invoiceId = `INV-${1000 + salesHistory.length + 25}`;
    const todayDate = new Date().toISOString().split('T')[0];
    const itemSummary = cart
      .map((i) => `${i.quantity} ${i.unit || 'unit'} ${i.name} (@Rs. ${i.price})`)
      .join(' + ');

    const isRegisteredWalkin = saleCategory === 'walkin' && walkinCustomerType === 'registered';
    const isLegacyCustomerSale = saleCategory === 'customer';

    const saleRecord = {
      invoiceId,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formattedDate: new Date().toLocaleDateString(),
      items: [...cart],
      itemCount: cart.reduce((c, i) => c + i.quantity, 0),
      subtotal: cartSubtotal,
      deliveryCharge: effectiveDeliveryCharge,
      discount: effectiveDiscount,
      netPayable,
      saleCategory,
      walkinCustomerType: saleCategory === 'walkin' ? walkinCustomerType : null,
      deliverySubType: saleCategory === 'delivery' ? deliverySubType : null,
      fulfillmentMode: saleCategory === 'delivery' ? 'doorstep' : 'counter',
      paymentMethod:
        isRegisteredWalkin || isLegacyCustomerSale
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
      rider:
        saleCategory === 'delivery'
          ? (activeRider || customRiderName)
            ? {
                ...(activeRider || {}),
                name: customRiderName || (activeRider ? activeRider.name : ''),
                customName: customRiderName || (activeRider ? activeRider.name : ''),
                deliverySlot,
                deliveryLandmark,
                dropAddress,
                collectEmptyBottles,
              }
            : {
                name: '',
                customName: '',
                deliverySlot,
                deliveryLandmark,
                dropAddress,
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

    // Registered Customer / Monthly Subscribed Walk-in / Customer Mode: Execute exact Customer Khata Ledger Buy logic
    if ((isRegisteredWalkin || isLegacyCustomerSale) && activeCustomer) {
      const description = `POS Counter Buy: ${itemSummary}`;

      if (khataPaymentOption === 'cash') {
        addLedgerEntry(activeCustomer.id, {
          description,
          debit: netPayable,
          credit: 0,
          date: todayDate,
          method: 'Cash',
          notes: orderNotes ? `Instant POS Cash Purchase. ${orderNotes}` : 'Instant POS Cash Purchase',
        });
        addLedgerEntry(activeCustomer.id, {
          description: `Payment Received (Against POS Buy Order)`,
          debit: 0,
          credit: netPayable,
          date: todayDate,
          method: 'Cash',
          notes: 'Full immediate cash settlement',
        });
      } else if (khataPaymentOption === 'partial') {
        const paid = parseFloat(partialPaidAmount) || 0;
        addLedgerEntry(activeCustomer.id, {
          description,
          debit: netPayable,
          credit: 0,
          date: todayDate,
          method: 'Khata Credit',
          notes: orderNotes ? `Partial Cash: Rs. ${paid}. ${orderNotes}` : `Partial Cash: Rs. ${paid}`,
        });
        if (paid > 0) {
          addLedgerEntry(activeCustomer.id, {
            description: `Partial Payment (Against POS Buy Order)`,
            debit: 0,
            credit: paid,
            date: todayDate,
            method: 'Cash',
            notes: 'Partial on-the-spot payment',
          });
        }
      } else {
        // Full Khata Charge
        addLedgerEntry(activeCustomer.id, {
          description,
          debit: netPayable,
          credit: 0,
          date: todayDate,
          method: 'Khata Credit',
          notes: orderNotes ? `POS Monthly Subscribed Buy. ${orderNotes}` : 'POS Monthly Subscribed Buy',
        });
      }
    } else if (saleCategory === 'delivery') {
      const riderLabel = customRiderName || (activeRider ? activeRider.name : 'Unassigned');
      if (deliverySubType === 'monthly' && activeCustomer && paymentMethod === 'khata') {
        // Monthly Delivery charged to Khata
        addLedgerEntry(activeCustomer.id, {
          description: `POS Monthly Delivery: ${itemSummary} [${riderLabel}]`,
          debit: netPayable,
          credit: 0,
          date: todayDate,
          method: 'Khata Credit',
          notes: orderNotes ? `Doorstep Delivery. ${orderNotes}` : 'Doorstep Delivery',
        });
      }

      // Automatically register the delivery run in DeliveryContext (Drop Points table)
      if (typeof addDelivery === 'function') {
        const itemDesc = cart.map((i) => `${i.quantity}x ${i.name}`).join(', ');
        const totalQty = cart.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);
        addDelivery({
          date: todayDate,
          shift: activeCustomer?.shift || 'MORNING',
          route: activeCustomer?.area || deliveryLandmark || 'Model Town & Faisal Town',
          riderNameSnapshot: customRiderName || activeRider?.name || 'Unassigned',
          staffType: activeRider?.vehicleType === 'Walking Man' ? 'WALKING_BOY' : (activeRider ? 'MOTORCYCLE_RIDER' : 'OTHER'),
          customerId: activeCustomer ? activeCustomer.id : undefined,
          customerName: activeCustomer ? activeCustomer.name : (walkinName.trim() || 'Home Delivery Customer'),
          deliveryAddress: dropAddress || activeCustomer?.address || activeCustomer?.area || 'Model Town',
          itemDescription: itemDesc,
          qtyLiters: totalQty,
          paymentMode: paymentMethod.toUpperCase(),
          codAmountToCollect: paymentMethod === 'cod' || paymentMethod === 'cash' ? netPayable : 0,
          bottlesReturned: 0,
        });
      }
    } else if (paymentMethod === 'khata' && activeCustomer) {
      // Fallback Khata payment
      addLedgerEntry(activeCustomer.id, {
        description: `POS Counter Sale (${invoiceId})`,
        debit: netPayable,
        credit: 0,
        date: todayDate,
        method: 'Khata',
        notes: `Items: ${cart.map((i) => `${i.name} x${i.quantity}`).join(', ')}`,
      });
    }

    const updatedSales = [saleRecord, ...salesHistory];
    setSalesHistory(updatedSales);
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(updatedSales));

    setCompletedSaleReceipt(saleRecord);
    handleClearCart();
    return saleRecord;
  };

  // =========================================================================
  // 4. DIRECT KHATA PAYMENT & SETTLEMENT
  // =========================================================================
  const executeKhataPayment = ({ customerId, amountPaid, paymentMethod = 'Cash', notes = '' }) => {
    const custId = String(customerId);
    const amount = Number(amountPaid) || 0;
    if (amount <= 0) return false;

    addLedgerEntry(custId, {
      description: 'POS Counter Khata Payment Received',
      credit: amount,
      debit: 0,
      method: paymentMethod,
      notes: notes || 'Cash received at POS register',
    });

    return true;
  };

  // =========================================================================
  // 5. INVENTORY OVERVIEW CALCULATIONS (from localStorage data)
  // =========================================================================
  const totalFarmMilk = animals.reduce((sum, a) => sum + (parseFloat(a.totalDailyYield) || 0), 0);

  const milkProducts = products.filter((p) => p.category && p.category.toLowerCase().includes('milk'));
  const dahiProducts = products.filter((p) => p.category && p.category.toLowerCase().includes('dahi'));

  const activeMilkPrice = milkProducts.length > 0 ? milkProducts[0].price : 0;
  const activeDahiPrice = dahiProducts.length > 0 ? dahiProducts[0].price : 0;

  let totalMilkSold = 0;
  let totalDahiSold = 0;

  salesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const name = item.name ? item.name.toLowerCase() : '';
      const cat = item.category ? item.category.toLowerCase() : '';
      const qty = Number(item.quantity) || 0;

      if (cat.includes('milk') || name.includes('milk')) {
        totalMilkSold += qty;
      }
      if (cat.includes('dahi') || name.includes('dahi')) {
        totalDahiSold += qty;
      }
    });
  });

  return (
    <POSContext.Provider
      value={{
        // Products
        products,
        editingProduct,
        setEditingProduct,
        addProduct,
        updateProduct,
        editProduct: updateProduct,
        deleteProduct,

        // Cart
        cart,
        cartCount: cart.reduce((count, i) => count + i.quantity, 0),
        cartSubtotal,
        discount,
        setDiscount,
        deliveryCharge,
        setDeliveryCharge,
        effectiveDeliveryCharge,
        effectiveDiscount,
        netPayable,
        handleAddToCart,
        addToCart: handleAddToCart,
        handleUpdateQuantity,
        updateQuantity: handleUpdateQuantity,
        handleUpdatePrice,
        updateItemPrice: handleUpdatePrice,
        handleRemoveFromCart,
        removeFromCart: handleRemoveFromCart,
        handleClearCart,
        clearCart: handleClearCart,

        // Fulfillment & Sale Modes
        saleCategory,
        setSaleCategory,
        walkinCustomerType,
        setWalkinCustomerType,
        walkinSubType: walkinCustomerType,
        setWalkinSubType: setWalkinCustomerType,
        walkinName,
        setWalkinName,
        walkinPhone,
        setWalkinPhone,
        deliverySubType,
        setDeliverySubType,
        khataPaymentOption,
        setKhataPaymentOption,
        partialPaidAmount,
        setPartialPaidAmount,
        orderNotes,
        setOrderNotes,
        fulfillmentMode,
        setFulfillmentMode,
        riders: deliveryRidersList,
        selectedRiderId,
        setSelectedRiderId,
        activeRider,
        customRiderName,
        setCustomRiderName,
        deliverySlot,
        setDeliverySlot,
        deliveryLandmark,
        setDeliveryLandmark,
        dropAddress,
        setDropAddress,
        collectEmptyBottles,
        setCollectEmptyBottles,

        // Payment
        paymentMethod,
        setPaymentMethod,
        cashTendered,
        setCashTendered,
        onlineDetails,
        setOnlineDetails,

        // Customer
        linkedCustomerId,
        setLinkedCustomerId,
        activeCustomer,
        registeredCustomers: allCustomers,

        // Sales
        handleCompleteSale,
        completeSale: handleCompleteSale,
        completedSaleReceipt,
        setCompletedSaleReceipt,
        salesHistory,

        // Direct Khata
        executeKhataPayment,

        // 6 Inventory metrics
        inventoryMetrics: {
          totalMilk: (totalFarmMilk > 0 ? totalFarmMilk : 0).toFixed(1),
          totalDahi: products.filter((p) => p.category.toLowerCase().includes('dahi')).length > 0 ? 110 : 0,
          milkSold: totalMilkSold.toFixed(1),
          dahiSold: totalDahiSold.toFixed(1),
          milkPrice: activeMilkPrice,
          dahiPrice: activeDahiPrice,
        },
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
  return useContext(POSContext);
}

export function useProductContext() {
  return useContext(POSContext);
}

export { POSContext };
export default POSProvider;
