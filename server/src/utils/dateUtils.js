/**
 * Date & Timezone Utilities for Pure Milk Bar ERP
 * Timezone: Asia/Karachi (PKT, UTC+5)
 */

export const PKT_TIMEZONE = 'Asia/Karachi';
export const PKT_OFFSET_HOURS = 5;

/**
 * Get current date string in PKT timezone (YYYY-MM-DD)
 * @returns {string} e.g. "2026-09-28"
 */
export function getPktTodayString() {
  const now = new Date();
  // Format in Asia/Karachi locale
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // en-CA gives YYYY-MM-DD
}

/**
 * Parse a business date string (YYYY-MM-DD) or Date object and return
 * exact start (00:00:00.000 PKT) and end (23:59:59.999 PKT) Date objects in UTC.
 * 
 * In PKT (UTC+5):
 * 2026-09-28 00:00:00.000 PKT = 2026-09-27 19:00:00.000 UTC
 * 2026-09-28 23:59:59.999 PKT = 2026-09-28 18:59:59.999 UTC
 * 
 * @param {string|Date} dateInput YYYY-MM-DD or Date
 * @returns {{ startOfDay: Date, endOfDay: Date, dateStr: string }}
 */
export function getPktDayRange(dateInput) {
  let dateStr;
  if (!dateInput) {
    dateStr = getPktTodayString();
  } else if (typeof dateInput === 'string') {
    // If input is already YYYY-MM-DD
    const match = dateInput.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) {
      dateStr = match[0];
    } else {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) {
        dateStr = getPktTodayString();
      } else {
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: PKT_TIMEZONE,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        dateStr = formatter.format(d);
      }
    }
  } else if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) {
      dateStr = getPktTodayString();
    } else {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: PKT_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      dateStr = formatter.format(dateInput);
    }
  } else {
    dateStr = getPktTodayString();
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  // Construct start of day in UTC (which corresponds to 00:00:00 in UTC+5)
  // UTC time = PKT time - 5 hours
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0 - PKT_OFFSET_HOURS, 0, 0, 0));
  // End of day: 23:59:59.999 in PKT = 18:59:59.999 in UTC
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23 - PKT_OFFSET_HOURS, 59, 59, 999));

  return {
    startOfDay,
    endOfDay,
    dateStr,
  };
}

/**
 * Get date range for multiple days in PKT
 * @param {string} startDateStr YYYY-MM-DD
 * @param {string} endDateStr YYYY-MM-DD
 * @returns {{ startOfRange: Date, endOfRange: Date, startDateStr: string, endDateStr: string }}
 */
export function getPktDateRange(startDateStr, endDateStr) {
  const { startOfDay: startOfRange, dateStr: validStartStr } = getPktDayRange(startDateStr);
  const { endOfDay: endOfRange, dateStr: validEndStr } = getPktDayRange(endDateStr || startDateStr);
  return {
    startOfRange,
    endOfRange,
    startDateStr: validStartStr,
    endDateStr: validEndStr,
  };
}
