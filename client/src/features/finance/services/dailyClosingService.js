import { api } from '../../../services/api';
import { getPktTodayString } from '../../../utils/dateUtils';

/**
 * Fetch daily closing summary from backend for a specific date or date range.
 * Fully wired to real MongoDB API.
 *
 * @param {Object} options { date, period, startDate, endDate }
 * @returns {Promise<Object>}
 */
export const getDailyClosingSummary = async (options = {}) => {
  const params = typeof options === 'string' ? { date: options, period: 'today' } : options;
  const {
    date = getPktTodayString(),
    period = 'today',
    startDate = null,
    endDate = null,
  } = params;

  const queryParams = { period };
  if (period === 'today' || !period) {
    queryParams.date = date || getPktTodayString();
  } else if (period === 'custom') {
    queryParams.startDate = startDate;
    queryParams.endDate = endDate;
  }

  const res = await api.dailyClosing.getSummary(queryParams);
  // Support both standard envelope format { success: true, data: { ... } } and direct response
  return res?.data || res;
};

/**
 * Confirm daily closing and permanently lock the dayEnd snapshot in database.
 *
 * @param {Object} payload { date, physicalMilkLiters, physicalCash, varianceReason, notes, productPhysicalCounts }
 * @returns {Promise<Object>}
 */
export const confirmDailyClosing = async (payload) => {
  const res = await api.dailyClosing.confirm(payload);
  return res;
};

/**
 * Fetch light closing history (last 30 closings)
 * @returns {Promise<Array>}
 */
export const getClosingHistory = async (limit = 30) => {
  const res = await api.dailyClosing.getHistory(limit);
  return Array.isArray(res) ? res : res?.data || res?.history || [];
};

/**
 * Record a milk or product wastage entry
 * @param {Object} payload { date, type, productId, productName, quantity, unit, reason, note }
 * @returns {Promise<Object>}
 */
export const recordWastage = async (payload) => {
  const res = await api.dailyClosing.recordWastage(payload);
  return res?.data || res;
};

/**
 * Admin action to reopen a closed day
 * @param {string} closingId
 * @param {string} reopenReason
 * @returns {Promise<Object>}
 */
export const reopenDailyClosing = async (closingId, reopenReason) => {
  const res = await api.dailyClosing.reopen(closingId, { reopenReason });
  return res?.data || res;
};

/**
 * Helper to escape CSV cells (properly handles quotes, commas, newlines)
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export complete summary and product flow to a clean CSV file
 *
 * @param {Object} summaryData
 */
