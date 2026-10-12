import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import farmService from '@/services/farmService';
import posService from '@/services/posService.js';
import { isObjectId } from './posHelpers';
import { getLocalDate, normalizeDateStr } from '@/utils/dateUtils';

export function usePOSDirectOperations({
  products = [],
  setProducts,
  setFarmStock,
  setSupplierStock,
  setPosSyncVersion,
  setSalesHistory,
  setCompletedSaleReceipt,
  addLedgerEntry,
  remainingFarmBuffaloMilk = 0,
  getLiveStock,
}) {
  const [processingBatches, setProcessingBatches] = useState([]);

  const loadProcessingBatches = useCallback(async () => {
    try {
      const res = await farmService.getProcessingBatches();
      const list = Array.isArray(res) ? res : res?.batches || res?.data || [];
      setProcessingBatches((prev) => {
        const fetchedKeys = new Set();
        list.forEach((b) => {
          if (b._id) fetchedKeys.add(String(b._id));
          if (b.id) fetchedKeys.add(String(b.id));
          if (b.batchNumber) fetchedKeys.add(String(b.batchNumber));
        });

        // Drop any pending batch that is already in fetchedKeys or matches an entry in list
        const pendingBatches = prev.filter((b) => {
          const key1 = String(b.id || '');
          const key2 = String(b._id || '');
          const key3 = String(b.batchNumber || '');
          if (fetchedKeys.has(key1) || fetchedKeys.has(key2) || fetchedKeys.has(key3)) return false;

          const isDuplicate = list.some((lb) => {
            const sameDate = (normalizeDateStr(lb.date || lb.createdAt) || '') === (normalizeDateStr(b.date || b.createdAt) || '');
            const sameMilk = Math.abs((Number(lb.milkUsedQuantity || lb.milkUsedLiters) || 0) - (Number(b.milkUsedQuantity || b.milkUsedLiters) || 0)) < 0.05;
            const sameOutput = Math.abs((Number(lb.outputQuantity) || 0) - (Number(b.outputQuantity) || 0)) < 0.05;
            return sameDate && sameMilk && sameOutput;
          });
          return !isDuplicate;
        });
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
      milkType = 'Buffalo Milk',
      quantity = 0,
      farmMilkUsed = 0,
      supplierMilkUsed = 0,
      outputQuantity = 0,
      farmDahiAdded = 0,
      supplierDahiAdded = 0,
      batch = null,
      stage = 'pos',
    }) => {
      console.log('Action Payload [recordDahiConversion]:', {
        source,
        milkType,
        quantity,
        farmMilkUsed,
        supplierMilkUsed,
        outputQuantity,
        farmDahiAdded,
        supplierDahiAdded,
        stage,
        batchId: batch?.id || batch?._id,
      });

      const fUsed = Number(farmMilkUsed) || 0;
      const sUsed = Number(supplierMilkUsed) || 0;
      const outQty = Number(outputQuantity) || 0;
      const isCow = String(milkType || '').toLowerCase().includes('cow');

      if (batch) {
        const batchWithMilkType = { ...batch, milkType: batch.milkType || milkType };
        setProcessingBatches((prev) => {
          const bKey = String(batch.batchNumber || batch._id || batch.id);
          const filtered = prev.filter((b) => {
            const existingKey = String(b.batchNumber || b._id || b.id);
            return existingKey !== bKey;
          });
          return [batchWithMilkType, ...filtered];
        });
      }

      if (setProducts) {
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const pName = (p.name || '').toLowerCase();
            const pCat = (p.category || '').toLowerCase();
            const isDahi = pCat.includes('dahi') || pName.includes('dahi') || pCat.includes('yogurt') || pName.includes('yogurt');
            const isCowProd = pName.includes('cow');
            const isBuffProd = pName.includes('buffalo');
            const isMilk = !isDahi && (pCat.includes('milk') || pName.includes('milk'));

            if (isDahi && outQty > 0) {
              return {
                ...p,
                stock: Number(((Number(p.stock) || 0) + outQty).toFixed(2)),
              };
            }

            // Strict single deduction from matching product stock
            if (isMilk) {
              if (isCow && isCowProd && fUsed > 0) {
                return {
                  ...p,
                  stock: Math.max(0, Number(((Number(p.stock) || 0) - fUsed).toFixed(2))),
                };
              }
              if (!isCow && isBuffProd) {
                const deduct = fUsed + sUsed;
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

    const saleDateStr = getLocalDate();
    const saleTimestamp = saleDateStr;
    const orderId = `ORD-POS-${Date.now()}`;
    const splitItems = [];

    const liveStock = typeof getLiveStock === 'function' ? getLiveStock() : {};
    const availableFarmBuff = Math.max(0, Number(liveStock.rawFarmBuffaloMilkStock ?? liveStock.farmBuffaloMilkStock ?? remainingFarmBuffaloMilk ?? 0));
    const availableFarmCow = Math.max(0, Number(liveStock.rawFarmCowMilkStock ?? liveStock.farmCowMilkStock ?? 0));

    if (isCow) {
      let remainingToDeduct = qty;
      let farmCowQty = 0;
      let supplierCowQty = 0;

      if (availableFarmCow > 0) {
        if (remainingToDeduct <= availableFarmCow) {
          farmCowQty = remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          farmCowQty = availableFarmCow;
          remainingToDeduct = Number((remainingToDeduct - availableFarmCow).toFixed(2));
        }
      }

      if (remainingToDeduct > 0) {
        supplierCowQty = remainingToDeduct;
        remainingToDeduct = 0;
      }

      if (farmCowQty > 0) {
        const farmSub = Number((farmCowQty * activeRate).toFixed(2));
        splitItems.push({
          id: matchedProduct?.id || 'prod-cow-milk',
          sku: matchedProduct?.sku || 'PRD-001',
          name: supplierCowQty > 0 ? 'Cow Milk (Farm Share)' : (matchedProduct?.name || 'Cow Milk'),
          milkType: 'cow',
          category: 'Milk',
          quantity: Number(farmCowQty.toFixed(2)),
          price: activeRate,
          subtotal: farmSub,
          unit: 'per liter',
          source: 'Farm',
          farmRatio: 1,
          supplierRatio: 0,
          farmRevenue: farmSub,
          supplierRevenue: 0,
          farmQuantity: Number(farmCowQty.toFixed(2)),
          supplierQuantity: 0,
        });
      }

      if (supplierCowQty > 0) {
        const supSub = Number((supplierCowQty * activeRate).toFixed(2));
        splitItems.push({
          id: matchedProduct?.id || 'prod-cow-milk',
          sku: matchedProduct?.sku || 'PRD-001',
          name: farmCowQty > 0 ? 'Cow Milk (Supplier Share)' : (matchedProduct?.name || 'Cow Milk'),
          milkType: 'cow',
          category: 'Milk',
          quantity: Number(supplierCowQty.toFixed(2)),
          price: activeRate,
          subtotal: supSub,
          unit: 'per liter',
          source: 'Supplier',
          farmRatio: 0,
          supplierRatio: 1,
          farmRevenue: 0,
          supplierRevenue: supSub,
          farmQuantity: 0,
          supplierQuantity: Number(supplierCowQty.toFixed(2)),
        });
      }
    } else {
      let remainingToDeduct = qty;
      let farmBuffQty = 0;
      let supplierBuffQty = 0;

      if (availableFarmBuff > 0) {
        if (remainingToDeduct <= availableFarmBuff) {
          farmBuffQty = remainingToDeduct;
          remainingToDeduct = 0;
        } else {
          farmBuffQty = availableFarmBuff;
          remainingToDeduct = Number((remainingToDeduct - availableFarmBuff).toFixed(2));
        }
      }

      if (remainingToDeduct > 0) {
        supplierBuffQty = remainingToDeduct;
        remainingToDeduct = 0;
      }

      if (farmBuffQty > 0) {
        const farmSub = Number((farmBuffQty * activeRate).toFixed(2));
        splitItems.push({
          id: matchedProduct?.id || 'prod-buffalo-milk',
          sku: matchedProduct?.sku || 'PRD-002',
          name: supplierBuffQty > 0 ? 'Buffalo Milk (Farm Share)' : (matchedProduct?.name || 'Buffalo Milk'),
          milkType: 'buffalo',
          category: 'Milk',
          quantity: Number(farmBuffQty.toFixed(2)),
          price: activeRate,
          subtotal: farmSub,
          unit: 'per liter',
          source: 'Farm',
          farmRatio: 1,
          supplierRatio: 0,
          farmRevenue: farmSub,
          supplierRevenue: 0,
          farmQuantity: Number(farmBuffQty.toFixed(2)),
          supplierQuantity: 0,
        });
      }

      if (supplierBuffQty > 0) {
        const supSub = Number((supplierBuffQty * activeRate).toFixed(2));
        splitItems.push({
          id: matchedProduct?.id || 'prod-buffalo-milk',
          sku: matchedProduct?.sku || 'PRD-002',
          name: farmBuffQty > 0 ? 'Buffalo Milk (Supplier Share)' : (matchedProduct?.name || 'Buffalo Milk'),
          milkType: 'buffalo',
          category: 'Milk',
          quantity: Number(supplierBuffQty.toFixed(2)),
          price: activeRate,
          subtotal: supSub,
          unit: 'per liter',
          source: 'Supplier',
          farmRatio: 0,
          supplierRatio: 1,
          farmRevenue: 0,
          supplierRevenue: supSub,
          farmQuantity: 0,
          supplierQuantity: Number(supplierBuffQty.toFixed(2)),
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

      const totalMilkUsed = farmPortion + supPortion || qty;
      const farmRatio = totalMilkUsed > 0 ? farmPortion / totalMilkUsed : 0.5;
      const supplierRatio = totalMilkUsed > 0 ? supPortion / totalMilkUsed : 0.5;
      const farmDahiAdded = Number((outputQty * farmRatio).toFixed(3));
      const supplierDahiAdded = Number((outputQty * supplierRatio).toFixed(3));

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
        farmRatio: Number(farmRatio.toFixed(4)),
        supplierRatio: Number(supplierRatio.toFixed(4)),
        farmDahiAdded,
        supplierDahiAdded,
        unitCost: resolvedUnitCost,
        farmMilkCost: resolvedFarmCost,
        supplierMilkCost: resolvedSupplierCost,
        milkUsedCost: resolvedMilkUsedCost,
        milkType: extraData.milkType || 'Buffalo Milk',
        output: `${outputQty} kg`,
        outputQuantity: outputQty,
        outputVal: outputQty,
        fat: extraData.fat || '4.5%',
        date: extraData.date || getLocalDate(),
        status: extraData.status || 'Completed',
        stage: extraData.stage || 'pos',
        posRate: `Rs. ${rateNum} / kg`,
        time: timeNow,
        notes: extraData.notes || '',
      };

      // Strict single deduction handled by usePOSMetrics and product catalog update
      recordDahiConversion({
        source: normSource,
        milkType: newBatch.milkType,
        quantity: qty,
        farmMilkUsed: farmPortion,
        supplierMilkUsed: supPortion,
        outputQuantity: outputQty,
        farmDahiAdded,
        supplierDahiAdded,
        batch: newBatch,
        stage: newBatch.stage,
      });

      try {
        const backendRes = await farmService.createProcessingBatch({
          product: newBatch.product,
          milkType: newBatch.milkType,
          milkUsed: qty,
          milkUsedQuantity: qty,
          milkUsedLiters: qty,
          source: normSource,
          farmMilkUsed: farmPortion,
          supplierMilkUsed: supPortion,
          farmRatio: newBatch.farmRatio,
          supplierRatio: newBatch.supplierRatio,
          farmDahiAdded: newBatch.farmDahiAdded,
          supplierDahiAdded: newBatch.supplierDahiAdded,
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
