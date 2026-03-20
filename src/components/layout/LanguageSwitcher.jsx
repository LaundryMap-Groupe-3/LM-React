import { useTranslation } from '../../context/I18nContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-2 rounded transition-colors ${
          language === 'fr'
            ? 'bg-[#3B82F6] text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-2 rounded transition-colors ${
          language === 'en'
            ? 'bg-[#3B82F6] text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
