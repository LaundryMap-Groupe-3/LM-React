import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { Users } from 'lucide-react';

const AdminUserList = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_user_list', t);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
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
      fetchUsers(1, '');
    };
    checkAdmin();
  }, [t]);

  const fetchUsers = async (page, searchQuery) => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers(page, pageSize, searchQuery);
      setUsers(response.data || []);
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
    fetchUsers(1, search);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page, search);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

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
            {t('admin.users_list_title', 'Liste des utilisateurs')}
          </h1>
          <p className="mt-2 text-[#9CA3AF] text-[14px] text-left">
            {t('admin.users_list_subtitle', 'Consultez tous les comptes utilisateurs de la plateforme.')}
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

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.users_search_placeholder', 'Rechercher un utilisateur...')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchUsers(1, ''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-[#2563EB] transition-colors"
          >
            {t('explorer.search_button', 'Rechercher')}
          </button>
        </form>
      </div>

      {/* Count */}
      <p className="text-[13px] text-gray-500 mb-4 flex items-center gap-2">
        <Users size={16} className="text-gray-400" />
        {totalCount} {t('admin.users_total', 'utilisateur(s)')}
      </p>

      {/* Content */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg shadow-md p-12 text-center bg-white">
          <h3 className="text-2xl font-semibold mb-4 text-gray-900">
            {t('admin.no_users_found', 'Aucun utilisateur trouvé')}
          </h3>
          <p className="text-lg text-gray-600">
            {t('admin.no_users_found_hint', 'Aucun utilisateur ne correspond à votre recherche.')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {users.map((u) => (
              <div
                key={u.id}
                className="rounded-lg shadow-md border-l-4 border-[#3B82F6] text-left overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-4">
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-[16px] font-bold text-[#111827] flex-1">
                        {u.firstName} {u.lastName}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] text-[#6B7280]">
                        <span className="font-semibold">{u.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-[#9CA3AF]">
                      {t('admin.request_date', 'Inscrit le')} {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default AdminUserList;
