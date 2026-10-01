import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Bike,
  RefreshCw,
  Search,
  ArrowUpRight,
  X,
  Banknote,
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function POSDoorstepOrdersModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const {
    deliveries = [],
    updateDeliveryStatus,
    refreshDeliveries,
    isLoading = false,
  } = useDeliveryContext();

  const [filterTab, setFilterTab] = useState('PENDING'); // 'PENDING' | 'TODAY' | 'DELIVERED' | 'FAILED' | 'ALL'
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  if (!isOpen) return null;

  const todayISO = new Date().toISOString().split('T')[0];

  // Helper to normalize and check if delivery is from today
  const isTodayDelivery = (d) => {
    if (!d.date) return false;
    const dateStr = typeof d.date === 'string' ? d.date.split('T')[0] : new Date(d.date).toISOString().split('T')[0];
    return dateStr === todayISO;
  };

  // Filter deliveries based on tab & search
  const filteredDeliveries = deliveries.filter((d) => {
    // Search query match
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (d.customerName && d.customerName.toLowerCase().includes(term)) ||
      (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(term)) ||
      (d.runCode && d.runCode.toLowerCase().includes(term)) ||
      (d.receiptNumber && d.receiptNumber.toLowerCase().includes(term)) ||
      (d.riderNameSnapshot && d.riderNameSnapshot.toLowerCase().includes(term)) ||
      (d.itemDescription && d.itemDescription.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    // Filter tab logic
    if (filterTab === 'PENDING') {
      return d.status === 'PENDING';
    }
    if (filterTab === 'TODAY') {
      return isTodayDelivery(d);
    }
    if (filterTab === 'DELIVERED') {
      return d.status === 'DELIVERED';
    }
    if (filterTab === 'FAILED') {
      return d.status === 'FAILED' || d.status === 'SKIPPED';
    }
    return true; // 'ALL'
  });

  // Calculate counts for header chips
  const pendingCount = deliveries.filter((d) => d.status === 'PENDING').length;
  const todayCount = deliveries.filter(isTodayDelivery).length;
  const deliveredCount = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const failedCount = deliveries.filter((d) => d.status === 'FAILED' || d.status === 'SKIPPED').length;

  const handleStatusUpdate = async (deliveryId, newStatus, runCode) => {
    try {
      setUpdatingId(deliveryId);
      await updateDeliveryStatus(deliveryId, newStatus);
      if (newStatus === 'DELIVERED') {
        toast.success(`Order ${runCode || ''} marked as DELIVERED!`);
      } else if (newStatus === 'FAILED') {
        toast.error(`Order ${runCode || ''} marked as FAILED`);
      } else {
        toast.info(`Order ${runCode || ''} status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
      toast.error('Failed to update delivery status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 stroke-3" />
            Delivered
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Delivery
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <X className="w-3 h-3" />
            Failed
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-display text-white">
                  Doorstep &amp; Delivery Orders
                </h2>
                {pendingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 animate-bounce">
                    <span className="w-2 h-2 rounded-full bg-slate-950"></span>
                    {pendingCount} Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    0 Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Manage live active doorstep delivery orders &bull; Mark Delivered or Failed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refreshDeliveries && refreshDeliveries()}
              title="Refresh deliveries data"
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/delivery?tab=drop-points');
              }}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Doorstep Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Orders</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterTab === 'PENDING' ? 'bg-amber-800 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('TODAY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'TODAY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <span>Today's All</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterTab === 'TODAY' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {todayCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('DELIVERED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'DELIVERED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Delivered</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterTab === 'DELIVERED' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {deliveredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('FAILED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filterTab === 'FAILED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Failed / Skipped</span>
              {failedCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  filterTab === 'FAILED' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                  {failedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filterTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              All Runs ({deliveries.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, run code, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Orders List Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-slate-100/60">
          {filteredDeliveries.length === 0 ? (
            <div className="py-14 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-2xs">
                {filterTab === 'PENDING' ? (
                  <PackageCheck className="w-7 h-7 text-emerald-600" />
                ) : (
                  <Truck className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">
                  {filterTab === 'PENDING'
                    ? 'No Pending Deliveries!'
                    : 'No Orders Found in this view'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {filterTab === 'PENDING'
                    ? 'All doorstep deliveries are completed or no pending orders are waiting right now.'
                    : 'Try changing your search query or switching to another filter tab above.'}
                </p>
              </div>
            </div>
          ) : (
            filteredDeliveries.map((delivery) => {
              const delId = delivery._id || delivery.id;
              const hasItemsArray = Array.isArray(delivery.items) && delivery.items.length > 0;
              const totalDue = Number(delivery.amountDue) || 0;
              const paidAmt = Number(delivery.amountPaid) || 0;
              const codAmount = Number(delivery.codAmountToCollect) || (totalDue > 0 ? totalDue : 0);
              const isPending = delivery.status === 'PENDING';
              const isUpdating = updatingId === delId;

              return (
                <div
                  key={delId}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-400/20'
                      : delivery.status === 'DELIVERED'
                      ? 'border-emerald-200/80 bg-white'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs shadow-2xs">
                        📦
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 font-mono">
                            {delivery.runCode || 'DEL-ORDER'}
                          </span>
                          {delivery.receiptNumber && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                              #{delivery.receiptNumber}
                            </span>
                          )}
                          {getStatusBadge(delivery.status)}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>📅 {delivery.date ? (typeof delivery.date === 'string' ? delivery.date.split('T')[0] : new Date(delivery.date).toLocaleDateString()) : 'Today'}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-slate-700">{delivery.shift || 'MORNING'} Shift</span>
                          {delivery.route && (
                            <>
                              <span>&bull;</span>
                              <span>Route: {delivery.route}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rider info */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80">
                      <Bike className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-medium text-slate-500 text-[11px]">Rider:</span>
                      <span className="font-bold text-slate-800">
                        {delivery.riderNameSnapshot || (delivery.riderId?.name) || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                    {/* Customer & Address Details */}
                    <div className="md:col-span-5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-900">
                          {delivery.customerName || 'Walk-in / Direct Delivery'}
                        </span>
                      </div>

                      {delivery.deliveryAddress && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 text-[11px] leading-relaxed">
                            {delivery.deliveryAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Order Items & Qty */}
                    <div className="md:col-span-4 bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Items Purchased
                      </div>
                      {hasItemsArray ? (
                        <div className="space-y-0.5 max-h-20 overflow-y-auto">
                          {delivery.items.map((it, iIdx) => (
                            <div key={iIdx} className="flex justify-between text-[11px]">
                              <span className="font-medium text-slate-800">
                                {it.quantity}x {it.name}
                              </span>
                              <span className="font-mono text-slate-600">
                                Rs. {Number(it.subtotal || it.unitPrice * it.quantity || 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="font-medium text-slate-800 text-[11px]">
                          {delivery.qtyLiters > 0 ? `${delivery.qtyLiters} Liters — ` : ''}
                          {delivery.itemDescription || 'Dairy Products'}
                        </div>
                      )}
                    </div>

                    {/* Financials & Quick Action Buttons */}
                    <div className="md:col-span-3 flex flex-col items-end justify-center space-y-2">
                      <div className="text-right">
                        {codAmount > 0 ? (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-rose-600">
                              Due to Collect (COD):
                            </span>
                            <div className="text-sm font-black text-rose-600 font-mono">
                              Rs. {codAmount.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-600">
                              Payment Mode:
                            </span>
                            <div className="text-xs font-bold text-emerald-700 font-mono">
                              {delivery.paymentMode || 'PAID'} (Rs. {paidAmt.toLocaleString()})
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex items-center gap-1.5 w-full justify-end">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(delId, 'DELIVERED', delivery.runCode)}
                              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered</span>
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(delId, 'FAILED', delivery.runCode)}
                              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>Failed</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500">
                              Status: {delivery.status}
                            </span>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(delId, 'PENDING', delivery.runCode)}
                              title="Revert back to Pending"
                              className="text-[11px] font-bold text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Revert</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-3 font-medium">
            <span>
              Total Today: <strong className="text-slate-900">{todayCount}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Pending: <strong className="text-amber-700">{pendingCount}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Delivered: <strong className="text-emerald-700">{deliveredCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/delivery?tab=drop-points');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition"
            >
              <span>View Full Deliveries History in Doorstep Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
