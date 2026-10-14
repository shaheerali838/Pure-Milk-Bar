/**
 * Date & Timezone Utilities for Pure Milk Bar ERP (Client)
 * Timezone: Asia/Karachi (PKT, UTC+5)
 */

export const PKT_TIMEZONE = 'Asia/Karachi';

/**
 * Returns YYYY-MM-DD exactly in local timezone.
 * Never uses toISOString() which shifts to UTC date.
 */
export const getLocalDate = (d = new Date()) => {
  try {
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat('en-CA', { timeZone: PKT_TIMEZONE }).format(new Date());
    }
    return new Intl.DateTimeFormat('en-CA', { timeZone: PKT_TIMEZONE }).format(dateObj);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: PKT_TIMEZONE }).format(new Date());
  }
};

/**
 * Get current business date string in PKT timezone (YYYY-MM-DD)
 * Never relies on toISOString() which returns UTC date.
 * @returns {string} e.g. "2026-09-28"
 */
export function getPktTodayString() {
  return getLocalDate();
}

/**
 * Returns today's ISO date string (YYYY-MM-DD) strictly using local timezone
 */
export function getTodayDateStr() {
  return getLocalDate();
}

/**
 * Get active business date string (YYYY-MM-DD) from persisted DailyClose state.
 * Falls back to current local calendar date if not set or invalid.
 * @returns {string} e.g. "2026-10-10"
 */
export function getActiveBusinessDate() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pure_milk_bar_daily_closing_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.activeDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.activeDate)) {
          const today = getLocalDate();
          if (parsed.activeDate < today && !parsed.isDayClosed) {
            return today;
          }
          return parsed.activeDate;
        }
      }
    } catch {
      // Ignore parse failure and fall back
    }
  }
  return getLocalDate();
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

/**
 * Parse any date string / timestamp into a clean YYYY-MM-DD representation
 * @param {string|Date|number} val
 * @returns {string}
 */
export function parseCleanDate(val) {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: PKT_TIMEZONE }).format(d);
    } catch {
      const year = d.getFullYear();
      if (year < 2020) return '';
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return '';
}

/**
 * Check if a date falls within the selected timeframe
 * @param {string|Date} dateVal
 * @param {'today' | 'week' | 'month' | 'all' | 'custom'} timeRange
 * @param {string} customStartDate (YYYY-MM-DD)
 * @param {string} customEndDate (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isMatchingTimeframe(dateVal, timeRange = 'today', customStartDate = '', customEndDate = '') {
  if (timeRange === 'all' || timeRange === 'all_time') return true;
  const clean = parseCleanDate(dateVal);
  if (!clean) return false;

  const todayStr = getPktTodayString();
  if (timeRange === 'today') {
    return clean === todayStr;
  }
  if (timeRange === 'week' || timeRange === 'this_week') {
    const weekStartStr = getPktDaysAgoString(7);
    return clean >= weekStartStr;
  }
  if (timeRange === 'month' || timeRange === 'this_month') {
    const monthStartStr = getPktDaysAgoString(30);
    return clean >= monthStartStr;
  }
  if (timeRange === 'custom') {
    if (customStartDate && clean < customStartDate) return false;
    if (customEndDate && clean > customEndDate) return false;
    return true;
  }
  return true;
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
  if (filterType === 'Today' || filterType === 'TODAY' || filterType === 'today') {
    return { startDate: today, endDate: today };
  }
  if (filterType === 'Weekly' || filterType === 'WEEKLY' || filterType === 'week' || filterType === 'this_week') {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(new Date().setDate(diff));
    const startStr = getPktDateString(monday);
    return { startDate: startStr, endDate: today };
  }
  if (filterType === 'Monthly' || filterType === 'MONTHLY' || filterType === 'month' || filterType === 'this_month') {
    const startStr = today.slice(0, 7) + '-01';
    return { startDate: startStr, endDate: today };
  }
  if (filterType === 'Custom Range' || filterType === 'CUSTOM' || filterType === 'custom') {
    return { startDate: customStart || today, endDate: customEnd || today };
  }
  return { startDate: '', endDate: '' };
}

const MONTH_NAME_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

/**
 * Normalizes any date value (ISO string, timestamp, Date instance, or human "Thu Oct 01") into YYYY-MM-DD
 */
