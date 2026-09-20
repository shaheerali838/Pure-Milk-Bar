import React, { useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PaySalaryView({
  staff,
  baseSalary = 25000,
  remainingBalance = 25000,
  record,
  selectedMonth = '2026-09',
  onBack,
  onComplete,
}) {
  const { recordSalaryPayment } = useRiderSalaryContext();

  const [amountPaid, setAmountPaid] = useState(
    remainingBalance > 0 ? String(remainingBalance) : '0'
  );
  const [base, setBase] = useState(String(baseSalary || 25000));
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!staff) return null;

  const pastPayments = record?.payments || [];
  const totalPaidSoFar = record ? Number(record.paidAmount) || 0 : 0;

  const handlePreset = (fraction) => {
    const target = Math.round(Number(base) * fraction);
    const amountToSet = Math.max(0, Math.min(Number(remainingBalance), target));
    setAmountPaid(String(amountToSet));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payNum = Number(amountPaid);
    if (!payNum || payNum <= 0) {
      setError('Please enter a valid salary amount to pay.');
      return;
    }

    recordSalaryPayment({
      staffId: staff.id,
      staffName: staff.name,
      month: selectedMonth,
      baseSalary: Number(base) || 25000,
      amountPaid: payNum,
      paymentMode,
      notes,
    });

    if (onComplete) {
      onComplete();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-150 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-7.5 w-7.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Payroll"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-none">
              Pay Salary &bull; {staff.name}
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Payroll period: {selectedMonth} &bull; {staff.type === 'RIDER' ? 'Delivery Rider' : 'Walking Staff'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center text-lg font-bold font-display">
            {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Staff Member
            </span>
            <h3 className="text-base font-bold font-display">{staff.name}</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Phone: {staff.phone || 'N/A'} &bull; Route: {staff.route || 'General'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-right">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Salary
            </span>
            <p className="text-base font-black font-display text-white tabular leading-tight">
              Rs. {Number(base).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Paid So Far
            </span>
            <p className="text-base font-black font-display text-emerald-400 tabular leading-tight">
              Rs. {totalPaidSoFar.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Remaining Due
            </span>
            <p className="text-base font-black font-display text-rose-400 tabular leading-tight">
              Rs. {Number(remainingBalance).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-3">
        <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          Record Salary Payout
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Presets:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmountPaid(String(remainingBalance))}
            className="h-6.5 px-2.5 text-[11px] font-bold text-emerald-700 bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
          >
            Pay Remaining (Rs. {Number(remainingBalance).toLocaleString()})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePreset(0.5)}
            className="h-6.5 px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            50% Advance (Rs. {(Number(base) * 0.5).toLocaleString()})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAmountPaid(String(base))}
            className="h-6.5 px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Full Base (Rs. {Number(base).toLocaleString()})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Monthly Base Salary (Rs.)</Label>
            <Input
              type="number"
              min="0"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="text-xs tabular h-8"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">
              Amount to Pay Now (Rs.) <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="text-xs tabular h-8 font-bold text-emerald-700"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger className="w-full text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH" className="text-xs">
                  Cash in Hand (CASH)
                </SelectItem>
                <SelectItem value="ONLINE" className="text-xs">
                  EasyPaisa / JazzCash / Online
                </SelectItem>
                <SelectItem value="BANK" className="text-xs">
                  Direct Bank Transfer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <Label className="text-xs font-semibold text-slate-700">Payment Notes / Remarks</Label>
            <Input
              type="text"
              placeholder="Enter details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="text-xs h-7.5 px-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-7.5 px-3.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Confirm Salary Payout
          </Button>
        </div>
      </form>

      {pastPayments.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          <h4 className="font-bold text-slate-900 text-xs font-display flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Payout History for {selectedMonth}
          </h4>
          <div className="rounded-lg border border-slate-200/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="w-[120px] py-1 text-xs">Payment Date</TableHead>
                  <TableHead className="py-1 text-xs">Amount Paid</TableHead>
                  <TableHead className="py-1 text-xs">Payment Mode</TableHead>
                  <TableHead className="py-1 text-xs">Notes / Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastPayments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/70">
                    <TableCell className="text-xs font-mono tabular py-2">
                      {p.date}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-700 tabular py-2">
                      Rs. {Number(p.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2 font-medium text-slate-800">
                      {p.paymentMode}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 py-2">
                      {p.notes || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
