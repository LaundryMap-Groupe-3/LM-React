import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';

const LanguageSwitcher = ({ iconsOnly = false }) => {
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
      <div className="flex gap-2">
        <button
          onClick={() => handleChangeLanguage('fr')}
          className={`w-[31px] h-[31px] flex items-center justify-center rounded transition-all text-lg ${
            language === 'fr'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title="Français"
        >
          <span className="leading-none">🇫🇷</span>
        </button>
        <button
          onClick={() => handleChangeLanguage('en')}
          className={`w-[31px] h-[31px] flex items-center justify-center rounded transition-all text-lg ${
            language === 'en'
              ? 'bg-[#3B82F6] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title="English"
        >
          <span className="leading-none">🇬🇧</span>
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
        <span>🇫🇷</span>
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
        <span>🇬🇧</span>
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