export const exportDailyClosingCsv = (summaryData) => {
  if (!summaryData) return;

  const dateLabel = summaryData.period === 'custom' && summaryData.startDate && summaryData.endDate
    ? `${summaryData.startDate}_to_${summaryData.endDate}`
    : summaryData.date || getPktTodayString();

  const lines = [];

  const addRow = (...cols) => {
    lines.push(cols.map(escapeCsvValue).join(','));
  };

  // 1. Report Header
  addRow('PURE MILK BAR - DAY END CLOSING REPORT');
  addRow('Report Period', summaryData.period || 'today');
  addRow('Date / Range', summaryData.date || dateLabel);
  addRow('Status', summaryData.status || 'OPEN');
  if (summaryData.closing?.closedBy) {
    addRow('Closed By', summaryData.closing.closedBy);
    addRow('Closed At', summaryData.closing.closedAt || '—');
  }
  addRow('');

  // 2. High-Level Financial & Stock KPIs
  addRow('--- EXECUTIVE SUMMARY ---');
  addRow('Total Available Milk (L)', summaryData.milk?.totalAvailable ?? 0);
  addRow('Total Milk Out / Sold (L)', summaryData.milk?.totalOut ?? 0);
  addRow('Expected Closing Milk in Tanks (L)', summaryData.milk?.expectedClosing ?? 0);
  if (summaryData.closing?.physicalMilk !== null && summaryData.closing?.physicalMilk !== undefined) {
    addRow('Actual Physical Milk Measured (L)', summaryData.closing.physicalMilk);
    addRow('Milk Variance (L)', summaryData.closing.milkVariance);
  }
  addRow('Gross Revenue (Rs.)', summaryData.profit?.grossRevenue ?? 0);
  addRow('Total Collections In (Rs.)', summaryData.collections?.totalCollected ?? 0);
  addRow('Total Daily Expenses (Rs.)', summaryData.expenses?.total ?? 0);
  addRow('Expected Cash in Drawer (Rs.)', summaryData.cash?.expectedInDrawer ?? 0);
  addRow('Estimated Day Profit (Rs.)', summaryData.profit?.estimatedProfit ?? 0);
  addRow('');

  // 3. Product-Wise Stock Flow ("Kal se kya bacha -> Aj kya bika -> Abhi kitna bacha")
  addRow('--- PRODUCT-WISE INVENTORY FLOW & PROFIT ---');
  addRow('Product Name', 'Unit', 'Kal Se Bacha (Opening)', 'Aj Bana / Aaya', 'Aj Bika (Sold)', 'Wastage', 'Abhi Bacha (Expected)', 'Revenue (Rs.)', 'Cost (Rs.)', 'Profit (Rs.)');

  if (Array.isArray(summaryData.products) && summaryData.products.length > 0) {
    summaryData.products.forEach((p) => {
      addRow(
        p.name,
        p.unit || 'PIECE',
        p.openingStock ?? 0,
        p.produced ?? 0,
        p.sold ?? 0,
        p.wasted ?? 0,
        p.expectedClosing ?? 0,
        p.revenue ?? 0,
        p.cost ?? 0,
        p.profit ?? 0
      );
    });
  } else {
    addRow('No product catalog entries recorded for this period');
  }
  addRow('');

  // 4. Detailed Milk Balance Breakdown
  addRow('--- RAW MILK MASS BALANCE RECONCILIATION ---');
  addRow('1. Opening Milk Stock in Tanks (L)', summaryData.milk?.openingStock ?? 0);
  addRow('2. Farm Milking Production (L)', summaryData.milk?.farmProduction ?? 0);
  addRow('3. Supplier Milk Intake Inflow (L)', summaryData.milk?.supplierInflow ?? 0);
  addRow('Total Available Milk (L)', summaryData.milk?.totalAvailable ?? 0);
  addRow('4. Counter Walk-in Milk Sales (L)', summaryData.milk?.counterSales ?? 0);
  addRow('5. Doorstep Delivery Milk Sales (L)', summaryData.milk?.doorstepSales ?? 0);
  addRow('6. Dahi / Product Processing Used (L)', summaryData.milk?.processingUsed ?? 0);
  addRow('7. Milk Spoilage & Wastage (L)', summaryData.milk?.wastage ?? 0);
  addRow('Total Milk Outflows (L)', summaryData.milk?.totalOut ?? 0);
  addRow('Expected Closing Milk in Tanks (L)', summaryData.milk?.expectedClosing ?? 0);
  addRow('');

  // 5. Money Collected Channels
  addRow('--- MONEY INFLOWS (COLLECTIONS) ---');
  addRow('Counter Cash Collections (Rs.)', summaryData.collections?.counterCash ?? 0);
  addRow('Counter Digital Online (Rs.)', summaryData.collections?.counterOnline ?? 0);
  addRow('Doorstep Delivery COD Cash (Rs.)', summaryData.collections?.codCash ?? 0);
  addRow('Customer Khata Recovered (Cash) (Rs.)', summaryData.collections?.khataRecoveredCash ?? 0);
  addRow('Customer Khata Recovered (Digital) (Rs.)', summaryData.collections?.khataRecoveredOnline ?? 0);
  addRow('Total Money Collected (Rs.)', summaryData.collections?.totalCollected ?? 0);
  addRow('Credit Given on Khata Today (Rs.)', summaryData.creditGiven ?? 0);
  addRow('');

  // 6. Operating Expenses Breakdown
  addRow('--- OPERATING EXPENSES (MONEY OUT) ---');
  if (Array.isArray(summaryData.expenses?.items)) {
    summaryData.expenses.items.forEach((exp) => {
      addRow(exp.label || exp.key, exp.amount ?? 0);
    });
  }
  addRow('Cash Expenses Paid from Drawer (Rs.)', summaryData.expenses?.cashTotal ?? 0);
  addRow('Digital / Non-Cash Expenses (Rs.)', summaryData.expenses?.nonCashTotal ?? 0);
  addRow('Total Operating Expenses (Rs.)', summaryData.expenses?.total ?? 0);
  addRow('');

  const csvContent = '\uFEFF' + lines.join('\r\n'); // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Daily_Closing_${dateLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
