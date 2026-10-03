import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerContext } from './CustomerContext';
import { useLedgerContext } from './LedgerContext';
import { useAnimalContext } from './AnimalContext';
import { useDeliveryContext } from './DeliveryContext';
import { useIntakeContext } from './IntakeContext';
import { useExpense } from './ExpenseContext';
import { useSourcExpenseContext } from './SourcExpenseContext';
import { useFuelLogContext } from './FuelLogContext';
import { useDeliveryStaffContext } from './DeliveryStaffContext';
import { estimateDistanceKm } from '@/features/pos/utils/estimateDeliveryDistance';
import posService from '@/services/posService';
import { toast } from 'sonner';
import farmService from '@/services/farmService';
const defaultPOSContextValue = {
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
  handleCompleteSale: () => null,
};

const POSContext = createContext(defaultPOSContextValue);

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


// Delivery Staff with Vehicle Types (Dynamically populated from DeliveryStaffContext)
export const deliveryRidersList = [];

export function POSProvider({ children }) {
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

  // Version counter to trigger re-renders on local storage events
  const [posSyncVersion, setPosSyncVersion] = useState(0);

  // Dynamic stock overrides for instant setter sync without page reload
  const [farmStock, setFarmStock] = useState(null);
  const [supplierStock, setSupplierStock] = useState(null);

  const [processingBatches, setProcessingBatches] = useState([]);
  const loadProcessingBatches = React.useCallback(async () => {
    try {
      const res = await farmService.getProcessingBatches();
      const list = Array.isArray(res) ? res : res?.batches || res?.data || [];
      setProcessingBatches((prev) => {
        const fetchedIds = new Set(list.map((b) => String(b._id || b.id || b.batchNumber)));
        const pendingBatches = prev.filter(
          (b) => b.id && !fetchedIds.has(String(b.id)) && String(b.id).startsWith('BATCH-')
        );
        return [...pendingBatches, ...list];
      });
    } catch (e) {
      setProcessingBatches((prev) => prev);
    }
  }, []);

  // Synchronous, instant Dahi conversion recorder for real-time POS & Inventory updates without page reload
  const recordDahiConversion = React.useCallback(
    ({
      source = 'Both (Mixed)',
      quantity = 0,
      farmMilkUsed = 0,
      supplierMilkUsed = 0,
      outputQuantity = 0,
      batch = null,
    }) => {
      const fUsed = Number(farmMilkUsed) || 0;
      const sUsed = Number(supplierMilkUsed) || 0;
      const outQty = Number(outputQuantity) || 0;

      // 1. Immediately append to processingBatches state
      if (batch) {
        setProcessingBatches((prev) => [batch, ...prev.filter((b) => b.id !== batch.id)]);
      }

      // 2. Immediately decrement source milk & increment Dahi in products state with zero validation (never negative)
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const pName = (p.name || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();
          const isDahi = pCat.includes('dahi') || pName.includes('dahi') || pCat.includes('yogurt') || pName.includes('yogurt');
          const isCow = pName.includes('cow');
          const isBuff = pName.includes('buffalo');
          const isMilk = !isDahi && (pCat.includes('milk') || pName.includes('milk'));

          if (isDahi && outQty > 0) {
            return {
              ...p,
              stock: Number(((Number(p.stock) || 0) + outQty).toFixed(2)),
            };
          }

          if (isMilk) {
            if (isCow && fUsed > 0) {
              return {
                ...p,
                stock: Math.max(0, Number(((Number(p.stock) || 0) - fUsed).toFixed(2))),
              };
            }
            if (isBuff) {
              const deduct = (fUsed > 0 && !isCow ? fUsed : 0) + sUsed;
              if (deduct > 0) {
                return {
                  ...p,
                  stock: Math.max(0, Number(((Number(p.stock) || 0) - deduct).toFixed(2))),
                };
              }
            }
          }

          return p;
        })
      );

      // 3. Immediately increment posSyncVersion to trigger instant reactive recalculation of inventoryMetrics
      setPosSyncVersion((v) => v + 1);
    },
    []
  );

  useEffect(() => {
    loadProcessingBatches();
    const handleSync = () => {
      setPosSyncVersion((v) => v + 1);
      loadProcessingBatches();
    };
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
  }, [loadProcessingBatches]);

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
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const res = await posService.getProducts();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.products)
          ? res.products
          : Array.isArray(res?.data)
          ? res.data
          : [];
        if (Array.isArray(list) && list.length > 0) {
          const normalizedList = list.map((p) => ({
            ...p,
            id: p.id || p._id?.toString() || p.sku,
            sku: p.sku || p.id || p._id?.toString(),
            cost: p.costPrice !== undefined ? p.costPrice : p.cost,
            unit: p.unit === 'KG' ? 'per kg' : p.unit === 'LITER' ? 'per liter' : p.unit === 'PACKET' ? 'per packet' : p.unit === 'PIECE' ? 'per piece' : p.unit || 'per kg',
          }));

          setProducts(normalizedList);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('POS live products API skipped:', err.message);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, [posSyncVersion]);

  // Track product being edited (null = adding new product)
  const [editingProduct, setEditingProduct] = useState(null);

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
      return updated;
    });

    // Sync to backend
    try {
      if (posService && posService.createProduct) {
        const payload = {
          sku: createdItem.sku,
          name: createdItem.name,
          category: createdItem.category,
          unit: String(createdItem.unit).toUpperCase().includes('KG') ? 'KG' : String(createdItem.unit).toUpperCase().includes('LITER') ? 'LITER' : String(createdItem.unit).toUpperCase().includes('PACKET') ? 'PACKET' : 'PIECE',
          price: createdItem.price,
          costPrice: createdItem.cost,
          currentStock: Number(createdItem.stock) || 0,
        };
        posService.createProduct(payload).then((backendProduct) => {
          if (backendProduct && (backendProduct._id || backendProduct.id)) {
            const realId = backendProduct._id || backendProduct.id;
            setProducts((prev) => prev.map(p => (p.id === createdItem.id ? { ...p, id: realId, _id: realId } : p)));
          }
        }).catch((err) => {
          console.warn('Failed to sync new product to backend:', err);
        });
      }
    } catch (err) {}

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

    // Sync to backend
    try {
      if (posService && posService.updateProduct && updatedProduct.id) {
        // Optimistic background sync
        const payload = {
          ...updatedProduct,
          price: updatedProduct.price !== undefined && updatedProduct.price !== null && updatedProduct.price !== '' ? Number(updatedProduct.price) : undefined,
          costPrice: updatedProduct.cost !== undefined && updatedProduct.cost !== null && updatedProduct.cost !== '' ? Number(updatedProduct.cost) : undefined,
        };
        if (updatedProduct.unit) {
          payload.unit = String(updatedProduct.unit).toUpperCase().includes('KG') ? 'KG' : String(updatedProduct.unit).toUpperCase().includes('LITER') ? 'LITER' : String(updatedProduct.unit).toUpperCase().includes('PACKET') ? 'PACKET' : 'PIECE';
        }
        posService.updateProduct(updatedProduct.id, payload).catch((err) => {
          console.warn('Failed to sync product update to backend:', err);
        });
      }
    } catch (err) {}
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
      return updated;
    });
  };

  // D. Delete Product
  const deleteProduct = (productId) => {
    setProducts((prevProducts) => {
      const updated = prevProducts.filter((item) => item.id !== productId);
      return updated;
    });

    if (editingProduct && editingProduct.id === productId) {
      setEditingProduct(null);
    }

    // Remove from cart if present
    setCart((prev) => prev.filter((item) => item.id !== productId));

    // Sync to backend
    try {
      if (posService && posService.deleteProduct) {
        posService.deleteProduct(productId).catch((err) => {
          console.warn('Failed to sync product deletion to backend:', err);
        });
      }
    } catch (err) {}
  };

  // =========================================================================
  // 2. CART & CHECKOUT STATE
  // =========================================================================
  const [cart, setCart] = useState([]);

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

  // COD Payment Options: 'full' | 'half' | 'partial' | 'unpaid'
  const [codPaymentOption, setCodPaymentOption] = useState('full');
  const [codPaidAmount, setCodPaidAmount] = useState('');

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

  // Auto-switch paymentMethod based on delivery subtype rules:
  // - On-Time Delivery: Khata is not allowed (switch to COD or Cash)
  // - Monthly Delivery: Cash is not allowed (switch to Khata)
  useEffect(() => {
    if (saleCategory === 'delivery') {
      if (deliverySubType === 'ontime' && paymentMethod === 'khata') {
        setPaymentMethod('cod');
      } else if (deliverySubType === 'monthly' && paymentMethod === 'cash') {
        setPaymentMethod('khata');
      }
    }
  }, [saleCategory, deliverySubType, paymentMethod]);

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

  // Resolve default source & ratios for products added to cart
  const resolveCartProductSource = (product) => {
    const name = (product.name || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();
    const isDahi = cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt');

    if (product.source && ['Farm', 'Supplier', 'Mixed', 'Both (Mixed)'].includes(product.source)) {
      const src = product.source === 'Both (Mixed)' ? 'Mixed' : product.source;
      return {
        source: src,
        farmRatio: src === 'Farm' ? 1 : src === 'Supplier' ? 0 : (product.farmRatio || 0.5),
        supplierRatio: src === 'Supplier' ? 1 : src === 'Farm' ? 0 : (product.supplierRatio || 0.5),
      };
    }

    if (isDahi) {
      // Find latest ready or active batch in processingBatches
      const dahiBatches = (processingBatches || []).filter((b) => {
        const p = (b.product || '').toLowerCase();
        return p.includes('dahi') || p.includes('yogurt');
      });
      if (dahiBatches.length > 0) {
        const latest = dahiBatches[0];
        const bSrc = (latest.source || '').toLowerCase();
        if (bSrc.includes('farm') && !bSrc.includes('supplier') && !bSrc.includes('mix') && !bSrc.includes('both')) {
          return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
        }
        if (bSrc.includes('supplier') && !bSrc.includes('farm') && !bSrc.includes('mix') && !bSrc.includes('both')) {
          return { source: 'Supplier', farmRatio: 0, supplierRatio: 1 };
        }
        const fRatio = latest.farmRatio !== undefined ? Number(latest.farmRatio) : 0.5;
        const sRatio = latest.supplierRatio !== undefined ? Number(latest.supplierRatio) : 0.5;
        return { source: 'Mixed', farmRatio: fRatio, supplierRatio: sRatio };
      }
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
    }

    if (name.includes('supplier') || cat.includes('supplier')) {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1 };
    }

    if (name.includes('buffalo')) {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1 };
    }

    return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
  };

  // Cart operations
  const handleAddToCart = (product, initialQty = 1) => {
    const isCow = /cow/i.test(product.name || '');
    const isBuffalo = /buffalo/i.test(product.name || '');
    const stock = Number(product.stock) || 0;
    const { source: itemSrc, farmRatio: fRatio, supplierRatio: sRatio } = resolveCartProductSource(product);

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
          source: itemSrc,
          farmRatio: fRatio,
          supplierRatio: sRatio,
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
    const { source: itemSrc, farmRatio: fRatio, supplierRatio: sRatio } = resolveCartProductSource(product);

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
          source: itemSrc,
          farmRatio: fRatio,
          supplierRatio: sRatio,
          quantity: calcQty,
        },
      ];
    });
  };

  // Switch or update item source directly in active cart ('Farm' | 'Supplier' | 'Mixed')
  const handleUpdateItemSource = (productId, newSource, customFarmRatio = null) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        let fRatio = 1;
        let sRatio = 0;
        if (newSource === 'Farm') {
          fRatio = 1;
          sRatio = 0;
        } else if (newSource === 'Supplier') {
          fRatio = 0;
          sRatio = 1;
        } else {
          // Mixed
          fRatio = customFarmRatio !== null && !isNaN(customFarmRatio) ? Number(customFarmRatio) : (item.farmRatio || 0.5);
          sRatio = Number((1 - fRatio).toFixed(4));
        }
        return {
          ...item,
          source: newSource,
          farmRatio: fRatio,
          supplierRatio: sRatio,
        };
      })
    );
  };

  // Fix Cart Zero Bug: Typing 0 or clearing quantity should NOT remove item from cart;
  // Item should only be deleted via the Trash button (handleRemoveFromCart)
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === '' || newQuantity === undefined || newQuantity === null) {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: '' } : item))
      );
      return;
    }
    
    // Allow raw string value (like "0.") to stay in state so user can type decimals
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Update item quantity in cart when rupee amount is typed/selected (e.g. 100 -> 0.5L)
  // Typing 0 or clearing should NOT remove item from cart
  const handleUpdateByRupees = (productId, rupees) => {
    if (rupees === '' || rupees === undefined || rupees === null) {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: 0 } : item))
      );
      return;
    }
    const parsed = parseFloat(rupees);
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const rate = Number(item.price) || 1;
        const calculatedQty = (!isNaN(parsed) && parsed > 0 && rate > 0)
          ? Number((parsed / rate).toFixed(3))
          : 0;
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
  const activeCustomer = allCustomers.find((c) => String(c.id || c._id) === String(linkedCustomerId)) || null;
  const activeRider = selectedRiderId
    ? dynamicRiders.find((r) => String(r.id) === String(selectedRiderId)) || null
    : null;

  // Auto-sync customer's custom delivery charges when in delivery mode
  useEffect(() => {
    if (saleCategory === 'delivery') {
      if (activeCustomer && activeCustomer.deliveryFee !== undefined && activeCustomer.deliveryFee !== null) {
        setDeliveryCharge(Number(activeCustomer.deliveryFee) || 0);
      }
    } else {
      // Walkin counter sale: Always 0 delivery fee
      setDeliveryCharge(0);
    }
  }, [saleCategory, activeCustomer]);

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
  // =========================================================================
  // 3. SALES & INVOICES (Synced with live database)
  // =========================================================================
  const [salesHistory, setSalesHistory] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);

  // Fetch live orders from backend API on mount & updates
  const fetchOrders = React.useCallback(async () => {
    try {
      setIsLoadingSales(true);
      const data = await posService.getOrders();
      const list = Array.isArray(data) ? data : data?.orders || data?.data || [];
      const normalized = list
        .filter((order) => !isLegacyDummySale(order))
        .map((order) => {
          const items = (order.items || []).map((i) => ({
            ...i,
            id: i.productId || i._id || i.id,
            name: i.name,
            quantity: Number(i.quantity) || 0,
            price: Number(i.unitPrice || i.price) || 0,
            cost: Number(i.cost) || 0,
            source: i.source || undefined,
            farmRatio: i.farmRatio !== undefined ? Number(i.farmRatio) : undefined,
            supplierRatio: i.supplierRatio !== undefined ? Number(i.supplierRatio) : undefined,
            farmRevenue: i.farmRevenue !== undefined ? Number(i.farmRevenue) : undefined,
            supplierRevenue: i.supplierRevenue !== undefined ? Number(i.supplierRevenue) : undefined,
            farmQuantity: i.farmQuantity !== undefined ? Number(i.farmQuantity) : undefined,
            supplierQuantity: i.supplierQuantity !== undefined ? Number(i.supplierQuantity) : undefined,
            subtotal: Number(i.subtotal) || ((Number(i.quantity) || 0) * (Number(i.unitPrice || i.price) || 0)),
          }));
          return {
            ...order,
            invoiceId: order.receiptNumber || order.orderNumber || order.invoiceId || (order._id ? `INV-${String(order._id).slice(-6)}` : `INV-${Date.now()}`),
            id: order._id || order.id,
            timestamp: order.createdAt || new Date().toISOString(),
            formattedTime: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            formattedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
            items,
            itemCount: items.reduce((c, i) => c + (Number(i.quantity) || 0), 0),
            subtotal: Number(order.subtotal) || 0,
            deliveryCharge: Number(order.deliveryFee) || 0,
            discount: Number(order.discountAmount) || 0,
            netPayable: Number(order.grandTotal || order.netPayable || 0),
            saleCategory: order.fulfillmentType === 'DOORSTEP' ? 'delivery' : 'walkin',
            paymentMethod: (order.paymentMethod || 'cash').toLowerCase(),
            customer: order.customerId ? { id: order.customerId?._id || order.customerId, name: order.customerNameSnapshot } : null,
            walkinCustomer: order.walkinCustomer || (!order.customerId ? {
              name: order.customerNameSnapshot || 'Walk-in Customer',
              phone: order.customerPhoneSnapshot || 'N/A',
            } : null),
            notes: order.notes || '',
          };
        });
      setSalesHistory((prev) => {
        const backendIds = new Set(
          normalized.map((o) => String(o.id || o._id || o.orderNumber || o.invoiceId))
        );
        const pendingLocal = prev.filter(
          (o) => o.id && !backendIds.has(String(o.id)) && String(o.id).startsWith('ORD-POS-')
        );
        return [...pendingLocal, ...normalized];
      });
    } catch (err) {
      console.warn('POS live order fetch notice:', err.message);
      setSalesHistory((prev) => prev);
    } finally {
      setIsLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, posSyncVersion]);

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
      items: cart.flatMap((i) => {
        const qty = Number(i.quantity) || 0;
        const rate = Number(i.price) || 0;
        const lineSubtotal = Math.round(qty * rate);
        const name = (i.name || '').toLowerCase();
        const isBuffalo = name.includes('buffalo');
        const isCow = name.includes('cow');

        if (isCow) {
          // Rule 1: Cow Milk Logic (Strictly Farm)
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

        if (isBuffalo) {
          // Rule 3: Buffalo Milk Revenue Split Logic (FIFO Stock Priority)
          // Pehle Farm Buffalo se quantity minus karo
          const availableFarmBuff = Math.max(0, Number(remainingFarmBuffaloMilk) || 0);
          const farmQty = Math.min(availableFarmBuff, qty);
          // Agar wo khatam ho jaye, toh baqi quantity Supplier Buffalo se minus karo
          const supQty = Math.max(0, qty - farmQty);

          const farmRev = Math.round(farmQty * rate);
          const supRev = lineSubtotal - farmRev;

          if (farmQty > 0 && supQty > 0) {
            return [
              {
                ...i,
                name: 'Buffalo Milk (Farm Share)',
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
                name: 'Buffalo Milk (Supplier Share)',
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
              name: 'Buffalo Milk',
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
            name: 'Buffalo Milk',
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

        const { source: itemSource, farmRatio, supplierRatio } = resolveItemSourceAndRatios(i);
        const farmRev = Math.round(lineSubtotal * farmRatio);
        const supRev = lineSubtotal - farmRev;
        const farmQty = Number((qty * farmRatio).toFixed(3));
        const supQty = Number((qty * supplierRatio).toFixed(3));

        return [{
          ...i,
          quantity: qty,
          price: rate,
          cost: Number(i.cost) || 0,
          source: itemSource,
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

    const cartItemsSnapshot = cart.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: Number(i.quantity) || 0,
      unit: i.unit || 'per kg',
      price: Number(i.price) || 0,
      subtotal: Math.round((Number(i.quantity) || 0) * (Number(i.price) || 0)),
    }));

    // Calculate paid and remaining amounts for accurate ledger syncing & reporting
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
        // Full Khata
        calculatedPaidAmount = 0;
        calculatedRemainingAmount = netPayable;
      }
    } else if (saleCategory === 'delivery') {
      if (paymentMethod === 'online' || paymentMethod === 'cash') {
        calculatedPaidAmount = netPayable;
        calculatedRemainingAmount = 0;
      } else if (paymentMethod === 'khata') {
        calculatedPaidAmount = 0;
        calculatedRemainingAmount = netPayable;
      } else if (paymentMethod === 'cod') {
        if (codPaymentOption === 'full') {
          calculatedPaidAmount = netPayable;
          calculatedRemainingAmount = 0;
        } else if (codPaymentOption === 'half') {
          calculatedPaidAmount = Math.round(netPayable / 2);
          calculatedRemainingAmount = Math.max(0, netPayable - calculatedPaidAmount);
        } else if (codPaymentOption === 'partial') {
          calculatedPaidAmount = Math.min(netPayable, Math.max(0, parseFloat(codPaidAmount) || 0));
          calculatedRemainingAmount = Math.max(0, netPayable - calculatedPaidAmount);
        } else {
          // Unpaid / Full Khata
          calculatedPaidAmount = 0;
          calculatedRemainingAmount = netPayable;
        }
      }
    }

    // Determine backend payment method and split metadata
    let backendPaymentMethod = 'CASH';
    let splitPaymentMeta = null;

    if (calculatedPaidAmount >= netPayable) {
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

    // Ledger Sync: If an active customer is linked to this order, record in Customer Khata Ledger
    if (activeCustomer) {
      const isFullPaid = calculatedPaidAmount >= netPayable;
      const isPartialPaid = calculatedPaidAmount > 0 && calculatedPaidAmount < netPayable;

      const fulfillmentLabel =
        saleCategory === 'delivery'
          ? paymentMethod === 'cod'
            ? 'Doorstep (COD)'
            : 'Doorstep Delivery'
          : 'Walk-in Counter';

      const payMethodLabel =
        paymentMethod === 'cod'
          ? isFullPaid
            ? 'COD Full Paid'
            : isPartialPaid
            ? `COD Partial (Rs. ${calculatedPaidAmount.toLocaleString()})`
            : 'COD Unpaid / Khata'
          : paymentMethod === 'online'
          ? 'Online Payment'
          : paymentMethod === 'khata'
          ? 'Khata Credit'
          : 'Cash';

      const noteMsg = isFullPaid
        ? 'No Khata / Fully Paid in Full'
        : isPartialPaid
        ? `Partial Paid: Rs. ${calculatedPaidAmount.toLocaleString()}, Remaining Baqi: Rs. ${calculatedRemainingAmount.toLocaleString()}`
        : 'Charged to Khata (Full Baqi)';

      // 1. Record Debit Order Entry (What was bought) - marked as isPosOrder=true to prevent double-writing
      if (typeof addLedgerEntry === 'function') {
        addLedgerEntry(
          activeCustomer.id || activeCustomer._id,
          {
            description: `${saleCategory === 'delivery' ? 'Doorstep Delivery' : 'POS Counter Buy'}: ${itemSummary}`,
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

        // 2. If payment was made on a partial or full settlement, record local payment line
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
              paymentMethod: paymentMethod === 'online' ? 'Online Payment' : paymentMethod === 'cod' ? 'Cash on Delivery' : 'Cash',
              invoiceId,
              notes: `Partial Settlement: Rs. ${calculatedPaidAmount.toLocaleString()} Received`,
            },
            true
          );
        }
      }
    }

    const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
    const validCustomerId = isObjectId(activeCustomer?._id || activeCustomer?.id)
      ? (activeCustomer?._id || activeCustomer?.id)
      : null;

    if (saleCategory === 'delivery') {
      // Automatically register the delivery run in DeliveryContext (Drop Points table)
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

        addDelivery({
          date: todayDate,
          shift: activeCustomer?.shift || 'MORNING',
          route: activeCustomer?.area || deliveryLandmark || 'Standard Route',
          riderNameSnapshot: customRiderName || activeRider?.name || null,
          riderId: activeRider?.id || null,
          staffType: activeRider?.vehicleType === 'Walking Man' ? 'WALKING_BOY' : (activeRider ? 'MOTORCYCLE_RIDER' : 'OTHER'),
          customerId: validCustomerId || undefined,
          customerName: activeCustomer ? activeCustomer.name : (walkinName.trim() || 'Walk-in / Guest Delivery'),
          deliveryAddress: dropAddress || activeCustomer?.address || activeCustomer?.area || 'Direct Drop Point',
          itemDescription: itemDesc,
          qtyLiters: totalQty,
          items: formattedDeliveryItems,
          amountPaid: calculatedPaidAmount,
          amountDue: calculatedRemainingAmount,
          paymentStatus: calculatedPaidAmount >= netPayable ? 'PAID' : calculatedPaidAmount > 0 ? 'PARTIAL' : 'UNPAID',
          paymentMode: backendPaymentMethod,
          codAmountToCollect: calculatedRemainingAmount > 0 ? calculatedRemainingAmount : 0,
          source: 'POS_ONE_TIME',
          receiptNumber: invoiceId,
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
    }

    const updatedSales = [saleRecord, ...salesHistory];
    setSalesHistory(updatedSales);

    // Save order to live backend POS API
    try {
      posService.createOrder({
        customerId: validCustomerId,
        customerNameSnapshot: activeCustomer?.name || (saleCategory === 'walkin' ? (walkinName.trim() || 'Walk-in Customer') : 'Customer'),
        customerPhoneSnapshot: activeCustomer?.phone || (saleCategory === 'walkin' ? (walkinPhone.trim() || null) : null),
        fulfillmentType: saleCategory === 'delivery' ? 'DELIVERY' : 'COUNTER',
        items: saleRecord.items.map((i) => {
          const qty = Number(i.quantity) || 1;
          const price = Number(i.price) || 0;
          const lineSub = Number(i.subtotal) || (qty * price);
          return {
            productId: isObjectId(i.id) ? i.id : null,
            name: i.name || 'Product',
            sku: i.sku || null,
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
          dropAddress: dropAddress || activeCustomer?.address || activeCustomer?.area || null,
          deliveryAddress: dropAddress || activeCustomer?.address || activeCustomer?.area || null,
          deliverySubType: deliverySubType === 'monthly' ? 'MONTHLY' : 'ON_TIME',
        } : null,
        notes: orderNotes || '',
      })
      .then(() => {
        if (validCustomerId && typeof fetchCustomerLedger === 'function') {
          fetchCustomerLedger(validCustomerId);
        }
        if (typeof refreshCustomers === 'function') {
          refreshCustomers();
        }
      })
      .catch((err) => console.warn('Background POS order sync error:', err));
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

    if (saleFarmMilkSold > 0) {
      setFarmStock((prev) => (prev !== null ? Math.max(0, Number((prev - saleFarmMilkSold).toFixed(1))) : null));
    }
    if (saleSupplierMilkSold > 0) {
      setSupplierStock((prev) => (prev !== null ? Math.max(0, Number((prev - saleSupplierMilkSold).toFixed(1))) : null));
    }

    setCompletedSaleReceipt(saleRecord);
    handleClearCart();
    setPosSyncVersion((v) => v + 1);

    // Notify Dahi processing hub & inventory listeners of the live sale
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pure_milk_bar_pos_sale_completed'));
      window.dispatchEvent(new Event('pure_milk_bar_dahi_updated'));
      window.dispatchEvent(new Event('pure_milk_bar_inventory_updated'));
    }

    return saleRecord;
  };

  // =========================================================================
  // 3B. DIRECT MILK SALE (sellMilk Function)
  // Smart FIFO stock priority deduction & strictly isolated revenue split
  // - 'Cow' Milk -> 100% strictly Farm P&L
  // - 'Buffalo' Milk -> First deduct from Farm Buffalo stock, then Supplier Buffalo stock
  //   Farm share -> Strictly Farm P&L
  //   Supplier share -> Strictly Supplier P&L
  // =========================================================================
  const sellMilk = async (type, quantity, rate, extraDetails = {}) => {
    const qty = Number(quantity) || 0;
    if (qty <= 0) {
      return { success: false, message: 'Invalid quantity specified for milk sale.' };
    }

    const typeStr = String(type || '').trim().toLowerCase();
    const isCow = typeStr.includes('cow');

    // Find catalog product for reference price & ID
    const matchedProduct = products.find((p) => {
      const pName = String(p.name || '').toLowerCase();
      return isCow ? pName.includes('cow') : pName.includes('buffalo');
    });

    const activeRate = (rate !== undefined && rate !== null && Number(rate) > 0)
      ? Number(rate)
      : (Number(matchedProduct?.price) || 270);

    const saleTimestamp = new Date().toISOString();
    const orderId = `ORD-POS-${Date.now()}`;
    const splitItems = [];

    if (isCow) {
      // 1. Cow Milk: Strictly 100% Farm
      const lineSub = Number((qty * activeRate).toFixed(2));
      splitItems.push({
        id: matchedProduct?.id || 'prod-cow-milk',
        sku: matchedProduct?.sku || 'PRD-001',
        name: 'Cow Milk',
        category: 'Milk',
        quantity: qty,
        price: activeRate,
        subtotal: lineSub,
        unit: 'per liter',
        source: 'Farm',
        farmRatio: 1,
        supplierRatio: 0,
        farmRevenue: lineSub,
        supplierRevenue: 0,
        farmQuantity: qty,
        supplierQuantity: 0,
      });
    } else {
      // 2. Buffalo Milk: Smart FIFO Stock Priority (Farm Buffalo first, then Supplier Buffalo)
      const availableFarmBuff = Math.max(0, Number(remainingFarmBuffaloMilk) || 0);
      const farmQty = Math.max(0, Math.min(availableFarmBuff, qty));
      const supplierQty = Math.max(0, Number((qty - farmQty).toFixed(2)));

      if (farmQty > 0) {
        const farmSub = Number((farmQty * activeRate).toFixed(2));
        splitItems.push({
          id: matchedProduct?.id || 'prod-buffalo-milk',
          sku: matchedProduct?.sku || 'PRD-002',
          name: supplierQty > 0 ? 'Buffalo Milk (Farm Share)' : (matchedProduct?.name || 'Buffalo Milk'),
          category: 'Milk',
          quantity: Number(farmQty.toFixed(2)),
          price: activeRate,
          subtotal: farmSub,
          unit: 'per liter',
          source: 'Farm',
          farmRatio: 1,
          supplierRatio: 0,
          farmRevenue: farmSub,
          supplierRevenue: 0,
          farmQuantity: Number(farmQty.toFixed(2)),
          supplierQuantity: 0,
        });
      }

      if (supplierQty > 0) {
        const supSub = Number((supplierQty * activeRate).toFixed(2));
        splitItems.push({
          id: matchedProduct?.id || 'prod-buffalo-milk',
          sku: matchedProduct?.sku || 'PRD-002',
          name: farmQty > 0 ? 'Buffalo Milk (Supplier Share)' : (matchedProduct?.name || 'Buffalo Milk'),
          category: 'Milk',
          quantity: Number(supplierQty.toFixed(2)),
          price: activeRate,
          subtotal: supSub,
          unit: 'per liter',
          source: 'Supplier',
          farmRatio: 0,
          supplierRatio: 1,
          farmRevenue: 0,
          supplierRevenue: supSub,
          farmQuantity: 0,
          supplierQuantity: Number(supplierQty.toFixed(2)),
        });
      }
    }

    const totalSubtotal = splitItems.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    const saleRecord = {
      orderId,
      id: orderId,
      items: splitItems,
      subtotal: totalSubtotal,
      discount: Number(extraDetails.discount) || 0,
      deliveryCharge: Number(extraDetails.deliveryCharge) || 0,
      netPayable: totalSubtotal,
      paidAmount: totalSubtotal,
      amountReceived: totalSubtotal,
      changeGiven: 0,
      paymentMethod: extraDetails.paymentMethod || 'cash',
      category: extraDetails.category || 'walk-in',
      customerId: extraDetails.customerId || null,
      customerName: extraDetails.customerName || 'Walk-in Customer',
      notes: extraDetails.notes || `${isCow ? 'Cow' : 'Buffalo'} Milk direct sale via sellMilk`,
      timestamp: saleTimestamp,
      date: saleTimestamp,
    };

    // Push to sales history
    setSalesHistory((prev) => [saleRecord, ...prev]);

    // Deduct from matched product local stock
    if (matchedProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === matchedProduct.id || p.sku === matchedProduct.sku
            ? { ...p, stock: Math.max(0, Number(((p.stock || 0) - qty).toFixed(2))) }
            : p
        )
      );
    }

    // Background sync to backend orders API
    try {
      if (posService && posService.createOrder) {
        posService.createOrder({
          orderNumber: orderId,
          orderType: 'DINE_IN',
          items: splitItems.map((i) => ({
            productId: isObjectId(i.id) ? i.id : null,
            name: i.name,
            sku: i.sku || null,
            unit: 'LITER',
            quantity: i.quantity,
            unitPrice: i.price,
            subtotal: i.subtotal,
            source: i.source,
            cost: Number(i.cost) || 0,
            farmRatio: i.farmRatio,
            supplierRatio: i.supplierRatio,
            farmRevenue: i.farmRevenue,
            supplierRevenue: i.supplierRevenue,
            farmQuantity: i.farmQuantity,
            supplierQuantity: i.supplierQuantity,
          })),
          subtotal: totalSubtotal,
          grandTotal: totalSubtotal,
          amountReceived: totalSubtotal,
          changeGiven: 0,
          paymentMethod: (extraDetails.paymentMethod || 'cash').toUpperCase(),
          notes: saleRecord.notes,
        }).catch((err) => console.warn('Background sellMilk order sync error:', err));
      }
    } catch (e) {
      console.warn('sellMilk backend sync exception:', e);
    }

    setCompletedSaleReceipt(saleRecord);

    // Real-time Context API stock setter update without page reload
    const farmSoldInDirect = splitItems.find((i) => i.source === 'Farm')?.quantity || (isCow ? qty : 0);
    const supSoldInDirect = splitItems.find((i) => i.source === 'Supplier')?.quantity || 0;
    if (farmSoldInDirect > 0) {
      setFarmStock((prev) => (prev !== null ? Math.max(0, Number((prev - farmSoldInDirect).toFixed(1))) : null));
    }
    if (supSoldInDirect > 0) {
      setSupplierStock((prev) => (prev !== null ? Math.max(0, Number((prev - supSoldInDirect).toFixed(1))) : null));
    }

    setPosSyncVersion((v) => v + 1);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pure_milk_bar_pos_sale_completed'));
      window.dispatchEvent(new Event('pure_milk_bar_inventory_updated'));
    }

    return {
      success: true,
      saleRecord,
      farmQuantity: splitItems.find((i) => i.source === 'Farm')?.quantity || 0,
      supplierQuantity: splitItems.find((i) => i.source === 'Supplier')?.quantity || 0,
    };
  };

  // =========================================================================
  // 3C. CONVERT TO DAHI (Unified Dahi Conversion Function)
  // Deducts source milk from Farm / Supplier stock instantly in Database and State
  // =========================================================================
  const convertToDahi = React.useCallback(
    async (source, quantity, extraData = {}) => {
      const qty = Math.max(0, Number(quantity) || 0);
      if (qty <= 0) {
        toast.error('Invalid quantity specified for Dahi conversion.');
        return { success: false, message: 'Invalid quantity' };
      }

      const srcStr = String(source || 'Farm').trim().toLowerCase();
      let normSource = 'Both (Mixed)';
      let farmPortion = 0;
      let supPortion = 0;

      if (srcStr.includes('farm') && !srcStr.includes('supplier') && !srcStr.includes('both') && !srcStr.includes('mix')) {
        normSource = 'Farm Milk';
        farmPortion = qty;
        supPortion = 0;
      } else if (srcStr.includes('supplier') && !srcStr.includes('farm') && !srcStr.includes('both') && !srcStr.includes('mix')) {
        normSource = 'Supplier Milk';
        farmPortion = 0;
        supPortion = qty;
      } else {
        normSource = 'Both (Mixed)';
        if (extraData.farmMilkUsed !== undefined && extraData.supplierMilkUsed !== undefined) {
          farmPortion = Math.max(0, Number(extraData.farmMilkUsed) || 0);
          supPortion = Math.max(0, Number(extraData.supplierMilkUsed) || 0);
        } else {
          farmPortion = Math.round(qty * 0.5);
          supPortion = Math.max(0, qty - farmPortion);
        }
      }

      const outputQty = extraData.outputQuantity !== undefined && extraData.outputQuantity !== null
        ? Number(extraData.outputQuantity)
        : extraData.output
          ? (parseFloat(extraData.output) || Number((qty * 0.985).toFixed(1)))
          : Number((qty * 0.985).toFixed(1));

      const rateNum = parseFloat(String(extraData.posRate || '').replace(/[^\d.]/g, '')) || 320;
      const batchId = `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const resolvedUnitCost = Number(extraData.unitCost) || (normSource === 'Supplier Milk' ? 180 : 150);
      const resolvedFarmCost = Number(extraData.farmMilkCost) || (farmPortion * (normSource === 'Farm Milk' ? resolvedUnitCost : 150));
      const resolvedSupplierCost = Number(extraData.supplierMilkCost) || (supPortion * (normSource === 'Supplier Milk' ? resolvedUnitCost : 180));
      const resolvedMilkUsedCost = Number(extraData.dahiProductionCost || extraData.milkUsedCost || extraData.totalMilkCost) || (resolvedFarmCost + resolvedSupplierCost);

      const newBatch = {
        id: batchId,
        _id: batchId,
        batchNumber: batchId,
        product: extraData.product || 'Fresh Dahi (Plain)',
        source: normSource,
        milkUsed: `${qty} L`,
        milkUsedQuantity: qty,
        milkUsedLiters: qty,
        milkUsedVal: qty,
        farmMilkUsed: farmPortion,
        supplierMilkUsed: supPortion,
        farmRatio: qty > 0 ? Number((farmPortion / qty).toFixed(4)) : 0.5,
        supplierRatio: qty > 0 ? Number((supPortion / qty).toFixed(4)) : 0.5,
        unitCost: resolvedUnitCost,
        farmMilkCost: resolvedFarmCost,
        supplierMilkCost: resolvedSupplierCost,
        milkUsedCost: resolvedMilkUsedCost,
        dahiProductionCost: resolvedMilkUsedCost,
        output: `${outputQty} kg`,
        outputQuantity: outputQty,
        outputVal: outputQty,
        fat: extraData.fat || '4.5%',
        date: extraData.date || new Date().toISOString().split('T')[0],
        status: extraData.status || 'Completed',
        stage: extraData.stage || 'pos',
        posRate: `Rs. ${rateNum} / kg`,
        time: timeNow,
        notes: extraData.notes || '',
      };

      // 1. Immediately call setter functions to dynamically deduct stock
      if (farmPortion > 0) {
        setFarmStock((prev) => (prev !== null ? Math.max(0, Number((prev - farmPortion).toFixed(1))) : null));
      }
      if (supPortion > 0) {
        setSupplierStock((prev) => (prev !== null ? Math.max(0, Number((prev - supPortion).toFixed(1))) : null));
      }

      // 2. Immediately record in state without page reload
      recordDahiConversion({
        source: normSource,
        quantity: qty,
        farmMilkUsed: farmPortion,
        supplierMilkUsed: supPortion,
        outputQuantity: outputQty,
        batch: newBatch,
      });

      // 3. Sync to backend database
      try {
        const backendRes = await farmService.createProcessingBatch({
          product: newBatch.product,
          milkUsed: qty,
          milkUsedQuantity: qty,
          milkUsedLiters: qty,
          source: normSource,
          farmMilkUsed: farmPortion,
          supplierMilkUsed: supPortion,
          farmRatio: newBatch.farmRatio,
          supplierRatio: newBatch.supplierRatio,
          unitCost: resolvedUnitCost,
          farmMilkCost: resolvedFarmCost,
          supplierMilkCost: resolvedSupplierCost,
          milkUsedCost: resolvedMilkUsedCost,
          dahiProductionCost: resolvedMilkUsedCost,
          output: `${outputQty} kg`,
          outputQuantity: outputQty,
          fat: newBatch.fat,
          date: newBatch.date,
          status: newBatch.status,
          stage: newBatch.stage,
          posRate: newBatch.posRate,
          notes: newBatch.notes,
        });

        const realBatch = backendRes?.batch || backendRes?.data || backendRes;
        if (realBatch?._id || realBatch?.id) {
          setProcessingBatches((prev) =>
            prev.map((b) => (b.id === batchId ? { ...b, ...realBatch, id: realBatch._id || realBatch.id } : b))
          );
        }
      } catch (err) {
        console.warn('Backend createProcessingBatch error:', err);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('pure_milk_bar_dahi_updated'));
        window.dispatchEvent(new Event('pure_milk_bar_inventory_updated'));
      }

      toast.success(`Dahi batch created: ${outputQty} kg`, {
        description: `${qty} L milk deducted (${farmPortion}L Farm, ${supPortion}L Supplier). POS stock updated.`,
      });

      return {
        success: true,
        batch: newBatch,
        farmMilkDeducted: farmPortion,
        supplierMilkDeducted: supPortion,
        dahiProduced: outputQty,
      };
    },
    [recordDahiConversion]
  );

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
  // 5. INVENTORY OVERVIEW CALCULATIONS (from live API data)
  // =========================================================================
  // Real farm yield from Milking Logs or active herd baseline (Overall and Split by Cow vs Buffalo)
  const { totalFarmMilk, totalFarmCowMilk, totalFarmBuffaloMilk } = React.useMemo(() => {
    let logSum = 0;
    let cowLogs = 0;
    let buffLogs = 0;

    const cowTagSet = new Set();
    const buffTagSet = new Set();

    animals.forEach((a) => {
      const type = (a.type || '').toUpperCase();
      const spec = (a.species || a.breed || '').toLowerCase();
      const tag = (a.tag || a.tagNumber || '').toUpperCase();
      const id = String(a.id || a._id || '');

      const isCow = type === 'COW' || spec.includes('cow') || tag.startsWith('COW');
      if (isCow) {
        if (tag) cowTagSet.add(tag);
        if (id) cowTagSet.add(id);
      } else {
        if (tag) buffTagSet.add(tag);
        if (id) buffTagSet.add(id);
      }
    });

    if (Array.isArray(milkingLogs) && milkingLogs.length > 0) {
      milkingLogs.forEach((log) => {
        const y = parseFloat(log.yieldLiters || log.yield) || 0;
        const tag = (log.animalTag || log.tag || log.animalId?.tagNumber || log.animalId?.tag || '').toUpperCase();
        const rawId = String(log.animalId?._id || log.animalId || '');
        const animalObj = animals.find(a => String(a.id || a._id) === rawId || (tag && (String(a.tag || a.tagNumber).toUpperCase() === tag)));

        const isCow = (animalObj?.type || '').toUpperCase() === 'COW' ||
                      (animalObj?.species || '').toLowerCase().includes('cow') ||
                      cowTagSet.has(tag) ||
                      cowTagSet.has(rawId) ||
                      tag.startsWith('COW') ||
                      (log.animalId?.type || '').toUpperCase() === 'COW';

        logSum += y;
        if (isCow) {
          cowLogs += y;
        } else {
          buffLogs += y;
        }
      });
    }

    // Strictly calculate from actual recorded Milking Logs
    const resolved = logSum;
    const resolvedCow = cowLogs;
    const resolvedBuff = buffLogs;

    return {
      totalFarmMilk: Number(resolved.toFixed(1)),
      totalFarmCowMilk: Number(resolvedCow.toFixed(1)),
      totalFarmBuffaloMilk: Number(resolvedBuff.toFixed(1)),
    };
  }, [animals, milkingLogs, posSyncVersion]);

  // Separate Supplier Cow & Buffalo intake totals
  const { totalSupplierIntake, totalSupplierCowIntake, totalSupplierBuffaloIntake } = React.useMemo(() => {
    let tot = 0;
    let cowIn = 0;
    let buffIn = 0;
    (intakeLogs || []).forEach((item) => {
      const qty = Number(item.quantity || item.quantityLiters) || 0;
      const type = (item.milkType || '').toUpperCase();
      tot += qty;
      if (type === 'COW') {
        cowIn += qty;
      } else {
        buffIn += qty;
      }
    });
    return {
      totalSupplierIntake: Number(tot.toFixed(1)),
      totalSupplierCowIntake: Number(cowIn.toFixed(1)),
      totalSupplierBuffaloIntake: Number(buffIn.toFixed(1)),
    };
  }, [intakeLogs]);

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

  // =========================================================================
  // CRITICAL P&L SOURCE ATTRIBUTION LOGIC (Rules 1, 2, 3)
  // 1. DAHI (YOGURT) CONVERSION LOGIC:
  //    - Source 'Farm' -> 100% Farm P&L
  //    - Source 'Supplier' -> 100% Supplier P&L
  //    - Source 'Both' (Mixed) -> 100% Farm P&L (Supplier P&L = 0)
  // 2. LIQUID MILK LOGIC:
  //    - Farm Milk -> 100% Farm P&L
  //    - Supplier Milk -> 100% Supplier P&L
  // =========================================================================
  const resolveItemSourceAndRatios = (item) => {
    const rawSrc = String(item.source || '').trim();
    const name = String(item.name || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    const isDahi = cat.includes('dahi') || name.includes('dahi') || cat.includes('yogurt') || name.includes('yogurt');
    const isMilk = !isDahi && (cat.includes('milk') || name.includes('milk') || cat.includes('cow') || cat.includes('buffalo') || name.includes('cow') || name.includes('buffalo'));

    if (isDahi) {
      const srcLow = rawSrc.toLowerCase();
      // 1. Explicit source on item
      if (srcLow.includes('supplier')) {
        return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
      }
      // RULE 1: Agar source 'Both' (Mixed) hai: saari sales SIRF Farm P&L mein jayegi! Supplier P&L = 0
      if (srcLow.includes('both') || srcLow.includes('mix')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }
      if (srcLow.includes('farm')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }

      // 2. Product Catalog Source Check
      const prod = products.find((p) => p.id === item.id || p.sku === item.sku || p.name === item.name);
      const prodSrc = String(prod?.source || '').trim().toLowerCase();
      if (prodSrc.includes('supplier')) {
        return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
      }
      if (prodSrc.includes('both') || prodSrc.includes('mix')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }
      if (prodSrc.includes('farm')) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }

      // 3. Dahi Kitchen Processing Batches Check
      const dahiBatches = (processingBatches || []).filter((b) => {
        const p = (b.product || '').toLowerCase();
        return p.includes('dahi') || p.includes('yogurt');
      });
      if (dahiBatches.length > 0) {
        const latest = dahiBatches[0];
        const bSrc = String(latest.source || '').toLowerCase();
        if (bSrc.includes('supplier') && !bSrc.includes('farm') && !bSrc.includes('both') && !bSrc.includes('mix')) {
          return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
        }
        // 'Farm' or 'Both' (Mixed) batch -> 100% Farm P&L!
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }

      // 4. Default Dahi: If farm produced milk, goes to Farm P&L; if farm produced 0 milk, goes to Supplier
      if (totalFarmMilk > 0) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: true, isMilk: false };
      }
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: true, isMilk: false };
    }

    // Liquid Milk attribution:
    const srcLow = rawSrc.toLowerCase();
    
    // Explicit share indicators
    if (name.includes('supplier share') || srcLow === 'supplier') {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
    }
    if (name.includes('farm share') || srcLow === 'farm') {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }

    // Rule 1: Cow Milk is strictly 100% Farm
    if (name.includes('cow') || cat.includes('cow')) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }

    if (srcLow.includes('supplier') || name.includes('supplier') || cat.includes('supplier') || name.includes('sourced') || cat.includes('sourced') || name.includes('chilled')) {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
    }
    if (srcLow.includes('farm') || name.includes('farm')) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }

    // Herd production check
    if (name.includes('buffalo')) {
      if (totalFarmBuffaloMilk > 0) {
        return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
      }
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
    }

    if (totalFarmMilk > 0) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0, isDahi: false, isMilk: true };
    }
    return { source: 'Supplier', farmRatio: 0, supplierRatio: 1, isDahi: false, isMilk: true };
  };

  // =========================================================================
  // 1. ISOLATED FARM SALES (POS Sales Farm Milk + POS Sales Farm Dahi + POS Sales 'Both' Dahi)
  // Supplier items strictly excluded (0 in Farm)
  // =========================================================================
  const farmSalesHistory = React.useMemo(() => {
    return salesHistory
      .map((sale) => {
        const farmItems = (sale.items || [])
          .map((item) => {
            const { source, farmRatio } = resolveItemSourceAndRatios(item);
            const totalItemRev = Number(item.subtotal) || ((Number(item.quantity) || 0) * (Number(item.price) || 0));
            const totalItemQty = Number(item.quantity) || 0;

            let lineRev = 0;
            let lineQty = 0;

            if (item.farmRevenue !== undefined && Number(item.farmRevenue) > 0) {
              lineRev = Number(item.farmRevenue);
              lineQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) : totalItemQty;
            } else if (item.farmRatio !== undefined && Number(item.farmRatio) > 0) {
              lineRev = Math.round(Number(item.farmRatio) * totalItemRev);
              lineQty = Number((Number(item.farmRatio) * totalItemQty).toFixed(2));
            } else if (source === 'Farm') {
              lineRev = totalItemRev;
              lineQty = totalItemQty;
            }

            if (lineRev <= 0 && lineQty <= 0) return null;

            return {
              ...item,
              quantity: lineQty,
              source: 'Farm',
              effectiveRevenue: lineRev,
              subtotal: lineRev,
            };
          })
          .filter(Boolean);

        if (farmItems.length === 0) return null;
        const farmTotal = farmItems.reduce((s, i) => s + (Number(i.effectiveRevenue) || 0), 0);
        return {
          ...sale,
          items: farmItems,
          subtotal: farmTotal,
          netPayable: farmTotal,
          isFarmSale: true,
        };
      })
      .filter(Boolean);
  }, [salesHistory, products, processingBatches, totalFarmMilk, totalFarmCowMilk, totalFarmBuffaloMilk]);

  // =========================================================================
  // 2. ISOLATED SUPPLIER SALES (POS Sales Supplier Milk + POS Sales Supplier Dahi)
  // Farm Milk, Farm Dahi, and 'Both' Dahi strictly excluded (0 in Supplier)
  // =========================================================================
  const supplierSalesHistory = React.useMemo(() => {
    return salesHistory
      .map((sale) => {
        const supItems = (sale.items || [])
          .map((item) => {
            const { source, supplierRatio } = resolveItemSourceAndRatios(item);
            const totalItemRev = Number(item.subtotal) || ((Number(item.quantity) || 0) * (Number(item.price) || 0));
            const totalItemQty = Number(item.quantity) || 0;

            let lineRev = 0;
            let lineQty = 0;

            if (item.supplierRevenue !== undefined && Number(item.supplierRevenue) > 0) {
              lineRev = Number(item.supplierRevenue);
              lineQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) : totalItemQty;
            } else if (item.supplierRatio !== undefined && Number(item.supplierRatio) > 0) {
              lineRev = Math.round(Number(item.supplierRatio) * totalItemRev);
              lineQty = Number((Number(item.supplierRatio) * totalItemQty).toFixed(2));
            } else if (source === 'Supplier') {
              lineRev = totalItemRev;
              lineQty = totalItemQty;
            }

            if (lineRev <= 0 && lineQty <= 0) return null;

            return {
              ...item,
              quantity: lineQty,
              source: 'Supplier',
              effectiveRevenue: lineRev,
              subtotal: lineRev,
            };
          })
          .filter(Boolean);

        if (supItems.length === 0) return null;
        const supTotal = supItems.reduce((s, i) => s + (Number(i.effectiveRevenue) || 0), 0);
        return {
          ...sale,
          items: supItems,
          subtotal: supTotal,
          netPayable: supTotal,
          isSupplierSale: true,
        };
      })
      .filter(Boolean);
  }, [salesHistory, products, processingBatches, totalFarmMilk, totalFarmCowMilk, totalFarmBuffaloMilk]);

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

  // Populate farmStats strictly from farmSalesHistory via .forEach / .reduce
  farmSalesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const { isDahi, isMilk } = resolveItemSourceAndRatios(item);
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.effectiveRevenue ?? item.subtotal) || (qty * unitPrice);
      const prodMatch = products.find((p) => p.id === item.id || p.sku === item.sku || p.name === item.name);
      const unitCost = Number(item.cost) || Number(prodMatch?.costPrice || prodMatch?.cost) || (isDahi ? 220 : 190);

      if (isMilk) {
        farmStats.milkSold += qty;
        farmStats.milkRevenue += lineTotal;
      } else if (isDahi) {
        farmStats.dahiSold += qty;
        farmStats.dahiRevenue += lineTotal;
      } else {
        farmStats.otherSold += qty;
      }
      farmStats.totalRevenue += lineTotal;
      farmStats.totalCost += Math.round(qty * unitCost);

      const pName = item.name || (isMilk ? 'Farm Milk' : 'Farm Dahi');
      if (!farmStats.itemizedProducts[pName]) {
        farmStats.itemizedProducts[pName] = {
          id: item.id || pName,
          name: pName,
          category: item.category || (isMilk ? 'Milk' : 'Dahi'),
          unit: item.unit || (isMilk ? 'per liter' : 'per kg'),
          source: 'Farm',
          qtySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          avgRate: unitPrice,
          unitCost,
        };
      }
      farmStats.itemizedProducts[pName].qtySold += qty;
      farmStats.itemizedProducts[pName].totalRevenue += lineTotal;
      farmStats.itemizedProducts[pName].totalCost += Math.round(qty * unitCost);
    });
  });

  // Populate supplierStats strictly from supplierSalesHistory via .forEach / .reduce
  supplierSalesHistory.forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const { isDahi, isMilk } = resolveItemSourceAndRatios(item);
      const qty = Number(item.quantity) || 0;
      const unitPrice = Number(item.price) || 0;
      const lineTotal = Number(item.effectiveRevenue ?? item.subtotal) || (qty * unitPrice);
      const prodMatch = products.find((p) => p.id === item.id || p.sku === item.sku || p.name === item.name);
      const unitCost = Number(item.cost) || Number(prodMatch?.costPrice || prodMatch?.cost) || (isDahi ? 215 : 220);

      if (isMilk) {
        supplierStats.milkSold += qty;
        supplierStats.milkRevenue += lineTotal;
      } else if (isDahi) {
        supplierStats.dahiSold += qty;
        supplierStats.dahiRevenue += lineTotal;
      } else {
        supplierStats.otherSold += qty;
      }
      supplierStats.totalRevenue += lineTotal;
      supplierStats.totalCost += Math.round(qty * unitCost);

      const pName = item.name || (isMilk ? 'Supplier Milk' : 'Supplier Dahi');
      if (!supplierStats.itemizedProducts[pName]) {
        supplierStats.itemizedProducts[pName] = {
          id: item.id || pName,
          name: pName,
          category: item.category || (isMilk ? 'Milk' : 'Dahi'),
          unit: item.unit || (isMilk ? 'per liter' : 'per kg'),
          source: 'Supplier',
          qtySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          avgRate: unitPrice,
          unitCost,
        };
      }
      supplierStats.itemizedProducts[pName].qtySold += qty;
      supplierStats.itemizedProducts[pName].totalRevenue += lineTotal;
      supplierStats.itemizedProducts[pName].totalCost += Math.round(qty * unitCost);
    });
  });

  // Live Expenses and Procurement Outflows
  const farmExpensesTotal = expenseCtx?.totals?.totalFarmExpense ?? (farmExpensesList || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const supplierProcurementTotal = (intakeLogs || []).reduce((sum, item) => sum + (Number(item.totalCost ?? item.totalAmount) || (Number(item.quantity || item.quantityLiters || 0) * Number(item.ratePerLiter || 220))), 0);
  const supplierExpensesTotal = (supplierExpensesList || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const supplierTotalCosts = supplierProcurementTotal + supplierExpensesTotal;

  // Dahi Production Cost calculation strictly segregated by source:
  let farmDahiProductionCost = 0;
  let supplierDahiProductionCost = 0;
  let farmMilkCostTransferred = 0;
  let supplierMilkCostTransferred = 0;

  (processingBatches || []).forEach((b) => {
    const pName = (b.product || '').toLowerCase();
    const isDahi = pName.includes('dahi') || pName.includes('yogurt') || !pName.includes('milk');
    if (!isDahi) return;

    const src = (b.source || '').toLowerCase();
    const totalCost = Number(b.totalDahiCost || b.dahiProductionCost) || 0;
    const milkTransferred = Number(b.milkCostTransferred || b.milkUsedCost) || 0;
    const farmUsed = Number(b.farmMilkUsed) || 0;
    const supUsed = Number(b.supplierMilkUsed) || 0;
    const totalMilk = farmUsed + supUsed || Number(b.milkUsedQuantity || b.milkUsedVal) || 0;
    const unitCost = Number(b.unitCost) || (src.includes('supplier') && !src.includes('farm') ? 220 : 230);
    const dahiCostRate = Number(b.dahiCostRate) || 250;
    const outputQty = Number(b.outputQuantity || b.outputVal) || (totalMilk * 0.985);

    const fCost = Number(b.farmMilkCost) || (farmUsed > 0 ? Math.round(farmUsed * (src.includes('farm') && !src.includes('supplier') ? unitCost : 230)) : 0);
    const sCost = Number(b.supplierMilkCost) || (supUsed > 0 ? Math.round(supUsed * (src.includes('supplier') && !src.includes('farm') ? unitCost : 220)) : 0);

    if (src.includes('farm') && !src.includes('supplier') && !src.includes('mix') && !src.includes('both')) {
      farmDahiProductionCost += (totalCost || Math.round(outputQty * dahiCostRate));
      farmMilkCostTransferred += (milkTransferred || fCost || Math.round(totalMilk * unitCost));
    } else if (src.includes('supplier') && !src.includes('farm') && !src.includes('mix') && !src.includes('both')) {
      supplierDahiProductionCost += (totalCost || Math.round(outputQty * dahiCostRate));
      supplierMilkCostTransferred += (milkTransferred || sCost || Math.round(totalMilk * unitCost));
    } else {
      // Both (Mixed): Saari sales SIRF Farm P&L mein jayegi! Supplier P&L = 0
      farmDahiProductionCost += (totalCost || Math.round(outputQty * dahiCostRate));
      farmMilkCostTransferred += (milkTransferred || fCost || Math.round(totalMilk * unitCost));
    }
  });

  const farmProcessingDeltaCost = Math.max(0, farmDahiProductionCost - farmMilkCostTransferred);
  const supplierProcessingDeltaCost = Math.max(0, supplierDahiProductionCost - supplierMilkCostTransferred);

  // Formula: Total Dahi POS Sales - Dahi Production Cost = Actual Net Profit
  const farmDahiActualNetProfit = farmStats.dahiRevenue - farmDahiProductionCost;
  const supplierDahiActualNetProfit = supplierStats.dahiRevenue - supplierDahiProductionCost;

  // RULE 2: FARM P&L MODULE (STRICTLY ISOLATED)
  // Income (Aamdani): POS Sales (Farm Milk) + POS Sales (Farm Dahi) + POS Sales ('Both' wali Dahi)
  // Expenses (Kharchay): Farm Production Expenses (chara, medicine, etc.) + Farm Dahi Processing Delta Cost
  // Farm Net Profit = Income - Expenses - Dahi Processing Delta Cost
  // Exclusion: Yahan Supplier ki koi purchase cost, expense ya sale show nahi honi chahiye (0)
  const farmTotalIncome = farmStats.totalRevenue;
  const farmNetProfit = farmTotalIncome - farmExpensesTotal - farmProcessingDeltaCost;
  const farmNetMargin = farmTotalIncome > 0 ? Math.round((farmNetProfit / farmTotalIncome) * 100) : 0;
  const farmRealizationPerLiter = farmStats.milkSold > 0 ? Number((farmNetProfit / farmStats.milkSold).toFixed(2)) : 0;

  const farmSalesMetrics = {
    source: 'Farm',
    label: 'In-House Dairy Farm',
    milkSold: Number(farmStats.milkSold.toFixed(1)),
    dahiSold: Number(farmStats.dahiSold.toFixed(1)),
    otherSold: Number(farmStats.otherSold.toFixed(1)),
    milkRevenue: farmStats.milkRevenue,
    dahiRevenue: farmStats.dahiRevenue,
    totalRevenue: farmTotalIncome,
    totalIncome: farmTotalIncome,
    income: farmTotalIncome,
    dahiProductionCost: farmDahiProductionCost,
    milkUsedCost: farmMilkCostTransferred,
    milkCostTransferred: farmMilkCostTransferred,
    processingDeltaCost: farmProcessingDeltaCost,
    dahiNetProfit: farmDahiActualNetProfit,
    actualNetProfit: farmDahiActualNetProfit,
    totalExpenses: farmExpensesTotal,
    expenses: farmExpensesTotal,
    totalCost: farmExpensesTotal + farmProcessingDeltaCost,
    grossProfit: farmTotalIncome,
    grossMarginPercent: farmTotalIncome > 0 ? 100 : 0,
    allocatedOverhead: 0,
    netProfit: farmNetProfit,
    netMarginPercent: farmNetMargin,
    realizationPerLiter: farmRealizationPerLiter,
    itemizedProducts: Object.values(farmStats.itemizedProducts),
  };

  // RULE 3: SUPPLIER P&L MODULE (STRICTLY ISOLATED)
  // Income (Aamdani): POS Sales (Supplier Milk) + POS Sales (Supplier Dahi)
  // Costs/Expenses: Supplier Milk Procurement (Purchase Cost) + Supplier Expenses (logistics, testing, etc.) + Supplier Dahi Processing Delta Cost
  // Supplier Net Profit = Income - (Costs + Expenses) - Dahi Processing Delta Cost
  // Exclusion: Yahan Farm ka doodh, Farm ki dahi, 'Both' wali dahi ki sales, ya Farm ke kharchay show NAHI hone chahiye (0)
  const supplierTotalIncome = supplierStats.totalRevenue;
  const supplierNetProfit = supplierTotalIncome - supplierTotalCosts - supplierProcessingDeltaCost;
  const supplierNetMargin = supplierTotalIncome > 0 ? Math.round((supplierNetProfit / supplierTotalIncome) * 100) : 0;
  const supplierRealizationPerLiter = supplierStats.milkSold > 0 ? Number((supplierNetProfit / supplierStats.milkSold).toFixed(2)) : 0;

  const supplierSalesMetrics = {
    source: 'Supplier',
    label: 'Supplier Procured Sourcing',
    milkSold: Number(supplierStats.milkSold.toFixed(1)),
    dahiSold: Number(supplierStats.dahiSold.toFixed(1)),
    otherSold: Number(supplierStats.otherSold.toFixed(1)),
    milkRevenue: supplierStats.milkRevenue,
    dahiRevenue: supplierStats.dahiRevenue,
    totalRevenue: supplierTotalIncome,
    totalIncome: supplierTotalIncome,
    income: supplierTotalIncome,
    dahiProductionCost: supplierDahiProductionCost,
    milkUsedCost: supplierMilkCostTransferred,
    milkCostTransferred: supplierMilkCostTransferred,
    processingDeltaCost: supplierProcessingDeltaCost,
    dahiNetProfit: supplierDahiActualNetProfit,
    actualNetProfit: supplierDahiActualNetProfit,
    purchaseCost: supplierProcurementTotal,
    procurementCost: supplierProcurementTotal,
    supplierExpenses: supplierExpensesTotal,
    totalExpenses: supplierExpensesTotal,
    totalCost: supplierTotalCosts + supplierProcessingDeltaCost,
    totalCosts: supplierTotalCosts + supplierProcessingDeltaCost,
    grossProfit: supplierTotalIncome - supplierProcurementTotal,
    grossMarginPercent: supplierTotalIncome > 0 ? Math.round(((supplierTotalIncome - supplierProcurementTotal) / supplierTotalIncome) * 100) : 0,
    allocatedOverhead: 0,
    netProfit: supplierNetProfit,
    netMarginPercent: supplierNetMargin,
    realizationPerLiter: supplierRealizationPerLiter,
    itemizedProducts: Object.values(supplierStats.itemizedProducts),
  };

  // RULE 4: MAIN DASHBOARD (COMBINED VIEW)
  // Total Business Profit = Farm Net Profit + Supplier Net Profit
  const totalBusinessNetProfit = farmNetProfit + supplierNetProfit;
  const totalBusinessRevenue = farmTotalIncome + supplierTotalIncome;
  const totalBusinessCosts = farmExpensesTotal + farmProcessingDeltaCost + supplierTotalCosts + supplierProcessingDeltaCost;
  const totalBusinessMargin = totalBusinessRevenue > 0 ? Math.round((totalBusinessNetProfit / totalBusinessRevenue) * 100) : 0;

  const totalDahiRevenue = farmStats.dahiRevenue + supplierStats.dahiRevenue;
  const totalDahiProductionCost = farmDahiProductionCost + supplierDahiProductionCost;
  const totalDahiNetProfit = farmDahiActualNetProfit + supplierDahiActualNetProfit;

  const businessFinancialMetrics = {
    farmNetProfit,
    farmTotalIncome,
    farmExpenses: farmExpensesTotal,
    farmProcessingDeltaCost,
    supplierNetProfit,
    supplierTotalIncome,
    supplierProcurementCost: supplierProcurementTotal,
    supplierExpenses: supplierExpensesTotal,
    supplierTotalCosts,
    supplierProcessingDeltaCost,
    totalBusinessNetProfit,
    totalBusinessRevenue,
    totalBusinessCosts,
    totalBusinessMargin,
    totalDahiRevenue,
    totalDahiProductionCost,
    totalDahiNetProfit,
    totalDahiSold: farmStats.dahiSold + supplierStats.dahiSold,
  };

  // Processing batches for milk converted to Dahi, Processed Milk, and value-added items
  let farmMilkConvertedToDahi = 0;
  let supplierMilkConvertedToDahi = 0;
  let totalDahiTransferredToPOS = 0;
  let processedCowMilkStock = 0;
  let processedBuffaloMilkStock = 0;
  let totalProcessedMilk = 0;
  const batchProductStockMap = {};

  (processingBatches || []).forEach((b) => {
    const pName = (b.product || '').toLowerCase();
    const isDahi = pName.includes('dahi') || pName.includes('yogurt');
    const isMilk = pName.includes('milk') && !isDahi;
    const isCow = pName.includes('cow');
    const isBuff = pName.includes('buffalo');

    const numUsed = Number(b.milkUsedQuantity || b.milkUsedVal || b.milkUsedLiters) || parseFloat(String(b.milkUsed).replace(/[^\d.]/g, '')) || 0;
    const outNum = Number(b.outputQuantity || b.outputVal) || parseFloat(String(b.output).replace(/[^\d.]/g, '')) || 0;

    // Deduct raw sourcing only when raw milk was converted to value-add (Dahi, Cheese, Ghee, etc.)
    if (isDahi || (!isMilk && numUsed > 0)) {
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
    }

    const bStatus = String(b.status || '').toLowerCase();
    const bStage = String(b.stage || '').toLowerCase();
    const isReady = ['completed', 'ready_for_pos', 'pos'].includes(bStatus) || ['pos', 'chilled', 'completed'].includes(bStage);

    if (isReady && outNum > 0) {
      if (isDahi) {
        totalDahiTransferredToPOS += outNum;
      } else if (isMilk) {
        totalProcessedMilk += outNum;
        if (isCow) {
          processedCowMilkStock += outNum;
        } else if (isBuff) {
          processedBuffaloMilkStock += outNum;
        } else {
          processedCowMilkStock += outNum / 2;
          processedBuffaloMilkStock += outNum / 2;
        }
      }

      // Track by specific product name for general inventory products
      const rawName = b.product || 'Product';
      batchProductStockMap[rawName] = (batchProductStockMap[rawName] || 0) + outNum;
    }
  });

  // Calculate breakdown of sales for Cow vs Buffalo for Farm and Supplier:
  const todayDateStr = new Date().toISOString().split('T')[0];
  const nowObj = new Date();
  const localTodayDateStr = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`;

  let todayFarmMilkSold = 0;
  let todayFarmCowMilkSold = 0;
  let todayFarmBuffaloMilkSold = 0;
  let todaySupplierMilkSold = 0;
  let todaySupplierCowMilkSold = 0;
  let todaySupplierBuffaloMilkSold = 0;

  salesHistory.forEach((sale) => {
    const saleDateStr = sale.timestamp ? String(sale.timestamp).split('T')[0] : (sale.date ? String(sale.date).split('T')[0] : '');
    const isToday = !saleDateStr || saleDateStr === todayDateStr || saleDateStr === localTodayDateStr;

    if (isToday) {
      (sale.items || []).forEach((item) => {
        const { source: src } = resolveItemSourceAndRatios(item);
        const name = (item.name || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const qty = Number(item.quantity) || 0;
        
        const isMilk = cat.includes('milk') || name.includes('milk') || cat.includes('buffalo') || cat.includes('cow') || name.includes('buffalo') || name.includes('cow');
        
        if (isMilk) {
          const isCow = name.includes('cow');
          if (isCow) {
            // Cow Milk: Strictly Farm
            todayFarmMilkSold += qty;
            todayFarmCowMilkSold += qty;
          } else {
            // Buffalo Milk: Respects FIFO split farmQuantity and supplierQuantity
            const fQty = item.farmQuantity !== undefined ? Number(item.farmQuantity) : (src === 'Farm' ? qty : 0);
            const sQty = item.supplierQuantity !== undefined ? Number(item.supplierQuantity) : (src === 'Supplier' ? qty : 0);

            if (fQty > 0) {
              todayFarmMilkSold += fQty;
              todayFarmBuffaloMilkSold += fQty;
            }
            if (sQty > 0) {
              todaySupplierMilkSold += sQty;
              todaySupplierBuffaloMilkSold += sQty;
            }
            if (fQty === 0 && sQty === 0) {
              if (src === 'Supplier') {
                todaySupplierMilkSold += qty;
                todaySupplierBuffaloMilkSold += qty;
              } else {
                todayFarmMilkSold += qty;
                todayFarmBuffaloMilkSold += qty;
              }
            }
          }
        }
      });
    }
  });

  // Calculate Today's Supplier Intake correctly (milk is perishable, stock resets daily)
  let todaySupplierIntake = 0;
  let todaySupplierCowIntake = 0;
  let todaySupplierBuffaloIntake = 0;
  
  (intakeLogs || []).forEach((item) => {
    const logDate = item.date ? String(item.date).split('T')[0] : '';
    if (logDate === todayDateStr || logDate === localTodayDateStr) {
      const qty = Number(item.quantity || item.quantityLiters) || 0;
      const type = (item.milkType || '').toUpperCase();
      todaySupplierIntake += qty;
      if (type === 'COW') todaySupplierCowIntake += qty;
      else todaySupplierBuffaloIntake += qty;
    }
  });

  // Remaining liquid milk after BOTH POS sales AND Dahi conversion:
  // Formula: Available Farm Stock = Total Farm Intake - (Total Farm Milk Sold in POS + Total Farm Milk Converted to Dahi)
  const totalFarmMilkSoldQty = Number(farmStats.milkSold) || todayFarmMilkSold;
  const calculatedAvailableFarmStock = Math.max(0, Number((totalFarmMilk - totalFarmMilkSoldQty - farmMilkConvertedToDahi).toFixed(1)));
  const availableFarmStock = farmStock !== null ? farmStock : calculatedAvailableFarmStock;
  const remainingFarmMilk = availableFarmStock;
  const calculatedRemainingSupplierMilk = Math.max(0, Number((todaySupplierIntake - todaySupplierMilkSold - supplierMilkConvertedToDahi).toFixed(1)));
  const remainingSupplierMilk = supplierStock !== null ? supplierStock : calculatedRemainingSupplierMilk;
  const remainingTotalMilk = Number((remainingFarmMilk + remainingSupplierMilk + totalProcessedMilk).toFixed(1));

  // Separate live remaining stocks for Cow Milk and Buffalo Milk (Raw Yield + Processed Batches - Sold):
  const preDahiCow = Math.max(0, totalFarmCowMilk - todayFarmCowMilkSold + processedCowMilkStock);
  const preDahiBuff = Math.max(0, totalFarmBuffaloMilk - todayFarmBuffaloMilkSold + processedBuffaloMilkStock);
  
  const buffDeduction = Math.min(preDahiBuff, farmMilkConvertedToDahi);
  const cowDeduction = Math.max(0, farmMilkConvertedToDahi - buffDeduction);
  
  const remainingFarmCowMilk = Math.max(0, Number((preDahiCow - cowDeduction).toFixed(1)));
  const remainingFarmBuffaloMilk = Math.max(0, Number((preDahiBuff - buffDeduction).toFixed(1)));

  const preDahiSupCow = Math.max(0, todaySupplierCowIntake - todaySupplierCowMilkSold);
  const preDahiSupBuff = Math.max(0, todaySupplierBuffaloIntake - todaySupplierBuffaloMilkSold);

  const supBuffDeduction = Math.min(preDahiSupBuff, supplierMilkConvertedToDahi);
  const supCowDeduction = Math.max(0, supplierMilkConvertedToDahi - supBuffDeduction);

  const remainingSupplierCowMilk = Math.max(0, Number((preDahiSupCow - supCowDeduction).toFixed(1)));
  const remainingSupplierBuffaloMilk = Math.max(0, Number((preDahiSupBuff - supBuffDeduction).toFixed(1)));

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
        handleUpdateItemSource,
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
        codPaymentOption,
        setCodPaymentOption,
        codPaidAmount,
        setCodPaidAmount,
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
        sellMilk,
        handleCompleteSale,
        completeSale: handleCompleteSale,
        completedSaleReceipt,
        setCompletedSaleReceipt,
        salesHistory,
        farmSalesHistory,
        supplierSalesHistory,

        // Dahi Conversion & Real-time Stock Sync
        farmStock,
        setFarmStock,
        supplierStock,
        setSupplierStock,
        convertToDahi,
        recordDahiConversion,

        // Direct Khata
        executeKhataPayment,

        // Inventory & Sales metrics (Live Milk & Dahi)
        inventoryMetrics: {
          availableFarmStock: availableFarmStock % 1 === 0 ? availableFarmStock.toFixed(0) : availableFarmStock.toFixed(1),
          rawAvailableFarmStock: availableFarmStock,
          totalFarmYield: totalFarmMilk,
          totalFarmCowYield: totalFarmCowMilk,
          totalFarmBuffaloYield: totalFarmBuffaloMilk,
          farmMilkStock: availableFarmStock % 1 === 0 ? availableFarmStock.toFixed(0) : availableFarmStock.toFixed(1),
          farmCowMilkStock: remainingFarmCowMilk % 1 === 0 ? remainingFarmCowMilk.toFixed(0) : remainingFarmCowMilk.toFixed(1),
          farmBuffaloMilkStock: remainingFarmBuffaloMilk % 1 === 0 ? remainingFarmBuffaloMilk.toFixed(0) : remainingFarmBuffaloMilk.toFixed(1),
          totalMilk: remainingTotalMilk % 1 === 0 ? remainingTotalMilk.toFixed(0) : remainingTotalMilk.toFixed(1),
          totalMilkStock: remainingTotalMilk % 1 === 0 ? remainingTotalMilk.toFixed(0) : remainingTotalMilk.toFixed(1),
          totalSupplierIntake,
          totalSupplierCowIntake,
          totalSupplierBuffaloIntake,
          supplierMilkStock: remainingSupplierMilk % 1 === 0 ? remainingSupplierMilk.toFixed(0) : remainingSupplierMilk.toFixed(1),
          supplierCowMilkStock: remainingSupplierCowMilk % 1 === 0 ? remainingSupplierCowMilk.toFixed(0) : remainingSupplierCowMilk.toFixed(1),
          supplierBuffaloMilkStock: remainingSupplierBuffaloMilk % 1 === 0 ? remainingSupplierBuffaloMilk.toFixed(0) : remainingSupplierBuffaloMilk.toFixed(1),
          totalDahi: availableDahiStock % 1 === 0 ? availableDahiStock.toFixed(0) : availableDahiStock.toFixed(1),
          totalDahiStock: availableDahiStock % 1 === 0 ? availableDahiStock.toFixed(0) : availableDahiStock.toFixed(1),
          totalDahiTransferred: totalDahiTransferredToPOS % 1 === 0 ? totalDahiTransferredToPOS.toFixed(0) : totalDahiTransferredToPOS.toFixed(1),
          rawFarmMilkStock: availableFarmStock,
          rawFarmCowMilkStock: remainingFarmCowMilk,
          rawFarmBuffaloMilkStock: remainingFarmBuffaloMilk,
          rawSupplierMilkStock: remainingSupplierMilk,
          rawSupplierCowMilkStock: remainingSupplierCowMilk,
          rawSupplierBuffaloMilkStock: remainingSupplierBuffaloMilk,
          rawTotalMilkStock: remainingTotalMilk,
          rawDahiStock: availableDahiStock,
          totalFarmMilkIntake: totalFarmMilk,
          totalFarmMilkSold: totalFarmMilkSoldQty,
          totalFarmMilkConvertedToDahi: farmMilkConvertedToDahi,
          milkSold: (totalMilkSold % 1 === 0 ? totalMilkSold.toFixed(0) : totalMilkSold.toFixed(2)),
          dahiSold: (totalDahiSold % 1 === 0 ? totalDahiSold.toFixed(0) : totalDahiSold.toFixed(2)),
          totalMilkPrice,
          totalDahiPrice,
          dahiExtraProfit: dahiRealizedExtraProfit,
          dahiTotalPotentialExtraProfit: dahiTotalExtraProfit,
          milkPrice: activeMilkPrice,
          dahiPrice: activeDahiPrice,
          productBatchStockMap: batchProductStockMap,
        },

        // Farm & Supplier Sales Source Metrics
        farmSalesMetrics,
        supplierSalesMetrics,
        businessFinancialMetrics,
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
