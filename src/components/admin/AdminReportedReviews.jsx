import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';

const REASON_LABELS = {
  equipment_broken: 'Problème d\'équipement',
  cleanliness_issue: 'Problème de propreté',
  safety_concern: 'Problème de sécurité',
  staff_behavior: 'Comportement inapproprié',
  pricing_issue: 'Problème de tarification',
  other: 'Autre',
};

const AdminReportedReviews = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  usePageTitle('page_titles.admin_reports', t);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const loadReports = async (page) => {
    try {
      setLoading(true);
      const response = await adminService.getReportedReviews(page, pageSize);
      setItems(Array.isArray(response?.data) ? response.data : []);
      setTotalPages(response?.pagination?.pages || 0);
      setTotalCount(response?.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

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
      await loadReports(1);
    };

    checkAdmin();
  }, [t]);

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDismiss = async (reviewId) => {
    try {
      setActionLoadingId(reviewId);
      await adminService.dismissReviewReports(reviewId);
      setToastMessage(t('admin.reports_dismissed', 'Le signalement a été traité: commentaire conservé.'));
      setToastType('success');
      await loadReports(currentPage);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteComment = async (reviewId) => {
    const reason = window.prompt(
      t('admin.delete_comment_reason_prompt', 'Motif de suppression du commentaire (optionnel) :'),
      'Commentaire inapproprié'
    );

    if (reason === null) {
      return;
    }

    try {
      setActionLoadingId(reviewId);
      await adminService.deleteReportedReviewComment(reviewId, reason);
      setToastMessage(t('admin.comment_deleted_success', 'Le commentaire signalé a été supprimé.'));
      setToastType('success');
      await loadReports(currentPage);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isEmpty = useMemo(() => !loading && items.length === 0, [loading, items]);

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
              {t('admin.reported_reviews_title', 'Modération des commentaires signalés')}
            </h1>
            <p className={`text-sm mt-1 ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('admin.reported_reviews_count', 'Signalements en attente')} : {totalCount}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
        </div>
      )}

      {isEmpty && (
        <div className={`rounded-lg p-12 text-center ${
          isDarkTheme ? 'bg-gray-800' : 'bg-white'
        }`}>
          <ShieldAlert size={48} className={`mx-auto mb-4 ${
            isDarkTheme ? 'text-gray-600' : 'text-gray-300'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('admin.no_reported_reviews', 'Aucun commentaire signalé à modérer')}
          </h3>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => {
            const isActionLoading = actionLoadingId === item.reviewId;

            return (
              <div
                key={item.reviewId}
                className={`rounded-xl border p-5 ${
                  isDarkTheme
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        <Flag size={14} />
                        {item.reportsCount} {t('admin.reports', 'signalements')}
                      </span>
                      <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('admin.last_report_at', 'Dernier signalement')} : {formatDateTime(item.latestReportAt)}
                      </span>
                    </div>

                    <p className={`text-sm mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-semibold">{t('admin.laundry', 'Laverie')} :</span>{' '}
                      {item?.laundry?.establishmentName || '-'}
                    </p>

                    <p className={`text-sm mb-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="font-semibold">{t('admin.author', 'Auteur')} :</span>{' '}
                      {`${item?.author?.firstName || ''} ${item?.author?.lastName || ''}`.trim() || item?.author?.email || '-'}
                    </p>

                    <div className={`rounded-lg p-3 mb-4 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`text-sm whitespace-pre-wrap ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                        {item.comment || t('admin.comment_unavailable', 'Commentaire indisponible')}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(item.reasons || {}).map(([reason, count]) => (
                        <span
                          key={reason}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                        >
                          {REASON_LABELS[reason] || reason} ({count})
                        </span>
                      ))}
                    </div>

                    {Array.isArray(item.reportComments) && item.reportComments.length > 0 && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold mb-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('admin.reporters_comments', 'Commentaires des signalements')}
                        </p>
                        <ul className="space-y-1">
                          {item.reportComments.slice(0, 2).map((commentText, index) => (
                            <li
                              key={`${item.reviewId}-${index}`}
                              className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                              • {commentText}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:w-56">
                    <button
                      onClick={() => handleDismiss(item.reviewId)}
                      disabled={isActionLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle2 size={16} />
                      {t('admin.keep_comment', 'Conserver le commentaire')}
                    </button>
                    <button
                      onClick={() => handleDeleteComment(item.reviewId)}
                      disabled={isActionLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={16} />
                      {t('admin.delete_comment', 'Supprimer le commentaire')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('admin.page', 'Page')} {currentPage} {t('admin.of', 'sur')} {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => loadReports(currentPage - 1)}
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
              onClick={() => loadReports(currentPage + 1)}
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
    </div>
  );
};

export default AdminReportedReviews;
