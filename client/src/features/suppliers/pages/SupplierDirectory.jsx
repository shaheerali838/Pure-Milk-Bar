import React, { useState, useEffect } from 'react';
import { Users, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupplierContext } from '@/context/SupplierContext';
import SupplierCardOverflow from '../components/supplierDirectory/SupplierCardOverflow';
import SupplierTable from '../components/supplierDirectory/SupplierTable';
import AddSupplier from '../components/supplierDirectory/AddSupplier';
import SupplierDetail from '../components/supplierDirectory/SupplierDetail';
import DateHeader from '@/components/common/DateHeader';
import { useGlobalDate } from '@/context/GlobalDateContext';
import { getTodayDateStr } from '@/utils/dateUtils';

export default function SupplierDirectory() {
  const { globalDate, setGlobalDate, setToday } = useGlobalDate();
  const todayStr = getTodayDateStr();

  const [selectedDate, setSelectedDate] = useState(() => globalDate || todayStr);

  useEffect(() => {
    if (globalDate) {
      setSelectedDate(globalDate);
    }
  }, [globalDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (typeof setGlobalDate === 'function') {
      setGlobalDate(newDate);
    }
  };

  // Active view: 'list' | 'form' | 'detail'
  const [viewMode, setViewMode] = useState('list');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setViewingSupplier(null);
    setViewMode('form');
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setViewingSupplier(null);
    setViewMode('form');
  };

  const handleOpenView = (supplier) => {
    setViewingSupplier(supplier);
    setEditingSupplier(null);
    setViewMode('detail');
  };

  // 1. FULL SPACE: Add / Edit Supplier Form View
  if (viewMode === 'form') {
    return (
      <AddSupplier
        onCancel={() => {
          setViewMode('list');
          setEditingSupplier(null);
        }}
        editSupplier={editingSupplier}
      />
    );
  }

  // 2. FULL SPACE: Supplier Profile Detail View
  if (viewMode === 'detail') {
    return (
      <SupplierDetail
        supplier={viewingSupplier}
        initialDate={selectedDate}
        onBack={() => {
          setViewMode('list');
          setViewingSupplier(null);
        }}
        onEdit={handleOpenEdit}
      />
    );
  }

  // 3. MAIN DIRECTORY: Summary Cards & Supplier Table View
  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* Global Date Header */}
      <DateHeader
        date={selectedDate}
        setDate={handleDateChange}
        title="Supplier Profiles & Directory"
        subtitle={`Procurement tracking, supplier payouts, and active ledger balances for ${selectedDate}`}
      />

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            Supplier Profiles &amp; Directory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 h-9.5 rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:brightness-110 active:translate-y-0 cursor-pointer"
            style={{ backgroundColor: '#009966' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary Cards (Farm card design) */}
      <SupplierCardOverflow
        onSelectSupplier={handleOpenView}
        selectedDate={selectedDate}
      />

      {/* 3. Supplier Table */}
      <SupplierTable
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        selectedDate={selectedDate}
      />
    </div>
  );
}

