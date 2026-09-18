/**
 * Utility to clear and reset all LocalStorage data across all modules in Pure Milk Bar.
 */

export const ALL_STORAGE_KEYS = [
  'pure_milk_bar_suppliers_v2',
  'pure_milk_bar_suppliers_v1',
  'pure_milk_bar_animals_register_v4',
  'pure_milk_bar_expenses',
  'pure_milk_bar_customers',
  'pure_milk_bar_deliveries',
  'pure_milk_bar_rider_salaries',
  'pure_milk_bar_fuel_logs',
  'pure_milk_bar_staff',
  'pure_milk_bar_delivery_staff',
  'pure_milk_bar_products',
  'pure_milk_bar_cart',
  'pure_milk_bar_sales',
  'pure_milk_bar_ledgers',
  'pure_milk_bar_milking_saved_entries',
];

export function clearAllLocalStorage(shouldReload = false) {
  try {
    ALL_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.clear();
    console.log('All local storage data cleared across all files.');

    if (shouldReload && typeof window !== 'undefined') {
      window.location.reload();
    }
    return true;
  } catch (err) {
    console.error('Error clearing local storage:', err);
    return false;
  }
}

// Auto-run one-time reset so user's existing browser data clears immediately
const WIPE_FLAG = 'pure_milk_bar_initial_wipe_2026_done';
if (typeof window !== 'undefined') {
  window.clearAllLocalStorage = clearAllLocalStorage;

  try {
    if (!localStorage.getItem(WIPE_FLAG)) {
      clearAllLocalStorage(false);
      localStorage.setItem(WIPE_FLAG, 'true');
      console.log('Initial local storage reset performed successfully.');
    }
  } catch (e) {
    console.error('Auto-wipe check failed:', e);
  }
}

export default clearAllLocalStorage;
