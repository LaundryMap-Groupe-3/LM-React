import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const AdminProfessionalDetails = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkTheme: preferenceDarkTheme } = usePreferences();
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;
  usePageTitle('page_titles.admin_professional_details', t);

  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.type !== 'admin') {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      fetchProfessionalDetails();
    };
    checkAdmin();
  }, [t, id]);

  const fetchProfessionalDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProfessionalDetails(id);
      setProfessional(response.data || response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await adminService.approveProfessional(id);
      setShowApproveConfirm(false);
      setTimeout(() => navigate('/admin/professionals'), 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    if (window.confirm(t('admin.reject_confirmation'))) {
      try {
        setIsProcessing(true);
        await adminService.rejectProfessional(id, rejectionReason);
        setTimeout(() => navigate('/admin/professionals'), 1500);
      } catch (error) {
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
  }

  if (!loading && user.type !== 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`p-8 rounded-lg border-2 ${effectiveDarkTheme ? 'border-red-500/60 bg-red-950/40' : 'border-red-500 bg-red-50'}`}>
          <p className={`font-semibold ${effectiveDarkTheme ? 'text-red-400' : 'text-red-600'}`}>
            {t('errors.admin_access_required')}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`p-8 rounded-lg border-2 ${effectiveDarkTheme ? 'border-red-500/60 bg-red-950/40' : 'border-red-500 bg-red-50'}`}>
          <p className={`font-semibold ${effectiveDarkTheme ? 'text-red-400' : 'text-red-600'}`}>
            {t('errors.generic_error')}
          </p>
        </div>
      </div>
    );
  }

  const professionalUser = professional.user || professional;
  const isApproved = professional.status === 'approved' || professional.status === 'validated';
  const isRejected = professional.status === 'rejected';

  return (
    <div className={`min-h-screen ${effectiveDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/professionals')}
            className={`flex items-center gap-2 font-medium text-sm transition-colors ${effectiveDarkTheme ? 'text-blue-300 hover:text-blue-200' : 'text-[#3B82F6] hover:text-[#2563EB]'}`}
          >
            <ArrowLeft size={20} />
            {t('admin.back_to_list')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Informations */}
          <div className="lg:col-span-2">
            {/* Titre et statut */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className={`text-[24px] font-bold ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {professionalUser.firstName} {professionalUser.lastName}
                </h1>
                <div className="flex gap-2">
                  {isApproved && <StatusBadge status="approved" label={t('admin.approved')} icon={<CheckCircle size={16} />} darkTheme={effectiveDarkTheme} />}
                  {isRejected && <StatusBadge status="rejected" label={t('admin.rejected')} icon={<AlertCircle size={16} />} darkTheme={effectiveDarkTheme} />}
                  {!isApproved && !isRejected && <StatusBadge status="pending" label={t('admin.pending')} darkTheme={effectiveDarkTheme} />}
                </div>
              </div>
            </div>

            {/* Toutes les informations regroupées */}
            <div className={`rounded-lg shadow-md border overflow-hidden ${effectiveDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className={`px-6 py-4 border-b ${effectiveDarkTheme ? 'bg-gray-700/50 border-gray-700' : 'bg-[#F3F4F6] border-gray-200'}`}>
                <h2 className={`text-[16px] font-bold ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('admin.personal_information')}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Informations personnelles */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('auth.first_name')}
                      </p>
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {professionalUser.firstName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('auth.last_name')}
                      </p>
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {professionalUser.lastName}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('auth.email')}
                      </p>
                      <p className={`text-[14px] break-all ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {professionalUser.email}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('admin.registration_date')}
                      </p>
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {formatDate(professionalUser.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

                {/* Informations professionnelles */}
                <div>
                  <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                    {t('admin.professional_information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('auth.company_name')}
                      </p>
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {professional.companyName || '-'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('auth.siren')}
                      </p>
                      <p className={`text-[14px] font-mono ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {professional.siren}
                      </p>
                    </div>
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('auth.phone')}
                      </p>
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {professional.phone || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Adresse professionnelle */}
                {professional.address && (
                  <>
                    <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>
                    <div>
                      <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {t('auth.professional_address')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                            {t('auth.street')}
                          </p>
                          <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                            {professional.address.street}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                            {t('auth.postal_code')}
                          </p>
                          <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                            {professional.address.postalCode}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                            {t('auth.city')}
                          </p>
                          <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                            {professional.address.city}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                            {t('auth.country')}
                          </p>
                          <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                            {professional.address.country || 'France'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Actions */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-md border overflow-hidden sticky top-6 ${effectiveDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className={`px-6 py-4 border-b ${effectiveDarkTheme ? 'bg-gray-700/50 border-gray-700' : 'bg-[#F3F4F6] border-gray-200'}`}>
                <h3 className={`text-[16px] font-bold ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('admin.approval_section')}
                </h3>
              </div>

              <div className="p-6">
                {/* Affichage du statut actuel */}
                {(isApproved || isRejected) && (
                  <div className={`mb-6 p-4 rounded-lg border ${effectiveDarkTheme ? 'bg-gray-700/40 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('admin.approval_status')}
                    </p>
                    <p className="text-[14px] font-semibold">
                      {isApproved ? (
                        <span className={effectiveDarkTheme ? 'text-green-400' : 'text-green-700'}>{t('admin.approved')}</span>
                      ) : (
                        <span className={effectiveDarkTheme ? 'text-red-400' : 'text-red-700'}>{t('admin.rejected')}</span>
                      )}
                    </p>
                    {isRejected && professional.rejectionReason && (
                      <div className={`mt-3 pt-3 border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                        <p className={`text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                          {t('admin.rejection_reason')}
                        </p>
                        <p className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                          {professional.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Formulaire de refus si en attente */}
                {!isApproved && !isRejected && showRejectModal && (
                  <div className={`mb-6 p-4 rounded-lg border-2 ${effectiveDarkTheme ? 'border-red-500/40 bg-red-950/30' : 'border-red-200 bg-red-50'}`}>
                    <label className={`block text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {t('admin.rejection_reason')}
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={t('admin.rejection_reason_placeholder')}
                      className={`w-full px-3 py-2 text-[13px] border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${effectiveDarkTheme ? 'border-gray-600 bg-gray-900 text-gray-100 placeholder:text-gray-500' : 'border-gray-300 bg-white text-gray-900'}`}
                      rows="4"
                    />
                  </div>
                )}

                {!isApproved && !isRejected && showApproveConfirm && (
                  <div className={`mb-6 p-4 rounded-lg border-2 ${effectiveDarkTheme ? 'border-green-500/40 bg-green-950/30' : 'border-green-200 bg-green-50'}`}>
                    <p className={`text-[13px] font-medium mb-3 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {t('admin.approve_confirmation')}
                    </p>
                    <div className="space-y-2">
                      <Button variant="success" onClick={handleApprove} disabled={isProcessing} loading={isProcessing} loadingLabel={t('admin.approving')} className="w-full py-2 text-[13px]">
                        {t('admin.approve_button')}
                      </Button>
                      <Button variant="secondary" onClick={() => setShowApproveConfirm(false)} disabled={isProcessing} className="w-full py-2 text-[13px]">
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="space-y-2">
                  {!isApproved && !isRejected && (
                    <>
                      {!showRejectModal && !showApproveConfirm && (
                        <Button variant="success" onClick={() => { setShowApproveConfirm(true); setShowRejectModal(false); }} disabled={isProcessing} className="w-full py-2 text-[13px]">
                          <CheckCircle size={16} />
                          {t('admin.approve_button')}
                        </Button>
                      )}

                      {!showRejectModal && !showApproveConfirm ? (
                        <Button variant="danger" onClick={() => { setShowRejectModal(true); setShowApproveConfirm(false); }} disabled={isProcessing} className="w-full py-2 text-[13px]">
                          <AlertCircle size={16} />
                          {t('admin.reject_button')}
                        </Button>
                      ) : showRejectModal ? (
                        <>
                          <Button variant="danger" onClick={handleRejectSubmit} disabled={isProcessing || !rejectionReason.trim()} loading={isProcessing} loadingLabel={t('admin.rejecting')} className="w-full py-2 text-[13px]">
                            {t('admin.reject_button')}
                          </Button>
                          <Button variant="secondary" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} disabled={isProcessing} className="w-full py-2 text-[13px]">
                            {t('common.cancel')}
                          </Button>
                        </>
                      ) : null}
                    </>
                  )}
                </div>

                {(isApproved || isRejected) && (
                  <Button onClick={() => navigate('/admin/professionals')} className="w-full py-2 text-[13px]">
                    <ArrowLeft size={16} />
                    {t('admin.back_to_list')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfessionalDetails;
