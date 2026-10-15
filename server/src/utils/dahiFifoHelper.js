import ProcessingBatch from '../models/ProcessingBatch.model.js';

/**
 * Checks whether an order item is a Dahi / Yogurt / Curd product.
 */
export function isDahiProductItem(item) {
  if (!item) return false;
  const name = String(item.name || item.productName || item.product?.name || '').toLowerCase();
  const category = String(item.category || item.product?.category || '').toLowerCase();
  return (
    category.includes('dahi') ||
    name.includes('dahi') ||
    category.includes('yogurt') ||
    name.includes('yogurt') ||
    category.includes('curd') ||
    name.includes('curd')
  );
}

/**
 * Deduct sold quantity from ProcessingBatch records using FIFO (First-In, First-Out).
 * Oldest active batches at POS counter are depleted first.
 * When a batch is fully depleted, its stage automatically becomes 'sold_out'.
 */
export async function deductDahiBatchesFIFO(productNameOrCategory, quantityToDeduct) {
  let qtyRemaining = Number(quantityToDeduct);
  if (isNaN(qtyRemaining) || qtyRemaining <= 0) return [];

  // Query active batches placed at POS counter, sorted oldest first (FIFO)
  const query = { stage: 'pos' };
  if (productNameOrCategory && typeof productNameOrCategory === 'string') {
    const cleanName = productNameOrCategory.trim();
    // Only filter by specific name if it's more specific than generic "dahi"
    if (!cleanName.toLowerCase().startsWith('dahi') || cleanName.length > 5) {
      const escaped = cleanName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.product = new RegExp(escaped, 'i');
    }
  }

  let batches = await ProcessingBatch.find(query).sort({ date: 1, createdAt: 1 });

  // If no batches matched specific product name, fallback to any active POS Dahi batch
  if ((!batches || batches.length === 0) && query.product) {
    batches = await ProcessingBatch.find({ stage: 'pos' }).sort({ date: 1, createdAt: 1 });
  }

  const updatedBatches = [];

  for (const batch of batches) {
    if (qtyRemaining <= 0) break;

    const outputQty = Number(batch.outputQuantity) || 0;
    const currentSold = Number(batch.soldQuantity) || 0;
    const currentRemaining = batch.remainingQuantity !== undefined && batch.remainingQuantity !== null
      ? Number(batch.remainingQuantity)
      : Math.max(0, outputQty - currentSold);

    if (currentRemaining <= 0) {
      batch.stage = 'sold_out';
      batch.remainingQuantity = 0;
      await batch.save();
      continue;
    }

    const deduction = Math.min(currentRemaining, qtyRemaining);
    const newSold = Number((currentSold + deduction).toFixed(2));
    const newRemaining = Math.max(0, Number((currentRemaining - deduction).toFixed(2)));

    batch.soldQuantity = newSold;
    batch.remainingQuantity = newRemaining;

    // Automatically transition to sold_out when depleted
    if (newRemaining <= 0) {
      batch.stage = 'sold_out';
      batch.status = 'Completed';
    }

    await batch.save();
    updatedBatches.push({
      batchNumber: batch.batchNumber,
      deducted: deduction,
      newRemaining,
      newStage: batch.stage,
    });

    qtyRemaining = Number((qtyRemaining - deduction).toFixed(2));
  }

  return updatedBatches;
}

/**
 * Restores depleted batch quantities when an order is cancelled or voided.
 */
export async function restoreDahiBatchesFIFO(productNameOrCategory, quantityToRestore) {
  let qtyRemaining = Number(quantityToRestore);
  if (isNaN(qtyRemaining) || qtyRemaining <= 0) return [];

  const query = { soldQuantity: { $gt: 0 } };
  if (productNameOrCategory && typeof productNameOrCategory === 'string') {
    const cleanName = productNameOrCategory.trim();
    if (!cleanName.toLowerCase().startsWith('dahi') || cleanName.length > 5) {
      const escaped = cleanName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.product = new RegExp(escaped, 'i');
    }
  }

  let batches = await ProcessingBatch.find(query).sort({ date: -1, createdAt: -1 });
  if ((!batches || batches.length === 0) && query.product) {
    batches = await ProcessingBatch.find({ soldQuantity: { $gt: 0 } }).sort({ date: -1, createdAt: -1 });
  }

  for (const batch of batches) {
    if (qtyRemaining <= 0) break;

    const currentSold = Number(batch.soldQuantity) || 0;
    const restoreAmount = Math.min(currentSold, qtyRemaining);
    const newSold = Math.max(0, Number((currentSold - restoreAmount).toFixed(2)));
    const outputQty = Number(batch.outputQuantity) || 0;
    const newRemaining = Math.max(0, Number((outputQty - newSold).toFixed(2)));

    batch.soldQuantity = newSold;
    batch.remainingQuantity = newRemaining;
    if (newRemaining > 0 && batch.stage === 'sold_out') {
      batch.stage = 'pos';
    }

    await batch.save();
    qtyRemaining = Number((qtyRemaining - restoreAmount).toFixed(2));
  }
}
