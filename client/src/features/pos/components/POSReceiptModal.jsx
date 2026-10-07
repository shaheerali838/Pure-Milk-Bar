import React, { useState } from "react";
import { X, CheckCircle2, Printer, ArrowRight, Milk, Phone, MapPin, Receipt, Check } from "lucide-react";
import { usePOSContext } from "@/context/POSContext";
import { useSettingsContext } from "@/context/SettingsContext";

/**
 * Generates an isolated, ultra-clean thermal receipt document for 80mm/58mm POS printers & A4
 */
function generateThermalReceiptHtml(receipt, business) {
  const businessName = business?.businessName?.trim() || "PURE MILK BAR";
  const address = business?.address1?.trim() || "Pure Organic Dairy & Milk Products";
  const phone = business?.phone?.trim() ? `Tel: ${business.phone}` : "Tel: +92 300 0000000";
  
  const customerName = receipt.customer?.name || receipt.walkinCustomer?.name || receipt.ontimeCustomer?.name || "Walk-in Customer";
  const customerPhone = receipt.customer?.phone || receipt.walkinCustomer?.phone || receipt.ontimeCustomer?.phone;
  const isDelivery = receipt.saleCategory === "delivery";
  const fulfillmentType = isDelivery
    ? `Home Delivery (${receipt.deliverySubType === "monthly" ? "Monthly" : "On-Time"})`
    : receipt.walkinCustomerType === "registered" || receipt.customer
    ? "Walk-in (Monthly Subscribed)"
    : "Walk-in Counter";

  const paymentLabel = (receipt.paymentMethod || "cash").toUpperCase();
  const dateStr = receipt.formattedDate || new Date().toLocaleDateString();
  const timeStr = receipt.formattedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const itemsRows = (receipt.items || []).map((item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    const lineTotal = Math.round(qty * rate);
    const unitLabel = item.unit ? item.unit.replace("per ", "") : (item.name?.toLowerCase().includes("milk") ? "L" : "kg");

    return `
      <tr>
        <td style="padding: 3px 0; text-align: left; vertical-align: top;">
          <div style="font-weight: 700; font-size: 11.5px; color: #000;">${item.name}</div>
          <div style="font-size: 10px; color: #333;">${qty} ${unitLabel} × Rs. ${rate.toLocaleString()}</div>
        </td>
        <td style="padding: 3px 0; text-align: right; vertical-align: top; font-weight: 700; font-size: 11.5px; white-space: nowrap;">
          Rs. ${lineTotal.toLocaleString()}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt - ${receipt.invoiceId || 'INV'}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          @media print {
            html, body {
              width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .receipt-container {
              width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 !important;
              padding: 3mm 2.5mm !important;
              box-sizing: border-box !important;
            }
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
          }
          html, body {
            width: 80mm;
            max-width: 80mm;
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-size: 11px;
            line-height: 1.35;
          }
          .receipt-container {
            width: 80mm;
            max-width: 80mm;
            margin: 0;
            padding: 3.5mm 2.5mm;
            box-sizing: border-box;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .left { text-align: left; }
          .bold { font-weight: 700; }
          .black { font-weight: 900; }
          .header-title {
            font-size: 15px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .header-sub {
            font-size: 10px;
            color: #333;
            line-height: 1.25;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .divider-solid {
            border-top: 1.5px solid #000;
            margin: 6px 0;
          }
          .divider-double {
            border-top: 2px solid #000;
            border-bottom: 1px solid #000;
            height: 2px;
            margin: 6px 0;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 10.5px;
            margin: 1.5px 0;
          }
          .meta-label {
            color: #444;
          }
          .meta-value {
            font-weight: 600;
            color: #000;
            text-align: right;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 4px 0;
          }
          .items-table th {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 3px 0;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin: 2px 0;
          }
          .grand-total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            padding: 4px 0;
            margin: 5px 0;
            font-size: 13.5px;
            font-weight: 900;
          }
          .footer-box {
            text-align: center;
            margin-top: 8px;
            font-size: 9.5px;
            color: #333;
            line-height: 1.4;
          }
          .barcode-line {
            letter-spacing: 4px;
            font-family: monospace;
            font-size: 12px;
            font-weight: 700;
            margin: 4px 0 2px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header -->
          <div class="center">
            <div class="header-title">${businessName}</div>
            <div class="header-sub">${address}</div>
            ${phone ? `<div class="header-sub">${phone}</div>` : ''}
          </div>

          <div class="divider"></div>

          <!-- Invoice Meta -->
          <div class="meta-row">
            <span class="meta-label">Invoice #:</span>
            <span class="meta-value">${receipt.invoiceId || 'INV-0000'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Date &amp; Time:</span>
            <span class="meta-value">${dateStr} ${timeStr}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Customer:</span>
            <span class="meta-value">${customerName}</span>
          </div>
          ${customerPhone && customerPhone !== 'N/A' ? `
            <div class="meta-row">
              <span class="meta-label">Phone:</span>
              <span class="meta-value">${customerPhone}</span>
            </div>
          ` : ''}
          <div class="meta-row">
            <span class="meta-label">Fulfillment:</span>
            <span class="meta-value">${fulfillmentType}</span>
          </div>
          ${receipt.rider?.name || receipt.rider?.customName ? `
            <div class="meta-row">
              <span class="meta-label">Assigned Rider:</span>
              <span class="meta-value">${receipt.rider.customName || receipt.rider.name}</span>
            </div>
          ` : ''}
          <div class="meta-row">
            <span class="meta-label">Payment Mode:</span>
            <span class="meta-value">${paymentLabel}</span>
          </div>

          <!-- Line Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th class="left">Item Description</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="divider"></div>

          <!-- Financial Breakdown -->
          <div class="total-row">
            <span>Subtotal:</span>
            <span class="bold">Rs. ${(Number(receipt.subtotal) || 0).toLocaleString()}</span>
          </div>

          ${Number(receipt.deliveryCharge) > 0 ? `
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span class="bold">+Rs. ${(Number(receipt.deliveryCharge) || 0).toLocaleString()}</span>
            </div>
          ` : ''}

          ${Number(receipt.discount) > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span class="bold">-Rs. ${(Number(receipt.discount) || 0).toLocaleString()}</span>
            </div>
          ` : ''}

          <div class="grand-total-box">
            <span>NET PAYABLE:</span>
            <span>Rs. ${(Number(receipt.netPayable) || 0).toLocaleString()}</span>
          </div>

          ${receipt.cashTendered && Number(receipt.cashTendered) > 0 ? `
            <div class="total-row">
              <span>Cash Tendered:</span>
              <span>Rs. ${(Number(receipt.cashTendered) || 0).toLocaleString()}</span>
            </div>
            ${Number(receipt.changeDue) > 0 ? `
              <div class="total-row bold">
                <span>Change Returned:</span>
                <span>Rs. ${(Number(receipt.changeDue) || 0).toLocaleString()}</span>
              </div>
            ` : ''}
          ` : ''}

          ${receipt.notes ? `
            <div class="divider"></div>
            <div style="font-size: 10px; color: #444;">
              <strong>Note:</strong> ${receipt.notes}
            </div>
          ` : ''}

          <div class="divider-solid"></div>

          <!-- Footer -->
          <div class="footer-box">
            <div class="barcode-line">||| | |||| || ||||| |||||</div>
            <div class="bold">Thank you for visiting ${businessName}!</div>
            <div>Pure, Fresh &amp; Hygienic Dairy Products</div>
            <div style="font-size: 8.5px; color: #777; margin-top: 3px;">
              Software Powered by Pure Milk Bar ERP
            </div>
          </div>
        </div>
      </body>
    </html>

  `;
}

export default function POSReceiptModal() {
  const { completedSaleReceipt, setCompletedSaleReceipt } = usePOSContext();
  const { settings } = useSettingsContext();
  const [isPrinting, setIsPrinting] = useState(false);
  const business = settings?.business || {};

  if (!completedSaleReceipt) return null;

  const handlePrint = () => {
    try {
      setIsPrinting(true);
      const receiptHtml = generateThermalReceiptHtml(completedSaleReceipt, business);

      let printFrame = document.getElementById("pos-thermal-print-iframe");
      if (!printFrame) {
        printFrame = document.createElement("iframe");
        printFrame.id = "pos-thermal-print-iframe";
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(receiptHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (err) {
          console.warn("Iframe direct print fallback:", err);
          window.print();
        } finally {
          setIsPrinting(false);
        }
      }, 250);
    } catch (err) {
      console.error("Print receipt error:", err);
      setIsPrinting(false);
      window.print();
    }
  };

  const handleClose = () => {
    setCompletedSaleReceipt(null);
  };

  const displayName = business.businessName?.trim() || "PURE MILK BAR";
  const displayAddress = business.address1?.trim() || "Pure Organic Dairy & Milk Products";
  const displayPhone = business.phone?.trim() ? `Tel: ${business.phone}` : null;

  const customerName =
    completedSaleReceipt.customer?.name ||
    completedSaleReceipt.walkinCustomer?.name ||
    completedSaleReceipt.ontimeCustomer?.name ||
    "Walk-in Customer";

  const customerPhone =
    completedSaleReceipt.customer?.phone ||
    completedSaleReceipt.walkinCustomer?.phone ||
    completedSaleReceipt.ontimeCustomer?.phone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 no-print">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Top Emerald Success Header */}
        <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight font-display">
                Sale Completed Successfully
              </h3>
              <p className="text-[11px] text-emerald-100 font-mono">
                Invoice: {completedSaleReceipt.invoiceId || "INV-0000"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-700/60 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Paper Card Body */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* Business Information */}
          <div className="text-center pb-2.5 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 mb-1 border border-emerald-200/80">
              <Milk className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 font-display uppercase tracking-tight">
              {displayName}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {displayAddress}
            </p>
            {displayPhone && (
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {displayPhone}
              </p>
            )}
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              {completedSaleReceipt.formattedDate || new Date().toLocaleDateString()} ·{" "}
              {completedSaleReceipt.formattedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Customer & Order Metadata */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-slate-600 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Customer:</span>
              <strong className="text-slate-900 font-bold">
                {customerName}
              </strong>
            </div>

            {customerPhone && customerPhone !== "N/A" && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {customerPhone}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Order Type:</span>
              <span className="font-bold text-emerald-700 capitalize">
                {completedSaleReceipt.saleCategory === "walkin"
                  ? completedSaleReceipt.walkinCustomerType === "registered" ||
                    completedSaleReceipt.customer
                    ? "Walk-in (Monthly Subscribed)"
                    : "Walk-in (First-Time)"
                  : completedSaleReceipt.saleCategory === "delivery"
                    ? `Delivery (${completedSaleReceipt.deliverySubType === "monthly" ? "Monthly" : "One-Time"})`
                    : "Monthly Khata"}
              </span>
            </div>

            {Boolean(
              completedSaleReceipt.rider?.customName ||
              completedSaleReceipt.rider?.name
            ) && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Rider / Delivery:</span>
                <span className="font-semibold text-slate-800">
                  {completedSaleReceipt.rider.customName ||
                    completedSaleReceipt.rider.name}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-black uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.2 rounded text-[10px]">
                {completedSaleReceipt.paymentMethod || "CASH"}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-200">
              <span>ITEM &amp; QUANTITY</span>
              <span className="text-right">TOTAL</span>
            </div>
            <div className="divide-y divide-slate-100 py-1 max-h-40 overflow-y-auto pr-1">
              {(completedSaleReceipt.items || []).map((item, idx) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const lineTotal = Math.round(qty * price);
                const unitLabel = item.unit ? item.unit.replace("per ", "") : (item.name?.toLowerCase().includes("milk") ? "L" : "kg");

                return (
                  <div
                    key={item.id || idx}
                    className="py-1.5 flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">
                        {item.name}
                      </span>
                      <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                        {qty} {unitLabel} × Rs. {price.toLocaleString()}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular text-xs">
                      Rs. {lineTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Calculation */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="tabular font-semibold text-slate-700">
                Rs. {(Number(completedSaleReceipt.subtotal) || 0).toLocaleString()}
              </span>
            </div>

            {Number(completedSaleReceipt.deliveryCharge) > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Delivery Fee:</span>
                <span className="tabular font-semibold">
                  +Rs. {Number(completedSaleReceipt.deliveryCharge).toLocaleString()}
                </span>
              </div>
            )}

            {Number(completedSaleReceipt.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span className="tabular">
                  -Rs. {Number(completedSaleReceipt.discount).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span className="tracking-tight uppercase font-display">NET PAYABLE:</span>
              <span className="text-emerald-700 tabular text-base font-black">
                Rs. {(Number(completedSaleReceipt.netPayable) || 0).toLocaleString()}
              </span>
            </div>

            {completedSaleReceipt.cashTendered && Number(completedSaleReceipt.cashTendered) > 0 && (
              <div className="pt-1 text-[11px] space-y-0.5 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Cash Tendered:</span>
                  <span className="tabular font-semibold">
                    Rs. {Number(completedSaleReceipt.cashTendered).toLocaleString()}
                  </span>
                </div>
                {Number(completedSaleReceipt.changeDue) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Change Returned:</span>
                    <span className="tabular">
                      Rs. {Number(completedSaleReceipt.changeDue).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Action Footer */}
          <div className="pt-3 flex items-center justify-between gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{isPrinting ? "Printing..." : "Print Thermal Receipt"}</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <span>New Sale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

