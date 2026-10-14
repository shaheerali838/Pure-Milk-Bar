import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getPktTodayString } from '@/utils/dateUtils';
import { broadcastSync, subscribeToSync } from '@/utils/syncBroadcaster';
import { getTodayClosingStatus, reopenTodayClosing } from '@/features/finance/services/dailyClosingService';

const STORAGE_KEY = 'pure_milk_bar_daily_closing_state';

// Action Types for Strict State Management
export const DAILY_CLOSE_ACTIONS = {
  CLOSE_DAY: 'CLOSE_DAY',
  OPEN_NEW_DAY: 'OPEN_NEW_DAY',
  REOPEN_DAY: 'REOPEN_DAY',
  UPDATE_CLOSING_STOCK: 'UPDATE_CLOSING_STOCK',
  SET_HISTORY: 'SET_HISTORY',
  RESET_STATE: 'RESET_STATE',
};

const initialInventoryStock = {
  farm: 0,
  farmCowMilk: 0,
  farmBuffaloMilk: 0,
  supplier: 0,
  supplierCowMilk: 0,
  supplierBuffaloMilk: 0,
  dahi: 0,
  farmDahi: 0,
  supplierDahi: 0,
};

const initialState = {
  isDayClosed: false,
  activeDate: getPktTodayString(),
  closedDate: null,
  closedAt: null,
  financials: {
    farmRawMilkRevenue: 0,
    supplierRevenue: 0,
    farmDahiRevenue: 0,
    todayExpenses: 0,
    totalRevenue: 0,
    netProfit: 0,
  },
  openingStock: { ...initialInventoryStock },
  closingStock: { ...initialInventoryStock },
  dailyCloseHistory: [],
  version: 0,
};

