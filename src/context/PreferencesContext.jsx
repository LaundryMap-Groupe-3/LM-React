import { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';

const PreferencesContext = createContext();

// Detect browser preferences
const detectBrowserPreferences = () => {
  // Detect language from navigator
  const browserLanguage = navigator.language.split('-')[0];
  const supportedLanguages = ['fr', 'en'];
  const language = supportedLanguages.includes(browserLanguage) ? browserLanguage : 'fr';

  // Detect dark mode preference from media query
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';

  return { language, theme };
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load languages first - this should be public
        try {
          const langs = await userService.getLanguages();
          setLanguages(langs || []);
        } catch (err) {
          console.warn('Failed to load languages:', err);
        }

        // Load user preferences - this requires authentication
        try {
          const prefs = await userService.getPreferences();
          if (prefs) {
            setPreferences(prefs);
            setIsDarkTheme(prefs.theme === 'dark');
            localStorage.setItem('language', prefs.language);
            localStorage.setItem('theme', prefs.theme);
            setIsAuthenticated(true);
          }
        } catch (err) {
          // User is not authenticated yet, use browser preferences
          if (err.status === 401) {
            const browserPrefs = detectBrowserPreferences();
            const defaultPreferences = {
              language: localStorage.getItem('language') || browserPrefs.language,
              theme: localStorage.getItem('theme') || browserPrefs.theme,
              notifications: true
            };
            setPreferences(defaultPreferences);
            setIsDarkTheme(defaultPreferences.theme === 'dark');
            localStorage.setItem('language', defaultPreferences.language);
            localStorage.setItem('theme', defaultPreferences.theme);
            setIsAuthenticated(false);
          } else {
            console.warn('Failed to load user preferences:', err);
          }
        }
      } catch (error) {
        console.error('Failed to load preferences data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updatePreferences = async (newPreferences) => {
    try {
      const updated = await userService.updatePreferences(newPreferences);
      if (updated?.preferences) {
        // Update local state with complete preferences from server
        setPreferences(updated.preferences);
        
        // Update theme if changed
        if (newPreferences.theme) {
          setIsDarkTheme(newPreferences.theme === 'dark');
          localStorage.setItem('theme', newPreferences.theme);
        }
        
        // Update language in localStorage if changed
        if (newPreferences.language) {
          localStorage.setItem('language', newPreferences.language);
          // Notify I18nContext about language change
          window.dispatchEvent(new CustomEvent('language-changed', {
            detail: { language: newPreferences.language }
          }));
        }
        
        return updated.preferences;
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const toggleTheme = async () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    try {
      await updatePreferences({ theme: newTheme });
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      await updatePreferences({ language: languageCode });
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    }
  };

  const toggleNotifications = async () => {
    if (preferences) {
      try {
        await updatePreferences({ notifications: !preferences.notifications });
      } catch (error) {
        console.error('Failed to toggle notifications:', error);
      }
    }
  };

  // Reload user preferences after login
  const reloadUserPreferences = async () => {
    try {
      const prefs = await userService.getPreferences();
      if (prefs) {
        const previousLanguage = localStorage.getItem('language');
        
        setPreferences(prefs);
        setIsDarkTheme(prefs.theme === 'dark');
        localStorage.setItem('language', prefs.language);
        localStorage.setItem('theme', prefs.theme);
        setIsAuthenticated(true);
        
        // Dispatch language change event if language is different
        if (previousLanguage !== prefs.language) {
          window.dispatchEvent(new CustomEvent('language-changed', {
            detail: { language: prefs.language }
          }));
        }
      }
    } catch (error) {
      console.error('Failed to reload user preferences:', error);
    }
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      languages,
      loading,
      isDarkTheme,
      updatePreferences,
      toggleTheme,
      changeLanguage,
      toggleNotifications,
      reloadUserPreferences,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences doit être utilisé dans un PreferencesProvider');
  }
  return context;
};
