import { useTranslation } from '../../context/I18nContext';

const LanguageSwitcher = ({ iconsOnly = false }) => {
  const { language, changeLanguage } = useTranslation();

  if (iconsOnly) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => changeLanguage('fr')}
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
          onClick={() => changeLanguage('en')}
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
        onClick={() => changeLanguage('fr')}
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
        onClick={() => changeLanguage('en')}
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