export function normalizeDateStr(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.includes('T')) return trimmed.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const match = trimmed.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/i);
    if (match) {
      const month = MONTH_NAME_MAP[match[1].toLowerCase()];
      const day = match[2].padStart(2, '0');
      const year = new Date().getFullYear();
      return `${year}-${month}-${day}`;
    }
  }
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {}
  return String(raw).slice(0, 10);
}

/**
 * Standard date formatting for UI display (e.g., "12 Oct 2026" or "12/10/2026")
 * Uses native Intl.DateTimeFormat in PKT timezone.
 */
export function formatStandardDate(dateVal, format = 'friendly') {
  if (!dateVal) return '—';
  const dStr = normalizeDateStr(dateVal);
  if (!dStr) return '—';
  const parts = dStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (!isNaN(d.getTime())) {
      if (format === 'numeric') {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    }
  }
  return dStr;
}

/**
 * Standard date and time formatting for UI receipts and audit logs (e.g., "12 Oct 2026, 02:30 PM")
 */
export function formatStandardDateTime(dateVal) {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    const datePart = formatStandardDate(dateVal);
    return datePart !== '—' ? datePart : String(dateVal);
  }
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: PKT_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Universal array sorter by date descending (latest/newest first)
 */
export function sortByDateDesc(array = [], dateField = 'date') {
  if (!Array.isArray(array)) return [];
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField] || a.createdAt || a.timestamp || a.dateStr || 0);
    const dateB = new Date(b[dateField] || b.createdAt || b.timestamp || b.dateStr || 0);
    return dateB - dateA;
  });
}

/**
 * Ensures payload always has a valid date string (defaults to today in PKT)
 */
export function ensureValidDate(dateVal) {
  if (!dateVal) return getPktTodayString();
  const normalized = normalizeDateStr(dateVal);
  return normalized || getPktTodayString();
}

/**
 * Returns boundaries { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', label: string }
 * for a given dateFilter mode: 'today' | 'this_week' | 'this_month' | 'custom' | 'all'
 */
export function getDateRangeBoundaries(dateFilter = 'today', customStart = '', customEnd = '') {
  const todayStr = getPktTodayString();
  const now = new Date();
  const lowerFilter = String(dateFilter || '').toLowerCase();

  if (lowerFilter === 'today') {
    return {
      start: todayStr,
      end: todayStr,
      label: 'Today',
      detailedLabel: `Today (${todayStr})`,
    };
  }

  if (lowerFilter === 'this_week' || lowerFilter === 'week' || lowerFilter === 'weekly') {
    const day = now.getDay(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const start = format(monday);
    const end = format(sunday);
    return {
      start,
      end,
      label: 'This Week',
      detailedLabel: `This Week (${start} to ${end})`,
    };
  }

  if (lowerFilter === 'this_month' || lowerFilter === 'month' || lowerFilter === 'monthly') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const start = format(monthStart);
    const end = format(monthEnd);
    return {
      start,
      end,
      label: 'This Month',
      detailedLabel: `This Month (${start} to ${end})`,
    };
  }

  if (lowerFilter === 'custom' || lowerFilter === 'custom range') {
    let detailedLabel = 'Custom Range';
    if (customStart && customEnd) detailedLabel = `${customStart} to ${customEnd}`;
    else if (customStart) detailedLabel = `From ${customStart}`;
    else if (customEnd) detailedLabel = `Until ${customEnd}`;

    return {
      start: customStart || null,
      end: customEnd || null,
      label: 'Custom Range',
      detailedLabel,
    };
  }

  // 'all' / 'all time'
  return {
    start: null,
    end: null,
    label: 'All Time',
    detailedLabel: 'All Recorded Time',
  };
}

/**
 * Checks if a given raw date falls within the selected date filter range
 */
export function isDateInFilterRange(rawDate, dateFilter = 'today', customStart = '', customEnd = '') {
  const lowerFilter = String(dateFilter || '').toLowerCase();
  if (!lowerFilter || lowerFilter === 'all' || lowerFilter === 'all time' || lowerFilter === 'all_time') return true;
  if (!rawDate) return false;

  const dStr = normalizeDateStr(rawDate) || parseCleanDate(rawDate) || getPktDateString(rawDate);
  if (!dStr) return false;

  const { start, end } = getDateRangeBoundaries(dateFilter, customStart, customEnd);

  if (start && end) {
    return dStr >= start && dStr <= end;
  }
  if (start && !end) {
    return dStr >= start;
  }
  if (!start && end) {
    return dStr <= end;
  }
  return true;
}