function dailyCloseReducer(state, action) {
  switch (action.type) {
    case DAILY_CLOSE_ACTIONS.CLOSE_DAY: {
      const {
        date = state.activeDate,
        totalRevenue = 0,
        totalExpenses = 0,
        netProfit = 0,
        farm = null,
        supplier = null,
        totalBusinessProfit = null,
        closingStock = {},
      } = action.payload || {};

      // Snapshot closing stock safely
      const finalizedClosingStock = {
        farm: Number(closingStock.farm ?? state.closingStock.farm ?? 0),
        farmCowMilk: Number(closingStock.farmCowMilk ?? state.closingStock.farmCowMilk ?? 0),
        farmBuffaloMilk: Number(closingStock.farmBuffaloMilk ?? state.closingStock.farmBuffaloMilk ?? 0),
        supplier: Number(closingStock.supplier ?? state.closingStock.supplier ?? 0),
        supplierCowMilk: Number(closingStock.supplierCowMilk ?? state.closingStock.supplierCowMilk ?? 0),
        supplierBuffaloMilk: Number(closingStock.supplierBuffaloMilk ?? state.closingStock.supplierBuffaloMilk ?? 0),
        dahi: Number(closingStock.dahi ?? state.closingStock.dahi ?? 0),
        farmDahi: Number(closingStock.farmDahi ?? state.closingStock.farmDahi ?? 0),
        supplierDahi: Number(closingStock.supplierDahi ?? state.closingStock.supplierDahi ?? 0),
      };

      // Requirement 7: Closing Summary Report with Farm, Supplier, & Total Business P&L
      const computedFinalProfit = Number(totalBusinessProfit ?? netProfit ?? 0);
      const summaryReport = {
        date: date || state.activeDate,
        totalRevenue: Number(totalRevenue || 0),
        totalExpenses: Number(totalExpenses || 0),
        netProfit: computedFinalProfit,
        farm: farm || {
          totalRevenue: Number(totalRevenue || 0),
          totalExpenses: Number(totalExpenses || 0),
          netProfit: computedFinalProfit,
        },
        supplier: supplier || {
          totalRevenue: 0,
          totalProcurementCost: 0,
          totalExpenses: 0,
          netProfit: 0,
        },
        totalBusinessProfit: computedFinalProfit,
        closingStock: {
          farm: finalizedClosingStock.farm,
          supplier: finalizedClosingStock.supplier,
          dahi: finalizedClosingStock.dahi,
          farmCowMilk: finalizedClosingStock.farmCowMilk,
          farmBuffaloMilk: finalizedClosingStock.farmBuffaloMilk,
          supplierCowMilk: finalizedClosingStock.supplierCowMilk,
          supplierBuffaloMilk: finalizedClosingStock.supplierBuffaloMilk,
          farmDahi: finalizedClosingStock.farmDahi,
          supplierDahi: finalizedClosingStock.supplierDahi,
        },
        closedAt: new Date().toISOString(),
      };

      // Filter out duplicate for same date if exists, then prepend
      const existingWithoutDate = (state.dailyCloseHistory || []).filter(
        (item) => item.date !== summaryReport.date
      );
      const updatedHistory = [summaryReport, ...existingWithoutDate];

      return {
        ...state,
        isDayClosed: true,
        closedDate: date || state.activeDate,
        closedAt: summaryReport.closedAt,
        closingStock: finalizedClosingStock,
        dailyCloseHistory: updatedHistory,
        financials: {
          ...state.financials,
          totalRevenue: Number(totalRevenue || 0),
          todayExpenses: Number(totalExpenses || 0),
          netProfit: Number(netProfit || 0),
        },
        version: state.version + 1,
      };
    }

    case DAILY_CLOSE_ACTIONS.OPEN_NEW_DAY: {
      const nextDate = action.payload?.date || action.payload?.nextDate;
      let computedNextDate = nextDate;
      if (!computedNextDate) {
        const todayPkt = getPktTodayString();
        if (todayPkt > state.activeDate) {
          computedNextDate = todayPkt;
        } else {
          try {
            const parts = String(state.activeDate || todayPkt).split('-').map(Number);
            const d = new Date(parts[0], parts[1] - 1, (parts[2] || 1) + 1);
            computedNextDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } catch (_) {
            computedNextDate = todayPkt;
          }
        }
      }

      // CRITICAL RULE (Requirement 2 & 4):
      // Financials (Set to Zero): Naye din ke liye farmRawMilkRevenue, supplierRevenue, farmDahiRevenue, aur todayExpenses strictly 0
      const freshFinancials = {
        farmRawMilkRevenue: 0,
        supplierRevenue: 0,
        farmDahiRevenue: 0,
        todayExpenses: 0,
        totalRevenue: 0,
        netProfit: 0,
      };

      // Inventory/Stock (Carry Forward - DO NOT RESET):
      // farmCowMilk, farmBuffaloMilk, supplierCowMilk, supplierBuffaloMilk, aur dahiStock ko ZERO ya FULL par reset NAHI karna.
      // Aaj ka 'Closing Stock' kal ka 'Opening Stock' banega.
      // If opening for a new date, closingStock carries forward as new day's openingStock.
      // If reopening / re-running open day on the same date, preserve existing openingStock.
      const isNewDate = computedNextDate !== state.activeDate;
      const carriedForwardOpeningStock = isNewDate
        ? {
            farm: Number(state.closingStock.farm ?? 0),
            farmCowMilk: Number(state.closingStock.farmCowMilk ?? 0),
            farmBuffaloMilk: Number(state.closingStock.farmBuffaloMilk ?? 0),
            supplier: Number(state.closingStock.supplier ?? 0),
            supplierCowMilk: Number(state.closingStock.supplierCowMilk ?? 0),
            supplierBuffaloMilk: Number(state.closingStock.supplierBuffaloMilk ?? 0),
            dahi: Number(state.closingStock.dahi ?? 0),
            farmDahi: Number(state.closingStock.farmDahi ?? 0),
            supplierDahi: Number(state.closingStock.supplierDahi ?? 0),
          }
        : { ...state.openingStock };

      return {
        ...state,
        isDayClosed: false,
        activeDate: computedNextDate,
        closedDate: null,
        closedAt: null,
        financials: freshFinancials,
        openingStock: carriedForwardOpeningStock,
        closingStock: { ...carriedForwardOpeningStock },
        version: state.version + 1,
      };
    }

    case DAILY_CLOSE_ACTIONS.REOPEN_DAY: {
      return {
        ...state,
        isDayClosed: false,
        version: state.version + 1,
      };
    }

    case DAILY_CLOSE_ACTIONS.UPDATE_CLOSING_STOCK: {
      const stock = action.payload || {};
      return {
        ...state,
        closingStock: {
          ...state.closingStock,
          ...stock,
        },
      };
    }

    case DAILY_CLOSE_ACTIONS.SET_HISTORY: {
      return {
        ...state,
        dailyCloseHistory: Array.isArray(action.payload) ? action.payload : state.dailyCloseHistory,
      };
    }

    case 'SET_STATE': {
      return {
        ...state,
        ...action.payload,
      };
    }

    case DAILY_CLOSE_ACTIONS.RESET_STATE: {
      return {
        ...initialState,
        activeDate: getPktTodayString(),
      };
    }

    default:
      return state;
  }
}

const loadSavedState = () => {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const todayStr = getPktTodayString();
      let activeDate = parsed.activeDate || todayStr;
      let isDayClosed = Boolean(parsed.isDayClosed);
      let openingStock = { ...initialInventoryStock, ...(parsed.openingStock || {}) };
      let closingStock = { ...initialInventoryStock, ...(parsed.closingStock || {}) };

      // Auto roll forward if saved date is older than today's local date
      if (activeDate < todayStr) {
        if (isDayClosed) {
          openingStock = { ...initialInventoryStock, ...closingStock };
          isDayClosed = false;
        }
        activeDate = todayStr;
      }

      return {
        ...initialState,
        ...parsed,
        activeDate,
        isDayClosed,
        openingStock,
        closingStock,
        dailyCloseHistory: Array.isArray(parsed.dailyCloseHistory) ? parsed.dailyCloseHistory : [],
      };
    }
  } catch (err) {
    console.warn('Failed to parse saved DailyClose state:', err);
  }
  return initialState;
};

