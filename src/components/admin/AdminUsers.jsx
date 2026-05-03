import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import { Users, ArrowLeft } from 'lucide-react';

const AdminUsers = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_users', t);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
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
      await fetchUsers(1);
    };
    checkAdmin();
  }, [t]);

  const fetchUsers = async (page) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, pageSize);
      setUsers(response.data || []);
      setTotalCount(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 0);
      setCurrentPage(page);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (!user) {
    return null;
  }

  if (!loading && user.type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">{t('errors.admin_access_required')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-6 ${
      isDarkTheme ? 'bg-[#0F172A]' : 'bg-gray-50'
    }`}>
      <Toast message={toastMessage} type={toastType} />

      {/* Header with Back Button */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              {t('admin.users_management', 'Gestion des utilisateurs')}
            </h1>
            <p className={`text-sm mt-1 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('admin.users_count', 'Total')} : {totalCount} {t('admin.users', 'utilisateurs')}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <>
          {users.length === 0 ? (
            <div className={`rounded-lg p-12 text-center ${
              isDarkTheme ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Users size={48} className={`mx-auto mb-4 ${
                isDarkTheme ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('admin.no_users', 'Aucun utilisateur trouvé')}
              </h3>
            </div>
          ) : (
            <div className={`rounded-lg border overflow-hidden ${
              isDarkTheme
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-200 bg-white'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t('admin.name', 'Nom')}
                      </th>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t('admin.email', 'Email')}
                      </th>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t('admin.type', 'Type')}
                      </th>
                      <th className={`px-6 py-3 text-left text-sm font-semibold ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t('admin.registration_date', 'Date d\'inscription')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkTheme ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {users.map((u) => (
                      <tr key={u.id} className={`hover:${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                        <td className={`px-6 py-4 text-sm ${
                          isDarkTheme ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {u.firstName} {u.lastName}
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {u.email}
                        </td>
                        <td className={`px-6 py-4 text-sm`}>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            u.type === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : u.type === 'professional'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {u.type === 'admin'
                              ? t('admin.admin', 'Administrateur')
                              : u.type === 'professional'
                              ? t('admin.professional', 'Professionnel')
                              : t('admin.user_type', 'Utilisateur')}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${
                          isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatDate(u.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className={`text-sm ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {t('admin.page', 'Page')} {currentPage} {t('admin.of', 'sur')} {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? isDarkTheme
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDarkTheme
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {t('admin.previous', 'Précédent')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? isDarkTheme
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDarkTheme
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {t('admin.next', 'Suivant')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
