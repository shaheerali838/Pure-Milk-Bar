import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Edit3,
  History,
  Download,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntakeCardOverflow from '../components/intakeRegistor/IntakeCardOverflow';
import IntakeHistory from '../components/intakeRegistor/IntakeHistory';
import IntakeShifting from '../components/intakeRegistor/IntakeShifting';
import LogIntakeForm from '../components/intakeRegistor/LogIntakeForm';
import IntakeDetail from '../components/intakeRegistor/IntakeDetail';
import PaySupplierForm from '../components/intakeRegistor/PaySupplierForm';
import { useIntakeContext } from '@/context/IntakeContext';
import { exportTableToCSV } from '@/utils/csvExport';

export default function IntakeRegister() {
  const { intakeLogs } = useIntakeContext();

  // Active view: 'shift' | 'history' | 'form' | 'pay' | 'detail'
  const [viewMode, setViewMode] = useState('shift');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [payingSlip, setPayingSlip] = useState(null);

  // Open Log Form in full space
  const handleOpenLog = () => {
    setEditingItem(null);
    setViewingItem(null);
    setPayingSlip(null);
    setViewMode('form');
  };

  // Open Pay Supplier Form in full space (matching Log Single Intake type)
  const handleOpenPay = (slip = null) => {
    setPayingSlip(slip);
    setEditingItem(null);
    setViewingItem(null);
    setViewMode('pay');
  };

  // Open Edit Form in full space
  const handleEdit = (item) => {
    setEditingItem(item);
    setViewingItem(null);
    setViewMode('form');
  };

  // Open Detail View in full space matching SupplierDetail / ExpenseVoucherDetail
  const handleView = (item) => {
    setViewingItem(item);
    setViewMode('detail');
  };

  // Export CSV of current intake records
  const handleExportCSV = () => {
    if (!intakeLogs || intakeLogs.length === 0) {
      alert('No intake records to export.');
      return;
    }

    const headers = [
      'Slip ID',
      'Date',
      'Time / Shift',
      'Supplier ID',
      'Supplier Name',
      'Area / Route',
      'Quantity (Liters)',
      'Rate per Liter (PKR)',
      'Total Cost (PKR)',
      'Paid Amount (PKR)',
      'Pending Balance (PKR)',
      'Fat %',
      'LR',
      'SNF %',
      'Settlement Status',
      'Received By',
    ];

    const rows = intakeLogs.map((r) => [
      r.id || r._id || '-',
      r.date || '-',
      r.time || r.shift || 'Morning',
      r.supplierId || '-',
      r.supplierName || 'Supplier',
      r.area || 'Local Route',
      Number(r.quantity || 0).toFixed(1),
      Number(r.ratePerLiter || 0).toFixed(1),
      Number(r.totalCost || 0),
      Number(r.paidAmount || 0),
      Number(r.pendingAmount || (r.totalCost - (r.paidAmount || 0)) || 0),
      Number(r.fat || 0).toFixed(2),
      Number(r.lr || 0).toFixed(1),
      Number(r.snf || 0).toFixed(2),
      r.settlement || 'Pending',
      r.receivedBy || 'System',
    ]);

    const totalLiters = intakeLogs.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const totalCost = intakeLogs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
    const totalPaid = intakeLogs.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
    const totalPending = totalCost - totalPaid;
    const avgFat = intakeLogs.length ? (intakeLogs.reduce((sum, r) => sum + (Number(r.fat) || 0), 0) / intakeLogs.length).toFixed(2) : 0;
    const avgSnf = intakeLogs.length ? (intakeLogs.reduce((sum, r) => sum + (Number(r.snf) || 0), 0) / intakeLogs.length).toFixed(2) : 0;

    exportTableToCSV({
      filename: `milk_intake_register_${new Date().toISOString().split('T')[0]}`,
      title: 'Milk Procurement & Intake Register',
      metadata: [
        ['Total Slips Recorded', intakeLogs.length],
        ['Total Volume Procured', `${totalLiters.toFixed(1)} Liters`],
        ['Average Fat %', `${avgFat}%`],
        ['Average SNF %', `${avgSnf}%`],
        ['Total Payable', `Rs. ${totalCost.toLocaleString()}`],
        ['Total Paid', `Rs. ${totalPaid.toLocaleString()}`],
        ['Outstanding Balance', `Rs. ${totalPending.toLocaleString()}`],
      ],
      headers,
      rows,
      summaryRows: [
        ['SUMMARY TOTALS', '', '', '', '', 'Total Procurement', `${totalLiters.toFixed(1)} Liters`, '', `Rs. ${totalCost.toLocaleString()}`, `Rs. ${totalPaid.toLocaleString()}`, `Rs. ${totalPending.toLocaleString()}`, `${avgFat}%`, '', `${avgSnf}%`, '', `Slips: ${rows.length}`],
      ],
    });
  };

  // 1. FULL SPACE: Log Intake Form View
  if (viewMode === 'form') {
    return (
      <LogIntakeForm
        onCancel={() => {
          setViewMode('history');
          setEditingItem(null);
        }}
        editItem={editingItem}
      />
    );
  }

  // 2. FULL SPACE: Pay Supplier Form View
  if (viewMode === 'pay') {
    return (
      <PaySupplierForm
        slip={payingSlip}
        onCancel={() => {
          setViewMode('history');
          setPayingSlip(null);
        }}
        onPaymentSuccess={() => {
          setViewMode('history');
          setPayingSlip(null);
        }}
      />
    );
  }

  // 3. FULL SPACE: Intake Detail View (Matching ExpenseVoucherDetail / SupplierDetail)
  if (viewMode === 'detail' && viewingItem) {
    return (
      <IntakeDetail
        item={viewingItem}
        onBack={() => {
          setViewMode('history');
          setViewingItem(null);
        }}
        onEdit={(item) => handleEdit(item)}
        onPaySupplier={(slip) => handleOpenPay(slip)}
      />
    );
  }

  // 3. MAIN REGISTER: History or Shift View
  return (
    <div className="space-y-2 animate-in fade-in duration-150">
      {/* 1. Page Header with Action Controls & View Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            Supplier Milk Intake Register
          </h2>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented Pill Toggle exactly matching user screenshot */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/90 shadow-2xs">
            {/* 1. Shift Intake Entry Pill Button */}
            <button
              type="button"
              onClick={() => setViewMode('shift')}
              className={`flex items-center gap-1.5 px-4 h-[32px] rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                viewMode === 'shift'
                  ? 'bg-white text-[#155dfc] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <Edit3 className={`w-3.5 h-3.5 ${viewMode === 'shift' ? 'text-[#155dfc]' : 'text-slate-500'}`} />
              <span>Shift Intake Entry</span>
            </button>

            {/* 2. Intake History Pill Button with dynamic count */}
            <button
              type="button"
              onClick={() => setViewMode('history')}
              className={`flex items-center gap-1.5 px-4 h-[32px] rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                viewMode === 'history'
                  ? 'bg-white text-[#155dfc] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <History className={`w-3.5 h-3.5 ${viewMode === 'history' ? 'text-[#155dfc]' : 'text-slate-500'}`} />
              <span>Intake History ({intakeLogs.length})</span>
            </button>
          </div>

          {/* 3. Export CSV Button (Gray outline) */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 h-[38px] rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            title="Download CSV report of all intake records"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {/* 4. Pay Supplier Button (Opens Full-Space Form) */}
          <button
            type="button"
            onClick={() => handleOpenPay(null)}
            className="flex items-center gap-1.5 px-4 h-[38px] rounded-full text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
            title="Pay Supplier and decrease pending balance"
          >
            <Wallet className="w-4 h-4 text-emerald-700" />
            <span>Pay Supplier</span>
          </button>

          {/* 5. Log Single Intake Button (Solid Green background) */}
          <button
            type="button"
            onClick={handleOpenLog}
            className="flex items-center gap-1.5 px-4 h-[38px] rounded-full text-xs font-semibold text-white transition-all shadow-xs cursor-pointer hover:brightness-110 active:translate-y-0"
            style={{ backgroundColor: '#009966' }}
          >
            <Plus className="w-4 h-4" />
            <span>Log Single Intake</span>
          </button>
        </div>
      </div>

      {/* 2. Animal-Style Summary Cards */}
      <IntakeCardOverflow onViewBatch={handleView} />

      {/* 3. Dynamic Switchable View Area (History or Bulk Shift) */}
      {viewMode === 'shift' ? (
        <IntakeShifting onSaveSuccess={() => setViewMode('history')} />
      ) : (
        <IntakeHistory onView={handleView} onEdit={handleEdit} onPaySupplier={handleOpenPay} />
      )}
    </div>
  );
}
