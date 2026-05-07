import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import ClockIcon from '../../assets/images/icons/Clock-blue.svg';
import ExternalLinkIcon from '../../assets/images/icons/External-Link-white.svg';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import AdminTabs from './AdminTabs';

const AdminPendingProfessionals = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_pending_professionals', t);
  
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [pendingLaundriesCount, setPendingLaundriesCount] = useState(0);
  const [pendingProfessionalsCount, setPendingProfessionalsCount] = useState(0);
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
      fetchPendingLaundriesCount();
      fetchProfessionals(1);
    };
    checkAdmin();
  }, [t]);

  const fetchPendingLaundriesCount = async () => {
    try {
      const response = await adminService.getPendingLaundriesCount();
      setPendingLaundriesCount(response.count ?? 0);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    }
  };

  const fetchProfessionals = async (page) => {
    try {
      setLoading(true);
      const response = await adminService.getPendingProfessionals(page, pageSize);
      setProfessionals(response.data || []);
      setPendingProfessionalsCount(response.pagination.total);
      setTotalPages(response.pagination.pages);
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
      fetchProfessionals(page);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  if (!loading && user.type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">
            {t('errors.admin_access_required')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white">
      <Toast message={toastMessage} type={toastType} />
      
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-[20px] text-[#3B82F6] font-bold text-left">
            {t('admin.admin_title')}
          </h1>
          <p className="mt-2 text-[#9CA3AF] text-[14px] text-left">
            {t('admin.pending_professionals_description')}
          </p>
        </div>
      </div>

      <AdminTabs tabs={[
        { href: '/admin/pending-professionals', label: t('admin.professional_accounts'), count: pendingProfessionalsCount, active: true  },
        { href: '/admin/pending-laundries',     label: t('admin.laundries'),             count: pendingLaundriesCount,      active: false },
      ]} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-0 py-4">
        <h1 className="text-left text-[13px] font-bold text-gray-900 mb-6 flex items-center gap-2">
          <img src={ClockIcon} alt="Pending" className="w-[20px] h-[20px] text-gray-400" />
          {t('admin.pending_accounts_title')}
        </h1>

        {loading && professionals.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : professionals.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center bg-white">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              {t('admin.no_pending_professionals')}
            </h3>
            <p className="text-lg text-gray-600">
              {t('admin.all_accounts_processed')}
            </p>
          </div>
        ) : (
          <>
            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="rounded-lg shadow-md border-l-4 border-[#F59E0B] text-left overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-[16px] font-bold text-[#111827] flex-1">
                          {professional.user.firstName} {professional.user.lastName}
                        </h3>
                        <span className="px-2 py-1 border border-[#F59E0B]/14 bg-[#FEF3C7] text-[#92400E] text-[9px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap uppercase">
                          {t('admin.pending')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[13px] font-regular text-[#6B7280]">
                          <span className="font-semibold">{professional.user.email}</span>
                        </p>

                        <p className="text-[13px] text-[#6B7280]">
                          <span>SIRET: <span className="font-semibold text-[#111827]">{professional.siret}</span></span>
                        </p>

                        {professional.address && (
                          <p className="text-[13px] text-[#6B7280]">
                            <span>
                              {professional.address.street}, {professional.address.postalCode} {professional.address.city}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                      <div className="text-left">
                        <p className="text-[11px] font-regular text-[#9CA3AF]">
                          {t('admin.request_date')} {formatDate(professional.user.createdAt)}
                        </p>
                      </div>

                      <button className="bg-[#3B82F6] text-white px-3 py-1.5 rounded text-[11px] font-medium hover:bg-[#2563EB] transition-colors whitespace-nowrap" onClick={() => navigate(`/admin/professionals/${professional.id}`)}>
                        <img src={ExternalLinkIcon} alt="View" className="w-4 h-4 inline-block mr-1" />
                        {t('admin.manage_request')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPendingProfessionals;
