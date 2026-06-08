import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';

const LanguageSwitcher = ({ iconsOnly = false, isDarkTheme = false }) => {
  const { language, changeLanguage: changeI18nLanguage } = useTranslation();
  const { changeLanguage: changePrefLanguage, isAuthenticated } = usePreferences();

  const handleChangeLanguage = async (lang) => {
    if (isAuthenticated) {
      try {
        await changePrefLanguage(lang);
      } catch {
        changeI18nLanguage(lang);
      }
    } else {
      changeI18nLanguage(lang);
    }
  };

  if (iconsOnly) {
    return (
      <div className={`inline-flex rounded-full p-1 ${isDarkTheme ? 'bg-[#1E293B]' : 'bg-gray-100'}`}>
        <button
          onClick={() => handleChangeLanguage('fr')}
          className={`px-4 h-[34px] flex items-center justify-center rounded-full transition-all text-[13px] font-semibold ${
            language === 'fr'
              ? 'bg-[#3B82F6] text-white'
              : isDarkTheme ? 'text-[#94A3B8] hover:text-[#E2E8F0]' : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Français"
        >
          FR
        </button>
        <button
          onClick={() => handleChangeLanguage('en')}
          className={`px-4 h-[34px] flex items-center justify-center rounded-full transition-all text-[13px] font-semibold ${
            language === 'en'
              ? 'bg-[#3B82F6] text-white'
              : isDarkTheme ? 'text-[#94A3B8] hover:text-[#E2E8F0]' : 'text-gray-500 hover:text-gray-700'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleChangeLanguage('fr')}
        className={`flex items-center gap-1 px-2 py-1 text-sm font-medium rounded transition-all ${
          language === 'fr'
            ? 'bg-[#3B82F6] text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => handleChangeLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 text-sm font-medium rounded transition-all ${
          language === 'en'
            ? 'bg-[#3B82F6] text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
