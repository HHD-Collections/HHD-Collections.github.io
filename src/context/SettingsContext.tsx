import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { StoreSettings } from '../types';
import {
  DEFAULT_STORE_SETTINGS,
  getLocalStoreSettings,
  getStoreSettings,
  saveStoreSettings,
  SaveSettingsResult,
} from '../services/settingsService';

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  updateSettings: (partial: Partial<StoreSettings>) => Promise<SaveSettingsResult>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => getLocalStoreSettings());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      const remote = await getStoreSettings();
      setSettings(remote);
    } catch (err) {
      console.warn('Error loading settings in SettingsProvider:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for custom settings update events (within same window)
    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StoreSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    // Listen for cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hhd_store_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch (_) {}
      }
    };

    window.addEventListener('hhd:settings-updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('hhd:settings-updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchSettings]);

  const updateSettings = async (partial: Partial<StoreSettings>): Promise<SaveSettingsResult> => {
    const result = await saveStoreSettings(partial);
    setSettings(result.settings);
    return result;
  };

  const reloadSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        reloadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
