import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerContext } from './CustomerContext';
import { useLedgerContext } from './LedgerContext';
import { useAnimalContext } from './AnimalContext';
import { useDeliveryContext } from './DeliveryContext';
import { useIntakeContext } from './IntakeContext';
import { useFuelLogContext } from './FuelLogContext';
import { useDeliveryStaffContext } from './DeliveryStaffContext';
import { estimateDistanceKm } from '@/features/pos/utils/estimateDeliveryDistance';
import posService from '@/services/posService';

const POSContext = createContext();

// LocalStorage Keys - STRICT: No hardcoded dummy data
const STORAGE_KEY_PRODUCTS = 'pure_milk_bar_products';
const STORAGE_KEY_CART = 'pure_milk_bar_cart';
const STORAGE_KEY_SALES = 'pure_milk_bar_sales';

// Initial Dairy Catalog with explicit Source attribution ('Farm' vs 'Supplier')
// Initial Dairy Catalog with the 3 Core Products: Cow Milk, Buffalo Milk, and Dahi (Strictly 0 initial stock)
export const DEFAULT_CATALOG = [
  {
    id: 'PRD-COW-01',
    sku: 'PRD-COW-01',
    name: 'Cow Milk',
    category: 'Milk',
    unit: 'per liter',
    price: 260,
    cost: 190,
    source: 'Farm',
    stock: 0,
    status: 'Active',
    barcode: '890100101',
    storage: 'Refrigerated Chiller (0 - 4 °C)',
    frequency: 'Daily Morning & Evening Batches',
    description: 'Fresh pure cow milk directly from farm herd',
  },
  {
    id: 'PRD-BUF-01',
    sku: 'PRD-BUF-01',
    name: 'Buffalo Milk',
    category: 'Milk',
    unit: 'per liter',
    price: 290,
    cost: 210,
    source: 'Farm',
    stock: 0,
    status: 'Active',
    barcode: '890100102',
    storage: 'Refrigerated Chiller (0 - 4 °C)',
    frequency: 'Daily Morning & Evening Batches',
    description: 'Rich creamy high-fat buffalo milk directly from farm herd',
  },
  {
    id: 'PRD-DAHI-01',
    sku: 'PRD-DAHI-01',
    name: 'Dahi',
    category: 'Dahi',
    unit: 'per kg',
    price: 320,
    cost: 220,
    source: 'Farm',
    stock: 0,
    status: 'Active',
    barcode: '890100103',
    storage: 'Cold Storage Room (2 - 6 °C)',
    frequency: 'Daily Morning Batches',
    description: 'Traditional thick fresh whole milk dahi (pot yogurt)',
  },
];

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
  const animalCtx = useAnimalContext();
  const animals = animalCtx?.animals || [];
  const milkingLogs = animalCtx?.milkingLogs || [];
  const deliveryCtx = useDeliveryContext();
  const addDelivery = deliveryCtx?.addDelivery;
  const fuelLogCtx = useFuelLogContext();
  const addFuelLog = fuelLogCtx?.addFuelLog;
  const deliveryStaffCtx = useDeliveryStaffContext();
  const staffList = deliveryStaffCtx?.staffList || [];

  // Version counter to trigger re-renders on local storage events
  const [posSyncVersion, setPosSyncVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => setPosSyncVersion((v) => v + 1);
    window.addEventListener('pure_milk_bar_milking_updated', handleSync);
    window.addEventListener('pure_milk_bar_dahi_updated', handleSync);
    window.addEventListener('pure_milk_bar_sales_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('pure_milk_bar_milking_updated', handleSync);
      window.removeEventListener('pure_milk_bar_dahi_updated', handleSync);
      window.removeEventListener('pure_milk_bar_sales_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Dynamic riders derived from live delivery staff context
  const dynamicRiders = React.useMemo(() => {
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

  // =========================================================================
  // 1. PRODUCTS STATE - Always ensures Cow Milk, Buffalo Milk, and Dahi exist
  // =========================================================================
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map((p) => {
            // Reset legacy dummy stock numbers (65, 50, 35)
            const cleanStock =
              (p.stock === 65 && (p.id === 'PRD-COW-01' || p.name?.toLowerCase().includes('cow'))) ||
              (p.stock === 50 && (p.id === 'PRD-BUF-01' || p.name?.toLowerCase().includes('buff'))) ||
              (p.stock === 35 && (p.id === 'PRD-DAHI-01' || p.name?.toLowerCase().includes('dahi')))
                ? 0
                : (Number(p.stock) || 0);

            return {
              ...p,
              stock: cleanStock,
              source: p.source || (
                (p.name && (p.name.toLowerCase().includes('supplier') || p.name.toLowerCase().includes('sourced') || p.name.toLowerCase().includes('chilled'))) ||
                (p.category && (p.category.toLowerCase().includes('supplier') || p.category.toLowerCase().includes('sourced') || p.category.toLowerCase().includes('chilled')))
                  ? 'Supplier'
                  : 'Farm'
              ),
            };
          });

          // Ensure the 3 core products: Cow Milk, Buffalo Milk, and Dahi are present
          DEFAULT_CATALOG.forEach((defProd) => {
            const exists = list.some(
              (p) =>
                p.id === defProd.id ||
                p.sku === defProd.sku ||
                (p.name && p.name.toLowerCase() === defProd.name.toLowerCase()) ||
                (p.name && defProd.name.toLowerCase().includes('cow') && p.name.toLowerCase().includes('cow')) ||
                (p.name && defProd.name.toLowerCase().includes('buff') && p.name.toLowerCase().includes('buff')) ||
                (p.name && defProd.name.toLowerCase().includes('dahi') && p.name.toLowerCase().includes('dahi'))
            );
            if (!exists) {
              list.push(defProd);
            }
          });

          return list;
        }
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
    }
    return DEFAULT_CATALOG;
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
    let createdItem = null;
    setProducts((prevProducts) => {
      const nextNumber = prevProducts.length + 1;
      const generatedSku = `PRD-${String(nextNumber).padStart(3, '0')}`;

      createdItem = {
        id: newProduct.id ? newProduct.id.trim() : generatedSku,
        sku: newProduct.sku ? newProduct.sku.trim() : generatedSku,
        name: newProduct.name || 'Unnamed Product',
        category: newProduct.category || 'Milk',
        unit: newProduct.unit || 'per kg',
        source: newProduct.source || 'Farm',
        price: newProduct.price !== undefined && newProduct.price !== null && newProduct.price !== '' ? Number(newProduct.price) : 0,
        cost: newProduct.cost !== undefined && newProduct.cost !== null && newProduct.cost !== '' ? Number(newProduct.cost) : 0,
        status: newProduct.status || 'Active',
        barcode: newProduct.barcode || `890100${100 + nextNumber}`,
        storage: newProduct.storage || 'Refrigerated Chiller (0 - 4 °C)',
        frequency: newProduct.frequency || 'Daily Morning & Evening Batches',
        description: newProduct.description || '',
      };

      const updated = [createdItem, ...prevProducts];
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving products to localStorage:', err);
      }
      return updated;
    });
    return createdItem;
  };

  // B. Edit / Update Product
  const updateProduct = (updatedProduct) => {
    setProducts((prevProducts) => {
      const updated = prevProducts.map((item) => {
        if (item.id === updatedProduct.id) {
          return {
            ...item,
            ...updatedProduct,
            source: updatedProduct.source || item.source || 'Farm',
            price: updatedProduct.price !== undefined && updatedProduct.price !== null && updatedProduct.price !== '' ? Number(updatedProduct.price) : item.price,
            cost: updatedProduct.cost !== undefined && updatedProduct.cost !== null && updatedProduct.cost !== '' ? Number(updatedProduct.cost) : item.cost,
          };
        }
        return item;
      });

      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving products to localStorage:', err);
      }
      return updated;
    });
    setEditingProduct(null);

    // Also update price and name in active cart if present
    setCart((prev) =>
      prev.map((cartItem) => {
        if (cartItem.id === updatedProduct.id) {
          return {
            ...cartItem,
            name: updatedProduct.name || cartItem.name,
            price: updatedProduct.price !== undefined && updatedProduct.price !== null && updatedProduct.price !== '' ? Number(updatedProduct.price) : cartItem.price,
            unit: updatedProduct.unit || cartItem.unit,
            category: updatedProduct.category || cartItem.category,
          };
        }
        return cartItem;
      })
    );
  };

  // C. Batch Update Products
  const batchUpdateProducts = (updaterOrList) => {
    setProducts((prevProducts) => {
      let updated;
      if (typeof updaterOrList === 'function') {
        updated = updaterOrList(prevProducts);
      } else if (Array.isArray(updaterOrList)) {
        updated = updaterOrList;
      } else {
        return prevProducts;
      }

      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving products batch to localStorage:', err);
      }
      return updated;
    });
  };

  // D. Delete Product
  const deleteProduct = (productId) => {
    setProducts((prevProducts) => {
      const updated = prevProducts.filter((item) => item.id !== productId);
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving products to localStorage:', err);
      }
      return updated;
    });

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

  // Fuel Log state for delivery orders
  const [showFuelLog, setShowFuelLog] = useState(false);
  const [fuelLog, setFuelLog] = useState({
    liters: '',
    amount: '',
    distanceKm: '',
    notes: '',
  });

  const updateFuelLog = (field, value) => {
    setFuelLog((prev) => ({ ...prev, [field]: value }));
  };

  // Reset fuel log when delivery sub-type changes
  useEffect(() => {
    setShowFuelLog(false);
    setFuelLog({ liters: '', amount: '', distanceKm: '', notes: '' });
  }, [deliverySubType]);

  // Cart operations
  const handleAddToCart = (product, initialQty = 1) => {
    const addQty = typeof initialQty === 'number' && initialQty > 0 ? initialQty : 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: Number((item.quantity + addQty).toFixed(3)) } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          cost: Number(product.cost) || 0,
          unit: product.unit || 'per kg',
          category: product.category || 'Milk',
          source: product.source || 'Farm',
          quantity: addQty,
        },
      ];
    });
  };

  // Add or set item by rupee amount (e.g. Rs 50, 100, 500)
  const handleAddToCartByRupees = (product, rupees) => {
    const numRupees = parseFloat(rupees);
    if (isNaN(numRupees) || numRupees <= 0) return;
    const rate = Number(product.price) || 200;
    const calcQty = rate > 0 ? Number((numRupees / rate).toFixed(3)) : 1;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: calcQty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: rate,
          cost: Number(product.cost) || 0,
          unit: product.unit || 'per kg',
          category: product.category || 'Milk',
          source: product.source || 'Farm',
          quantity: calcQty,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const parsed = parseFloat(newQuantity);
    if (isNaN(parsed) || parsed <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: Number(parsed.toFixed(3)) } : item))
    );
  };

  // Update item quantity in cart when rupee amount is typed/selected (e.g. 100 -> 0.5L)
  const handleUpdateByRupees = (productId, rupees) => {
    const parsed = parseFloat(rupees);
    if (isNaN(parsed) || parsed <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const rate = Number(item.price) || 1;
        const calculatedQty = rate > 0 ? Number((parsed / rate).toFixed(3)) : 0;
        return {
          ...item,
          quantity: calculatedQty,
        };
      })
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
    setShowFuelLog(false);
    setFuelLog({ liters: '', amount: '', distanceKm: '', notes: '' });
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
  const activeRider = selectedRiderId
    ? dynamicRiders.find((r) => String(r.id) === String(selectedRiderId)) || null
    : null;

  // Auto-estimate distance for monthly delivery customer if not already edited
  useEffect(() => {
    if (deliverySubType === 'monthly' && activeCustomer) {
      setFuelLog((prev) => {
        if (!prev.distanceKm) {
          const estimated = estimateDistanceKm(activeCustomer);
          return { ...prev, distanceKm: String(estimated) };
        }
        return prev;
      });
    }
  }, [deliverySubType, activeCustomer]);

  // =========================================================================
  // 3. SALES & INVOICES - STRICTLY REAL DATA FROM LOCAL STORAGE (NO DUMMY SALES)
  // =========================================================================
  const [salesHistory, setSalesHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SALES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly filter out any legacy dummy records
          const realSales = parsed.filter((s) => !isLegacyDummySale(s));
          localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(realSales));
          return realSales;
        }
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

    const invoiceId = `INV-${1001 + salesHistory.length}`;
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
      items: cart.map((i) => {
        const qty = Number(i.quantity) || 0;
        const rate = Number(i.price) || 0;
        return {
          ...i,
          quantity: qty,
          price: rate,
          cost: Number(i.cost) || 0,
          source: i.source || 'Farm',
          subtotal: Math.round(qty * rate),
        };
      }),
      itemCount: cart.reduce((c, i) => c + (Number(i.quantity) || 0), 0),
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

      // Record fuel log if toggle is on and liters and amount are provided
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

    // Save order to live backend POS API
    try {
      const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
      const validCustomerId = isObjectId(activeCustomer?._id || activeCustomer?.id)
        ? (activeCustomer?._id || activeCustomer?.id)
        : null;

      posService.createOrder({
        customerId: validCustomerId,
        customerNameSnapshot: activeCustomer?.name || (saleCategory === 'walkin' ? 'Walk-in Customer' : 'Customer'),
        fulfillmentType: 'COUNTER',
        items: cart.map((i) => {
          const qty = Number(i.quantity) || 1;
          const price = Number(i.price) || 0;
          return {
            productId: isObjectId(i.id) ? i.id : null,
            name: i.name || 'Product',
            sku: i.sku || null,
            unit: String(i.unit || 'PIECE').toUpperCase().includes('L') ? 'LITER' : String(i.unit || 'PIECE').toUpperCase().includes('KG') ? 'KG' : 'PIECE',
            quantity: qty,
            unitPrice: price,
            subtotal: qty * price,
          };
        }),
        subtotal: cartSubtotal,
        discountAmount: effectiveDiscount || 0,
        deliveryFee: 0,
        grandTotal: netPayable,
        amountReceived: netPayable,
        changeGiven: 0,
        paymentMethod: ['CASH', 'KHATA', 'ONLINE', 'SPLIT'].includes(String(paymentMethod).toUpperCase())
          ? String(paymentMethod).toUpperCase()
          : 'CASH',
        notes: orderNotes || '',
      }).catch((err) => console.warn('Background POS order sync error:', err));
    } catch (e) {
      console.warn('POS API order sync error:', e);
    }

    // Deduct sold quantities from active products stock
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const soldInCart = cart.find((i) => i.id === prod.id || i.sku === prod.sku);
        if (soldInCart) {
          const qty = Number(soldInCart.quantity) || 0;
          return {
            ...prod,
            stock: Math.max(0, Number(((prod.stock || 0) - qty).toFixed(2))),
          };
        }
        return prod;
      })
    );

    setCompletedSaleReceipt(saleRecord);
    handleClearCart();
    window.dispatchEvent(new Event('pure_milk_bar_sales_updated'));
    window.dispatchEvent(new Event('storage'));
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
  // 5. INVENTORY OVERVIEW CALCULATIONS (from localStorage & API data)
  // =========================================================================
  // Real farm yield from Milking Register, logs, or active herd baseline
  const totalFarmMilk = React.useMemo(() => {
    let registerSum = 0;
    try {
      const savedRaw = localStorage.getItem('pure_milk_bar_milking_saved_entries');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed) {
          ['Morning', 'Evening'].forEach((shift) => {
            if (parsed[shift] && typeof parsed[shift] === 'object') {
              Object.values(parsed[shift]).forEach((val) => {
                const num = parseFloat(val);
                if (!isNaN(num) && num > 0) registerSum += num;
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Error reading milking register in POSContext:', e);
    }

    let logSum = 0;
    if (Array.isArray(milkingLogs) && milkingLogs.length > 0) {
      logSum = milkingLogs.reduce((acc, log) => acc + (parseFloat(log.yieldLiters || log.yield) || 0), 0);
    }

    let baselineSum = 0;
    if (Array.isArray(animals) && animals.length > 0) {
      baselineSum = animals.reduce((acc, a) => {
        const totalDaily = parseFloat(a.totalDailyYield || 0);
        if (totalDaily > 0) return acc + totalDaily;
        const morning = parseFloat(a.morningYield || 0);
        const evening = parseFloat(a.eveningYield || 0);
        return acc + (morning + evening);
      }, 0);
    }

    const resolved = registerSum > 0 ? registerSum : (logSum > 0 ? logSum : baselineSum);
    return Number(resolved.toFixed(1));
  }, [animals, milkingLogs, posSyncVersion]);

  const milkProducts = products.filter((p) => p.category && p.category.toLowerCase().includes('milk'));
  const dahiProducts = products.filter((p) => p.category && p.category.toLowerCase().includes('dahi'));

  const activeMilkPrice = milkProducts.length > 0 ? milkProducts[0].price : 0;
  const activeDahiPrice = dahiProducts.length > 0 ? dahiProducts[0].price : 0;

  let totalMilkSold = 0;
  let totalDahiSold = 0;
  let totalMilkPrice = 0;
  let totalDahiPrice = 0;

  salesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const name = item.name ? item.name.toLowerCase() : '';
      const cat = item.category ? item.category.toLowerCase() : '';
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.subtotal) || (qty * unitPrice);

      if (cat.includes('milk') || name.includes('milk')) {
        totalMilkSold += qty;
        totalMilkPrice += lineTotal > 0 ? lineTotal : (qty * (unitPrice || activeMilkPrice));
      }
      if (cat.includes('dahi') || name.includes('dahi')) {
        totalDahiSold += qty;
        totalDahiPrice += lineTotal > 0 ? lineTotal : (qty * (unitPrice || activeDahiPrice));
      }
    });
  });

  // Detailed Source Attribution Function ('Farm' vs 'Supplier')
  const resolveItemSource = (item) => {
    if (item.source === 'Supplier' || item.source === 'Farm') return item.source;
    const prod = products.find((p) => p.id === item.id || p.sku === item.sku || p.name === item.name);
    if (prod?.source) return prod.source;
    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    if (
      name.includes('supplier') ||
      name.includes('sourced') ||
      name.includes('chilled') ||
      name.includes('intake') ||
      cat.includes('supplier') ||
      cat.includes('sourced') ||
      cat.includes('chilled')
    ) {
      return 'Supplier';
    }
    return 'Farm';
  };

  const farmStats = {
    milkSold: 0,
    dahiSold: 0,
    otherSold: 0,
    milkRevenue: 0,
    dahiRevenue: 0,
    totalRevenue: 0,
    totalCost: 0,
    itemizedProducts: {},
  };

  const supplierStats = {
    milkSold: 0,
    dahiSold: 0,
    otherSold: 0,
    milkRevenue: 0,
    dahiRevenue: 0,
    totalRevenue: 0,
    totalCost: 0,
    itemizedProducts: {},
  };

  salesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const src = resolveItemSource(item);
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.subtotal) || (qty * unitPrice);
      const prodMatch = products.find((p) => p.id === item.id || p.sku === item.sku || p.name === item.name);
      const unitCost = Number(item.cost) || Number(prodMatch?.cost) || (
        src === 'Supplier'
          ? (item.category?.toLowerCase().includes('dahi') ? 215 : 228)
          : (item.category?.toLowerCase().includes('dahi') ? 220 : 190)
      );
      const lineCost = Math.round(qty * unitCost);
      const lineTotal = Number(item.total) || Math.round(qty * unitPrice);

      const isMilk = (item.category || '').toLowerCase().includes('milk') || (item.name || '').toLowerCase().includes('milk');
      const isDahi = (item.category || '').toLowerCase().includes('dahi') || (item.name || '').toLowerCase().includes('dahi');

      const target = src === 'Supplier' ? supplierStats : farmStats;

      if (isMilk) {
        target.milkSold += qty;
        target.milkRevenue += lineTotal;
      } else if (isDahi) {
        target.dahiSold += qty;
        target.dahiRevenue += lineTotal;
      } else {
        target.otherSold += qty;
      }

      target.totalRevenue += lineTotal;
      target.totalCost += lineCost;

      const pName = item.name || (isMilk ? `${src} Milk` : `${src} Dahi`);
      if (!target.itemizedProducts[pName]) {
        target.itemizedProducts[pName] = {
          id: item.id || pName,
          name: pName,
          category: item.category || (isMilk ? 'Milk' : 'Dahi'),
          unit: item.unit || (isMilk ? 'per liter' : 'per kg'),
          source: src,
          qtySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          avgRate: unitPrice,
          unitCost: unitCost,
        };
      }
      target.itemizedProducts[pName].qtySold += qty;
      target.itemizedProducts[pName].totalRevenue += lineTotal;
      target.itemizedProducts[pName].totalCost += lineCost;
    });
  });

  // Calculate Farm P&L Metrics
  const farmGrossProfit = Math.max(0, farmStats.totalRevenue - farmStats.totalCost);
  const farmGrossMargin = farmStats.totalRevenue > 0 ? Math.round((farmGrossProfit / farmStats.totalRevenue) * 100) : 0;
  const farmOverhead = Math.round(farmStats.totalRevenue * 0.12);
  const farmNetProfit = Math.max(0, farmGrossProfit - farmOverhead);
  const farmNetMargin = farmStats.totalRevenue > 0 ? Math.round((farmNetProfit / farmStats.totalRevenue) * 100) : 0;
  const farmRealizationPerLiter = farmStats.milkSold > 0 ? Number((farmNetProfit / farmStats.milkSold).toFixed(2)) : 0;

  const farmSalesMetrics = {
    source: 'Farm',
    label: 'In-House Dairy Farm',
    milkSold: Number(farmStats.milkSold.toFixed(1)),
    dahiSold: Number(farmStats.dahiSold.toFixed(1)),
    otherSold: Number(farmStats.otherSold.toFixed(1)),
    milkRevenue: farmStats.milkRevenue,
    dahiRevenue: farmStats.dahiRevenue,
    totalRevenue: farmStats.totalRevenue,
    totalCost: farmStats.totalCost,
    grossProfit: farmGrossProfit,
    grossMarginPercent: farmGrossMargin,
    allocatedOverhead: farmOverhead,
    netProfit: farmNetProfit,
    netMarginPercent: farmNetMargin,
    realizationPerLiter: farmRealizationPerLiter,
    itemizedProducts: Object.values(farmStats.itemizedProducts),
  };

  // Calculate Supplier P&L Metrics
  const supplierGrossProfit = Math.max(0, supplierStats.totalRevenue - supplierStats.totalCost);
  const supplierGrossMargin = supplierStats.totalRevenue > 0 ? Math.round((supplierGrossProfit / supplierStats.totalRevenue) * 100) : 0;
  const supplierOverhead = Math.round(supplierStats.totalRevenue * 0.10);
  const supplierNetProfit = Math.max(0, supplierGrossProfit - supplierOverhead);
  const supplierNetMargin = supplierStats.totalRevenue > 0 ? Math.round((supplierNetProfit / supplierStats.totalRevenue) * 100) : 0;
  const supplierRealizationPerLiter = supplierStats.milkSold > 0 ? Number((supplierNetProfit / supplierStats.milkSold).toFixed(2)) : 0;

  const supplierSalesMetrics = {
    source: 'Supplier',
    label: 'Supplier Procured Sourcing',
    milkSold: Number(supplierStats.milkSold.toFixed(1)),
    dahiSold: Number(supplierStats.dahiSold.toFixed(1)),
    otherSold: Number(supplierStats.otherSold.toFixed(1)),
    milkRevenue: supplierStats.milkRevenue,
    dahiRevenue: supplierStats.dahiRevenue,
    totalRevenue: supplierStats.totalRevenue,
    totalCost: supplierStats.totalCost,
    grossProfit: supplierGrossProfit,
    grossMarginPercent: supplierGrossMargin,
    allocatedOverhead: supplierOverhead,
    netProfit: supplierNetProfit,
    netMarginPercent: supplierNetMargin,
    realizationPerLiter: supplierRealizationPerLiter,
    itemizedProducts: Object.values(supplierStats.itemizedProducts),
  };

  let intakeLogs = [];
  try {
    // Clear legacy mock intake records from older mock versions
    localStorage.removeItem('pure_milk_bar_intake_records_v3');
    localStorage.removeItem('pure_milk_bar_intake_records_v2');
    localStorage.removeItem('pure_milk_bar_intake_records_v1');
    localStorage.removeItem('pure_milk_bar_intake_records');

    const intakeCtx = useIntakeContext();
    intakeLogs = intakeCtx?.intakeLogs || [];
  } catch (e) {
    intakeLogs = [];
  }

  const totalSupplierIntake = intakeLogs.reduce((sum, item) => sum + (Number(item.quantity || item.quantityLiters) || 0), 0);

  // Dahi batches for milk converted to Dahi and transferred to POS
  let farmMilkConvertedToDahi = 0;
  let supplierMilkConvertedToDahi = 0;
  let totalDahiTransferredToPOS = 0;

  try {
    const dahiSaved = localStorage.getItem('pure_milk_bar_dahi_batches_v5');
    if (dahiSaved) {
      const parsedBatches = JSON.parse(dahiSaved);
      if (Array.isArray(parsedBatches)) {
        parsedBatches.forEach((b) => {
          const numUsed = Number(b.milkUsedVal) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
          if (b.farmMilkUsed !== undefined && b.supplierMilkUsed !== undefined) {
            farmMilkConvertedToDahi += Number(b.farmMilkUsed) || 0;
            supplierMilkConvertedToDahi += Number(b.supplierMilkUsed) || 0;
          } else {
            const src = (b.source || '').toLowerCase();
            if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix')) {
              farmMilkConvertedToDahi += numUsed;
            } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix')) {
              supplierMilkConvertedToDahi += numUsed;
            } else {
              const totalSourced = totalFarmMilk + totalSupplierIntake;
              const ratio = totalSourced > 0 ? totalFarmMilk / totalSourced : 0.5;
              const fPortion = Math.round(numUsed * ratio);
              farmMilkConvertedToDahi += fPortion;
              supplierMilkConvertedToDahi += Math.max(0, numUsed - fPortion);
            }
          }

          if (b.stage === 'pos') {
            const outNum = Number(b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;
            totalDahiTransferredToPOS += outNum;
          }
        });
      }
    }
  } catch (e) {
    farmMilkConvertedToDahi = 0;
    supplierMilkConvertedToDahi = 0;
    totalDahiTransferredToPOS = 0;
  }

  // Remaining liquid milk after BOTH POS sales AND Dahi conversion:
  const remainingFarmMilk = Math.max(0, Number((totalFarmMilk - (farmSalesMetrics?.milkSold || 0) - farmMilkConvertedToDahi).toFixed(1)));
  const remainingSupplierMilk = Math.max(0, Number((totalSupplierIntake - (supplierSalesMetrics?.milkSold || 0) - supplierMilkConvertedToDahi).toFixed(1)));
  const remainingTotalMilk = Number((remainingFarmMilk + remainingSupplierMilk).toFixed(1));

  // Available live Dahi stock at POS Counter (transferred minus sold)
  const availableDahiStock = Math.max(0, Number((totalDahiTransferredToPOS - totalDahiSold).toFixed(1)));

  // Dahi Extra Profit Calculation:
  // Liquid Milk retail price: activeMilkPrice (approx Rs. 260/L)
  // Dahi retail price: activeDahiPrice (approx Rs. 320/kg)
  // Extra profit per kg = activeDahiPrice - activeMilkPrice (approx Rs. 60/kg value-add uplift)
  const dahiExtraMarginPerKg = Math.max(0, (activeDahiPrice || 320) - (activeMilkPrice || 260));
  const dahiRealizedExtraProfit = Math.round(totalDahiSold * dahiExtraMarginPerKg);
  const dahiTotalExtraProfit = Math.round(totalDahiTransferredToPOS * dahiExtraMarginPerKg);

  return (
    <POSContext.Provider
      value={{
        // Products
        products,
        setProducts,
        editingProduct,
        setEditingProduct,
        addProduct,
        updateProduct,
        editProduct: updateProduct,
        batchUpdateProducts,
        deleteProduct,

        // Cart
        cart,
        cartCount: cart.reduce((count, i) => count + (Number(i.quantity) || 0), 0),
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
        handleAddToCartByRupees,
        addToCartByRupees: handleAddToCartByRupees,
        handleUpdateQuantity,
        updateQuantity: handleUpdateQuantity,
        handleUpdateByRupees,
        updateByRupees: handleUpdateByRupees,
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
        riders: dynamicRiders,
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

        // Fuel Log
        showFuelLog,
        setShowFuelLog,
        fuelLog,
        setFuelLog,
        updateFuelLog,

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

        // Inventory & Sales metrics (Live Milk & Dahi)
        inventoryMetrics: {
          totalFarmYield: totalFarmMilk,
          farmMilkStock: remainingFarmMilk % 1 === 0 ? remainingFarmMilk.toFixed(0) : remainingFarmMilk.toFixed(1),
          totalMilk: remainingTotalMilk % 1 === 0 ? remainingTotalMilk.toFixed(0) : remainingTotalMilk.toFixed(1),
          totalMilkStock: remainingTotalMilk % 1 === 0 ? remainingTotalMilk.toFixed(0) : remainingTotalMilk.toFixed(1),
          totalSupplierIntake,
          supplierMilkStock: remainingSupplierMilk % 1 === 0 ? remainingSupplierMilk.toFixed(0) : remainingSupplierMilk.toFixed(1),
          totalDahi: availableDahiStock % 1 === 0 ? availableDahiStock.toFixed(0) : availableDahiStock.toFixed(1),
          totalDahiStock: availableDahiStock % 1 === 0 ? availableDahiStock.toFixed(0) : availableDahiStock.toFixed(1),
          totalDahiTransferred: totalDahiTransferredToPOS % 1 === 0 ? totalDahiTransferredToPOS.toFixed(0) : totalDahiTransferredToPOS.toFixed(1),
          milkSold: (totalMilkSold % 1 === 0 ? totalMilkSold.toFixed(0) : totalMilkSold.toFixed(2)),
          dahiSold: (totalDahiSold % 1 === 0 ? totalDahiSold.toFixed(0) : totalDahiSold.toFixed(2)),
          totalMilkPrice,
          totalDahiPrice,
          dahiExtraProfit: dahiRealizedExtraProfit,
          dahiTotalPotentialExtraProfit: dahiTotalExtraProfit,
          milkPrice: activeMilkPrice,
          dahiPrice: activeDahiPrice,
        },

        // Farm & Supplier Sales Source Metrics
        farmSalesMetrics,
        supplierSalesMetrics,
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
