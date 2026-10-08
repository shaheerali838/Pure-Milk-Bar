import React, { useState, useEffect } from 'react';
import { estimateDistanceKm } from '../../features/pos/utils/estimateDeliveryDistance.js';

export function usePOSCart({ processingBatches = [], allCustomers = [], dynamicRiders = [] } = {}) {
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

    if (product.source && ['Farm', 'Supplier', 'Mixed', 'Both (Mixed)'].includes(product.source)) {
      const src = product.source === 'Both (Mixed)' ? 'Mixed' : product.source;
      return {
        source: src,
        farmRatio: src === 'Farm' ? 1 : src === 'Supplier' ? 0 : (product.farmRatio || 0.5),
        supplierRatio: src === 'Supplier' ? 1 : src === 'Farm' ? 0 : (product.supplierRatio || 0.5),
      };
    }

    if (isDahi) {
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
      return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
    }

    return { source: 'Farm', farmRatio: 1, supplierRatio: 0 };
  };

  // Cart operations
  const handleAddToCart = (product, initialQty = 1) => {
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
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

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
    setOntimeCustomerName('');
    setOntimeCustomerPhone('');
    setOntimeDeliveryArea('');
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
  };
}
