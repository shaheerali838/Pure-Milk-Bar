import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const STORAGE_KEY_SETTINGS = 'pure_milk_bar_global_settings';

const defaultSettings = {
  business: {
    businessName: '',
    ownerName: '',
    phone: '',
    address1: '',
    city: '',
    ntn: '',
    defaultCurrency: 'PKR',
    timeZone: 'Asia/Karachi',
  },
  productDefaults: {
    defaultUnit: 'liter',
    lowStockThreshold: 0,
    wastageAllowance: 0,
    varianceTolerance: '±1%',
  },
  pricing: {
    defaultCowMilkRate: 0,
    defaultBuffaloMilkRate: 0,
    maxCustomerCreditLimit: 0,
    paymentGracePeriod: 0,
  },
  notifs: {
    dailyClosingReminder: false,
    customerCreditLimitAlert: false,
    lowMilkStockWarning: false,
    deliveryDispatchNotification: false,
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            business: { ...defaultSettings.business, ...(parsed.business || {}) },
            productDefaults: { ...defaultSettings.productDefaults, ...(parsed.productDefaults || {}) },
            pricing: { ...defaultSettings.pricing, ...(parsed.pricing || {}) },
            notifs: { ...defaultSettings.notifs, ...(parsed.notifs || {}) },
          };
        }
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  }, [settings]);

  // Update a single section by merge-updating it
  const updateSettingsSection = (section, partialData) => {
    setSettings((prev) => {
      const updatedSection = {
        ...(prev[section] || {}),
        ...(partialData || {}),
      };
      const newSettings = {
        ...prev,
        [section]: updatedSection,
      };
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettingsSection,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      const parsed = saved ? JSON.parse(saved) : defaultSettings;
      return {
        settings: parsed || defaultSettings,
        updateSettingsSection: () => {},
      };
    } catch {
      return {
        settings: defaultSettings,
        updateSettingsSection: () => {},
      };
    }
  }
  return context;
}

export default SettingsProvider;
