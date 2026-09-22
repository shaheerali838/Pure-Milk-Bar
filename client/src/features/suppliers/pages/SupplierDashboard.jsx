import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import SupplierDashboardCard from '../components/SupplierDashboardCard';
import SupplierDashboardCharts from '../components/SupplierDashboardCharts';

import AddSupplier from '../components/supplierDirectory/AddSupplier';
import LogIntakeForm from '../components/intakeRegistor/LogIntakeForm';
import RecordExpenseForm from '../components/SourceExpesne/RecordExpenseForm';
import IntakeDetail from '../components/intakeRegistor/IntakeDetail';
import PaySupplierForm from '../components/intakeRegistor/PaySupplierForm';
import IntakeHistory from '../components/intakeRegistor/IntakeHistory';

export default function SupplierDashboard() {
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isLogIntakeOpen, setIsLogIntakeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedIntakeRow, setSelectedIntakeRow] = useState(null);
  const [editingIntakeRow, setEditingIntakeRow] = useState(null);
  const [payingSlip, setPayingSlip] = useState(null);

  // 1. FULL VIEW: Exact same IntakeDetail view as Intake Register
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

  // 2. FULL VIEW: Pay Supplier Form
  if (payingSlip) {
    return (
      <PaySupplierForm
        slip={payingSlip}
        onCancel={() => setPayingSlip(null)}
        onPaymentSuccess={() => setPayingSlip(null)}
      />
    );
  }

  // 3. FULL VIEW: Log or Edit Milk Intake
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
    <div className="relative min-h-screen bg-slate-50/50 pb-10">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
              Supplier Operations Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Overview &amp; Analytics
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                active Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <SupplierDashboardCard />
      
      <SupplierDashboardCharts
        onLogIntake={() => setIsLogIntakeOpen(true)}
        onAddSupplier={() => setIsAddSupplierOpen(true)}
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Directly Calling the Intake History Table Component */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Procurement Intake History
          </h3>
          <span className="text-xs text-slate-500">
            Click any row to view full slip details
          </span>
        </div>
        <IntakeHistory
          onView={(log) => setSelectedIntakeRow(log)}
          onEdit={(log) => {
            setEditingIntakeRow(log);
            setIsLogIntakeOpen(true);
          }}
          onPaySupplier={(slip) => setPayingSlip(slip)}
        />
      </div>

      {/* Modals */}
      {isAddSupplierOpen && (
        <AddSupplier onCancel={() => setIsAddSupplierOpen(false)} />
      )}

      {isAddExpenseOpen && (
        <RecordExpenseForm onCancel={() => setIsAddExpenseOpen(false)} />
      )}
    </div>
  );
}
