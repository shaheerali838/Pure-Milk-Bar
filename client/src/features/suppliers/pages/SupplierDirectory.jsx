import React, { useState } from 'react';
import { Users, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupplierContext } from '@/context/SupplierContext';
import SupplierCardOverflow from '../components/supplierDirectory/SupplierCardOverflow';
import SupplierTable from '../components/supplierDirectory/SupplierTable';
import AddSupplier from '../components/supplierDirectory/AddSupplier';
import SupplierDetail from '../components/supplierDirectory/SupplierDetail';

export default function SupplierDirectory() {
  const { resetToDefault } = useSupplierContext();

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
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-[#009966]" />
            Supplier Profiles &amp; Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered dairy farmers, agreed rates, procurement volumes, and settlement balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (window.confirm('Reset all supplier records to clean default state?')) {
                resetToDefault();
              }
            }}
            className="flex items-center gap-1.5 px-3 h-[38px] rounded-full text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
            title="Reset supplier records in localStorage to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Data</span>
          </Button>

          <Button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 h-[38px] rounded-full text-white text-xs sm:text-sm font-semibold shadow-xs hover:brightness-110 active:translate-y-0 cursor-pointer"
            style={{ backgroundColor: '#009966' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      {/* 2. Summary Cards (Farm card design) */}
      <SupplierCardOverflow onSelectSupplier={handleOpenView} />

      {/* 3. Supplier Table */}
      <SupplierTable
        onView={handleOpenView}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
