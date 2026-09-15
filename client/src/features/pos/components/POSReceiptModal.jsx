import React from 'react';
import { X, CheckCircle, Printer, ArrowRight } from 'lucide-react';
import { usePOSContext } from '@/context/POSContext';

export default function POSReceiptModal() {
  const { completedSaleReceipt, setCompletedSaleReceipt } = usePOSContext();

  if (!completedSaleReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setCompletedSaleReceipt(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-bold tracking-tight font-display">Sale Completed Successfully</h3>
              <p className="text-[11px] text-emerald-100 font-mono">Invoice: {completedSaleReceipt.invoiceId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Business Brand */}
          <div className="text-center pb-2 border-b border-dashed border-slate-200">
            <h2 className="text-base font-black text-slate-900 font-display">PURE MILK BAR</h2>
            <p className="text-[11px] text-slate-500">Pure Organic Dairy &amp; Milk Products</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {completedSaleReceipt.formattedDate} · {completedSaleReceipt.formattedTime}
            </p>
          </div>

          {/* Customer & Fulfillment Info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-slate-600 text-[11px]">
            <div className="flex justify-between">
              <span>Customer:</span>
              <strong className="text-slate-800">
                {completedSaleReceipt.customer
                  ? completedSaleReceipt.customer.name
                  : completedSaleReceipt.walkinCustomer?.name || 'Walk-in Customer'}
              </strong>
            </div>
            {completedSaleReceipt.walkinCustomer?.phone && completedSaleReceipt.walkinCustomer.phone !== 'N/A' && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-semibold text-slate-700">{completedSaleReceipt.walkinCustomer.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span className="font-semibold text-emerald-700 capitalize">
                {completedSaleReceipt.saleCategory === 'walkin'
                  ? 'Walk-in Counter'
                  : completedSaleReceipt.saleCategory === 'delivery'
                  ? `Delivery (${completedSaleReceipt.deliverySubType === 'monthly' ? 'Monthly' : 'On-Time'})`
                  : 'Monthly Subscribed (Khata Buy)'}
              </span>
            </div>
            {completedSaleReceipt.rider && (
              <div className="flex justify-between">
                <span>Rider / Delivery:</span>
                <span className="font-semibold text-slate-800">
                  {completedSaleReceipt.rider.customName || completedSaleReceipt.rider.name}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold uppercase text-emerald-700">
                {completedSaleReceipt.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
              <span>ITEM</span>
              <span className="text-right">TOTAL</span>
            </div>
            <div className="divide-y divide-slate-100 py-1">
              {completedSaleReceipt.items.map((item) => (
                <div key={item.id} className="py-1.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <div className="text-[10px] text-slate-400">
                      {item.quantity} × Rs. {item.price} / {item.unit ? item.unit.replace('per ', '') : 'kg'}
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 tabular">
                    Rs. {(item.quantity * item.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-2 border-t border-dashed border-slate-200 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="tabular">Rs. {completedSaleReceipt.subtotal.toLocaleString()}</span>
            </div>
            {completedSaleReceipt.deliveryCharge > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charges:</span>
                <span className="tabular">+Rs. {completedSaleReceipt.deliveryCharge.toLocaleString()}</span>
              </div>
            )}
            {completedSaleReceipt.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span className="tabular">-Rs. {completedSaleReceipt.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>NET PAYABLE:</span>
              <span className="text-purple-700 tabular">Rs. {completedSaleReceipt.netPayable.toLocaleString()}</span>
            </div>

            {completedSaleReceipt.cashTendered && (
              <>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>Cash Tendered:</span>
                  <span className="tabular">Rs. {completedSaleReceipt.cashTendered.toLocaleString()}</span>
                </div>
                {completedSaleReceipt.changeDue > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span className="tabular">Rs. {completedSaleReceipt.changeDue.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              New Sale
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
