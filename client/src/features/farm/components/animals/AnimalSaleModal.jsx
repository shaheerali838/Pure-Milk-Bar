import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Tag,
  DollarSign,
  User,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  TrendingUp,
  TrendingDown,
  Beef,
  Heart,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAnimalContext } from '../../../../context/AnimalContext';
import PKRIcon from '@/components/common/PKRIcon';

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'JazzCash/EasyPaisa',
  'Online',
  'Cheque',
  'Credit / Udhaar',
];

export default function AnimalSaleModal({
  isOpen,
  onClose,
  initialAnimal = null,
  onSuccess,
}) {
  const { animals = [], recordAnimalSale } = useAnimalContext();

  // Active / unsold animals available for sale
  const availableAnimals = useMemo(() => {
    return animals.filter((a) => !a.isSold && a.isActive !== false);
  }, [animals]);

  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [includeCalf, setIncludeCalf] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial selected animal if passed
  useEffect(() => {
    if (initialAnimal) {
      setSelectedAnimalId(String(initialAnimal.id || initialAnimal._id));
      if (initialAnimal.hasCalf) setIncludeCalf(true);
    } else if (availableAnimals.length > 0 && !selectedAnimalId) {
      setSelectedAnimalId(String(availableAnimals[0].id || availableAnimals[0]._id));
    }
  }, [initialAnimal, availableAnimals]);

  const selectedAnimal = useMemo(() => {
    return animals.find(
      (a) =>
        String(a.id || a._id) === String(selectedAnimalId) ||
        String(a.tag || a.tagNumber) === String(selectedAnimalId)
    );
  }, [animals, selectedAnimalId]);

  // Update includeCalf default if animal changes
  useEffect(() => {
    if (selectedAnimal?.hasCalf) {
      setIncludeCalf(true);
    } else {
      setIncludeCalf(false);
    }
  }, [selectedAnimal]);

  // Margin calculation
  const purchasePrice = parseFloat(selectedAnimal?.purchasePrice || 0);
  const numericSalePrice = parseFloat(salePrice) || 0;
  const margin = numericSalePrice - purchasePrice;
  const isProfit = margin >= 0;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAnimal) {
      toast.error('Please select an animal to sell');
      return;
    }
    if (!buyerName.trim()) {
      toast.error('Buyer name is required');
      return;
    }
    if (isNaN(numericSalePrice) || numericSalePrice <= 0) {
      toast.error('Please enter a valid sale price');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordAnimalSale({
        animalId: selectedAnimal.id || selectedAnimal._id,
        salePrice: numericSalePrice,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerAddress: buyerAddress.trim(),
        saleDate,
        paymentMethod,
        hasCalfIncluded: Boolean(includeCalf),
        notes: notes.trim(),
      });

      toast.success(
        `Animal ${selectedAnimal.tag} successfully recorded as SOLD for Rs. ${numericSalePrice.toLocaleString()}!`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record animal sale:', err);
      toast.error(err.message || 'Failed to record animal sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <PKRIcon className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                Record Animal Sale
              </h2>
              <p className="text-[11px] text-slate-500">
                Sell livestock from herd and archive to database sales records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Select Animal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Livestock Animal to Sell <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
                required
              >
                {availableAnimals.length === 0 ? (
                  <option value="">No available livestock to sell</option>
                ) : (
                  availableAnimals.map((a) => (
                    <option key={a.id || a._id} value={a.id || a._id}>
                      {a.tag} — {a.species} ({a.breed || 'Standard'}) • Purchase: Rs.{' '}
                      {(a.purchasePrice || 0).toLocaleString()} • {a.lactationStatus || 'Milking'}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Animal Snapshot Preview Card */}
          {selectedAnimal && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100/70 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Beef className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 font-mono text-sm">
                      {selectedAnimal.tag}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                      {selectedAnimal.species}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Original Cost: <strong className="text-slate-700 font-mono">Rs. {purchasePrice.toLocaleString()}</strong>
                    {selectedAnimal.totalDailyYield && ` • Milk: ${selectedAnimal.totalDailyYield}`}
                  </p>
                </div>
              </div>

              {selectedAnimal.hasCalf && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">
                    <Heart className="w-3 h-3 fill-pink-500" />
                    Has Calf ({selectedAnimal.calfGender || 'Calf'})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Calf Inclusion Toggle (if animal has calf) */}
          {selectedAnimal?.hasCalf && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-pink-50/70 border border-pink-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCalf}
                onChange={(e) => setIncludeCalf(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-pink-900 block">
                  Include Calf at side in this sale?
                </span>
                <span className="text-[11px] text-pink-700">
                  Calf Tag: {selectedAnimal.calfTag || 'Auto'} • {selectedAnimal.calfGender || 'Male'}
                </span>
              </div>
            </label>
          )}

          {/* Sale Financials: Sale Price & Margin Preview */}
          <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/80 rounded-xl space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sale Price (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-700 font-bold text-xs">
                  Rs.
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="e.g. 280000"
                  className="w-full pl-10 pr-3 py-2 bg-white border border-emerald-300 rounded-lg text-slate-900 text-sm font-bold font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Profit/Loss Comparison Bar */}
            {numericSalePrice > 0 && purchasePrice > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                <span className="text-slate-600 font-medium">Estimated Net Difference:</span>
                <span
                  className={`inline-flex items-center gap-1 font-bold font-mono px-2 py-0.5 rounded-md ${
                    isProfit
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isProfit ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  {isProfit ? '+' : ''}Rs. {Math.abs(margin).toLocaleString()} ({isProfit ? 'Profit' : 'Loss'})
                </span>
              </div>
            )}
          </div>

          {/* Buyer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Buyer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Haji Muhammad Aslam"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Buyer Phone / Contact
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sale Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Buyer Location / Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Buyer Location / Mandi / Address (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="e.g. Sahiwal Mandi, Lahore"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes / Remarks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sale Remarks / Notes
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 pt-2 pointer-events-none text-slate-400">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Cash received in full at farm gate"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAnimal}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Sale...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Animal Sale</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
