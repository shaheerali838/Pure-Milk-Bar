
import { exportTableToCSV } from '@/utils/csvExport';

export const getDailyClosingSummary = async (options = {}) => {
  // Can be called with a date string or options object { date, period, startDate, endDate }
  const params = typeof options === 'string' ? { date: options, period: 'today' } : options;
  const {
    date = new Date().toISOString().split('T')[0],
    period = 'today',
    startDate = null,
    endDate = null,
  } = params;

  // TODO: connect to /api/finance/daily-closing once backend + supplier dashboard data exists
  // Simulating async network fetch
  await new Promise((resolve) => setTimeout(resolve, 150));

  return {
    date,
    period,
    startDate: period === 'custom' ? startDate : null,
    endDate: period === 'custom' ? endDate : null,
    status: 'open', // 'open' | 'closed' | 'reconciled'
    lastClosedAt: null,
    closedBy: null,

    // 1. Milk Flow Mass Balance (Liters)
    // Granular fields will be populated from Farm Milking Register, Supplier Deliveries, POS & Doorstep Deliveries
    milkFlow: {
      morningOpeningStock: null, // Morning opening tank stock (L)
      farmProduction: null,      // Morning + evening farm milking (L)
      supplierInflow: null,      // Supplier milk purchase (L) - placeholder (no data source yet)
      totalAvailable: null,      // Calculated available milk (L)
      counterPosSales: null,     // Counter POS sales (L)
      doorstepDeliveries: null,  // Doorstep delivery sales (L)
      dahiProcessingUsed: null,  // Used in Dahi / Product processing (L)
      spoiledWastage: null,      // Spillage / Wastage (L)
      totalDeductions: null,     // Calculated total deductions (L)
      expectedClosingStock: null,// Theoretical expected stock in tanks (L)
    },

    // 2. Physical Stock Inspection (Liters)
    physicalStock: {
      physicalClosingStock: null, // Actual measured stock (L)
      variance: null,             // Difference (Physical - Expected) (L)
      varianceReason: '',
      isReconciled: false,
    },

    // 3. Multi-Channel Collections (PKR)
    collections: {
      counterCash: null,          // Cash collected at counter POS (Rs.)
      onlineTransfer: null,       // JazzCash / EasyPaisa / Bank transfer at counter (Rs.)
      deliveryCodCash: null,      // Cash on delivery collected by riders (Rs.)
      customerKhataRecovered: null, // Ledger dues recovered today (Rs.)
      totalCollections: null,     // Total money collected across all channels (Rs.)
    },

    // 4. Daily Operating Expenses (PKR)
    expenses: {
      items: [
        // Placeholder items representing standard dairy expense categories
        // Will be populated from ExpenseContext / /api/expenses
        { id: 'exp-salaries', label: 'Daily Staff Wages / Labor', category: 'Wages', amount: null, note: 'Daily wages' },
        { id: 'exp-feed', label: 'Animal Feed & Fodder Purchase', category: 'Feed', amount: null, note: 'Daily fodder' },
        { id: 'exp-fuel', label: 'Generator Fuel & Rider Petrol', category: 'Fuel', amount: null, note: 'Fuel & logistics' },
        { id: 'exp-misc', label: 'Store Maintenance & Miscellaneous', category: 'Misc', amount: null, note: 'Packaging & store' },
      ],
      totalExpenses: null,
    },

    // 5. Net Liquid Flow & Profitability Snapshot
    financialSummary: {
      grossRevenue: null,
      totalExpenses: null,
      netCashLiquidFlow: null,    // (Total Cash Collections - Cash Expenses)
      netEstimatedProfit: null,   // (Gross Revenue - Total Costs)
    },

    // 6. Product Breakdown (Sales & P&L by Product)
    productBreakdown: [
      { id: 'prod-milk', name: 'Fresh Buffalo Milk', category: 'Milk', unitsSold: null, unit: 'Liters', revenue: null, estimatedCost: null, profit: null },
      { id: 'prod-dahi', name: 'Fresh Farm Dahi', category: 'Dahi', unitsSold: null, unit: 'KG', revenue: null, estimatedCost: null, profit: null },
      { id: 'prod-lassi', name: 'Sweet / Salty Lassi', category: 'Lassi', unitsSold: null, unit: 'Bottles', revenue: null, estimatedCost: null, profit: null },
    ],
  };
};

export const confirmDailyClosing = async (closingPayload) => {
  // TODO: connect to /api/finance/daily-closing once backend + supplier dashboard data exists
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    success: true,
    message: 'Day end summary successfully confirmed and locked.',
    closedAt: new Date().toISOString(),
    data: closingPayload,
  };
};

