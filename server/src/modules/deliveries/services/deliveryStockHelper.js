import Product from '../../../models/Product.model.js';
import Customer from '../../../models/Customer.model.js';
import DeliveryRun from '../../../models/DeliveryRun.model.js';
import { matchProductForServerItem, getLiveAvailableStock } from '../../../utils/stockResolver.js';

/**
 * Validates available physical and catalog inventory stock before creating or dispatching a delivery run.
 */
export async function validateDeliveryStock(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  const allProducts = await Product.find({}).lean();
  for (const item of items) {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    const matchedProd = await matchProductForServerItem(item, allProducts);
    if (matchedProd) {
      const availStock = await getLiveAvailableStock(matchedProd);
      if (availStock <= 0 || qty > availStock) {
        const err = new Error(
          `Insufficient stock for "${matchedProd.name}". Available: ${availStock} ${matchedProd.unit || 'L'}, Requested: ${qty}`
        );
        err.statusCode = 400;
        err.code = 'INSUFFICIENT_STOCK';
        throw err;
      }
    }
  }
}

/**
 * Deducts inventory stock exactly once when a delivery run reaches DELIVERED status.
 */
export async function deductDeliveryStock(delivery) {
  if (!delivery) return { skipped: true, reason: 'No delivery provided' };

  // Idempotency: Skip if stock already deducted for this delivery run
  if (delivery.isStockDeducted) {
    return { skipped: true, reason: 'Stock already deducted for this delivery' };
  }

  // Check if order was placed via POS counter (which already deducted inventory upon order creation)
  if (delivery.source === 'POS_ONE_TIME' || delivery.linkedOrderId) {
    await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
      $set: {
        isStockDeducted: true,
        stockDeductedAt: new Date(),
      },
    });
    return { skipped: true, reason: 'POS order already deducted stock at counter' };
  }

  let itemsToDeduct = [];
  if (Array.isArray(delivery.items) && delivery.items.length > 0) {
    itemsToDeduct = delivery.items.filter((it) => (Number(it.quantity) || 0) > 0);
  }

  // Fallback if delivery.items was empty: derive items from customer standing order or itemDescription
  if (itemsToDeduct.length === 0) {
    if (delivery.customerId) {
      try {
        const customer = await Customer.findById(delivery.customerId);
        if (customer) {
          const isMorning = String(delivery.shift || '').toUpperCase() === 'MORNING';
          const agreementItems = isMorning
            ? customer.morningItems || customer.standingOrder?.morningItems || []
            : customer.eveningItems || customer.standingOrder?.eveningItems || [];

          if (Array.isArray(agreementItems) && agreementItems.length > 0) {
            itemsToDeduct = agreementItems
              .map((it) => ({
                name: it.name || 'Product',
                quantity: Number(it.qty || it.quantity) || 0,
                unit: it.unit || 'L',
              }))
              .filter((it) => it.quantity > 0);
          }
        }
      } catch (_) {}
    }

    // Final fallback from qtyLiters / itemDescription
    if (itemsToDeduct.length === 0) {
      const totalQty = Number(delivery.qtyLiters) || 0;
      const desc = String(delivery.itemDescription || '').toLowerCase();
      if (totalQty > 0 || desc) {
        if (desc.includes('cow')) {
          itemsToDeduct.push({ name: 'Fresh Milk Cow', quantity: totalQty || 1, unit: 'L' });
        } else if (desc.includes('dahi') || desc.includes('yogurt')) {
          itemsToDeduct.push({ name: 'Dahi', quantity: totalQty || 1, unit: 'KG' });
        } else {
          itemsToDeduct.push({ name: 'Bufflo milk', quantity: totalQty || 1, unit: 'L' });
        }
      }
    }
  }

  if (itemsToDeduct.length === 0) {
    await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
      $set: {
        isStockDeducted: true,
        stockDeductedAt: new Date(),
      },
    });
    return { success: true, deducted: [] };
  }

  const allProducts = await Product.find({});
  const deductionRecords = [];

  for (const item of itemsToDeduct) {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    const matchedProd = await matchProductForServerItem(item, allProducts);
    if (matchedProd) {
      const liveAvail = await getLiveAvailableStock(matchedProd);
      const newStock = Math.max(0, Number((liveAvail - qty).toFixed(2)));

      await Product.findByIdAndUpdate(matchedProd._id, {
        $set: { currentStock: newStock },
      });

      // Update in-memory reference for multiple items matching same product
      matchedProd.currentStock = newStock;

      deductionRecords.push({
        productId: matchedProd._id,
        sku: matchedProd.sku,
        productName: matchedProd.name,
        quantity: qty,
        unit: item.unit || matchedProd.unit,
        previousStock: liveAvail,
        newStock,
        deductedAt: new Date(),
      });
    }
  }

  await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
    $set: {
      isStockDeducted: true,
      stockDeductedAt: new Date(),
      stockDeductionDetails: deductionRecords,
    },
  });

  return { success: true, deducted: deductionRecords };
}

/**
 * Restores inventory stock if a delivered run is reverted to PENDING/SKIPPED/FAILED or deleted.
 */
export async function restoreDeliveryStock(delivery) {
  if (!delivery || !delivery.isStockDeducted) {
    return { skipped: true, reason: 'Stock was not deducted' };
  }

  // If originated from POS, POS manages its own refunds/voids
  if (delivery.source === 'POS_ONE_TIME' || delivery.linkedOrderId) {
    await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
      $set: {
        isStockDeducted: false,
        stockDeductedAt: null,
      },
    });
    return { skipped: true };
  }

  const details = Array.isArray(delivery.stockDeductionDetails) ? delivery.stockDeductionDetails : [];

  if (details.length > 0) {
    for (const rec of details) {
      const qty = Number(rec.quantity) || 0;
      if (qty > 0 && rec.productId) {
        const prod = await Product.findById(rec.productId);
        if (prod) {
          const restoredStock = Number(((prod.currentStock || 0) + qty).toFixed(2));
          await Product.findByIdAndUpdate(prod._id, {
            $set: { currentStock: restoredStock },
          });
        }
      }
    }
  } else if (Array.isArray(delivery.items) && delivery.items.length > 0) {
    const allProducts = await Product.find({});
    for (const item of delivery.items) {
      const qty = Number(item.quantity) || 0;
      if (qty <= 0) continue;
      const matchedProd = await matchProductForServerItem(item, allProducts);
      if (matchedProd) {
        const restoredStock = Number(((matchedProd.currentStock || 0) + qty).toFixed(2));
        await Product.findByIdAndUpdate(matchedProd._id, {
          $set: { currentStock: restoredStock },
        });
        matchedProd.currentStock = restoredStock;
      }
    }
  }

  await DeliveryRun.findByIdAndUpdate(delivery._id || delivery.id, {
    $set: {
      isStockDeducted: false,
      stockDeductedAt: null,
      stockDeductionDetails: [],
    },
  });

  return { success: true };
}
