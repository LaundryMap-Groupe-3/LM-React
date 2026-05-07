import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import AdminTabs from './AdminTabs';
import { Clock } from 'lucide-react';

const AdminPendingLaundries = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_pending_laundries', t);

  const [laundries, setLaundries] = useState([]);
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
      fetchLaundries(1);
      fetchPendingLaundriesCount();
      fetchpendingProfessionalsCount();
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

  const fetchLaundries = async (page) => {
    try {
      setLoading(true);
      const response = await adminService.getPendingLaundries(page, pageSize);
      setLaundries(response.data || []);
      setPendingLaundriesCount(response.pagination.total);
      setTotalPages(response.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchpendingProfessionalsCount = async () => {
    try {
      const response = await adminService.getPendingProfessionalsCount();
      setPendingProfessionalsCount(response.total);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchLaundries(page);
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
            {t('admin.pending_laundries_subtitle')}
          </p>
        </div>
      </div>

      <AdminTabs tabs={[
        { href: '/admin/pending-professionals', label: t('admin.professional_accounts'), count: pendingProfessionalsCount, active: false },
        { href: '/admin/pending-laundries',     label: t('admin.laundries'),             count: pendingLaundriesCount,      active: true  },
      ]} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-0 py-4">
        <h1 className="text-left text-[13px] font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock size={20} className="text-gray-700" />
          {t('admin.pending_laundries_title')}
        </h1>

        {loading && laundries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : laundries.length === 0 ? (
          <div className="rounded-lg shadow-md p-12 text-center bg-white">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              {t('admin.no_pending_laundries')}
            </h3>
            <p className="text-lg text-gray-600">
              {t('admin.all_laundries_processed')}
            </p>
          </div>
        ) : (
          <>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {laundries.map((laundry) => (
                <div
                  key={laundry.id}
                  className="rounded-lg shadow-md border-l-4 border-[#F59E0B] text-left overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-[16px] font-bold text-[#111827] flex-1">
                          {laundry.establishmentName || t('admin.unknown_laundry')}
                        </h3>
                        <span className="px-2 py-1 border border-[#F59E0B]/14 bg-[#FEF3C7] text-[#92400E] text-[9px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap uppercase">
                          {t('admin.pending')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[13px] font-regular text-[#6B7280]">
                          <span className="font-semibold">
                            {laundry.professional?.user
                              ? `${laundry.professional.user.lastName} ${laundry.professional.user.firstName}`
                              : `${laundry.professional?.lastName || ''} ${laundry.professional?.firstName || ''}`.trim() || '-'}
                          </span>
                        </p>

                        <p className="text-[13px] font-regular text-[#6B7280]">
                          <span className="font-semibold">{laundry.contactEmail || laundry.professional?.email || '-'}</span>
                        </p>

                        {laundry.address && (
                          <p className="text-[13px] text-[#6B7280]">
                            <span>
                              {laundry.address.street}, {laundry.address.postalCode} {laundry.address.city}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                      <div className="text-left">
                        <p className="text-[11px] font-regular text-[#9CA3AF]">
                          {t('admin.request_date')} {formatDate(laundry.createdAt)}
                        </p>
                      </div>

                      <button className="bg-[#3B82F6] text-white px-3 py-1.5 rounded text-[11px] font-medium hover:bg-[#2563EB] transition-colors whitespace-nowrap" onClick={() => navigate(`/admin/laundries/${laundry.id}`)}>
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

export default AdminPendingLaundries;
