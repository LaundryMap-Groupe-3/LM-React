import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import adminService from '../../services/adminService';
import UserShieldIcon from '../../assets/images/icons/User-Shield-black.svg';

const AdminOffensiveWords = () => {
  const { t, changeLanguage } = useTranslation();
  usePageTitle('page_titles.admin_offensive_words', t);

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  // Load offensive words on mount
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOffensiveWords();
      setWords(data.words || []);
    } catch (error) {
      console.error('Failed to load offensive words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();

    if (!newWord.trim()) {
      setToastMessage(t('validation.offensive_word_required'));
      setToastType('error');
      return;
    }

    setIsAdding(true);
    try {
      const result = await adminService.createOffensiveWord(newWord.trim());
      setWords([...words, result].sort((a, b) => a.label.localeCompare(b.label)));
      setNewWord('');
      setFeedbackMessage(t('admin.offensive_word_added', 'Mot ajouté avec succès'));
      setFeedbackType('success');
    } catch (error) {
      console.error('Failed to add offensive word:', error);
      setFeedbackMessage(t('errors.save_error', 'Erreur lors de l\'ajout'));
      setFeedbackType('error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWord = async (id) => {
    if (!window.confirm(t('admin.confirm_delete_word', 'Êtes-vous sûr de vouloir supprimer ce mot ?'))) {
      return;
    }

    try {
      await adminService.deleteOffensiveWord(id);
      setWords(words.filter(w => w.id !== id));
    } catch (error) {
      console.error('Failed to delete offensive word:', error);
    }
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    changeLanguage(lang);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-[20px] text-left font-bold text-[#3B82F6] mb-4">
          {t('admin.offensive_words_title', 'Gestion des mots offensants')}
        </h1>
        
        <div className="mb-8 p-4 rounded-lg border-2 border-[#3B82F6] bg-[#3B82F6]/[.34] dark:bg-[#3B82F6]/[.20] flex items-start gap-4">
          <img src={UserShieldIcon} alt="Shield" className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-[14px] font-bold text-left mb-1">
              {t('admin.offensive_words_subtitle', 'Modération des commentaires')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-left font-light text-[12px]">
              {t('admin.offensive_words_full_description', 'Cette section est dédiée à l\'identification des termes proscrits, c\'est-à-dire ceux qui ne sont pas conformes à nos règles et directives.')}
            </p>
          </div>
        </div>

        {/* Language Buttons */}
        <div className="mb-6 flex gap-2 justify-center">
          <button
            onClick={() => handleLanguageChange('fr')}
            className={`px-4 py-2 rounded-lg font-regular transition-colors ${
              currentLanguage === 'fr'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-[#D1D5DB] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Français
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded-lg font-regular transition-colors ${
              currentLanguage === 'en'
                ? 'bg-[#3B82F6] text-white'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-[#D1D5DB] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            English
          </button>
        </div>

        {/* Add Word Form */}
        <div className="p-6 mb-6">
          <form onSubmit={handleAddWord} className="flex flex-row gap-3">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder={t('admin.word_placeholder', 'Ajouter un mot à la liste noir...')}
              className="flex-1 w-[174px] h-[40px] px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              disabled={isAdding}
              maxLength={255}
            />
            <button
              type="submit"
              disabled={isAdding || !newWord.trim()}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-[#0E9620]/[.20] text-white font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </form>
          {feedbackMessage ? (
            <div
              className={`mt-3 rounded-lg border px-4 py-3 text-sm font-medium ${
                feedbackType === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {feedbackMessage}
            </div>
          ) : null}
        </div>

        {/* Words List */}
        <div className="rounded-[8px] border-2 border-[#E5E7EB] p-6">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {t('common.loading')}
              </p>
            </div>
          ) : words.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                {t('admin.no_offensive_words', 'Aucun mot offensant pour le moment')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                {t('admin.words_list_title', 'Mots offensants')} ({words.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {words.map((word) => (
                  <div
                    key={word.id}
                    className="flex w-full items-center justify-between gap-4 px-4 py-2 border-2 border-[#D1D5DB] dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
                  >
                    <span className="min-w-0 text-[#9CA3AF] font-regular text-[14px] break-words">
                      {word.label}
                    </span>
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="shrink-0 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors text-xl leading-none"
                      title={t('common.delete', 'Supprimer')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminOffensiveWords;
