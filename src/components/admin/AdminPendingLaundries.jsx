import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast.jsx';

const AdminPendingLaundries = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_pending_laundries', t);

  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.type !== 'admin') {
        setToastMessage(t('errors.admin_access_required', 'Accès administrateur requis'));
        setToastType('error');
        setLoading(false);
        return;
      }

      setUser(currentUser);
      fetchLaundries(1);
    };

    checkAdmin();
  }, [t]);

  const fetchLaundries = async (page) => {
    try {
      setLoading(true);
      const response = await adminService.getPendingLaundries(page, pageSize);
      setLaundries(response.data || []);
      setTotalCount(response.pagination.total || 0);
      setTotalPages(response.pagination.pages || 0);
      setCurrentPage(page);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error', 'Erreur de chargement'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchLaundries(page);
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
    return null;
  }

  if (!loading && user.type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">
            {t('errors.admin_access_required', 'Accès administrateur requis')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-[20px] text-[#3B82F6] font-bold text-left">
            {t('admin.admin_title', 'Administration')}
          </h1>
          <p className="mt-2 text-[#9CA3AF] text-[14px] text-left">
            {t('admin.pending_professionals_description', 'Gestion des comptes professionnels et des fiches de laveries en attente de validation')}
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 shadow-md bg-white rounded-lg px-4 py-2 mb-8">
        <button
          type="button"
          onClick={() => navigate('/admin/professionals')}
          className="p-3 text-[13px] font-medium rounded-[5px] flex-1 h-9 flex items-center justify-center gap-2 whitespace-nowrap transition-colors text-gray-500 hover:text-gray-700 bg-transparent"
        >
          {t('admin.professional_accounts', 'Comptes professionnels')}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/laundries')}
          className="p-3 text-[13px] font-medium rounded-[5px] flex-1 h-9 flex items-center justify-center gap-2 whitespace-nowrap transition-colors bg-[#3B82F6] text-white"
        >
          {t('admin.laundries', 'Laveries')}
          <span className="bg-white/20 text-white text-xs px-2 py-1 h-6 min-w-6 rounded-full flex items-center justify-center">
            {totalCount}
          </span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-0 py-4">
        <h1 className="text-left text-[13px] font-bold text-gray-900 mb-6">
          {t('admin.pending_accounts_title', 'Fiches de laveries en attente')}
        </h1>

        {loading && laundries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : laundries.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center bg-white">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              {t('admin.no_pending_laundries', 'Aucune laverie en attente')}
            </h3>
            <p className="text-lg text-gray-600">
              {t('admin.all_accounts_processed', 'Toutes les fiches ont été traitées')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {laundries.map((laundry) => (
                <div
                  key={laundry.id}
                  className={`rounded-lg shadow-md border-l-4 border-[#F59E0B] text-left overflow-hidden ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`text-[16px] font-bold flex-1 ${isDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                          {laundry.establishmentName}
                        </h3>
                        <span className="px-2 py-1 border border-[#F59E0B]/14 bg-[#FEF3C7] text-[#92400E] text-[9px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap uppercase">
                          {t('admin.pending', 'En attente')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className={`text-[13px] ${isDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                          <span className="font-semibold">{laundry.professional?.companyName || '-'}</span>
                        </p>

                        <p className={`text-[13px] ${isDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                          <span className="font-semibold">{laundry.professional?.email || '-'}</span>
                        </p>

                        <p className={`text-[13px] ${isDarkTheme ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                          <span>
                            {laundry.address?.street}, {laundry.address?.postalCode} {laundry.address?.city}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                      <div className="text-left">
                        <p className={`text-[11px] ${isDarkTheme ? 'text-gray-400' : 'text-[#9CA3AF]'}`}>
                          {t('dashboard.created_at', 'Créée le :')} {formatDate(laundry.createdAt)}
                        </p>
                        <p className={`text-[11px] ${isDarkTheme ? 'text-gray-400' : 'text-[#9CA3AF]'}`}>
                          {t('dashboard.updated_at', 'Modifiée le :')} {formatDate(laundry.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 flex rounded-lg items-center justify-center text-lg font-medium ${
                      currentPage === 1
                        ? 'border border-[#CBD5E1] text-black cursor-not-allowed bg-gray-50'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                    }`}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium ${
                        currentPage === page
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-medium ${
                      currentPage === totalPages
                        ? 'border border-[#CBD5E1] text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPendingLaundries;