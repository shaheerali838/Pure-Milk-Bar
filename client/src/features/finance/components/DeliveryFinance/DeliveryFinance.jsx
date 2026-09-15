import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Bike,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import { useFuelLogContext } from '@/context/FuelLogContext';
import { useRiderSalaryContext } from '@/context/RiderSalaryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DeliveryFinanceStats from './DeliveryFinanceStats';
import CustomerDeliveryBreakdownTable from './CustomerDeliveryBreakdownTable';
import CustomerDropPointsDetailView from './CustomerDropPointsDetailView';
import RiderPerformanceTable from './RiderPerformanceTable';
import RiderPerformanceDetailView from './RiderPerformanceDetailView';
import RiderSalaryPayrollTable from './RiderSalaryPayrollTable';
import PaySalaryView from './PaySalaryView';

export default function DeliveryFinance() {
  const { rawCustomers = [] } = useCustomerContext();
  const { deliveries = [] } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();
  const { fuelLogs = [] } = useFuelLogContext();
  const { salaries = [] } = useRiderSalaryContext();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // 'YYYY-MM'

  // Time Range Filter State: 'today' | 'weekly' | 'monthly' | 'custom'
  const [timeFilter, setTimeFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(todayStr);
  const [customEndDate, setCustomEndDate] = useState(todayStr);

  // Sub-tab inside Delivery Finance: 'customers' | 'riders' | 'payroll'
  const [subTab, setSubTab] = useState('customers');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Sub-views state
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'customerDetail' | 'riderDetail' | 'paySalary'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerDeliveries, setSelectedCustomerDeliveries] = useState([]);
  const [selectedRider, setSelectedRider] = useState(null);
  const [selectedRiderDeliveries, setSelectedRiderDeliveries] = useState([]);
  const [selectedRiderFuelLogs, setSelectedRiderFuelLogs] = useState([]);
  const [salaryPaymentState, setSalaryPaymentState] = useState(null);

  // Helper to check if a date string falls in the selected time range
  const isDateInTimeRange = (dateString) => {
    if (!dateString) return false;
    const dateOnly = dateString.split('T')[0];

    if (timeFilter === 'today') {
      return dateOnly === todayStr;
    }

    if (timeFilter === 'weekly') {
      const targetDate = new Date(dateOnly);
      const today = new Date(todayStr);
      const diffTime = today.getTime() - targetDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }

    if (timeFilter === 'monthly') {
      return dateOnly.startsWith(currentMonthStr);
    }

    if (timeFilter === 'custom') {
      return dateOnly >= customStartDate && dateOnly <= customEndDate;
    }

    return true;
  };

  // Filter deliveries and fuel logs by time range
  const filteredDeliveries = deliveries.filter((d) => isDateInTimeRange(d.date));
  const filteredFuelLogs = fuelLogs.filter((f) => isDateInTimeRange(f.date));

  // Compute total salaries paid in this month
  const totalSalariesPaid = salaries
    .filter((s) => s.month === currentMonthStr)
    .reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);

  // Search filter applied to customers or staff
  const searchedCustomers = rawCustomers.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.area && c.area.toLowerCase().includes(term))
    );
  });

  const searchedStaff = staffList.filter((s) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term)) ||
      (s.route && s.route.toLowerCase().includes(term))
    );
  });

  const getTimeRangeLabel = () => {
    switch (timeFilter) {
      case 'today':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'custom':
        return `${customStartDate} to ${customEndDate}`;
      default:
        return 'Today';
    }
  };

  // Render Sub-Views
  if (currentView === 'customerDetail' && selectedCustomer) {
    return (
      <CustomerDropPointsDetailView
        customer={selectedCustomer}
        deliveries={selectedCustomerDeliveries}
        timeRangeLabel={getTimeRangeLabel()}
        onBack={() => {
          setSelectedCustomer(null);
          setSelectedCustomerDeliveries([]);
          setCurrentView('main');
        }}
      />
    );
  }

  if (currentView === 'riderDetail' && selectedRider) {
    return (
      <RiderPerformanceDetailView
        staff={selectedRider}
        deliveries={selectedRiderDeliveries}
        fuelLogs={selectedRiderFuelLogs}
        timeRangeLabel={getTimeRangeLabel()}
        onBack={() => {
          setSelectedRider(null);
          setSelectedRiderDeliveries([]);
          setSelectedRiderFuelLogs([]);
          setCurrentView('main');
        }}
      />
    );
  }

  if (currentView === 'paySalary' && salaryPaymentState) {
    return (
      <PaySalaryView
        staff={salaryPaymentState.staff}
        baseSalary={salaryPaymentState.baseSalary}
        remainingBalance={salaryPaymentState.remainingBalance}
        record={salaryPaymentState.record}
        selectedMonth={currentMonthStr}
        onBack={() => {
          setSalaryPaymentState(null);
          setCurrentView('main');
        }}
        onComplete={() => {
          setSalaryPaymentState(null);
          setCurrentView('main');
        }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* 4 Summary Stats */}
      <DeliveryFinanceStats
        filteredDeliveries={filteredDeliveries}
        filteredFuelLogs={filteredFuelLogs}
        totalSalariesPaid={totalSalariesPaid}
        timeRangeLabel={getTimeRangeLabel()}
      />

      {/* Filter & Controls Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        {/* Sub-tabs Switcher */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSubTab('customers')}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              subTab === 'customers'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Customer Drop Points
          </button>

          <button
            type="button"
            onClick={() => setSubTab('riders')}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              subTab === 'riders'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50/80 text-purple-800 border-purple-200/80 hover:bg-purple-100'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Rider Performance & Fuel
          </button>

          <button
            type="button"
            onClick={() => setSubTab('payroll')}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              subTab === 'payroll'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50/80 text-blue-800 border-blue-200/80 hover:bg-blue-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Rider Payroll & Salary
          </button>
        </div>

        {/* Time Range Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTimeFilter('today')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('weekly')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                timeFilter === 'weekly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('monthly')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                timeFilter === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('custom')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                timeFilter === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Pickers */}
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-1 text-xs">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-7 w-28 text-[11px] tabular px-1.5"
              />
              <span className="text-slate-400">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-7 w-28 text-[11px] tabular px-1.5"
              />
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-36 sm:w-44">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-6 pr-2 py-0 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Customer Drop Points */}
      {subTab === 'customers' && (
        <CustomerDeliveryBreakdownTable
          rawCustomers={searchedCustomers}
          filteredDeliveries={filteredDeliveries}
          onViewCustomerDropPoints={(cust, custDelvs) => {
            setSelectedCustomer(cust);
            setSelectedCustomerDeliveries(custDelvs);
            setCurrentView('customerDetail');
          }}
        />
      )}

      {/* Sub-tab 2: Rider Performance & Fuel */}
      {subTab === 'riders' && (
        <RiderPerformanceTable
          staffList={searchedStaff}
          filteredDeliveries={filteredDeliveries}
          filteredFuelLogs={filteredFuelLogs}
          onViewRiderDetail={(st, stDelvs, stFuels) => {
            setSelectedRider(st);
            setSelectedRiderDeliveries(stDelvs);
            setSelectedRiderFuelLogs(stFuels);
            setCurrentView('riderDetail');
          }}
        />
      )}

      {/* Sub-tab 3: Rider Payroll & Salary */}
      {subTab === 'payroll' && (
        <RiderSalaryPayrollTable
          staffList={searchedStaff}
          selectedMonth={currentMonthStr}
          onPaySalary={(staff, baseSalary, remainingBalance, record) => {
            setSalaryPaymentState({
              staff,
              baseSalary,
              remainingBalance,
              record,
            });
            setCurrentView('paySalary');
          }}
        />
      )}
    </div>
  );
}
