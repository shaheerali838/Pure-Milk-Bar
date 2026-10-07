import React, { useState } from 'react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { isDateInFilterRange } from '@/utils/dateUtils';
import DeliveryFilters from './DeliveryFilters';
import DeliveryTable from './DeliveryTable';

export default function DropPoints({ onViewDelivery }) {
  const {
    deliveries = [],
    dateFilter = 'Today',
    startDate = '',
    endDate = '',
  } = useDeliveryContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter deliveries by date range, search query, type, shift, and status
  const filteredDeliveries = deliveries.filter((d) => {
    // 1. Date filter match
    const matchesDate = isDateInFilterRange(d.date || d.createdAt, dateFilter, startDate, endDate);
    if (!matchesDate) return false;

    // 2. Search query match
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
      <div className="no-print">
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

      <DeliveryTable
        deliveries={filteredDeliveries}
        onViewDelivery={onViewDelivery}
      />
    </div>
  );
}


