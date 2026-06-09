import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { ShieldAlert, Plus, Search, ArrowLeft } from 'lucide-react';

const AdminOffensiveWordList = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_offensive_words', t);

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [user, setUser] = useState(null);

  const [newLabel, setNewLabel] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.type !== 'admin') {
        setToastMessage(t('errors.admin_access_required'));
        setToastType('error');
        setLoading(false);
        return;
      }
      setUser(currentUser);
      fetchWords(1, '');
    };
    checkAdmin();
  }, [t]);

  const fetchWords = async (page, searchQuery) => {
    try {
      setLoading(true);
      const response = await adminService.getOffensiveWords(page, pageSize, searchQuery);
      setWords(response.data || []);
      setTotalCount(response.pagination?.total ?? 0);
      setTotalPages(response.pagination?.pages ?? 0);
      setCurrentPage(page);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWords(1, search);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchWords(page, search);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    setCreating(true);
    try {
      await adminService.createOffensiveWord(label);
      setNewLabel('');
      setToastMessage(t('admin.offensive_word_created', 'Mot ajouté à la liste.'));
      setToastType('success');
      fetchWords(1, search);
    } catch (error) {
      const message = error.status === 409
        ? t('admin.offensive_word_already_exists', 'Ce mot est déjà présent dans la liste.')
        : (error.message || t('admin.offensive_word_create_error', "Erreur lors de l'ajout du mot."));
      setToastMessage(message);
      setToastType('error');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (word) => {
    setEditingId(word.id);
    setEditingLabel(word.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingLabel('');
  };

  const handleSaveEdit = async (id) => {
    const label = editingLabel.trim();
    if (!label) return;
    setSavingId(id);
    try {
      await adminService.updateOffensiveWord(id, { label });
      setToastMessage(t('admin.offensive_word_updated', 'Mot mis à jour.'));
      setToastType('success');
      cancelEdit();
      fetchWords(currentPage, search);
    } catch (error) {
      const message = error.status === 409
        ? t('admin.offensive_word_already_exists', 'Ce mot est déjà présent dans la liste.')
        : (error.message || t('admin.offensive_word_update_error', 'Erreur lors de la mise à jour du mot.'));
      setToastMessage(message);
      setToastType('error');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminService.deleteOffensiveWord(id);
      setToastMessage(t('admin.offensive_word_deleted', 'Mot supprimé.'));
      setToastType('success');
      const remaining = words.length - 1;
      const targetPage = remaining === 0 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchWords(targetPage, search);
    } catch (error) {
      setToastMessage(error.message || t('admin.offensive_word_delete_error', 'Erreur lors de la suppression du mot.'));
      setToastType('error');
    } finally {
      setDeletingId(null);
    }
  };

  const bg = isDarkTheme ? 'bg-[#0F172A]' : 'bg-white';
  const card = isDarkTheme ? 'bg-[#1E293B]' : 'bg-white';
  const textPrimary = isDarkTheme ? 'text-[#E2E8F0]' : 'text-[#111827]';
  const textSecondary = isDarkTheme ? 'text-[#94A3B8]' : 'text-[#6B7280]';
  const textMuted = isDarkTheme ? 'text-[#64748B]' : 'text-gray-400';
  const linkColor = isDarkTheme ? 'text-[#60A5FA]' : 'text-[#3B82F6]';
  const inputBorder = isDarkTheme
    ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] placeholder-[#64748B]'
    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400';
  const clearBtnColor = isDarkTheme ? 'text-[#64748B] hover:text-[#94A3B8]' : 'text-gray-400 hover:text-gray-600';
  const cancelBtnColor = isDarkTheme ? 'text-[#94A3B8] hover:text-[#E2E8F0]' : 'text-gray-500 hover:text-gray-700';

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
    <div className="max-w-5xl mx-auto px-4 pb-10">
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between py-6">
        <div>
          <h1 className={`text-[20px] ${linkColor} font-bold text-left`}>
            {t('admin.offensive_words_title', 'Filtrage des contenus offensants')}
          </h1>
          <p className={`mt-2 ${textSecondary} text-[14px] text-left`}>
            {t('admin.offensive_words_subtitle', "Gérez la liste des mots bloqués dans les avis et réponses.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className={`text-[11px] sm:text-[13px] ${linkColor} hover:underline font-medium flex items-center mt-1 sm:mt-0`}
        >
          <ArrowLeft size={14} className="sm:hidden mr-1" />
          <ArrowLeft size={18} className="hidden sm:inline-block mr-1" />
          {t('admin.back_to_dashboard', 'Tableau de bord')}
        </button>
      </div>

      {/* Add form */}
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          maxLength={255}
          placeholder={t('admin.offensive_word_add_placeholder', 'Ajouter un mot ou une expression...')}
          className={`flex-1 border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${inputBorder}`}
        />
        <button
          type="submit"
          disabled={creating || !newLabel.trim()}
          aria-label={t('admin.offensive_word_add_btn', 'Ajouter')}
          title={t('admin.offensive_word_add_btn', 'Ajouter')}
          className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      </form>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.offensive_words_search_placeholder', 'Rechercher un mot...')}
              className={`w-full border rounded-lg px-3 py-2 pr-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${inputBorder}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchWords(1, ''); }}
                aria-label={t('common.clear_search', 'Effacer la recherche')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${clearBtnColor}`}
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            aria-label={t('explorer.search_button', 'Rechercher')}
            title={t('explorer.search_button', 'Rechercher')}
            className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors flex items-center justify-center"
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* Count */}
      <p className={`text-[13px] ${textSecondary} mb-4 flex items-center gap-2`}>
        <ShieldAlert size={16} className={textMuted} />
        {totalCount} {t('admin.offensive_words_total', 'mot(s) référencé(s)')}
      </p>

      {/* Content */}
      {loading && words.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : words.length === 0 ? (
        <div className={`rounded-lg shadow-md p-12 text-center ${card}`}>
          <h3 className={`text-2xl font-semibold mb-4 ${textPrimary}`}>
            {t('admin.no_offensive_words_found', 'Aucun mot référencé')}
          </h3>
          <p className={`text-lg ${textSecondary}`}>
            {t('admin.no_offensive_words_found_hint', 'Ajoutez un mot ou une expression à filtrer ci-dessus.')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {words.map((w) => (
              <div
                key={w.id}
                className={`rounded-lg shadow-md border-l-4 border-[#3B82F6] overflow-hidden ${card} hover:shadow-lg transition-shadow duration-300 p-4 flex items-center gap-4`}
              >
                {editingId === w.id ? (
                  <>
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      maxLength={255}
                      className={`flex-1 border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${inputBorder}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(w.id)}
                      disabled={savingId === w.id || !editingLabel.trim()}
                      className="text-[13px] text-white bg-[#3B82F6] hover:bg-[#2563EB] px-3 py-1.5 rounded-lg font-medium disabled:opacity-50"
                    >
                      {t('admin.save_btn', 'Enregistrer')}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className={`text-[13px] ${cancelBtnColor} px-3 py-1.5`}
                    >
                      {t('admin.cancel_btn', 'Annuler')}
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 text-[14px] font-medium ${textPrimary} text-left`}>{w.label}</span>
                    <button
                      type="button"
                      onClick={() => startEdit(w)}
                      className={`text-[13px] ${linkColor} hover:underline font-medium`}
                    >
                      {t('admin.edit_btn', 'Modifier')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(w.id)}
                      disabled={deletingId === w.id}
                      className="text-[13px] text-red-500 hover:text-red-400 font-medium disabled:opacity-50"
                    >
                      {t('admin.delete_btn', 'Supprimer')}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isDarkTheme={isDarkTheme} />
        </>
      )}
    </div>
    </div>
  );
};

export default AdminOffensiveWordList;
