import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { Users, ArrowLeft } from 'lucide-react';

const STATUS_COLORS = {
  approved: 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]/20',
  pending:  'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/14',
  rejected: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]/20',
};

const STATUS_COLORS_DARK = {
  approved: 'bg-green-900/50 text-green-300 border-green-700/30',
  pending:  'bg-yellow-900/50 text-yellow-300 border-yellow-700/30',
  rejected: 'bg-red-900/50 text-red-300 border-red-700/30',
};

const STATUS_BORDER = {
  approved: 'border-[#10B981]',
  pending:  'border-[#F59E0B]',
  rejected: 'border-[#EF4444]',
};

const AdminProfessionalList = ({ isDarkTheme, initialStatus = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_professional_list', t);

  const [professionals, setProfessionals] = useState([]);
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
      fetchProfessionals(1, '', initialStatus);
    };
    checkAdmin();
  }, [t]);

  const fetchProfessionals = async (page, searchQuery, status) => {
    try {
      setLoading(true);
      const response = await adminService.getAllProfessionals(page, pageSize, searchQuery, status);
      setProfessionals(response.data || []);
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
    fetchProfessionals(1, search, statusFilter);
  };

  const handleStatusFilter = (status) => {
    const next = statusFilter === status ? '' : status;
    setStatusFilter(next);
    fetchProfessionals(1, search, next);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchProfessionals(page, search, statusFilter);
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
    if (status === 'approved') return t('admin.approved', 'Approuvé');
    if (status === 'rejected') return t('admin.rejected', 'Refusé');
    return t('admin.pending', 'En attente');
  };

  const dk = isDarkTheme;

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? 'bg-[#0F172A]' : ''}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${dk ? 'bg-[#0F172A]' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between py-6">
        <div>
          <h1 className="text-[20px] text-[#3B82F6] font-bold text-left">
            {t('admin.professionals_list_title', 'Liste des professionnels')}
          </h1>
          <p className={`mt-2 text-[14px] text-left ${dk ? 'text-[#64748B]' : 'text-[#9CA3AF]'}`}>
            {t('admin.professionals_list_subtitle', 'Consultez et gérez tous les comptes professionnels de la plateforme.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="text-[11px] sm:text-[13px] text-[#3B82F6] hover:underline font-medium flex items-center mt-1 sm:mt-0"
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
              placeholder={t('admin.professionals_search_placeholder', 'Rechercher un professionnel...')}
              className={`w-full border rounded-lg px-3 py-2 pr-8 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
                dk
                  ? 'bg-[#1E293B] border-[#334155] text-[#E2E8F0] placeholder-[#475569]'
                  : 'border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchProfessionals(1, '', statusFilter); }}
                aria-label={t('common.clear', 'Effacer')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${dk ? 'text-[#475569] hover:text-[#94A3B8]' : 'text-gray-400 hover:text-gray-600'}`}
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
              aria-pressed={statusFilter === s}
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
                statusFilter === s
                  ? (dk ? STATUS_COLORS_DARK[s] : STATUS_COLORS[s])
                  : dk
                    ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:border-[#475569]'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className={`text-[13px] mb-4 flex items-center gap-2 ${dk ? 'text-[#64748B]' : 'text-gray-500'}`}>
        <Users size={16} className={dk ? 'text-[#475569]' : 'text-gray-400'} />
        {totalCount} {t('admin.professionals_total', 'professionnel(s)')}
      </p>

      {/* Content */}
      {loading && professionals.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : professionals.length === 0 ? (
        <div className={`rounded-lg shadow-md p-12 text-center ${dk ? 'bg-[#1E293B]' : 'bg-white'}`}>
          <h3 className={`text-2xl font-semibold mb-4 ${dk ? 'text-[#E2E8F0]' : 'text-gray-900'}`}>
            {t('admin.no_professionals_found', 'Aucun professionnel trouvé')}
          </h3>
          <p className={`text-lg ${dk ? 'text-[#94A3B8]' : 'text-gray-600'}`}>
            {t('admin.no_professionals_found_hint', 'Aucun professionnel ne correspond à votre recherche.')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {professionals.map((professional) => {
              const status = professional.status ?? 'pending';
              const statusColors = dk
                ? (STATUS_COLORS_DARK[status] ?? STATUS_COLORS_DARK.pending)
                : (STATUS_COLORS[status] ?? STATUS_COLORS.pending);
              return (
                <div
                  key={professional.id}
                  className={`rounded-lg shadow-md border-l-4 ${STATUS_BORDER[status] ?? STATUS_BORDER.pending} text-left overflow-hidden hover:shadow-lg transition-shadow duration-300 ${dk ? 'bg-[#1E293B]' : 'bg-white'}`}
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex items-start justify-between">
                        <h3 className={`text-[16px] font-bold flex-1 ${dk ? 'text-[#E2E8F0]' : 'text-[#111827]'}`}>
                          {professional.user.firstName} {professional.user.lastName}
                        </h3>
                        <span className={`px-2 py-1 border text-[9px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap uppercase ${statusColors}`}>
                          {statusLabel(status)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className={`text-[13px] ${dk ? 'text-[#94A3B8]' : 'text-[#6B7280]'}`}>
                          <span className="font-semibold">{professional.user.email}</span>
                        </p>
                        <p className={`text-[13px] ${dk ? 'text-[#94A3B8]' : 'text-[#6B7280]'}`}>
                          SIREN : <span className={`font-semibold ${dk ? 'text-[#E2E8F0]' : 'text-[#111827]'}`}>{professional.siren}</span>
                        </p>
                        {professional.address && (
                          <p className={`text-[13px] ${dk ? 'text-[#94A3B8]' : 'text-[#6B7280]'}`}>
                            {professional.address.street}, {professional.address.postalCode} {professional.address.city}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center justify-between gap-4 pt-4 border-t ${dk ? 'border-[#334155]' : 'border-gray-100'}`}>
                      <p className={`text-[11px] ${dk ? 'text-[#475569]' : 'text-[#9CA3AF]'}`}>
                        {t('admin.request_date', 'Demande du')} {formatDate(professional.user?.createdAt)}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/professionals/${professional.id}`)}
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

export default AdminProfessionalList;
