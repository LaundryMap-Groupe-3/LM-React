import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import usePageTitle from '../../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import authService from '../../services/authService';
import adminService from '../../services/adminService.js';
import Toast from '../common/Toast.jsx';

const Profile = ({ isDarkTheme, isLoggedIn, toggleDarkTheme, onLogout }) => {
  const navigate = useNavigate();
  const { t, changeLanguage: changeI18nLanguage } = useTranslation();
  const { preferences, languages, isDarkTheme: preferenceDarkTheme, updatePreferences } = usePreferences();
  usePageTitle('page_titles.profile', t);

  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    language: null,
    theme: null,
    notifications: null,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesChanged, setPreferencesChanged] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // Auto-save preferences when they change
  useEffect(() => {
    if (!preferencesChanged || !preferences) {
      return;
    }

    const timer = setTimeout(() => {
      handleSavePreferencesAuto();
    }, 500); // Debounce 500ms to avoid too many requests

    return () => clearTimeout(timer);
  }, [preferencesChanged, preferencesForm]);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (isLoggedIn) {
          const currentUser = await authService.getCurrentUser();
          const userProfile = await adminService.getProfile();
          setProfile({
            ...currentUser,
            ...userProfile,
          });
        }
      } catch (error) {
        setToastMessage(t('errors.profile_load_error'));
        setToastType('error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoggedIn, t]);

  // Initialize preferences form when preferences load
  useEffect(() => {
    if (preferences) {
      const newForm = {
        language: preferences.language,
        theme: preferences.theme,
        notifications: preferences.notifications,
      };
      setPreferencesForm(newForm);
      setPreferencesChanged(false);
    }
  }, [preferences]);

  const handlePreferenceChange = (field, value) => {
    const newForm = { ...preferencesForm, [field]: value };
    setPreferencesForm(newForm);

    // Apply language/theme immediately in the UI, autosave persists it shortly after.
    if (field === 'language') {
      changeI18nLanguage(value);
    }

    if (field === 'theme' && typeof toggleDarkTheme === 'function') {
      const shouldBeDark = value === 'dark';
      if (shouldBeDark !== effectiveDarkTheme) {
        toggleDarkTheme();
      }
    }
    
    // Check if changed from original preferences
    const hasChanged = 
      newForm.language !== preferences?.language ||
      newForm.theme !== preferences?.theme ||
      newForm.notifications !== preferences?.notifications;
    
    setPreferencesChanged(hasChanged);
  };

  const handleSavePreferencesAuto = async () => {
    // Check if preferences are loaded
    if (!preferences) {
      return;
    }

    setIsSavingPreferences(true);
    try {
      // Collect all changes
      const languageChanged = preferencesForm.language !== preferences.language;
      const themeChanged = preferencesForm.theme !== preferences.theme;
      const notificationsChanged = preferencesForm.notifications !== preferences.notifications;

      if (!languageChanged && !themeChanged && !notificationsChanged) {
        setIsSavingPreferences(false);
        return;
      }

      // Build the updates object
      const updates = {};
      if (languageChanged) {
        updates.language = preferencesForm.language;
      }
      if (themeChanged) {
        updates.theme = preferencesForm.theme;
      }
      if (notificationsChanged) {
        updates.notifications = preferencesForm.notifications;
      }

      // Use the context's updatePreferences method which handles state and localStorage correctly
      await updatePreferences(updates);
      
      // Update timestamp
      setLastSaveTime(new Date());
      setPreferencesChanged(false);
    } catch (error) {
      console.error('Error auto-saving preferences:', error);
      // Don't show error toast for auto-save, just log it
    } finally {
      setIsSavingPreferences(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <p className={effectiveDarkTheme ? 'text-gray-100' : 'text-gray-900'}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-8 lg:p-12 ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')}
      />

      <div className="flex flex-col space-y-6 sm:space-y-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        
        {/* Personal Information Section */}
        <div className={`rounded-lg border p-4 sm:p-6 md:p-8 w-full flex flex-col items-start ${
          effectiveDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <h1 className="text-left text-base sm:text-lg md:text-xl text-[#3B82F6]">
              {t('profile.personal_info')}
            </h1>
          </div>
          <div className="flex flex-col items-start mt-4">
            <div className="mt-4">
              <p className={`text-sm text-left ${
                effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'
              }`}>{t('auth.email')}</p>
              <p className={`font-medium text-left text-[14px] ${
                effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'
              }`}>
                {profile?.email || '-'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Preferences Section */}
        <div className={`rounded-lg border p-4 sm:p-6 md:p-8 w-full flex flex-col items-start justify-center ${
          effectiveDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <h1 className="text-left text-base sm:text-lg md:text-xl text-[#3B82F6]">
            {t('profile.preferences')}
          </h1>
          <div className="flex flex-col items-start mt-4 space-y-6 w-full">
            {/* Language Selector */}
            <div className="flex items-start justify-between w-full gap-[26px]">
              <div className="flex flex-col flex-1">
                <h2 className={`text-sm font-medium text-left mb-2 ${
                  effectiveDarkTheme ? 'text-gray-300' : 'text-[#374151]'
                }`}>{t('profile.language')}</h2>
                <p className={`font-regular text-left text-xs ${
                  effectiveDarkTheme ? 'text-[#ffffff]' : 'text-[#374151]'
                }`}>{t('profile.choose_language')}</p>
              </div>
              <div className="relative shrink-0">
                <select 
                  value={preferencesForm.language || ''}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  disabled={!languages.length}
                  className={`w-[140px] sm:w-[140px] h-9 text-center text-xs sm:text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    effectiveDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-[#111827]'
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="flex justify-between items-center w-full gap-[83px]">
              <div className="flex flex-col flex-1 pr-4">
                <h2 className={`text-sm font-medium text-left mb-2 ${
                  effectiveDarkTheme ? 'text-gray-300' : 'text-[#374151]'
                }`}>
                  {t('profile.theme')} {preferencesForm.theme === 'dark' ? t('profile.dark_theme') : t('profile.light_theme')}
                </h2>
                <p className={`text-xs text-left ${
                  effectiveDarkTheme ? 'text-[#ffffff]' : 'text-[#374151]'
                }`}>
                  {preferencesForm.theme === 'dark' ? t('profile.theme_dark_desc') : t('profile.theme_light_desc')}
                </p>
              </div>
              <div className="flex items-center shrink-0 ml-auto">
                <button
                  onClick={() => handlePreferenceChange('theme', preferencesForm.theme === 'dark' ? 'light' : 'dark')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    preferencesForm.theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      preferencesForm.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* Notifications Toggle */}
            <div className="flex justify-between items-center w-full gap-[79px]">
              <div className="flex flex-col flex-1 pr-4">
                <h2 className={`text-sm font-medium text-left mb-2 ${
                  effectiveDarkTheme ? 'text-gray-300' : 'text-[#374151]'
                }`}>{t('profile.notifications')}</h2>
                <p className={`text-xs text-left ${
                  effectiveDarkTheme ? 'text-[#ffffff]' : 'text-[#374151]'
                }`}>{t('profile.notifications_desc')}</p>
              </div>
              <div className="flex items-center shrink-0 ml-auto">
                <button
                  onClick={() => handlePreferenceChange('notifications', !preferencesForm.notifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    preferencesForm.notifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      preferencesForm.notifications ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </button>
              </div>
            </div>

            {/* Auto-save Status Indicator */}
            <div className="w-full flex items-center justify-end gap-2 mt-2 h-6">
              {isSavingPreferences && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`text-xs ${effectiveDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('common.saving')}
                  </span>
                </div>
              )}
              {!isSavingPreferences && lastSaveTime && (
                <span className={`text-xs ${effectiveDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
                  ✓ {t('common.saved')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;