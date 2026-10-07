import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeliveryContext } from '@/context/DeliveryContext';
import DeliveryFilters from './DeliveryFilters';
import DeliveryTable from './DeliveryTable';

export default function DropPoints({ onBookDelivery, onViewDelivery }) {
  const navigate = useNavigate();
  const { deliveries = [] } = useDeliveryContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (d.customerName && d.customerName.toLowerCase().includes(term)) ||
      (d.customerPhone && d.customerPhone.toLowerCase().includes(term)) ||
      (d.deliveryAddress && d.deliveryAddress.toLowerCase().includes(term)) ||
      (d.route && d.route.toLowerCase().includes(term)) ||
      (d.riderNameSnapshot && d.riderNameSnapshot.toLowerCase().includes(term)) ||
      (d.runCode && d.runCode.toLowerCase().includes(term)) ||
      (d.receiptNumber && d.receiptNumber.toLowerCase().includes(term));

    const isOntime =
      d.deliverySubType === 'ontime' ||
      d.source === 'POS_ONE_TIME' ||
      d.deliveryType === 'ONTIME';

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'ONTIME' && isOntime) ||
      (typeFilter === 'MONTHLY' && !isOntime);

    const matchesShift = shiftFilter === 'ALL' || d.shift === shiftFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesType && matchesShift && matchesStatus;
  });

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5 no-print">
        <div className="flex-1 min-w-[280px]">
          <DeliveryFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            shiftFilter={shiftFilter}
            setShiftFilter={setShiftFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        <button
          type="button"
          onClick={onBookDelivery || (() => navigate('/pos?category=delivery'))}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Delivery via POS</span>
        </button>
      </div>

      <DeliveryTable
        deliveries={filteredDeliveries}
        onViewDelivery={onViewDelivery}
      />
    </div>
  );
}

