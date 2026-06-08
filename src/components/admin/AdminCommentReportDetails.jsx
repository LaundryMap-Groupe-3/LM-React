import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import Button from '../common/Button';
import { ArrowLeft, Star, Ban, ShieldOff, Check } from 'lucide-react';

const AdminCommentReportDetails = ({ isDarkTheme }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { laundryNoteId } = useParams();
  usePageTitle('page_titles.admin_comment_report_details', t);

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [actionTarget, setActionTarget] = useState(null); // 'comment' | 'author' | 'keep' | null
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      fetchDetails();
    };
    checkAdmin();
  }, [t, laundryNoteId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCommentReportDetails(laundryNoteId);
      setData(response);
    } catch (error) {
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const openAction = (target) => {
    setActionTarget(target);
    setActionReason('');
  };

  const cancelAction = () => {
    setActionTarget(null);
    setActionReason('');
  };

  const confirmAction = async () => {
    if (actionTarget !== 'keep' && !actionReason.trim()) return;
    try {
      setActionLoading(true);
      if (actionTarget === 'comment') {
        await adminService.blockReportedComment(laundryNoteId, actionReason.trim());
        setToastMessage(t('admin.block_comment_success', 'Le commentaire a été bloqué.'));
      } else if (actionTarget === 'author') {
        await adminService.blockReportedCommentAuthor(laundryNoteId, actionReason.trim());
        setToastMessage(t('admin.block_author_success', "L'auteur a été suspendu."));
      } else {
        await adminService.dismissCommentReports(laundryNoteId);
        setToastMessage(t('admin.comment_report_keep_success', 'Le commentaire a été conservé et les signalements ont été ignorés.'));
      }
      setToastType('success');
      setActionTarget(null);
      setActionReason('');
      fetchDetails();
    } catch (error) {
      setToastMessage(error.message || t('errors.generic_error'));
      setToastType('error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  const isCommentBlocked = !!data?.laundryNote?.commentDeletedAt;
  const isAuthorSuspended = data?.author?.status === 'suspended';
  const reportsCount = data?.reports?.length || 0;
  const isKept = !isCommentBlocked && !isAuthorSuspended && reportsCount === 0;

  return (
    <div className="min-h-screen max-w-6xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white py-6">
      <Toast message={toastMessage} type={toastType} />

      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/comment-reports')}
          className="flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] font-medium text-sm transition-colors"
        >
          <ArrowLeft size={20} />
          {t('admin.back_to_comment_reports', 'Retour aux signalements')}
        </button>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Commentaire et signalements */}
          <div className="lg:col-span-2">
            {/* Titre et statut */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h1 className="text-[24px] font-bold text-[#111827]">
                  {data.author ? `${data.author.firstName} ${data.author.lastName}` : t('admin.comment_report_unknown_author', 'Auteur inconnu')}
                </h1>
                <div className="flex items-center gap-2">
                  {isAuthorSuspended && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                      {t('admin.comment_report_author_suspended', 'Suspendu')}
                    </span>
                  )}
                  {typeof data.laundryNote?.rating === 'number' && (
                    <span className="flex items-center mt-2 gap-1 text-[13px] text-gray-500">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      {data.laundryNote.rating}/5
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commentaire signalé */}
            <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white mb-6">
              <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
                <h2 className="text-[16px] font-bold text-[#111827]">
                  {t('admin.comment_report_comment_title', 'Commentaire signalé')}
                </h2>
              </div>
              <div className="p-6">
                {isCommentBlocked ? (
                  <p className="text-[14px] italic text-gray-400">
                    {t('admin.comment_report_comment_already_blocked', 'Ce commentaire a déjà été bloqué.')}
                    {data.laundryNote?.commentDeletedReason && (
                      <span className="block mt-1 text-gray-400">
                        {t('admin.comment_report_block_reason_label', 'Motif')} : {data.laundryNote.commentDeletedReason}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-[14px] text-[#111827]">{data.laundryNote?.comment}</p>
                )}
              </div>
            </div>

            {/* Signalements */}
            <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white">
              <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
                <h2 className="text-[16px] font-bold text-[#111827]">
                  {reportsCount} {t('admin.comment_report_count_label', reportsCount > 1 ? 'signalements' : 'signalement')}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {data.reports?.map((report, index) => (
                  <div key={`${report.reporterId}-${index}`}>
                    {index > 0 && <div className="border-t border-gray-200 mb-4" />}
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <span className="text-[13px] font-medium text-[#111827]">
                        {report.reporter ? `${report.reporter.firstName} ${report.reporter.lastName}` : t('admin.comment_report_unknown_reporter', 'Utilisateur inconnu')}
                      </span>
                      <span className="text-[12px] text-[#6B7280]">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="inline-block text-[12px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-semibold mb-1">
                      {t(`admin.comment_report_reason_${report.reason}`, report.reason)}
                    </span>
                    {report.comment && (
                      <p className="text-[13px] text-gray-600 mt-1">{report.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Actions de modération */}
          <div className="lg:col-span-1">
            <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white sticky top-6">
              <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
                <h3 className="text-[16px] font-bold text-[#111827]">
                  {t('admin.comment_report_actions_title', 'Actions de modération')}
                </h3>
              </div>

              <div className="p-6">
                {isKept ? (
                  <p className="text-[13px] text-[#6B7280]">
                    {t('admin.comment_report_kept_hint', 'Ce commentaire a été conservé : aucune action n’est plus possible sur ce signalement.')}
                  </p>
                ) : isCommentBlocked && isAuthorSuspended ? (
                  <p className="text-[13px] text-[#6B7280]">
                    {t('admin.comment_report_no_actions_hint', 'Aucune action supplémentaire n’est disponible : le commentaire est bloqué et l’auteur est suspendu.')}
                  </p>
                ) : actionTarget === null ? (
                  <div className="space-y-2">
                    {!isCommentBlocked && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => openAction('keep')}
                          className="w-full py-2 text-[13px]"
                        >
                          <Check size={15} />
                          {t('admin.comment_report_keep_btn', 'Conserver le commentaire')}
                        </Button>
                        <Button variant="danger" onClick={() => openAction('comment')} className="w-full py-2 text-[13px]">
                          <Ban size={15} />
                          {t('admin.block_comment_btn', 'Bloquer le commentaire')}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => openAction('author')}
                      disabled={isAuthorSuspended}
                      className="w-full py-2 text-[13px]"
                    >
                      <ShieldOff size={15} />
                      {isAuthorSuspended
                        ? t('admin.comment_report_author_already_suspended', 'Auteur déjà suspendu')
                        : t('admin.block_author_btn', "Bloquer l'auteur")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[13px] text-gray-600">
                      {actionTarget === 'comment' &&
                        t('admin.block_comment_confirm_text', 'Veuillez indiquer le motif du blocage de ce commentaire :')}
                      {actionTarget === 'author' &&
                        t('admin.block_author_confirm_text', "Veuillez indiquer le motif de la suspension de cet auteur :")}
                      {actionTarget === 'keep' &&
                        t('admin.comment_report_keep_confirm_text', 'Le commentaire restera visible et tous les signalements associés seront ignorés. Confirmez-vous cette action ?')}
                    </p>
                    {actionTarget !== 'keep' && (
                      <textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder={t('admin.block_reason_placeholder', 'Motif du blocage...')}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                      />
                    )}
                    <div className="space-y-2">
                      <Button
                        variant={actionTarget === 'keep' ? 'secondary' : 'danger'}
                        onClick={confirmAction}
                        disabled={actionLoading || (actionTarget !== 'keep' && !actionReason.trim())}
                        loading={actionLoading}
                        loadingLabel={t('admin.confirm_btn', 'Confirmer')}
                        className="w-full py-2 text-[13px]"
                      >
                        {t('admin.confirm_btn', 'Confirmer')}
                      </Button>
                      <Button variant="secondary" onClick={cancelAction} disabled={actionLoading} className="w-full py-2 text-[13px]">
                        {t('common.cancel', 'Annuler')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommentReportDetails;
