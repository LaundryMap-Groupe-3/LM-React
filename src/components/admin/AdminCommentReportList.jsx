import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import { Flag, ChevronRight, ArrowLeft } from 'lucide-react';

const AdminCommentReportList = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_comment_reports', t);

  const [items, setItems] = useState([]);
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
      fetchReports(1);
    };
    checkAdmin();
  }, [t]);

  const fetchReports = async (page) => {
    try {
      setLoading(true);
      const response = await adminService.getCommentReports(page, pageSize);
      setItems(response.data || []);
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchReports(page);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  const bg = isDarkTheme ? 'bg-[#0F172A]' : 'bg-white';
  const card = isDarkTheme ? 'bg-[#1E293B]' : 'bg-white';
  const textPrimary = isDarkTheme ? 'text-[#E2E8F0]' : 'text-[#111827]';
  const textSecondary = isDarkTheme ? 'text-[#94A3B8]' : 'text-[#6B7280]';
  const textMuted = isDarkTheme ? 'text-[#64748B]' : 'text-gray-400';
  const linkColor = isDarkTheme ? 'text-[#60a5fa]' : 'text-[#3B82F6]';

  return (
    <div className={`min-h-screen ${bg}`}>
    <div className="max-w-5xl mx-auto px-4 pb-10">
      <Toast message={toastMessage} type={toastType} />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between py-6">
        <div>
          <h1 className={`text-[20px] ${linkColor} font-bold text-left`}>
            {t('admin.comment_reports_title', 'Avis signalés')}
          </h1>
          <p className={`mt-2 ${textSecondary} text-[14px] text-left`}>
            {t('admin.comment_reports_subtitle', 'Examinez les commentaires signalés et modérez-les ou suspendez leurs auteurs.')}
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

      {/* Count */}
      <p className={`text-[13px] ${textSecondary} mb-4 flex items-center gap-2`}>
        <Flag size={16} className={textMuted} />
        {totalCount} {t('admin.comment_reports_total', 'commentaire(s) signalé(s)')}
      </p>

      {/* Content */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : items.length === 0 ? (
        <div className={`rounded-lg shadow-md p-12 text-center ${card}`}>
          <h3 className={`text-2xl font-semibold mb-4 ${textPrimary}`}>
            {t('admin.no_comment_reports_found', 'Aucun commentaire signalé')}
          </h3>
          <p className={`text-lg ${textSecondary}`}>
            {t('admin.no_comment_reports_found_hint', 'Les commentaires signalés apparaîtront ici.')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {items.map((item) => (
              <button
                key={item.laundryNoteId}
                type="button"
                onClick={() => navigate(`/admin/comment-reports/${item.laundryNoteId}`)}
                className={`w-full text-left rounded-lg shadow-md border-l-4 border-[#EF4444] overflow-hidden ${card} hover:shadow-lg transition-shadow duration-300 p-4 flex items-center gap-4`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[12px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${isDarkTheme ? 'bg-[#EF4444]/15 text-red-400' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                      {item.reportCount} {t('admin.comment_report_count_label', item.reportCount > 1 ? 'signalements' : 'signalement')}
                    </span>
                    {item.author && (
                      <span className={`text-[13px] ${textSecondary}`}>
                        {t('admin.comment_report_author_label', 'Auteur')} :{' '}
                        <span className={`font-medium ${textPrimary}`}>{item.author.firstName} {item.author.lastName}</span>
                        {item.author.status === 'suspended' && (
                          <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${isDarkTheme ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                            {t('admin.comment_report_author_suspended', 'Suspendu')}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className={`text-[14px] ${textPrimary} truncate`}>
                    {item.laundryNote?.comment}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    {t('admin.comment_report_last_reported_label', 'Dernier signalement')} :{' '}
                    {new Date(item.lastReportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <ChevronRight size={18} className={`shrink-0 ${isDarkTheme ? 'text-[#475569]' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
    </div>
  );
};

export default AdminCommentReportList;
