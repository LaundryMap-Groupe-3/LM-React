import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const AdminProfessionalDetails = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.admin_professional_details', t);
  
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [user, setUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
      setToastMessage(error.message || t('errors.fetch_error'));
      setToastType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (window.confirm(t('admin.approve_confirmation'))) {
      try {
        setIsProcessing(true);
        await adminService.approveProfessional(id);
        setToastMessage(t('admin.approval_success'));
        setToastType('success');
        // Rediriger vers la liste après succès
        setTimeout(() => navigate('/admin/professionals'), 1500);
      } catch (error) {
        setToastMessage(error.message || t('errors.generic_error'));
        setToastType('error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setToastMessage(t('admin.rejection_reason_required'));
      setToastType('error');
      return;
    }

    if (window.confirm(t('admin.reject_confirmation'))) {
      try {
        setIsProcessing(true);
        await adminService.rejectProfessional(id, rejectionReason);
        setToastMessage(t('admin.rejection_success'));
        setToastType('success');
        // Rediriger vers la liste après succès (le compte est supprimé)
        setTimeout(() => navigate('/admin/professionals'), 1500);
      } catch (error) {
        setToastMessage(error.message || t('errors.generic_error'));
        setToastType('error');
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
    return null;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">
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
    <div className="min-h-screen max-w-6xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white py-6">
      <Toast message={toastMessage} type={toastType} />
      
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/professionals')}
          className="flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] font-medium text-sm transition-colors"
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
              <div>
                <h1 className="text-[24px] font-bold text-[#111827]">
                  {professionalUser.firstName} {professionalUser.lastName}
                </h1>
                <p className="text-[14px] text-[#6B7280] mt-1">
                  {t('admin.professional_details')}
                </p>
              </div>
              <div className="flex gap-2">
                {isApproved && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-[12px] font-semibold rounded-md flex items-center gap-2 whitespace-nowrap">
                    <CheckCircle size={16} />
                    {t('admin.approved')}
                  </span>
                )}
                {isRejected && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-[12px] font-semibold rounded-md flex items-center gap-2 whitespace-nowrap">
                    <AlertCircle size={16} />
                    {t('admin.rejected')}
                  </span>
                )}
                {!isApproved && !isRejected && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[12px] font-semibold rounded-md flex items-center gap-2 whitespace-nowrap">
                    {t('admin.pending')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toutes les informations regroupées */}
          <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white">
            <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold text-[#111827]">
                {t('admin.personal_information')}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Informations personnelles */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.first_name')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {professionalUser.firstName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.last_name')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {professionalUser.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.email')}
                    </p>
                    <p className="text-[14px] text-[#111827] break-all">
                      {professionalUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('admin.registration_date')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {formatDate(professionalUser.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Séparateur */}
              <div className="border-t border-gray-200"></div>

              {/* Informations professionnelles */}
              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('admin.professional_information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.company_name')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {professional.companyName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.siret')}
                    </p>
                    <p className="text-[14px] text-[#111827] font-mono">
                      {professional.siret}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.phone')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {professional.phone || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adresse professionnelle */}
              {professional.address && (
                <>
                  <div className="border-t border-gray-200"></div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                      {t('auth.professional_address')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                          {t('auth.street')}
                        </p>
                        <p className="text-[14px] text-[#111827]">
                          {professional.address.street}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                          {t('auth.postal_code')}
                        </p>
                        <p className="text-[14px] text-[#111827]">
                          {professional.address.postalCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                          {t('auth.city')}
                        </p>
                        <p className="text-[14px] text-[#111827]">
                          {professional.address.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                          {t('auth.country')}
                        </p>
                        <p className="text-[14px] text-[#111827]">
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
          <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white sticky top-6">
            <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
              <h3 className="text-[16px] font-bold text-[#111827]">
                {t('admin.approval_section')}
              </h3>
            </div>
            
            <div className="p-6">
              {/* Affichage du statut actuel */}
              {(isApproved || isRejected) && (
                <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-2">
                    {t('admin.approval_status')}
                  </p>
                  <p className="text-[14px] font-semibold">
                    {isApproved ? (
                      <span className="text-green-700">{t('admin.approved')}</span>
                    ) : (
                      <span className="text-red-700">{t('admin.rejected')}</span>
                    )}
                  </p>
                  {isRejected && professional.rejectionReason && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-2">
                        {t('admin.rejection_reason')}
                      </p>
                      <p className="text-[13px] text-[#111827]">
                        {professional.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Formulaire de refus si en attente */}
              {!isApproved && !isRejected && showRejectModal && (
                <div className="mb-6 p-4 rounded-lg border-2 border-red-200 bg-red-50">
                  <label className="block text-[12px] font-semibold text-[#111827] uppercase mb-2">
                    {t('admin.rejection_reason')}
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t('admin.rejection_reason_placeholder')}
                    className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>
              )}

              {/* Boutons d'action */}
              <div className="space-y-2">
                {!isApproved && !isRejected && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      {isProcessing ? t('admin.approving') : t('admin.approve_button')}
                    </button>

                    {!showRejectModal ? (
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={isProcessing}
                        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <AlertCircle size={16} />
                        {t('admin.reject_button')}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleRejectSubmit}
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200"
                        >
                          {isProcessing ? t('admin.rejecting') : t('admin.reject_button')}
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectModal(false);
                            setRejectionReason('');
                          }}
                          disabled={isProcessing}
                          className="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200"
                        >
                          {t('common.cancel')}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Bouton retour si déjà validé */}
              {(isApproved || isRejected) && (
                <button
                  onClick={() => navigate('/admin/professionals')}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  {t('admin.back_to_list')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfessionalDetails;
