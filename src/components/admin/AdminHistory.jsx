import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { History } from 'lucide-react';

const ACTION_COLORS = {
  approve: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-700',
  create: 'bg-blue-100 text-blue-700',
  update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-gray-100 text-gray-700',
};

const TYPE_COLORS = {
  professional: 'bg-purple-100 text-purple-700',
  laundry: 'bg-cyan-100 text-cyan-700',
  user: 'bg-orange-100 text-orange-700',
};

const AdminHistory = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 bg-white">
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-[20px] text-[#3B82F6] font-bold text-left">
            {t('admin.history_title', "Historique des actions")}
          </h1>
          <p className="mt-2 text-[#9CA3AF] text-[14px] text-left">
            {t('admin.history_subtitle', "Consultez toutes les actions effectuées par les administrateurs.")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="text-[13px] text-[#3B82F6] hover:underline font-medium"
        >
          ← {t('admin.back_to_dashboard', 'Tableau de bord')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTypeChange(tab.key)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
              activeType === tab.key
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-[13px] text-gray-500 mb-4 flex items-center gap-2">
        <History size={16} className="text-gray-400" />
        {totalCount} {t('admin.history_total', 'entrée(s)')}
      </p>

      {/* Content */}
      {loading && entries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg shadow-md p-12 text-center bg-white">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('admin.history_empty', 'Aucune entrée dans l\'historique')}
          </h3>
          <p className="text-lg text-gray-600">
            {t('admin.history_empty_hint', 'Aucune action n\'a encore été enregistrée.')}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-100 mb-8">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-gray-500 font-semibold">{t('admin.history_col_date', 'Date')}</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">{t('admin.history_col_type', 'Type')}</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">{t('admin.history_col_action', 'Action')}</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">{t('admin.history_col_target', 'Cible')}</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">{t('admin.history_col_admin', 'Admin')}</th>
                  <th className="px-4 py-3 text-gray-500 font-semibold">{t('admin.history_col_reason', 'Motif')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={`${entry.type}-${entry.id}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLORS[entry.type] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`admin.history_type_${entry.type}`, entry.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${ACTION_COLORS[entry.action] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`admin.history_action_${entry.action}`, entry.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{entry.target ?? <span className="text-gray-400 italic">{t('admin.history_deleted', 'Supprimé')}</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.admin ?? <span className="text-gray-400 italic">{t('admin.history_deleted', 'Supprimé')}</span>}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={entry.actionReason}>{entry.actionReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default AdminHistory;
