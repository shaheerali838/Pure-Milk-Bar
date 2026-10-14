import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { estimateDistanceKm } from '../../features/pos/utils/estimateDeliveryDistance.js';
import { getPktTodayString, getActiveBusinessDate } from '@/utils/dateUtils';
import { resolveAvailableStock } from './posHelpers.js';

export function usePOSCart({
  processingBatches = [],
  allCustomers = [],
  dynamicRiders = [],
  activeDate = null,
  getLiveStock = () => ({}),
} = {}) {
  const effectiveActiveDate = activeDate || getActiveBusinessDate();
  const [cart, setCart] = useState([]);
  const [saleDate, setSaleDate] = useState(effectiveActiveDate);

  useEffect(() => {
    if (activeDate) {
      setSaleDate(activeDate);
    }
  }, [activeDate]);
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

  // On-Time Delivery Info (for random calling customers)
  const [ontimeCustomerName, setOntimeCustomerName] = useState('');
  const [ontimeCustomerPhone, setOntimeCustomerPhone] = useState('');
  const [ontimeDeliveryArea, setOntimeDeliveryArea] = useState('');

  // Delivery Sub-Types: 'ontime' | 'monthly'
  const [deliverySubType, setDeliverySubType] = useState('ontime');

  // Registered Customer Khata Options: 'khata' | 'cash' | 'partial'
  const [khataPaymentOption, setKhataPaymentOption] = useState('khata');
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // COD Payment Options: 'full' | 'half' | 'partial' | 'unpaid'
  const [codPaymentOption, setCodPaymentOption] = useState('full');
  const [codPaidAmount, setCodPaidAmount] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'khata' | 'online' | 'easypaisa' | 'jazzcash' | 'split' | 'cod'
  const [cashTendered, setCashTendered] = useState('');

  const [splitDetails, setSplitDetails] = useState({
    cash: '',
    easyPaisa: '',
    jazzCash: '',
  });

  const [onlineDetails, setOnlineDetails] = useState({
    provider: 'EasyPaisa',
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

  // Auto-switch paymentMethod for deliveries to COD
  useEffect(() => {
    if (saleCategory === 'delivery') {
      setPaymentMethod('cod');
    }
  }, [saleCategory, deliverySubType]);

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

    if (isDahi) {
      // Dahi inventory uses 100% dynamic Cascading (FIFO) deduction at checkout based on live stock
      return { source: 'Dynamic (Cascading)', farmRatio: 1, supplierRatio: 0 };
    }

    if (product.source && ['Farm', 'Supplier', 'Mixed', 'Both (Mixed)'].includes(product.source)) {
      const src = product.source === 'Both (Mixed)' ? 'Mixed' : product.source;
      return {
        source: src,
        farmRatio: src === 'Farm' ? 1 : src === 'Supplier' ? 0 : (product.farmRatio || 0.5),
        supplierRatio: src === 'Supplier' ? 1 : src === 'Farm' ? 0 : (product.supplierRatio || 0.5),
      };
    }

    if (name.includes('supplier') || cat.includes('supplier')) {
      return { source: 'Supplier', farmRatio: 0, supplierRatio: 1 };
    }

    if (name.includes('buffalo')) {
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
    }

    return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
  };

  // Cart operations with strict live stock validation
  const handleAddToCart = (product, initialQty = 1) => {
    if (!product) return;
    const availStock = resolveAvailableStock(product, product, getLiveStock?.() || {});
    const unit = product.unit?.replace('per ', '') || 'unit';

    if (availStock <= 0) {
      toast.error(` Out of Stock: "${product.name}" abhi dastiyab nahi hai.`, {
        description: `Recorded stock 0 ${unit} hai. Please add inventory or procurement.`,
        duration: 3500,
      });
      return;
    }

    const addQty = typeof initialQty === 'number' && initialQty > 0 ? initialQty : 1;
    const existing = cart.find((item) => item.id === product.id);
    const currentInCart = existing ? Number(existing.quantity) || 0 : 0;

    if (currentInCart + addQty > availStock) {
      toast.error(` Insufficient Stock! "${product.name}"`, {
        description: `Sirf ${availStock} ${unit} stock dastiyab hai (Already in cart: ${currentInCart} ${unit}).`,
        duration: 3500,
      });
      return;
    }

    const { source: itemSrc, farmRatio: fRatio, supplierRatio: sRatio } = resolveCartProductSource(product);
    setCart((prev) => {
      const match = prev.find((item) => item.id === product.id);
      if (match) {
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

  const handleAddToCartByRupees = (product, rupees) => {
    if (!product) return;
    const numRupees = parseFloat(rupees);
    if (isNaN(numRupees) || numRupees <= 0) return;
    const availStock = resolveAvailableStock(product, product, getLiveStock?.() || {});
    const unit = product.unit?.replace('per ', '') || 'unit';

    if (availStock <= 0) {
      toast.error(` Out of Stock: "${product.name}" abhi dastiyab nahi hai.`, {
        description: `Recorded stock 0 ${unit} hai.`,
        duration: 3500,
      });
      return;
    }

    const rate = Number(product.price) || 200;
    const calcQty = rate > 0 ? Number((numRupees / rate).toFixed(3)) : 1;
    const existing = cart.find((item) => item.id === product.id);
    const currentInCart = existing ? Number(existing.quantity) || 0 : 0;

    if (currentInCart + calcQty > availStock) {
      toast.error(` Insufficient Stock! "${product.name}"`, {
        description: `Sirf ${availStock} ${unit} stock dastiyab hai.`,
        duration: 3500,
      });
      return;
    }

    const { source: itemSrc, farmRatio: fRatio, supplierRatio: sRatio } = resolveCartProductSource(product);

    setCart((prev) => {
      const match = prev.find((item) => item.id === product.id);
      if (match) {
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

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === '' || newQuantity === undefined || newQuantity === null) {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: '' } : item))
      );
      return;
    }
    const numQty = parseFloat(newQuantity);
    if (isNaN(numQty) || numQty < 0) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const availStock = resolveAvailableStock(item, item, getLiveStock?.() || {});
        let clampedQty = numQty;
        if (availStock !== null && availStock !== undefined && numQty > availStock) {
          toast.error(`🚫 Stock Limit Exceeded! "${item.name}"`, {
            description: `Sirf ${availStock} stock dastiyab hai. Is se zyada enter nahi kiya ja sakta.`,
            duration: 2500,
          });
          clampedQty = availStock;
        }
        return { ...item, quantity: clampedQty };
      })
    );
  };

  const handleUpdateByRupees = (productId, rupees) => {
    if (rupees === '' || rupees === undefined || rupees === null) {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: '' } : item))
      );
      return;
    }
    const parsed = parseFloat(rupees);
    if (isNaN(parsed) || parsed < 0) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const rate = Number(item.price) || 1;
        let calculatedQty = (!isNaN(parsed) && parsed > 0 && rate > 0)
          ? Number((parsed / rate).toFixed(3))
          : 0;
        const availStock = resolveAvailableStock(item, item, getLiveStock?.() || {});
        if (availStock !== null && availStock !== undefined && calculatedQty > availStock) {
          toast.error(`🚫 Stock Limit Exceeded! "${item.name}"`, {
            description: `Rs. ${parsed} (${calculatedQty}) exceeds max stock of ${availStock}.`,
            duration: 2500,
          });
          calculatedQty = availStock;
        }
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
    setOntimeCustomerName('');
    setOntimeCustomerPhone('');
    setOntimeDeliveryArea('');
    setOrderNotes('');
    setPartialPaidAmount('');
    setLinkedCustomerId('');
    setSelectedRiderId('');
    setCustomRiderName('');
    setSaleDate(activeDate || getActiveBusinessDate());
    setShowFuelLog(false);
    setFuelLog({ liters: '', amount: '', distanceKm: '', notes: '' });
    setWalkinCustomerType('first_time');
    setOnlineDetails({ provider: 'EasyPaisa', senderAccount: '', trxId: '' });
    setSplitDetails({ cash: '', easyPaisa: '', jazzCash: '' });
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

  return {
    cart,
    setCart,
    cartCount: cart.reduce((count, i) => count + (Number(i.quantity) || 0), 0),
    cartSubtotal,
    discount,
    setDiscount,
    deliveryCharge,
    setDeliveryCharge,
    effectiveDeliveryCharge,
    effectiveDiscount,
    netPayable,
    fulfillmentMode,
    setFulfillmentMode,
    saleCategory,
    setSaleCategory,
    walkinCustomerType,
    setWalkinCustomerType,
    walkinName,
    setWalkinName,
    walkinPhone,
    setWalkinPhone,
    ontimeCustomerName,
    setOntimeCustomerName,
    ontimeCustomerPhone,
    setOntimeCustomerPhone,
    ontimeDeliveryArea,
    setOntimeDeliveryArea,
    deliverySubType,
    setDeliverySubType,
    khataPaymentOption,
    setKhataPaymentOption,
    partialPaidAmount,
    setPartialPaidAmount,
    splitDetails,
    setSplitDetails,
    orderNotes,
    setOrderNotes,
    codPaymentOption,
    setCodPaymentOption,
    codPaidAmount,
    setCodPaidAmount,
    paymentMethod,
    setPaymentMethod,
    cashTendered,
    setCashTendered,
    onlineDetails,
    setOnlineDetails,
    selectedRiderId,
    setSelectedRiderId,
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
    linkedCustomerId,
    setLinkedCustomerId,
    activeCustomer,
    activeRider,
    showFuelLog,
    setShowFuelLog,
    fuelLog,
    setFuelLog,
    updateFuelLog,
    handleAddToCart,
    handleAddToCartByRupees,
    handleUpdateItemSource,
    handleUpdateQuantity,
    handleUpdateByRupees,
    handleUpdatePrice,
    handleRemoveFromCart,
    handleClearCart,
    resolveCartProductSource,
    saleDate,
    setSaleDate,
  };
}
