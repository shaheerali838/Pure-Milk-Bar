import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, X, Package, Calculator, CheckCircle2 } from 'lucide-react';
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
  { id: 'p5', name: 'Fresh Paneer', defaultRate: 950, unit: 'Kg' },
  { id: 'p6', name: 'Khoya / Mawa', defaultRate: 850, unit: 'Kg' },
  { id: 'p8', name: 'Sweet Lassi', defaultRate: 90, unit: 'Bottle' },
  { id: 'p9', name: 'Other Dairy Product', defaultRate: 100, unit: 'Item' },
];

export default function BuyProductModal({ customer, isOpen, onClose }) {
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
  const [riderName, setRiderName] = useState('');
  const [paymentOption, setPaymentOption] = useState('khata'); // 'khata', 'cash', 'partial'
  const [partialPaidAmount, setPartialPaidAmount] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !customer) return null;

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

    // Reset single item fields to next product or default
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
  const currentKhataBal = Number(customer.khataBalance ?? customer.currentBalance ?? 0);
  const projectedBalance =
    paymentOption === 'khata'
      ? currentKhataBal + grandTotal
      : paymentOption === 'cash'
      ? currentKhataBal
      : currentKhataBal + Math.max(0, grandTotal - (parseFloat(partialPaidAmount) || 0));

  const handleSubmitPurchase = (e) => {
    e.preventDefault();
    if (items.length === 0 || grandTotal <= 0) return;

    // Generate detailed buying description
    const itemSummary = items
      .map((i) => `${i.quantity} ${i.unit} ${i.productName} (@Rs. ${i.rate})`)
      .join(' + ');

    const description = `Buy: ${itemSummary} [${deliveryType}]`;
    const invoiceId = `ORD-${Date.now().toString().slice(-4)}`;
    const structuredItems = items.map((i) => ({
      productId: i.productId,
      name: i.productName,
      quantity: parseFloat(i.quantity) || 0,
      unit: i.unit || 'L',
      price: parseFloat(i.rate) || 0,
      unitPrice: parseFloat(i.rate) || 0,
      subtotal: (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0),
    }));

    const finalRiderName = riderName.trim() || (deliveryType.toLowerCase().includes('doorstep') ? (customer.referenceName || '') : '');

    if (paymentOption === 'cash') {
      // 1. Add debit for items
      addLedgerEntry(customer.id, {
        description,
        debit: grandTotal,
        credit: 0,
        date: purchaseDate,
        method: 'Cash',
        orderTotal: grandTotal,
        paidAmount: grandTotal,
        remainingAmount: 0,
        fulfillmentType: deliveryType,
        riderName: finalRiderName,
        deliveryAddress: customer.address || '',
        paymentMethod: 'Cash',
        items: structuredItems,
        invoiceId,
        notes: notes ? `Instant Cash Purchase. ${notes}` : 'Instant Cash Purchase',
      });
      // 2. Add credit for immediate cash payment
      addLedgerEntry(customer.id, {
        description: `Payment Received (Against Buy Order #${invoiceId})`,
        debit: 0,
        credit: grandTotal,
        date: purchaseDate,
        method: 'Cash',
        orderTotal: grandTotal,
        paidAmount: grandTotal,
        remainingAmount: 0,
        fulfillmentType: deliveryType,
        riderName: finalRiderName,
        paymentMethod: 'Cash',
        invoiceId,
        notes: 'Full immediate payment',
      });
    } else if (paymentOption === 'partial') {
      const paid = parseFloat(partialPaidAmount) || 0;
      const remaining = Math.max(0, grandTotal - paid);
      addLedgerEntry(customer.id, {
        description,
        debit: grandTotal,
        credit: 0,
        date: purchaseDate,
        method: 'Khata Credit',
        orderTotal: grandTotal,
        paidAmount: paid,
        remainingAmount: remaining,
        fulfillmentType: deliveryType,
        riderName: finalRiderName,
        deliveryAddress: customer.address || '',
        paymentMethod: 'Partial Cash',
        items: structuredItems,
        invoiceId,
        notes: notes ? `Partial Cash: Rs. ${paid}. ${notes}` : `Partial Cash: Rs. ${paid}`,
      });
      if (paid > 0) {
        addLedgerEntry(customer.id, {
          description: `Partial Payment (Against Buy Order #${invoiceId})`,
          debit: 0,
          credit: paid,
          date: purchaseDate,
          method: 'Cash',
          orderTotal: grandTotal,
          paidAmount: paid,
          remainingAmount: remaining,
          fulfillmentType: deliveryType,
          riderName: finalRiderName,
          paymentMethod: 'Cash',
          invoiceId,
          notes: 'Partial on-the-spot payment',
        });
      }
    } else {
      // Add full debit to Khata
      addLedgerEntry(customer.id, {
        description,
        debit: grandTotal,
        credit: 0,
        date: purchaseDate,
        method: 'Khata Credit',
        orderTotal: grandTotal,
        paidAmount: 0,
        remainingAmount: grandTotal,
        fulfillmentType: deliveryType,
        riderName: finalRiderName,
        deliveryAddress: customer.address || '',
        paymentMethod: 'Khata Credit',
        items: structuredItems,
        invoiceId,
        notes: notes ? `Khata Order. ${notes}` : 'Khata Order',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-800 flex items-center gap-2">
                Customer Buy / New Order
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold text-[10px]">
                  {customer.name}
                </Badge>
              </h3>
              <p className="text-[11px] text-slate-500">
                Select dairy products to add to {customer.name}&apos;s buying ledger
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <Card className="p-2.5 bg-slate-50/80 border-slate-200 rounded-xl shadow-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Khata Due</span>
              <div className="text-base font-black text-rose-600 tabular">
                Rs. {currentKhataBal.toLocaleString()}
              </div>
            </Card>

            <Card className="p-2.5 bg-slate-50/80 border-slate-200 rounded-xl shadow-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cart Subtotal</span>
              <div className="text-base font-black text-slate-900 tabular">
                Rs. {grandTotal.toLocaleString()}
              </div>
            </Card>

            <Card className="p-2.5 bg-emerald-50/50 border-emerald-200 rounded-xl shadow-none">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">New Khata Balance</span>
              <div className="text-base font-black text-emerald-800 tabular">
                Rs. {projectedBalance.toLocaleString()}
              </div>
            </Card>
          </div>

          <Card className="p-3 border-emerald-100 bg-emerald-50/20 rounded-xl shadow-none space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Product to Buy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product
                </label>
                <Select value={selectedProduct} onValueChange={handleProductChange}>
                  <SelectTrigger className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
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
                  Quantity ({DAIRY_PRODUCTS.find((p) => p.id === selectedProduct)?.unit || 'Unit'})
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 tabular"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Unit Rate (Rs.)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 tabular"
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
                  Add
                </Button>
              </div>
            </div>
          </Card>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Order Items ({items.length})
              </span>
              <span className="text-xs font-bold text-slate-800 tabular">
                Total: Rs. {grandTotal.toLocaleString()}
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
                      No items added yet. Choose a product above and click &quot;Add&quot;.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Buying Date
              </label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Channel / Delivery
              </label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                  <SelectValue placeholder="Delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doorstep Delivery" className="text-xs">Doorstep Delivery (ہوم ڈیلیوری)</SelectItem>
                  <SelectItem value="Doorstep (COD)" className="text-xs">Doorstep (COD - کیش آن ڈیلیوری)</SelectItem>
                  <SelectItem value="Walk-in Counter" className="text-xs">Walk-in Counter (شاپ کاؤنٹر)</SelectItem>
                  <SelectItem value="Morning Shift Delivery" className="text-xs">Morning Shift Delivery (صبح کی شفٹ)</SelectItem>
                  <SelectItem value="Evening Shift Delivery" className="text-xs">Evening Shift Delivery (شام کی شفٹ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Delivery Rider / Staff
              </label>
              <Input
                type="text"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                placeholder="e.g. Rider Ali / Bilal"
                className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Payment &amp; Settlement Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
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
                  <div className="text-[10px] text-slate-400 font-normal">Full amount on credit</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
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
                  <div className="text-[10px] text-slate-400 font-normal">Immediate settlement</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
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
                  <div className="text-[10px] text-slate-400 font-normal">Pay part now, rest on Khata</div>
                </div>
              </label>
            </div>

            {paymentOption === 'partial' && (
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                  Cash Paid Now (Rs.)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={grandTotal}
                  value={partialPaidAmount}
                  onChange={(e) => setPartialPaidAmount(e.target.value)}
                  placeholder="Enter value"
                  className="w-full h-8.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 tabular"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Order Notes / Delivery Instructions (Optional)
            </label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter value"
              className="w-full h-8.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500">Grand Total: </span>
            <span className="font-black text-slate-900 text-sm tabular">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="px-4 py-1.5 h-8 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmitPurchase}
              disabled={items.length === 0 || grandTotal <= 0}
              className="px-5 py-1.5 h-8 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm &amp; Record Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
