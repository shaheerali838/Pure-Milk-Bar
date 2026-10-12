import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getLocalDate, normalizeDateStr } from '@/utils/dateUtils';

export { getLocalDate };

/**
 * Returns today's date string (YYYY-MM-DD) strictly in local timezone
 */
export const getTodayDateStr = () => {
  return getLocalDate();
};

/**
 * Normalizes any date value (ISO timestamp, Date object, or string) to local YYYY-MM-DD
 */
export const normalizeDate = (raw) => {
  return normalizeDateStr(raw) || getLocalDate();
};

/**
 * Formats YYYY-MM-DD into a human-readable string like "12 Oct 2026"
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = String(dateStr).slice(0, 10).split('-').map(Number);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch (_) {}
  return String(dateStr);
};

const GlobalDateContext = createContext(null);

export function GlobalDateProvider({ children }) {
  // STRICT RULE: Always initialize directly to today's local date
  const [globalDate, setGlobalDateState] = useState(() => getLocalDate());

  const setGlobalDate = useCallback((newDate) => {
    const normalized = normalizeDate(newDate) || getLocalDate();
    setGlobalDateState(normalized);
    try {
      window.dispatchEvent(new CustomEvent('pure_milk_bar_global_date_changed', { detail: normalized }));
    } catch (_) {}
  }, []);

  const setToday = useCallback(() => {
    setGlobalDate(getLocalDate());
  }, [setGlobalDate]);

  const isToday = useMemo(() => {
    return globalDate === getLocalDate();
  }, [globalDate]);

  const formattedDate = useMemo(() => {
    return formatDisplayDate(globalDate);
  }, [globalDate]);

  const value = useMemo(
    () => ({
      globalDate,
      selectedDate: globalDate,
      setGlobalDate,
      setSelectedDate: setGlobalDate,
      setToday,
      isToday,
      formattedDate,
      getTodayDateStr,
      normalizeDate,
      formatDisplayDate,
    }),
    [globalDate, setGlobalDate, setToday, isToday, formattedDate]
  );

  return (
    <GlobalDateContext.Provider value={value}>
      {children}
    </GlobalDateContext.Provider>
  );
}

export function useGlobalDate() {
  const context = useContext(GlobalDateContext);
  if (!context) {
    const today = getLocalDate();
    return {
      globalDate: today,
      selectedDate: today,
      setGlobalDate: () => {},
      setSelectedDate: () => {},
      setToday: () => {},
      isToday: true,
      formattedDate: formatDisplayDate(today),
      getTodayDateStr,
      normalizeDate,
      formatDisplayDate,
    };
  }
  return context;
}

export default GlobalDateContext;