const DailyCloseContext = createContext(null);

export function DailyCloseProvider({ children }) {
  const [state, dispatch] = useReducer(dailyCloseReducer, undefined, loadSavedState);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('DailyClose localStorage write warning:', e);
    }
  }, [state]);

  // Listen to cross-tab sync events
  useEffect(() => {
    const handleSync = () => {
      const saved = loadSavedState();
      if (saved && saved.version !== state.version) {
        dispatch({ type: 'SET_STATE', payload: saved });
      }
    };

    const unsubscribe = subscribeToSync((event) => {
      if (event === 'pure_milk_bar_daily_closing_updated') {
        handleSync();
      }
    });

    return () => unsubscribe();
  }, [state.version, state.isDayClosed]);

  // Server Truth Synchronization: Always check backend database status for today
  const syncWithServer = useCallback(async () => {
    try {
      const serverStatus = await getTodayClosingStatus();
      if (serverStatus && typeof serverStatus.isDayClosed === 'boolean') {
        if (serverStatus.isDayClosed && !state.isDayClosed) {
          dispatch({
            type: DAILY_CLOSE_ACTIONS.CLOSE_DAY,
            payload: {
              date: serverStatus.date || getPktTodayString(),
              closedAt: serverStatus.closedAt,
            },
          });
        } else if (!serverStatus.isDayClosed && state.isDayClosed) {
          dispatch({ type: DAILY_CLOSE_ACTIONS.REOPEN_DAY, payload: {} });
        }
      }
    } catch (err) {
      // ignore network errors
    }
  }, [state.isDayClosed]);

  useEffect(() => {
    syncWithServer();
    const handleFocus = () => syncWithServer();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(syncWithServer, 20000); // sync every 20s
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [syncWithServer]);

  // Action Dispatchers
  const closeDay = useCallback((payload = {}) => {
    dispatch({ type: DAILY_CLOSE_ACTIONS.CLOSE_DAY, payload });
    broadcastSync('pure_milk_bar_daily_closing_updated', { isDayClosed: true, ...payload });
  }, []);

  const openNewDay = useCallback((nextDate) => {
    const payload = typeof nextDate === 'string' ? { nextDate } : (nextDate || {});
    dispatch({ type: DAILY_CLOSE_ACTIONS.OPEN_NEW_DAY, payload });
    broadcastSync('pure_milk_bar_daily_closing_updated', { isDayClosed: false, ...payload });
  }, []);

  const reopenDay = useCallback(async (reason = 'Website operations reactivated by user') => {
    try {
      await reopenTodayClosing(reason);
    } catch (err) {
      console.warn('Backend reopen error (continuing with client state):', err);
    }
    dispatch({ type: DAILY_CLOSE_ACTIONS.REOPEN_DAY, payload: { reason } });
    broadcastSync('pure_milk_bar_daily_closing_updated', { isDayClosed: false, reason });
  }, []);

  const updateClosingStock = useCallback((stock) => {
    dispatch({ type: DAILY_CLOSE_ACTIONS.UPDATE_CLOSING_STOCK, payload: stock });
  }, []);

  const setDailyCloseHistory = useCallback((history) => {
    dispatch({ type: DAILY_CLOSE_ACTIONS.SET_HISTORY, payload: history });
  }, []);

  const contextValue = {
    isDayClosed: state.isDayClosed,
    activeDate: state.activeDate,
    closedDate: state.closedDate,
    closedAt: state.closedAt,
    openingStock: state.openingStock,
    closingStock: state.closingStock,
    dailyCloseHistory: state.dailyCloseHistory,
    financials: state.financials,
    version: state.version,
    closeDay,
    openNewDay,
    reopenDay,
    updateClosingStock,
    setDailyCloseHistory,
    dispatch,
  };

  return (
    <DailyCloseContext.Provider value={contextValue}>
      {children}
    </DailyCloseContext.Provider>
  );
}

export function useDailyClose() {
  const context = useContext(DailyCloseContext);
  if (!context) {
    return {
      isDayClosed: false,
      activeDate: getPktTodayString(),
      closedDate: null,
      closedAt: null,
      openingStock: initialInventoryStock,
      closingStock: initialInventoryStock,
      dailyCloseHistory: [],
      financials: {
        farmRawMilkRevenue: 0,
        supplierRevenue: 0,
        farmDahiRevenue: 0,
        todayExpenses: 0,
        totalRevenue: 0,
        netProfit: 0,
      },
      version: 0,
      closeDay: () => {},
      openNewDay: () => {},
      reopenDay: () => {},
      updateClosingStock: () => {},
      setDailyCloseHistory: () => {},
      dispatch: () => {},
    };
  }
  return context;
}

export default DailyCloseContext;
