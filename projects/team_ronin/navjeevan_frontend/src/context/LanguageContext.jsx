import { createContext, useContext, useMemo, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'navjeevan_language';

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    vaccinationHistory: 'Vaccination History',
    programs: 'Programs',
    notifications: 'Notifications',
    profile: 'Profile',
    aiAssistant: 'AI Assistant',
    citizenPortal: 'Citizen Portal',
    healthcareStaffDashboard: 'Healthcare Staff Dashboard',
    liveOperationalMode: 'Live operational mode',
    logout: 'Logout',
  },
  ne: {
    dashboard: 'ड्यासबोर्ड',
    vaccinationHistory: 'खोप इतिहास',
    programs: 'कार्यक्रमहरू',
    notifications: 'सूचनाहरू',
    profile: 'प्रोफाइल',
    aiAssistant: 'एआई सहायक',
    citizenPortal: 'नागरिक पोर्टल',
    healthcareStaffDashboard: 'स्वास्थ्यकर्मी ड्यासबोर्ड',
    liveOperationalMode: 'लाइभ सञ्चालन मोड',
    logout: 'लगआउट',
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback = '') => fallback,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'ne' ? 'ne' : 'en';
  });

  const setLanguage = (value) => {
    const next = value === 'ne' ? 'ne' : 'en';
    setLanguageState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, fallback = '') => TRANSLATIONS[language]?.[key] || fallback || key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
