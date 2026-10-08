import React, { useState } from 'react';
import { LayoutDashboard, Users, Droplets, Plus } from 'lucide-react';
import DashboardDateFilter from '@/components/common/DashboardDateFilter';
import SupplierDashboardCard from '../components/SupplierDashboardCard';
import SupplierDashboardCharts from '../components/SupplierDashboardCharts';

import AddSupplier from '../components/supplierDirectory/AddSupplier';
import SupplierTable from '../components/supplierDirectory/SupplierTable';
import SupplierDetail from '../components/supplierDirectory/SupplierDetail';
import LogIntakeForm from '../components/intakeRegistor/LogIntakeForm';
import RecordExpenseForm from '../components/SourceExpesne/RecordExpenseForm';
import IntakeDetail from '../components/intakeRegistor/IntakeDetail';
import PaySupplierForm from '../components/intakeRegistor/PaySupplierForm';
import IntakeHistory from '../components/intakeRegistor/IntakeHistory';
import { useSupplierContext } from '@/context/SupplierContext';
import { useIntakeContext } from '@/context/IntakeContext';

export default function SupplierDashboard() {
  const { suppliers = [] } = useSupplierContext() || {};
  const { intakeLogs = [] } = useIntakeContext() || {};

  // Date Filtering State
  const [timeRange, setTimeRange] = useState('today'); // 'today' | 'week' | 'month' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [activeBottomTab, setActiveBottomTab] = useState('suppliers'); // 'suppliers' | 'intake'
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isLogIntakeOpen, setIsLogIntakeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedIntakeRow, setSelectedIntakeRow] = useState(null);
  const [editingIntakeRow, setEditingIntakeRow] = useState(null);
  const [payingSlip, setPayingSlip] = useState(null);

  // 1. FULL VIEW: Supplier Profile & Ledger Detail View
  if (selectedSupplier) {
    return (
      <SupplierDetail
        supplier={selectedSupplier}
        onBack={() => setSelectedSupplier(null)}
        onEdit={(s) => {
          setSelectedSupplier(null);
          setEditingSupplier(s);
          setIsAddSupplierOpen(true);
        }}
      />
    );
  }

  // 2. FULL VIEW: Add / Edit Supplier Form View
  if (isAddSupplierOpen) {
    return (
      <AddSupplier
        editSupplier={editingSupplier}
        onCancel={() => {
          setIsAddSupplierOpen(false);
          setEditingSupplier(null);
        }}
      />
    );
  }

  // 3. FULL VIEW: Exact same IntakeDetail view as Intake Register
  if (selectedIntakeRow) {
    return (
      <IntakeDetail
        item={selectedIntakeRow}
        backLabel="Back to Dashboard"
        onBack={() => setSelectedIntakeRow(null)}
        onClose={() => setSelectedIntakeRow(null)}
        onEdit={(log) => {
          setSelectedIntakeRow(null);
          setEditingIntakeRow(log);
          setIsLogIntakeOpen(true);
        }}
        onPaySupplier={(slip) => {
          setSelectedIntakeRow(null);
          setPayingSlip(slip);
        }}
      />
    );
  }

  // 4. FULL VIEW: Pay Supplier Form
  if (payingSlip) {
    return (
      <PaySupplierForm
        slip={payingSlip}
        onCancel={() => setPayingSlip(null)}
        onPaymentSuccess={() => setPayingSlip(null)}
      />
    );
  }

  // 5. FULL VIEW: Log or Edit Milk Intake
  if (isLogIntakeOpen) {
    return (
      <LogIntakeForm
        editItem={editingIntakeRow}
        onCancel={() => {
          setIsLogIntakeOpen(false);
          setEditingIntakeRow(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <DashboardDateFilter
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          showAll={true}
          activeTheme="blue"
        />
      </div>

      {/* Main Content Areas */}
      <SupplierDashboardCard
        timeRange={timeRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />

      <SupplierDashboardCharts
        onLogIntake={() => setIsLogIntakeOpen(true)}
        onAddSupplier={() => {
          setEditingSupplier(null);
          setIsAddSupplierOpen(true);
        }}
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Dynamic Bottom Register: Supplier Register & Procurement Intake History */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {activeBottomTab === 'suppliers' ? 'Supplier Register & Directory' : 'Procurement Intake History'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {activeBottomTab === 'suppliers' ? `${suppliers.length} Registered Suppliers` : `${intakeLogs.length} Intake Logs`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeBottomTab === 'suppliers'
                ? 'Directory of all active milk suppliers, rates, daily expected volumes, and current ledger balances'
                : 'Consolidated logs of raw milk procurements, shifts, rates, and payments'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs Switcher: Supplier Register vs Intake History */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveBottomTab('suppliers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBottomTab === 'suppliers'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Supplier Register</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab('intake')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeBottomTab === 'intake'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Intake History</span>
              </button>
            </div>

            {activeBottomTab === 'suppliers' && (
              <button
                type="button"
                onClick={() => {
                  setEditingSupplier(null);
                  setIsAddSupplierOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#009966] hover:bg-[#008055] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-3" />
                <span>Add Supplier</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Supplier Register */}
        {activeBottomTab === 'suppliers' && (
          <SupplierTable
            onView={(supplier) => setSelectedSupplier(supplier)}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setIsAddSupplierOpen(true);
            }}
          />
        )}

        {/* Tab 2: Procurement Intake History */}
        {activeBottomTab === 'intake' && (
          <IntakeHistory
            onView={(log) => setSelectedIntakeRow(log)}
            onEdit={(log) => {
              setEditingIntakeRow(log);
              setIsLogIntakeOpen(true);
            }}
            onPaySupplier={(slip) => setPayingSlip(slip)}
            onViewSupplier={(supplierName, supplierId) => {
              const matched = suppliers.find(
                (s) =>
                  (supplierId && (s.id === supplierId || s._id === supplierId)) ||
                  (s.name && supplierName && s.name.trim().toLowerCase() === supplierName.trim().toLowerCase())
              );
              if (matched) setSelectedSupplier(matched);
              else setSelectedSupplier({ name: supplierName, id: supplierId });
            }}
          />
        )}
      </div>

      {isAddExpenseOpen && (
        <RecordExpenseForm onCancel={() => setIsAddExpenseOpen(false)} />
      )}
    </div>
  );
}
