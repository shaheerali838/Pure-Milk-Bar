import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Wallet,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  PlusCircle,
  Sparkles,
  Percent,
  TrendingDown,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomerContext } from '../../../../context/CustomerContext';
import { useLedgerContext } from '../../../../context/LedgerContext';
import { exportTableToCSV } from '@/utils/csvExport';

export default function CustomerAdvancePaymentsView({ onBack, onOpenAddCustomer }) {
  const navigate = useNavigate();
  const { customers = [], isLoading } = useCustomerContext();
  const { getCustomerCalculatedStats, getAllCustomersAggregates } = useLedgerContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'CONSUMED' | 'OVERDRAWN'

  // Calculate advance details strictly for customers who actually deposited advance
  const advanceCustomersList = useMemo(() => {
    return (customers || [])
      .map((cust) => {
        const stats = getCustomerCalculatedStats(cust.id || cust._id);
        const openingBal = Number(stats.openingBalance) || 0;
        const totalAdvanceDeposited = Number(stats.totalAdvanceDeposited) || 0;
        const totalCharged = Number(stats.totalCharged) || 0;
        const totalPaid = Number(stats.totalPaid) || 0;
        const remainingAdvance = Number(stats.remainingAdvance) || 0;
        const consumedAdvance = Number(stats.consumedAdvance) || 0;
        const closingDue = Number(stats.closingBalance) || 0;

        const isAdvanceOpeningMethod = String(cust.openingPaymentMethod || '').toUpperCase().includes('ADVANCE');
        const hasOpeningAdvance = stats.isAdvanceOpening && openingBal > 0;
        const hasDirectAdvanceDeposit = totalAdvanceDeposited > 0;
        const hasActiveAdvanceCredit = remainingAdvance > 0;

        // STRICT FILTER: If customer never paid advance, exclude them!
        if (!hasDirectAdvanceDeposit && !hasOpeningAdvance && !hasActiveAdvanceCredit && !isAdvanceOpeningMethod) {
          return null;
        }

        const totalFund = Math.max(totalAdvanceDeposited, (hasOpeningAdvance || isAdvanceOpeningMethod) ? openingBal : 0, remainingAdvance);
        if (totalFund <= 0 && remainingAdvance <= 0) {
          return null;
        }

        const percentConsumed = totalFund > 0 ? Math.min(100, Math.round((consumedAdvance / totalFund) * 100)) : 0;

        let statusKey = 'CONSUMED';
        if (remainingAdvance > 0) {
          statusKey = 'ACTIVE';
        } else if (closingDue > 0) {
          statusKey = 'OVERDRAWN';
        }

        return {
          customer: cust,
          id: cust.id || cust._id,
          name: cust.name || 'Unnamed Customer',
          phone: cust.phone || '—',
          area: cust.area || cust.address || '—',
          subscription: cust.subscription || 'Daily Supply',
          openingDate: stats.openingDate || (cust.createdAt ? String(cust.createdAt).slice(0, 10) : '—'),
          paymentMethod: cust.openingPaymentMethod || 'Advance Deposit',
          openingBal,
          totalAdvance: totalFund,
          totalCharged,
          totalPaid,
          remainingAdvance,
          consumedAdvance,
          closingDue,
          percentConsumed,
          statusKey,
        };
      })
      .filter(Boolean);
  }, [customers, getCustomerCalculatedStats]);

  // Filtered by Search & Tab Status
  const filteredList = useMemo(() => {
    return advanceCustomersList.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.area.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'ACTIVE') return item.remainingAdvance > 0;
      if (filterStatus === 'CONSUMED') return item.remainingAdvance === 0 && item.closingDue === 0;
      if (filterStatus === 'OVERDRAWN') return item.closingDue > 0;
      return true;
    });
  }, [advanceCustomersList, searchTerm, filterStatus]);

  // Overall aggregates
  const aggregates = getAllCustomersAggregates ? getAllCustomersAggregates() : {
    totalAllAdvanceReceived: 0,
    totalRemainingAdvance: 0,
    totalConsumedAdvance: 0,
    advanceAccountsCount: 0,
  };

  const totalDeposited = advanceCustomersList.reduce((acc, c) => acc + c.totalAdvance, 0);
  const totalRemaining = advanceCustomersList.reduce((acc, c) => acc + c.remainingAdvance, 0);
  const totalConsumed = advanceCustomersList.reduce((acc, c) => acc + c.consumedAdvance, 0);
  const activeRemainingCount = advanceCustomersList.filter((c) => c.remainingAdvance > 0).length;

  const handleExportCSV = () => {
    const csvData = filteredList.map((item, idx) => ({
      'Sr #': idx + 1,
      'Customer Name': item.name,
      'Phone Number': item.phone,
      'Area / Address': item.area,
      'Deposit Date': item.openingDate,
      'Payment Mode': item.paymentMethod,
      'Total Advance Deposited (PKR)': item.totalAdvance,
      'Total Purchases Deducted (PKR)': item.totalCharged,
      'Remaining Advance (PKR)': item.remainingAdvance,
      'Pending Due (PKR)': item.closingDue,
      'Consumption %': `${item.percentConsumed}%`,
      'Status': item.remainingAdvance > 0 ? 'Active Advance' : item.closingDue > 0 ? 'Dues Pending' : 'Fully Consumed',
    }));
    exportTableToCSV(csvData, 'Customer_Advance_Payments_Report');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in-50 duration-200">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 px-3 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-black font-display text-slate-900 tracking-tight">
                Customer Advance Payments & Balance Ledger
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Dynamic tracking of advance deposits, consumption against milk orders, and remaining credit balances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
            className="h-9 px-3 text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Total Advance Received */}
        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: '#2563eb15' }}
            >
              <ArrowDownLeft style={{ width: 15, height: 15, color: '#2563eb' }} />
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
              Deposits
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              Rs. {totalDeposited.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-800">Total Advance Received</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">Total advance funds deposited</p>
          </div>
        </div>

        {/* Card 2: Remaining Advance Balance (Active) */}
        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: '#05966915' }}
            >
              <Wallet style={{ width: 15, height: 15, color: '#059669' }} />
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200/80">
              Active Available
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              Rs. {totalRemaining.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-800">Remaining Advance Balance</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">
              {activeRemainingCount} customer{activeRemainingCount !== 1 ? 's' : ''} with active credit
            </p>
          </div>
        </div>

        {/* Card 3: Consumed Advance */}
        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: '#d9770615' }}
            >
              <TrendingDown style={{ width: 15, height: 15, color: '#d97706' }} />
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
              Adjusted
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              Rs. {totalConsumed.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-800">Total Advance Consumed</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">Deducted against orders</p>
          </div>
        </div>

        {/* Card 4: Advance Accounts Count */}
        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all duration-200 hover:shadow-xs">
          <div className="flex items-start justify-between mb-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
              style={{ background: '#9333ea15' }}
            >
              <User style={{ width: 15, height: 15, color: '#9333ea' }} />
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md text-slate-600 bg-slate-100 border border-slate-200/80">
              Advance Khata
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-tight tracking-tight mb-0.5 tabular">
              {advanceCustomersList.length} Accounts
            </p>
            <p className="text-xs font-bold text-slate-800">Advance Depositors</p>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1">Customers with advance history</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by customer name, phone or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { key: 'ALL', label: `All (${advanceCustomersList.length})` },
            { key: 'ACTIVE', label: `Active Credit (${activeRemainingCount})` },
            { key: 'CONSUMED', label: 'Fully Consumed' },
            { key: 'OVERDRAWN', label: 'Overdrawn / Dues' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                filterStatus === tab.key
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Advance Customers Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <Wallet className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Advance Payment Accounts Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              {searchTerm || filterStatus !== 'ALL'
                ? 'No customer accounts matched your current search or filter criteria.'
                : 'Customers who deposit advance payments (Cash Advance / Online Advance) will be automatically tracked here with real-time consumption.'}
            </p>
            {onOpenAddCustomer && (
              <Button
                onClick={onOpenAddCustomer}
                className="h-9 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Customer With Advance</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-3">Deposit Mode & Date</th>
                  <th className="py-3 px-3 text-right">Total Advance</th>
                  <th className="py-3 px-3 text-right">Purchases Consumed</th>
                  <th className="py-3 px-4">Consumption Progress</th>
                  <th className="py-3 px-4 text-right">Remaining Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredList.map((item) => {
                  const hasRemaining = item.remainingAdvance > 0;
                  const hasDue = item.closingDue > 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {hasRemaining && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active Advance" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {item.phone}
                              </span>
                              {item.area && item.area !== '—' && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {item.area}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Deposit Mode & Date */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {item.paymentMethod.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {item.openingDate}
                        </div>
                      </td>

                      {/* Total Advance Deposited */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-bold text-slate-900 tabular">
                          Rs. {item.totalAdvance.toLocaleString()}
                        </span>
                      </td>

                      {/* Total Deductions / Consumed */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-semibold text-slate-600 tabular">
                          Rs. {item.consumedAdvance.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Total billed: Rs. {item.totalCharged.toLocaleString()}
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500">{item.percentConsumed}% used</span>
                            <span className={hasRemaining ? 'text-emerald-600' : 'text-slate-400'}>
                              {100 - item.percentConsumed}% left
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.percentConsumed >= 100
                                  ? 'bg-slate-400'
                                  : item.percentConsumed > 75
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${item.percentConsumed}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Remaining Advance Balance */}
                      <td className="py-3.5 px-4 text-right">
                        {hasRemaining ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 tabular">
                              Rs. {item.remainingAdvance.toLocaleString()}
                            </span>
                            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Advance Available</p>
                          </div>
                        ) : hasDue ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 tabular">
                              Due: Rs. {item.closingDue.toLocaleString()}
                            </span>
                            <p className="text-[10px] text-rose-500 font-medium mt-0.5">Overdrawn</p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 tabular">
                              Rs. 0.00
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fully Settled</p>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {hasRemaining ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active Advance
                          </span>
                        ) : hasDue ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Dues Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            Consumed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const cId = item._id || item.id;
                            if (cId) navigate(`/customer-hub/khata-ledger?customerId=${cId}`);
                          }}
                          className="h-8 px-2.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg gap-1"
                        >
                          <span>View Khata</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
