import React, { useState } from 'react';
import { Trash2, AlertOctagon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { recordWastage } from '../../services/dailyClosingService';
import { getPktTodayString } from '@/utils/dateUtils';

export default function AddWastageDialog({
  open = false,
  onOpenChange,
  onWastageAdded,
  products = [],
  date = getPktTodayString(),
}) {
  const [type, setType] = useState('MILK');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('LITER');
  const [reason, setReason] = useState('SPOILED');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'MILK') {
      setUnit('LITER');
      setProductId('');
    } else if (products.length > 0) {
      const first = products.find((p) => !String(p.category || '').toLowerCase().includes('milk')) || products[0];
      setProductId(first?.productId || '');
      setUnit(first?.unit || 'KG');
    }
  };

  const handleProductSelect = (pId) => {
    setProductId(pId);
    const selected = products.find((p) => p.productId === pId);
    if (selected) {
      setUnit(selected.unit || 'PIECE');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!quantity || Number(quantity) <= 0) {
      setErrorMsg('Please enter a valid quantity greater than zero.');
      return;
    }

    let productName = 'Raw Milk';
    if (type === 'PRODUCT') {
      const found = products.find((p) => p.productId === productId);
      productName = found ? found.name : 'Dairy Product';
    }

    setIsSubmitting(true);
    try {
      await recordWastage({
        date,
        type,
        productId: type === 'PRODUCT' ? productId : null,
        productName,
        quantity: Number(quantity),
        unit,
        reason,
        note: note.trim(),
      });

      // Reset
      setQuantity('');
      setNote('');
      if (onWastageAdded) onWastageAdded();
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record wastage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950">
              <Trash2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Log Spoilage / Wastage
            </DialogTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Record lost milk, spoiled batches or damaged stock to accurately balance today's closing.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Selector (Milk vs Product) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('MILK')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'MILK'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Raw Milk (Liters)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('PRODUCT')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'PRODUCT'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Packaged / Value-Add
            </button>
          </div>

          {/* If Product Type: Select Product */}
          {type === 'PRODUCT' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Product
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {products.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.name} ({p.unit || 'Unit'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity & Unit Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Quantity Lost / Wasted
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 5.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LITER">LITER (L)</option>
                <option value="KG">KG</option>
                <option value="PACKET">PACKET</option>
                <option value="BOTTLE">BOTTLE</option>
                <option value="PIECE">PIECE</option>
              </select>
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Reason / Cause of Wastage
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="SPOILED">Spoiled / Souring / Bad Smell</option>
              <option value="CURDLED">Curdled / Phata Doodh during Boil</option>
              <option value="SPILLAGE">Physical Tank / Bucket Spillage</option>
              <option value="LINE_WASHING">Pipe & Chiller Line-Washing Loss</option>
              <option value="EXPIRED">Expired Past Freshness Shelf-life</option>
              <option value="OTHER">Other Miscellaneous Loss</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notes / Detail (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Tank valve leaked 3 liters in morning shift"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Record Wastage'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