export const exportDailyClosingCsv = (summaryData) => {
  if (!summaryData) return;

  const dateLabel = summaryData.period === 'custom' && summaryData.startDate && summaryData.endDate
    ? `${summaryData.startDate}_to_${summaryData.endDate}`
    : summaryData.date || 'today';

  const rows = [
    ['--- MILK FLOW MASS BALANCE (LITERS) ---', '', ''],
    ['1. Morning Opening Tank Stock (L)', summaryData.milkFlow?.morningOpeningStock ?? '—', 'Tank physical start'],
    ['2. Farm Milking Production (L)', summaryData.milkFlow?.farmProduction ?? '—', 'Morning + evening herd yields'],
    ['3. Supplier Milk Sourcing Inflow (L)', summaryData.milkFlow?.supplierInflow ?? '—', 'External farmer deliveries'],
    ['Total Available Raw Milk (L)', summaryData.milkFlow?.totalAvailable ?? '—', 'Total stock before dispatch'],
    ['4. Counter POS Milk Sales (L)', summaryData.milkFlow?.counterPosSales ?? '—', 'Shop counter volume sold'],
    ['5. Doorstep Delivery Sales (L)', summaryData.milkFlow?.doorstepDeliveries ?? '—', 'Rider subscription dispatches'],
    ['6. Dahi & Processing Milk Used (L)', summaryData.milkFlow?.dahiProcessingUsed ?? '—', 'Used in milk processing'],
    ['7. Spoilage & Wastage (L)', summaryData.milkFlow?.spoiledWastage ?? '—', 'Spillage & testing samples'],
    ['Total Milk Deductions (L)', summaryData.milkFlow?.totalDeductions ?? '—', 'Total dispatched / consumed'],
    ['Theoretical Expected Closing Stock (L)', summaryData.milkFlow?.expectedClosingStock ?? '—', 'Available minus Deductions'],
    ['Physical Measured Tank Stock (L)', summaryData.physicalStock?.physicalClosingStock ?? '—', 'Physical dipstick reading'],
    ['Variance / Discrepancy (L)', summaryData.physicalStock?.variance ?? '—', 'Physical minus Expected'],
    ['', '', ''],
    ['--- MULTI-CHANNEL COLLECTIONS (PKR) ---', '', ''],
    ['1. Counter Cash Collected', summaryData.collections?.counterCash ? `Rs. ${Number(summaryData.collections.counterCash).toLocaleString()}` : '—', 'POS Cash in drawer'],
    ['2. Counter Online Digital Transfers', summaryData.collections?.onlineTransfer ? `Rs. ${Number(summaryData.collections.onlineTransfer).toLocaleString()}` : '—', 'JazzCash / EasyPaisa / Bank'],
    ['3. Doorstep Delivery COD Recoveries', summaryData.collections?.deliveryCodCash ? `Rs. ${Number(summaryData.collections.deliveryCodCash).toLocaleString()}` : '—', 'Rider cash collections'],
    ['4. Customer Khata Dues Recovered', summaryData.collections?.customerKhataRecovered ? `Rs. ${Number(summaryData.collections.customerKhataRecovered).toLocaleString()}` : '—', 'Ledger balances cleared'],
    ['Total Money Collected', summaryData.collections?.totalCollections ? `Rs. ${Number(summaryData.collections.totalCollections).toLocaleString()}` : '—', 'Gross cash inflow'],
    ['Total Daily Expenses Paid', summaryData.expenses?.totalExpenses ? `Rs. ${Number(summaryData.expenses.totalExpenses).toLocaleString()}` : '—', 'Feed, fuel, wages & maintenance'],
    ['Net Operational Liquid Cash Flow', summaryData.financialSummary?.netCashLiquidFlow ? `Rs. ${Number(summaryData.financialSummary.netCashLiquidFlow).toLocaleString()}` : '—', 'Collections minus Expenses'],
    ['Estimated Net Profit', summaryData.financialSummary?.netEstimatedProfit ? `Rs. ${Number(summaryData.financialSummary.netEstimatedProfit).toLocaleString()}` : '—', 'Accounting bottomline'],
  ];

  exportTableToCSV({
    filename: `Day_End_Summary_${dateLabel}`,
    title: 'Daily Closing, Reconciliation & P&L Summary',
    metadata: [
      ['Closing Period', summaryData.period?.toUpperCase() || 'TODAY'],
      ['Date / Range', dateLabel],
      ['Audit Status', (summaryData.status || 'OPEN').toUpperCase()],
      ['Closed Timestamp', summaryData.lastClosedAt || 'Pending final lock'],
      ['Verified Operator', summaryData.closedBy || 'Admin'],
    ],
    headers: ['Reconciliation & Financial Line Item', 'Recorded Metric', 'Audit Context & Source'],
    rows,
  });
};
