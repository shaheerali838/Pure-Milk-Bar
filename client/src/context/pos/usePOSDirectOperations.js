import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import farmService from '@/services/farmService';
import posService from '@/services/posService.js';
import { isObjectId } from './posHelpers';

export function usePOSDirectOperations({
  products = [],
  setProducts,
  setFarmStock,
  setSupplierStock,
  setPosSyncVersion,
  setSalesHistory,
  setCompletedSaleReceipt,
  addLedgerEntry,
  getMetrics,
  remainingFarmBuffaloMilk = 0,
}) {
  const [processingBatches, setProcessingBatches] = useState([]);

  const loadProcessingBatches = useCallback(async () => {
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
  const recordDahiConversion = useCallback(
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

      if (batch) {
        setProcessingBatches((prev) => [batch, ...prev.filter((b) => b.id !== batch.id)]);
      }

      if (setProducts) {
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
      }

      if (setPosSyncVersion) {
        setPosSyncVersion((v) => v + 1);
      }
    },
    [setProducts, setPosSyncVersion]
  );

  // Direct Milk Sale (sellMilk)
  const sellMilk = async (type, quantity, rate, extraDetails = {}) => {
    const qty = Number(quantity) || 0;
    if (qty <= 0) {
      return { success: false, message: 'Invalid quantity specified for milk sale.' };
    }

    const typeStr = String(type || '').trim().toLowerCase();
    const isCow = typeStr.includes('cow');

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
      const liveMetrics = typeof getMetrics === 'function' ? getMetrics() : {};
      const availableFarmBuff = Math.max(0, Number(liveMetrics?.remainingFarmBuffaloMilk ?? liveMetrics?.inventoryMetrics?.rawFarmBuffaloMilkStock ?? remainingFarmBuffaloMilk) || 0);
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

    if (setSalesHistory) {
      setSalesHistory((prev) => [saleRecord, ...prev]);
    }

    if (matchedProduct && setProducts) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === matchedProduct.id || p.sku === matchedProduct.sku
            ? { ...p, stock: Math.max(0, Number(((p.stock || 0) - qty).toFixed(2))) }
            : p
        )
      );
    }

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

    if (setCompletedSaleReceipt) {
      setCompletedSaleReceipt(saleRecord);
    }

    const farmSoldInDirect = splitItems.find((i) => i.source === 'Farm')?.quantity || (isCow ? qty : 0);
    const supSoldInDirect = splitItems.find((i) => i.source === 'Supplier')?.quantity || 0;
    if (farmSoldInDirect > 0 && setFarmStock) {
      setFarmStock((prev) => (prev !== null ? Math.max(0, Number((prev - farmSoldInDirect).toFixed(1))) : null));
    }
    if (supSoldInDirect > 0 && setSupplierStock) {
      setSupplierStock((prev) => (prev !== null ? Math.max(0, Number((prev - supSoldInDirect).toFixed(1))) : null));
    }

    if (setPosSyncVersion) {
      setPosSyncVersion((v) => v + 1);
    }

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

  // Unified Dahi Conversion
  const convertToDahi = useCallback(
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

      if (farmPortion > 0 && setFarmStock) {
        setFarmStock((prev) => (prev !== null ? Math.max(0, Number((prev - farmPortion).toFixed(1))) : null));
      }
      if (supPortion > 0 && setSupplierStock) {
        setSupplierStock((prev) => (prev !== null ? Math.max(0, Number((prev - supPortion).toFixed(1))) : null));
      }

      recordDahiConversion({
        source: normSource,
        quantity: qty,
        farmMilkUsed: farmPortion,
        supplierMilkUsed: supPortion,
        outputQuantity: outputQty,
        batch: newBatch,
      });

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
    [recordDahiConversion, setFarmStock, setSupplierStock]
  );

  // Direct Khata Payment & Settlement
  const executeKhataPayment = ({ customerId, amountPaid, paymentMethod = 'Cash', notes = '' }) => {
    const custId = String(customerId);
    const amount = Number(amountPaid) || 0;
    if (amount <= 0 || !addLedgerEntry) return false;

    addLedgerEntry(custId, {
      description: 'POS Counter Khata Payment Received',
      credit: amount,
      debit: 0,
      method: paymentMethod,
      notes: notes || 'Cash received at POS register',
    });

    return true;
  };

  return {
    processingBatches,
    setProcessingBatches,
    loadProcessingBatches,
    recordDahiConversion,
    sellMilk,
    convertToDahi,
    executeKhataPayment,
  };
}
