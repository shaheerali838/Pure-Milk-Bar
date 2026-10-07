/**
 * Date & Timezone Utilities for Pure Milk Bar ERP (Client)
 * Timezone: Asia/Karachi (PKT, UTC+5)
 */

export const PKT_TIMEZONE = 'Asia/Karachi';

/**
 * Get current business date string in PKT timezone (YYYY-MM-DD)
 * Never relies on toISOString() which returns UTC date.
 * @returns {string} e.g. "2026-09-28"
 */
export function getPktTodayString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

/**
 * Get date string N days ago in PKT timezone
 * @param {number} days
 * @returns {string} e.g. "2026-09-21"
 */
export function getPktDaysAgoString(days = 7) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

/**
 * Format a timestamp / date into friendly local PKT display
 * @param {string|Date} dateVal
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatPktDisplay(dateVal, includeTime = false) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const options = {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-US', options).format(d);
}

export function getPktDateString(dateVal = new Date()) {
  if (!dateVal) return '';
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

/**
 * Get start and end date string (YYYY-MM-DD) for a given filter option
 */
export function getDateRangeFromFilter(filterType, customStart = '', customEnd = '') {
  const today = getPktTodayString();
  if (filterType === 'Today' || filterType === 'TODAY') {
    return { startDate: today, endDate: today };
  }
  if (filterType === 'Weekly' || filterType === 'WEEKLY') {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(new Date().setDate(diff));
    const startStr = getPktDateString(monday);
    return { startDate: startStr, endDate: today };
  }
  if (filterType === 'Monthly' || filterType === 'MONTHLY') {
    const startStr = today.slice(0, 7) + '-01';
    return { startDate: startStr, endDate: today };
  }
  if (filterType === 'Custom Range' || filterType === 'CUSTOM') {
    return { startDate: customStart || today, endDate: customEnd || today };
  }
  return { startDate: '', endDate: '' };
}

/**
 * Check whether a given date falls within the filter range
 */
export function isDateInFilterRange(dateVal, filterType = 'All Time', customStart = '', customEnd = '') {
  if (!filterType || filterType === 'All Time' || filterType === 'ALL') return true;
  if (!dateVal) return false;

  let dateStr = '';
  if (typeof dateVal === 'string' && dateVal.length >= 10) {
    const simpleMatch = dateVal.match(/^(\d{4}-\d{2}-\d{2})/);
    if (simpleMatch) {
      dateStr = simpleMatch[1];
    } else {
      dateStr = getPktDateString(dateVal);
    }
  } else {
    dateStr = getPktDateString(dateVal);
  }

  if (!dateStr) return false;

  const { startDate, endDate } = getDateRangeFromFilter(filterType, customStart, customEnd);
  if (startDate && dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;
  return true;
}

