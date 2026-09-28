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
