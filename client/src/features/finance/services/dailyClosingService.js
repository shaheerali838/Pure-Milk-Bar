
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
    ['Day End Summary Report', dateLabel],
    ['Period Mode', summaryData.period || 'today'],
    ['Status', summaryData.status || 'Open'],
    [''],
    ['--- MILK FLOW RECONCILIATION (Liters) ---'],
    ['1. Morning Opening Stock (L)', summaryData.milkFlow?.morningOpeningStock ?? '—'],
    ['2. Farm Milking Production (L)', summaryData.milkFlow?.farmProduction ?? '—'],
    ['3. Supplier Milk Inflow (L)', summaryData.milkFlow?.supplierInflow ?? '— (Not available yet)'],
    ['Total Available Milk (L)', summaryData.milkFlow?.totalAvailable ?? '—'],
    ['4. Counter POS Sales (L)', summaryData.milkFlow?.counterPosSales ?? '—'],
    ['5. Doorstep Delivery Sales (L)', summaryData.milkFlow?.doorstepDeliveries ?? '—'],
    ['6. Dahi & Processing Used (L)', summaryData.milkFlow?.dahiProcessingUsed ?? '—'],
    ['7. Spoilage & Wastage (L)', summaryData.milkFlow?.spoiledWastage ?? '—'],
    ['Total Milk Deductions (L)', summaryData.milkFlow?.totalDeductions ?? '—'],
    ['Expected Closing Stock (L)', summaryData.milkFlow?.expectedClosingStock ?? '—'],
    ['Physical Closing Stock (L)', summaryData.physicalStock?.physicalClosingStock ?? '—'],
    ['Difference from Expected (L)', summaryData.physicalStock?.variance ?? '—'],
    [''],
    ['--- MONEY COLLECTED TODAY (PKR) ---'],
    ['1. Counter Cash Collected (Rs.)', summaryData.collections?.counterCash ?? '—'],
    ['2. Counter Online Digital (Rs.)', summaryData.collections?.onlineTransfer ?? '—'],
    ['3. Delivery COD Cash (Rs.)', summaryData.collections?.deliveryCodCash ?? '—'],
    ['4. Customer Khata Recovered (Rs.)', summaryData.collections?.customerKhataRecovered ?? '—'],
    ['Total Collections (Rs.)', summaryData.collections?.totalCollections ?? '—'],
    ['Total Daily Expenses (Rs.)', summaryData.expenses?.totalExpenses ?? '—'],
    ['Net Liquid Flow (Rs.)', summaryData.financialSummary?.netCashLiquidFlow ?? '—'],
    ['Net Estimated Profit (Rs.)', summaryData.financialSummary?.netEstimatedProfit ?? '—'],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Day_End_Summary_${dateLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
