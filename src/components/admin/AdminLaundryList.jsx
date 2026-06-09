import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { Store, ArrowLeft } from 'lucide-react';

const STATUS_COLORS = {
  approved: 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]/20',
  pending: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/14',
  rejected: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]/20',
};

const STATUS_COLORS_DARK = {
  approved: 'bg-[#065F46]/30 text-[#6EE7B7] border-[#6EE7B7]/20',
  pending: 'bg-[#92400E]/30 text-[#FCD34D] border-[#F59E0B]/20',
  rejected: 'bg-[#991B1B]/30 text-[#FCA5A5] border-[#FCA5A5]/20',
};

const STATUS_BORDER = {
  approved: 'border-[#10B981]',
  pending: 'border-[#F59E0B]',
  rejected: 'border-[#EF4444]',
};

const AdminLaundryList = ({ isDarkTheme, initialStatus = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_laundry_list', t);

  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
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
      fetchLaundries(1, '', initialStatus);
    };
    checkAdmin();
  }, [t]);

  const fetchLaundries = async (page, searchQuery, status) => {
    try {
      setLoading(true);
      const response = await adminService.getAllLaundries(page, pageSize, searchQuery, status);
      setLaundries(response.data || []);
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
    fetchLaundries(1, search, statusFilter);
  };

  const handleStatusFilter = (status) => {
    const next = statusFilter === status ? '' : status;
    setStatusFilter(next);
    fetchLaundries(1, search, next);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchLaundries(page, search, statusFilter);
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

  const statusLabel = (status) => {
    if (status === 'approved') return t('admin.approved', 'Approuvée');
    if (status === 'rejected') return t('admin.rejected', 'Refusée');
    return t('admin.pending', 'En attente');
  };

  const bg = isDarkTheme ? 'bg-[#0F172A]' : 'bg-white';
  const card = isDarkTheme ? 'bg-[#1E293B]' : 'bg-white';
  const textPrimary = isDarkTheme ? 'text-[#E2E8F0]' : 'text-[#111827]';
  const textSecondary = isDarkTheme ? 'text-[#94A3B8]' : 'text-[#6B7280]';
  const textMuted = isDarkTheme ? 'text-[#64748B]' : 'text-gray-400';
  const linkColor = isDarkTheme ? 'text-[#60A5FA]' : 'text-[#3B82F6]';
  const inputBorder = isDarkTheme ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] placeholder-[#64748B]' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400';
  const clearBtnColor = isDarkTheme ? 'text-[#64748B] hover:text-[#94A3B8]' : 'text-gray-400 hover:text-gray-600';
  const filterInactive = isDarkTheme ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:border-[#475569]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300';
  const cardBorderTop = isDarkTheme ? 'border-[#334155]' : 'border-gray-100';
  const statusColors = isDarkTheme ? STATUS_COLORS_DARK : STATUS_COLORS;

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between py-6">
        <div>
          <h1 className={`text-[20px] ${linkColor} font-bold text-left`}>
            {t('admin.laundries_list_title', 'Liste des laveries')}
          </h1>
          <p className={`mt-2 ${textSecondary} text-[14px] text-left`}>
            {t('admin.laundries_list_subtitle', 'Consultez et gérez toutes les laveries de la plateforme.')}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.laundries_search_placeholder', 'Rechercher une laverie...')}
              className={`w-full border rounded-lg px-3 py-2 pr-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${inputBorder}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchLaundries(1, '', statusFilter); }}
                aria-label={t('common.clear_search', 'Effacer la recherche')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${clearBtnColor}`}
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

        <div className="flex gap-2">
          {['approved', 'pending', 'rejected'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
                statusFilter === s ? statusColors[s] : filterInactive
              }`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className={`text-[13px] ${textSecondary} mb-4 flex items-center gap-2`}>
        <Store size={16} className={textMuted} />
        {totalCount} {t('admin.laundries_total', 'laverie(s)')}
      </p>

      {/* Content */}
      {loading && laundries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : laundries.length === 0 ? (
        <div className={`rounded-lg shadow-md p-12 text-center ${card}`}>
          <h3 className={`text-2xl font-semibold mb-4 ${textPrimary}`}>
            {t('admin.no_laundries_found', 'Aucune laverie trouvée')}
          </h3>
          <p className={`text-lg ${textSecondary}`}>
            {t('admin.no_laundries_found_hint', 'Aucune laverie ne correspond à votre recherche.')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {laundries.map((laundry) => {
              const status = laundry.status ?? 'pending';
              return (
                <div
                  key={laundry.id}
                  className={`rounded-lg shadow-md border-l-4 ${STATUS_BORDER[status] ?? STATUS_BORDER.pending} text-left overflow-hidden ${card} hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex items-start justify-between">
                        <h3 className={`text-[16px] font-bold ${textPrimary} flex-1`}>
                          {laundry.establishmentName || t('admin.unknown_laundry', 'Laverie inconnue')}
                        </h3>
                        <span className={`px-2 py-1 border text-[9px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap uppercase ${statusColors[status] ?? statusColors.pending}`}>
                          {statusLabel(status)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className={`text-[13px] ${textSecondary}`}>
                          <span className="font-semibold">
                            {laundry.professional?.user
                              ? `${laundry.professional.user.lastName} ${laundry.professional.user.firstName}`
                              : `${laundry.professional?.lastName || ''} ${laundry.professional?.firstName || ''}`.trim() || '-'}
                          </span>
                        </p>
                        <p className={`text-[13px] ${textSecondary}`}>
                          <span className="font-semibold">{laundry.contactEmail || laundry.professional?.email || '-'}</span>
                        </p>
                        {laundry.address && (
                          <p className={`text-[13px] ${textSecondary}`}>
                            {laundry.address?.street}, {laundry.address?.postalCode} {laundry.address?.city}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center justify-between gap-4 pt-4 border-t ${cardBorderTop}`}>
                      <p className={`text-[11px] ${textMuted}`}>
                        {t('admin.request_date', 'Demande du')} {formatDate(laundry.createdAt)}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/laundries/${laundry.id}`)}
                        className="bg-[#3B82F6] text-white px-3 py-1.5 rounded text-[11px] font-medium hover:bg-[#2563EB] transition-colors whitespace-nowrap"
                      >
                        {t('admin.manage_request', 'Gérer')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isDarkTheme={isDarkTheme} />
        </>
      )}
    </div>
    </div>
  );
};

export default AdminLaundryList;
