import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import adminService from '@/services/adminService';

const SettingsContext = createContext();

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
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSettings();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...(data.settings || data),
        }));
      }
    } catch (err) {
      console.warn('Using default settings, API fetch skipped:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettingsSection = async (section, partialData) => {
    setSettings((prev) => {
      const updatedSection = {
        ...(prev[section] || {}),
        ...(partialData || {}),
      };
      const newSettings = {
        ...prev,
        [section]: updatedSection,
      };

      // Save to backend API asynchronously
      adminService.updateSettings({ [section]: updatedSection }).catch((e) =>
        console.warn('Failed to persist settings via API:', e)
      );

      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettingsSection,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      settings: defaultSettings,
      updateSettingsSection: () => {},
    };
  }
  return context;
}

export default SettingsProvider;
