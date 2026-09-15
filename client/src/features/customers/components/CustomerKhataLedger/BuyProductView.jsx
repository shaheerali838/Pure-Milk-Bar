import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Trash2,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

const DAIRY_PRODUCTS = [
  { id: 'p1', name: 'Buffalo Milk', defaultRate: 220, unit: 'L' },
  { id: 'p2', name: 'Cow Milk', defaultRate: 190, unit: 'L' },
  { id: 'p3', name: 'Fresh Dahi (Yogurt)', defaultRate: 240, unit: 'Kg' },
  { id: 'p4', name: 'Desi Ghee (Pure)', defaultRate: 2400, unit: 'Kg' },
  { id: 'p5', name: 'Fresh Paneer', defaultRate: 950, unit: 'Kg' },
  { id: 'p6', name: 'Khoya / Mawa', defaultRate: 850, unit: 'Kg' },
  { id: 'p7', name: 'White Butter (Makhan)', defaultRate: 1600, unit: 'Kg' },
  { id: 'p8', name: 'Sweet Lassi', defaultRate: 90, unit: 'Bottle' },
  { id: 'p9', name: 'Other Dairy Product', defaultRate: 100, unit: 'Item' },
];

export default function BuyProductView({ customer, onBack }) {
  const { addLedgerEntry } = useLedgerContext();

  const [items, setItems] = useState([
    {
      productId: 'p1',
      productName: 'Buffalo Milk',
      quantity: '2',
      rate: '220',
      unit: 'L',
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState('p1');
  const [quantity, setQuantity] = useState('1');
  const [rate, setRate] = useState('220');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryType, setDeliveryType] = useState('Doorstep Delivery');
  const [paymentOption, setPaymentOption] = useState('khata'); // 'khata', 'cash', 'partial'
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!customer) return null;

  const handleProductChange = (prodId) => {
    setSelectedProduct(prodId);
    const prod = DAIRY_PRODUCTS.find((p) => p.id === prodId);
    if (prod) {
      setRate(String(prod.defaultRate));
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const prod = DAIRY_PRODUCTS.find((p) => p.id === selectedProduct);
    const numQty = parseFloat(quantity);
    const numRate = parseFloat(rate);

    if (!prod || isNaN(numQty) || numQty <= 0 || isNaN(numRate) || numRate <= 0) return;

    setItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: String(numQty),
        rate: String(numRate),
        unit: prod.unit,
      },
    ]);

    setQuantity('1');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      const q = parseFloat(item.quantity) || 0;
      const r = parseFloat(item.rate) || 0;
      return sum + q * r;
    }, 0);
  };

  const grandTotal = calculateGrandTotal();
  const currentKhataBal = Number(customer.khataBalance || 0);
  const projectedBalance =
    paymentOption === 'khata'
      ? currentKhataBal + grandTotal
      : paymentOption === 'cash'
      ? currentKhataBal
      : currentKhataBal + Math.max(0, grandTotal - (parseFloat(partialPaidAmount) || 0));

  const handleSubmitPurchase = (e) => {
    e.preventDefault();
    if (items.length === 0 || grandTotal <= 0) return;

    const itemSummary = items
      .map((i) => `${i.quantity} ${i.unit} ${i.productName} (@Rs. ${i.rate})`)
      .join(' + ');

    const description = `Buy: ${itemSummary} [${deliveryType}]`;

    if (paymentOption === 'cash') {
      addLedgerEntry(customer.id, {
        description,
        debit: grandTotal,
        credit: 0,
        date: purchaseDate,
        method: 'Cash',
        notes: notes ? `Instant Cash Purchase. ${notes}` : 'Instant Cash Purchase',
      });
      addLedgerEntry(customer.id, {
        description: `Payment Received (Against Buy Order)`,
        debit: 0,
        credit: grandTotal,
        date: purchaseDate,
        method: 'Cash',
        notes: 'Full immediate payment',
      });
    } else if (paymentOption === 'partial') {
      const paid = parseFloat(partialPaidAmount) || 0;
      addLedgerEntry(customer.id, {
        description,
        debit: grandTotal,
        credit: 0,
        date: purchaseDate,
        method: 'Khata Credit',
        notes: notes ? `Partial Cash: Rs. ${paid}. ${notes}` : `Partial Cash: Rs. ${paid}`,
      });
      if (paid > 0) {
        addLedgerEntry(customer.id, {
          description: `Partial Payment (Against Buy Order)`,
          debit: 0,
          credit: paid,
          date: purchaseDate,
          method: 'Cash',
          notes: 'Partial on-the-spot payment',
        });
      }
    } else {
      addLedgerEntry(customer.id, {
        description,
        debit: grandTotal,
        credit: 0,
        date: purchaseDate,
        method: 'Khata Credit',
        notes: notes ? `Khata Order. ${notes}` : 'Khata Order',
      });
    }

    onBack();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <ShoppingCart className="w-4.5 h-4.5 text-emerald-600" />
            Customer Purchase &amp; Order Entry &bull; {customer.name}
          </h1>
        </div>
      </div>

      {/* Top 3 Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs border-t-3 border-t-rose-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Khata Due</span>
          <div className="text-base font-black text-rose-600 tabular mt-0.5">
            Rs. {currentKhataBal.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs border-t-3 border-t-blue-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cart Subtotal</span>
          <div className="text-base font-black text-slate-900 tabular mt-0.5">
            Rs. {grandTotal.toLocaleString()}
          </div>
        </Card>

        <Card className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs border-t-3 border-t-emerald-500">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Projected Khata Balance</span>
          <div className="text-base font-black text-emerald-800 tabular mt-0.5">
            Rs. {projectedBalance.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Main Content Container */}
      <Card className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        {/* Product Selection Bar */}
        <div className="p-3 border border-emerald-100 bg-emerald-50/30 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Product &amp; Add to Cart</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Product Item
              </label>
              <Select value={selectedProduct} onValueChange={handleProductChange}>
                <SelectTrigger className="w-full h-8.5 bg-white border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                  <SelectValue placeholder="Choose product" />
                </SelectTrigger>
                <SelectContent>
                  {DAIRY_PRODUCTS.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id} className="text-xs">
                      {prod.name} (Rs. {prod.defaultRate}/{prod.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Qty ({DAIRY_PRODUCTS.find((p) => p.id === selectedProduct)?.unit || 'Unit'})
              </label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-8.5 bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-800 tabular"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Unit Rate (PKR)
              </label>
              <Input
                type="number"
                min="1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full h-8.5 bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-800 tabular"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddItem}
                className="w-full h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Items Cart Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Order Items List ({items.length})
            </span>
            <span className="text-xs font-bold text-slate-900 tabular">
              Subtotal: Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          <Table className="w-full text-xs">
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="py-2 px-3 text-left font-bold text-slate-400">Product</TableHead>
                <TableHead className="py-2 px-3 text-center font-bold text-slate-400">Quantity</TableHead>
                <TableHead className="py-2 px-3 text-center font-bold text-slate-400">Rate</TableHead>
                <TableHead className="py-2 px-3 text-right font-bold text-slate-400">Total (Rs.)</TableHead>
                <TableHead className="py-2 px-2 text-center w-10 font-bold text-slate-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No items added yet. Choose a product above and click &quot;Add Item&quot;.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => {
                  const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
                  return (
                    <TableRow key={idx} className="hover:bg-slate-50/60">
                      <TableCell className="py-2 px-3 font-bold text-slate-800">
                        {item.productName}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center text-slate-700 font-semibold tabular">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-center text-slate-600 tabular">
                        Rs. {Number(item.rate).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2 px-3 text-right font-black text-slate-900 tabular">
                        Rs. {lineTotal.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Date, Delivery Shift & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Purchase Date
            </label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Delivery / Shift
            </label>
            <Select value={deliveryType} onValueChange={setDeliveryType}>
              <SelectTrigger className="w-full h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                <SelectValue placeholder="Delivery type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Doorstep Delivery" className="text-xs">Doorstep Delivery</SelectItem>
                <SelectItem value="Counter Store Purchase" className="text-xs">Counter Store Purchase</SelectItem>
                <SelectItem value="Morning Shift Delivery" className="text-xs">Morning Shift Delivery</SelectItem>
                <SelectItem value="Evening Shift Delivery" className="text-xs">Evening Shift Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Order Notes / Memo
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave at door in can"
              className="w-full h-8.5 bg-slate-50/50 border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Payment & Settlement Selection */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Payment &amp; Settlement Option
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                paymentOption === 'khata'
                  ? 'border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value="khata"
                checked={paymentOption === 'khata'}
                onChange={() => setPaymentOption('khata')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <div>Charge to Khata</div>
                <div className="text-[10px] text-slate-400 font-normal">Full amount added to monthly ledger</div>
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                paymentOption === 'cash'
                  ? 'border-blue-500 bg-blue-50/40 text-blue-900 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value="cash"
                checked={paymentOption === 'cash'}
                onChange={() => setPaymentOption('cash')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <div>Paid in Cash</div>
                <div className="text-[10px] text-slate-400 font-normal">Immediate payment settlement</div>
              </div>
            </label>

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                paymentOption === 'partial'
                  ? 'border-amber-500 bg-amber-50/40 text-amber-900 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value="partial"
                checked={paymentOption === 'partial'}
                onChange={() => setPaymentOption('partial')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <div className="text-xs">
                <div>Partial Payment</div>
                <div className="text-[10px] text-slate-400 font-normal">Pay part now, remainder on Khata</div>
              </div>
            </label>
          </div>

          {paymentOption === 'partial' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                Cash Paid Now (PKR)
              </label>
              <Input
                type="number"
                min="1"
                max={grandTotal}
                value={partialPaidAmount}
                onChange={(e) => setPartialPaidAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full h-8.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 tabular"
              />
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Grand Total: </span>
            <span className="font-black text-slate-900 text-sm tabular">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="px-4 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmitPurchase}
              disabled={items.length === 0 || grandTotal <= 0}
              className="px-6 py-1.5 h-8 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm &amp; Record Order
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
