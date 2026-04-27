import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
import Toast from '../common/Toast';
import PendingClockIcon from '../../assets/images/icons/Clock-orange.svg';
import UserIcon from '../../assets/images/icons/User-black.svg';
import CalendarIcon from '../../assets/images/icons/Calendar.svg';
import EmailIcon from '../../assets/images/icons/Email.svg';
import DepartmentIcon from '../../assets/images/icons/Department.svg';
import LocationIcon from '../../assets/images/icons/Location.svg';
import DoneIcon from '../../assets/images/icons/Done.svg';
import WhiteCrossIcon from '../../assets/images/icons/white-close.svg';
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminLaundryDetails = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.admin_laundry_details', t);

  const [laundry, setLaundry] = useState(null);
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
      fetchLaundryDetails();
    };
    checkAdmin();
  }, [t, id]);

  const fetchLaundryDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getLaundryDetails(id);
      setLaundry(response.data || response);
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
        await adminService.approveLaundry(id);
        setToastMessage(t('admin.approval_success'));
        setToastType('success');
        setTimeout(() => navigate('/admin/laundries'), 1500);
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
        await adminService.rejectLaundry(id, rejectionReason);
        setToastMessage(t('admin.rejection_success'));
        setToastType('success');
        setTimeout(() => navigate('/admin/laundries'), 1500);
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

  const resolveMediaUrl = (location) => {
    if (!location || typeof location !== 'string') {
      return '';
    }

    try {
      const absoluteUrl = new URL(location);
      return absoluteUrl.toString();
    } catch {
      const normalizedPath = location.startsWith('/') ? location : `/${location}`;
      return `${API_BASE_URL}${normalizedPath}`;
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const dayLabelByKey = {
    monday: t('professional.laundry_form.monday'),
    tuesday: t('professional.laundry_form.tuesday'),
    wednesday: t('professional.laundry_form.wednesday'),
    thursday: t('professional.laundry_form.thursday'),
    friday: t('professional.laundry_form.friday'),
    saturday: t('professional.laundry_form.saturday'),
    sunday: t('professional.laundry_form.sunday'),
  };

  if (!user) return null;

  if (!loading && user.type !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">{t('errors.admin_access_required')}</p>
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

  if (!laundry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-8 rounded-lg border-2 border-red-500 bg-red-50">
          <p className="text-red-600 font-semibold">{t('errors.generic_error')}</p>
        </div>
      </div>
    );
  }

  const isApproved = laundry.status === 'approved' || laundry.status === 'validated';
  const isRejected = laundry.status === 'rejected';
  const isAddressPending = laundry.address?.geolocalizationStatus === 'pending';
  const isRejectFlowActive = showRejectModal || rejectionReason.trim().length > 0;
  const laundryLocation = laundry.address
    ? `${laundry.address.street}, ${laundry.address.postalCode} ${laundry.address.city}`
    : '-';

  const owner = laundry.professional?.user || {};
  const logoUrl = resolveMediaUrl(laundry.logo?.location);
  const medias = Array.isArray(laundry.medias) ? laundry.medias : [];
  const openingHours = Array.isArray(laundry.openingHours) ? laundry.openingHours : [];
  const exceptionalClosures = Array.isArray(laundry.exceptionalClosures) ? laundry.exceptionalClosures : [];

  return (
    <div className="min-h-screen max-w-6xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white py-6">
      <Toast message={toastMessage} type={toastType} />

      <h1 className="text-[20px] mb-4 font-bold text-left text-[#3B82F6] leading-tight">
        {t('page_titles.admin_laundry_details')}
      </h1>

      <div className="mt-4 rounded-lg border-l-2 border-l-[#F59E0B] px-4 py-3 shadow-md shadow-gray-200/70 bg-white">
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          <aside className="order-2 lg:order-1 lg:w-60 lg:shrink-0 lg:border-l lg:border-gray-200 lg:pl-6">
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
                {isRejected && laundry.rejectionReason && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-2">
                      {t('admin.rejection_reason')}
                    </p>
                    <p className="text-[13px] text-[#111827]">{laundry.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {!isApproved && !isRejected && showRejectModal && (
              <div className="mb-6 p-4 flex flex-col gap-[15px] rounded-lg">
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-extrabold text-[#374151]">
                    {t('admin.rejection_reason')}
                  </label>
                  <p className="font-regular text-[12px] text-[#6B7280]">
                    {t('admin.rejection_reason_helper_laundry')}
                  </p>
                </div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('admin.rejection_reason_placeholder')}
                  className="w-full px-3 py-2 text-[9px] font-regular border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>
            )}

            <div className="flex justify-center gap-1.5">
              {!isApproved && !isRejected && (
                <>
                  {!isRejectFlowActive && (
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-[147px] h-9 bg-[#10B981] hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <img src={DoneIcon} alt="" className="w-[15px] h-[15px]" />
                      {isProcessing ? t('admin.approving') : t('admin.approve_button')}
                    </button>
                  )}

                  {!isRejectFlowActive ? (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessing}
                      className="w-[147px] h-9 bg-[#EF4444] hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <img src={WhiteCrossIcon} alt="" className="w-[15px] h-[15px]" />
                      {t('admin.reject_button')}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleRejectSubmit}
                        disabled={isProcessing || !rejectionReason.trim()}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <img src={WhiteCrossIcon} alt="" className="w-[15px] h-[15px]" />
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

            {(isApproved || isRejected) && (
              <button
                onClick={() => navigate('/admin/laundries')}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('admin.back_to_list')}
              </button>
            )}
          </aside>

          <div className="order-1 lg:order-2 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[16px] font-bold text-[#111827]">
                {laundry.establishmentName || '-'}
              </p>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                  isApproved
                    ? 'bg-green-100 text-green-800'
                    : isRejected
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#F59E0B]/9 border border-[#F59E0B]/14 text-[#F59E0B]'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {!isApproved && !isRejected && (
                    <img src={PendingClockIcon} alt="" className="h-3 w-3" />
                  )}
                  {isApproved ? t('admin.approved') : isRejected ? t('admin.rejected') : t('admin.pending')}
                </span>
              </span>
            </div>

            <p className="flex text-[12px] items-center">
              <img src={CalendarIcon} alt="Calendar Icon" className="inline-block w-[13px] h-[13px] mr-1" />
              {t('admin.request_date')} {formatDate(laundry.createdAt)}
            </p>

            <div className="text-left mt-3">
              <h3 className="font-extrabold text-[12px] text-[#374151]">{t('admin.laundry_section')}</h3>
              <p className="text-[14px] text-[#111827] break-all">
                <img src={EmailIcon} alt="Email Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                {laundry.contactEmail || owner.email || '-'}
              </p>
              <p className={`text-[12px] mt-1 ${isAddressPending ? 'text-red-600 font-semibold' : 'text-[#111827]'}`}>
                <img src={LocationIcon} alt="Location Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                {laundryLocation}
              </p>
              {isAddressPending && (
                <p className="text-[11px] text-red-600 mt-1 ml-[18px]">
                  {t('admin.address_geolocation_pending')}
                </p>
              )}
              <p className="text-[12px] text-[#111827] mt-1">
                {laundry.description || '-'}
              </p>
            </div>

            <div className="text-left mt-4">
              <h3 className="font-extrabold text-[12px] text-[#374151]">{t('admin.logo_and_photos')}</h3>

              <div className="mt-2">
                <p className="text-[12px] font-semibold text-[#6B7280]">{t('admin.logo')}</p>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={t('admin.logo')}
                    className="mt-1 h-20 w-20 rounded-md border border-gray-200 object-cover"
                  />
                ) : (
                  <p className="text-[12px] text-[#111827]">-</p>
                )}
              </div>

              <div className="mt-3">
                <p className="text-[12px] font-semibold text-[#6B7280]">{t('admin.photos')}</p>
                {medias.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {medias.map((media, index) => {
                      const mediaUrl = resolveMediaUrl(media.location);
                      if (!mediaUrl) return null;

                      return (
                        <img
                          key={`${media.id || 'media'}-${index}`}
                          src={mediaUrl}
                          alt={media.description || `${t('admin.photos')} ${index + 1}`}
                          className="h-24 w-full rounded-md border border-gray-200 object-cover"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#111827]">-</p>
                )}
              </div>
            </div>

            <div className="text-left mt-4">
              <h3 className="font-extrabold text-[12px] text-[#374151]">{t('admin.hours_and_closures')}</h3>

              <div className="mt-2">
                <p className="text-[12px] font-semibold text-[#6B7280]">{t('admin.weekly_opening_hours')}</p>
                {openingHours.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {openingHours.map((slot, index) => (
                      <p key={`${slot.day}-${slot.startTime}-${slot.endTime}-${index}`} className="text-[12px] text-[#111827]">
                        {(dayLabelByKey[slot.day] || slot.day)} : {slot.startTime} - {slot.endTime}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#111827]">-</p>
                )}
              </div>

              <div className="mt-3">
                <p className="text-[12px] font-semibold text-[#6B7280]">{t('admin.exceptional_closures')}</p>
                {exceptionalClosures.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {exceptionalClosures.map((closure, index) => (
                      <p key={`${closure.startDate}-${closure.endDate}-${index}`} className="text-[12px] text-[#111827]">
                        {formatDateOnly(closure.startDate)} - {formatDateOnly(closure.endDate)}
                        {closure.reason ? ` (${closure.reason})` : ''}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#111827]">-</p>
                )}
              </div>
            </div>

            <div className="text-left mt-4">
              <h3 className="font-extrabold text-[12px] text-[#374151]">{t('admin.professional_section')}</h3>
              <p>
                <img src={UserIcon} alt="User Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                {owner.firstName || '-'} {owner.lastName || ''}
              </p>
              <p className="text-[14px] text-[#111827] break-all mt-1">
                <img src={EmailIcon} alt="Email Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                {owner.email || '-'}
              </p>
              <p className="text-[12px] text-[#111827] mt-1">
                <img src={DepartmentIcon} alt="Department Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                {laundry.professional?.companyName || '-'}
              </p>
              <p className="text-[12px] text-[#111827] mt-1">
                {t('admin.siret')}: <span className="font-semibold">{laundry.professional?.siret || '-'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLaundryDetails;
