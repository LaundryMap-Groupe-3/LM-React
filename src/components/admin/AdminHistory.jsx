import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { History, ArrowLeft } from 'lucide-react';

const ACTION_COLORS = {
  approve: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-700',
  create: 'bg-blue-100 text-blue-700',
  update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-gray-100 text-gray-700',
  suspend: 'bg-orange-100 text-orange-700',
  block_content: 'bg-red-100 text-red-700',
};

const ACTION_COLORS_DARK = {
  approve: 'bg-green-900/50 text-green-300',
  reject: 'bg-red-900/50 text-red-300',
  create: 'bg-blue-900/50 text-blue-300',
  update: 'bg-yellow-900/50 text-yellow-300',
  delete: 'bg-gray-700 text-gray-300',
  suspend: 'bg-orange-900/50 text-orange-300',
  block_content: 'bg-red-900/50 text-red-300',
};

const TYPE_COLORS = {
  professional: 'bg-purple-100 text-purple-700',
  laundry: 'bg-cyan-100 text-cyan-700',
  user: 'bg-orange-100 text-orange-700',
};

const TYPE_COLORS_DARK = {
  professional: 'bg-purple-900/50 text-purple-300',
  laundry: 'bg-cyan-900/50 text-cyan-300',
  user: 'bg-orange-900/50 text-orange-300',
};

const AdminHistory = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkTheme: preferenceDarkTheme } = usePreferences();
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;
  usePageTitle('page_titles.admin_history', t);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activeType, setActiveType] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [user, setUser] = useState(null);

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
      fetchHistory(1, 'all');
    };
    checkAdmin();
  }, [t]);

  const fetchHistory = async (page, type) => {
    try {
      setLoading(true);
      const response = await adminService.getHistory(page, pageSize, type);
      setEntries(response.data || []);
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

  const handleTypeChange = (type) => {
    setActiveType(type);
    fetchHistory(1, type);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchHistory(page, activeType);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const TABS = [
    { key: 'all', label: t('admin.history_tab_all', 'Tous') },
    { key: 'professionals', label: t('admin.history_tab_professionals', 'Professionnels') },
    { key: 'laundries', label: t('admin.history_tab_laundries', 'Laveries') },
    { key: 'users', label: t('admin.history_tab_users', 'Utilisateurs') },
  ];

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  const typeColors = effectiveDarkTheme ? TYPE_COLORS_DARK : TYPE_COLORS;
  const actionColors = effectiveDarkTheme ? ACTION_COLORS_DARK : ACTION_COLORS;

  return (
    <div className={`min-h-screen ${effectiveDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between py-6">
        <div>
          <h1 className={`text-[20px] font-bold text-left ${effectiveDarkTheme ? 'text-blue-300' : 'text-[#3B82F6]'}`}>
            {t('admin.history_title', "Historique des actions")}
          </h1>
          <p className={`mt-2 text-[14px] text-left ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#9CA3AF]'}`}>
            {t('admin.history_subtitle', "Consultez toutes les actions effectuées par les administrateurs.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className={`text-[11px] sm:text-[13px] hover:underline font-medium flex items-center mt-1 sm:mt-0 ${effectiveDarkTheme ? 'text-blue-300' : 'text-[#3B82F6]'}`}
        >
          <ArrowLeft size={14} className="sm:hidden mr-1" />
          <ArrowLeft size={18} className="hidden sm:inline-block mr-1" />
          {t('admin.back_to_dashboard', 'Tableau de bord')}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-6 border-b ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTypeChange(tab.key)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
              activeType === tab.key
                ? (effectiveDarkTheme ? 'border-blue-300 text-blue-300' : 'border-[#3B82F6] text-[#3B82F6]')
                : (effectiveDarkTheme ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700')
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className={`text-[13px] mb-4 flex items-center gap-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
        <History size={16} className={effectiveDarkTheme ? 'text-gray-500' : 'text-gray-400'} />
        {totalCount} {t('admin.history_total', 'entrée(s)')}
      </p>

      {/* Content */}
      {loading && entries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : entries.length === 0 ? (
        <div className={`rounded-lg shadow-md p-12 text-center ${effectiveDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-2xl font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
            {t('admin.history_empty', 'Aucune entrée dans l\'historique')}
          </h3>
          <p className={`text-lg ${effectiveDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('admin.history_empty_hint', 'Aucune action n\'a encore été enregistrée.')}
          </p>
        </div>
      ) : (
        <>
          <div className={`overflow-x-auto rounded-lg shadow-md border mb-8 ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-100'}`}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className={`border-b ${effectiveDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <th className={`px-4 py-3 font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>{t('admin.history_col_date', 'Date')}</th>
                  <th className={`px-4 py-3 font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>{t('admin.history_col_type', 'Type')}</th>
                  <th className={`px-4 py-3 font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>{t('admin.history_col_action', 'Action')}</th>
                  <th className={`px-4 py-3 font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>{t('admin.history_col_target', 'Cible')}</th>
                  <th className={`px-4 py-3 font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>{t('admin.history_col_admin', 'Admin')}</th>
                  <th className={`px-4 py-3 font-semibold ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-500'}`}>{t('admin.history_col_reason', 'Motif')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={`${entry.type}-${entry.id}`} className={`border-b transition-colors ${effectiveDarkTheme ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className={`px-4 py-3 whitespace-nowrap ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[entry.type] || (effectiveDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>
                        {t(`admin.history_type_${entry.type}`, entry.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${actionColors[entry.action] || (effectiveDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>
                        {t(`admin.history_action_${entry.action}`, entry.action)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${effectiveDarkTheme ? 'text-gray-100' : 'text-gray-800'}`}>{entry.target ?? <span className={`italic ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>{t('admin.history_deleted', 'Supprimé')}</span>}</td>
                    <td className={`px-4 py-3 ${effectiveDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>{entry.admin ?? <span className={`italic ${effectiveDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>{t('admin.history_deleted', 'Supprimé')}</span>}</td>
                    <td className={`px-4 py-3 max-w-xs truncate ${effectiveDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} title={entry.actionReason}>{entry.actionReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
    </div>
  );
};

export default AdminHistory;
