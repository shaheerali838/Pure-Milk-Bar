import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryContext } from '@/context/DeliveryContext';
import DeliveryFilters from './DeliveryFilters';
import DeliveryTable from './DeliveryTable';

export default function DropPoints({ onBookDelivery, onViewDelivery }) {
  const navigate = useNavigate();
  const { deliveries = [] } = useDeliveryContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (d.customerName && d.customerName.toLowerCase().includes(term)) ||
      (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(term)) ||
      (d.route && d.route.toLowerCase().includes(term)) ||
      (d.riderNameSnapshot && d.riderNameSnapshot.toLowerCase().includes(term)) ||
      (d.runCode && d.runCode.toLowerCase().includes(term));

    const matchesShift = shiftFilter === 'ALL' || d.shift === shiftFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesShift && matchesStatus;
  });

  return (
    <div className="space-y-1.5">
      {/* Action Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 no-print">
        <div className="flex-1 min-w-[260px]">
          <DeliveryFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            shiftFilter={shiftFilter}
            setShiftFilter={setShiftFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        <Button
          type="button"
          onClick={onBookDelivery || (() => navigate('/pos?category=delivery'))}
          className="h-7.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-0.5" />
          <span>New Delivery via POS</span>
        </Button>
      </div>

      {/* Deliveries Table */}
      <DeliveryTable
        deliveries={filteredDeliveries}
        onViewDelivery={onViewDelivery}
      />
    </div>
  );
}
