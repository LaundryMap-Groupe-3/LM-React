import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import adminService from '../../services/adminService';
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await adminService.approveLaundry(id);
      setShowApproveConfirm(false);
      setTimeout(() => navigate('/admin/laundries'), 1500);
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

    try {
      setIsProcessing(true);
      await adminService.rejectLaundry(id, rejectionReason);
      setTimeout(() => navigate('/admin/laundries'), 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
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

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return '-';
    return `${parsed.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
  };

  const getDisplayValue = (value) => {
    if (value === 0) return '0';
    return value || '-';
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

  const normalizeArray = (value) => (Array.isArray(value) ? value : []);

  const resolveLabelsFromIds = (items) => {
    const list = normalizeArray(items);
    if (list.length === 0) return [];

    return list.map((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return `#${item}`;
      }

      if (item?.translationKey) {
        return t(item.translationKey);
      }

      return item?.name || item?.label || item?.title || '-';
    });
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
  const serviceLabels = resolveLabelsFromIds(laundry.services || laundry.serviceIds);
  const paymentLabels = resolveLabelsFromIds(laundry.paymentMethods || laundry.paymentMethodIds);

  const openingHoursByDay = !Array.isArray(laundry.openingHours) && laundry.openingHours
    ? laundry.openingHours
    : null;

  const openingHoursRows = openingHoursByDay
    ? Object.keys(dayLabelByKey).map((day) => {
        const primarySlot = openingHoursByDay?.[day];
        const extraSlots = Array.isArray(laundry.openingHoursExtra?.[day]) ? laundry.openingHoursExtra[day] : [];
        const allSlots = [];

        if (primarySlot?.open && primarySlot?.close) {
          allSlots.push(`${primarySlot.open} - ${primarySlot.close}`);
        }

        extraSlots.forEach((slot) => {
          if (slot?.open && slot?.close) {
            allSlots.push(`${slot.open} - ${slot.close}`);
          }
        });

        return {
          key: day,
          label: dayLabelByKey[day] || day,
          slots: allSlots,
        };
      })
    : [];

  return (
    <div className="min-h-screen max-w-6xl mx-auto md:pl-auto pl-4 md:pr-auto pr-4 bg-white py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/laundries')}
          className="flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] font-medium text-sm transition-colors"
        >
          <ArrowLeft size={20} />
          {t('admin.back_to_list')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[24px] font-bold text-[#111827]">
                {laundry.establishmentName || '-'}
              </h1>
              <div className="flex gap-2">
                {isApproved && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-[12px] font-semibold rounded-md flex items-center gap-2 whitespace-nowrap">
                    {t('admin.approved')}
                  </span>
                )}
                {isRejected && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-[12px] font-semibold rounded-md flex items-center gap-2 whitespace-nowrap">
                    {t('admin.rejected')}
                  </span>
                )}
                {!isApproved && !isRejected && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[12px] font-semibold rounded-md flex items-center gap-2 whitespace-nowrap">
                    <img src={PendingClockIcon} alt="" className="h-3 w-3" />
                    {t('admin.pending')}
                  </span>
                )}
              </div>
            </div>
            <p className="flex text-[12px] items-center mt-2">
              <img src={CalendarIcon} alt="Calendar Icon" className="inline-block w-[13px] h-[13px] mr-1" />
              {t('admin.request_date')} {formatDate(laundry.createdAt)}
            </p>
          </div>

          <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white">
            <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
              <h2 className="text-[16px] font-bold text-[#111827]">
                {t('admin.laundry_section')}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('auth.email')}
                    </p>
                    <p className="text-[14px] text-[#111827] break-all">
                      {laundry.contactEmail || owner.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('dashboard.contact_phone')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {laundry.contactPhone || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('dashboard.description')}
                    </p>
                    <p className="text-[14px] text-[#111827]">
                      {laundry.description || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('dashboard.address')}
                    </p>
                    <p className={`text-[14px] ${isAddressPending ? 'text-red-600 font-semibold' : 'text-[#111827]'}`}>
                      <img src={LocationIcon} alt="Location Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                      {laundryLocation}
                    </p>
                    {isAddressPending && (
                      <p className="text-[12px] text-red-600 mt-1 ml-[18px]">
                        {t('admin.address_geolocation_pending')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('admin.logo_and_photos')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('admin.logo')}
                    </p>
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={t('admin.logo')}
                        className="mt-1 h-20 w-20 rounded-md border border-gray-200 object-cover"
                      />
                    ) : (
                      <p className="text-[14px] text-[#111827]">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('admin.photos')}
                    </p>
                    {medias.length > 0 ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
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
                      <p className="text-[14px] text-[#111827]">-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('dashboard.services_and_equipment')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('dashboard.services')}
                    </p>
                    {serviceLabels.length > 0 ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {serviceLabels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className="w-fit self-center rounded-md bg-gray-100 px-2.5 py-1 text-[11px] text-[#111827]"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-[#111827]">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">
                      {t('dashboard.payment_methods')}
                    </p>
                    {paymentLabels.length > 0 ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {paymentLabels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className="w-fit self-center rounded-md bg-gray-100 px-2.5 py-1 text-[11px] text-[#111827]"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-[#111827]">-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('dashboard.machines')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#111827]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_6kg')}</p>
                    <p>{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines6kg)}</p>
                    <p>{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers6kg)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_8kg')}</p>
                    <p>{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines8kg)}</p>
                    <p>{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers8kg)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_10kg')}</p>
                    <p>{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines10kg)}</p>
                    <p>{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers10kg)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_12kg_plus')}</p>
                    <p>{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines12kgPlus)}</p>
                    <p>{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers12kgPlus)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('dashboard.pricing')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#111827]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_6kg')}</p>
                    <p>{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice6kg)}</p>
                    <p>{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice6kg)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_8kg')}</p>
                    <p>{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice8kg)}</p>
                    <p>{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice8kg)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_10kg')}</p>
                    <p>{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice10kg)}</p>
                    <p>{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice10kg)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('professional.laundry_form.capacity_12kg_plus')}</p>
                    <p>{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice12kgPlus)}</p>
                    <p>{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice12kgPlus)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('admin.professional_section')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('auth.first_name')}</p>
                    <p className="text-[14px] text-[#111827]">
                      <img src={UserIcon} alt="User Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                      {owner.firstName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('auth.last_name')}</p>
                    <p className="text-[14px] text-[#111827]">
                      {owner.lastName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('auth.email')}</p>
                    <p className="text-[14px] text-[#111827] break-all">
                      <img src={EmailIcon} alt="Email Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                      {owner.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('auth.company_name')}</p>
                    <p className="text-[14px] text-[#111827]">
                      <img src={DepartmentIcon} alt="Department Icon" className="inline-block w-[13px] h-[13px] mr-1" />
                      {laundry.professional?.companyName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('admin.siret')}</p>
                    <p className="text-[14px] text-[#111827]">
                      {laundry.professional?.siret || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#111827] mb-4">
                  {t('dashboard.timeline')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#111827]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('dashboard.created_at')}</p>
                    <p>{formatDate(laundry.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('dashboard.updated_at')}</p>
                    <p>{formatDate(laundry.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg shadow-md border border-gray-200 overflow-hidden bg-white sticky top-6">
            <div className="bg-[#F3F4F6] px-6 py-4 border-b border-gray-200">
              <h3 className="text-[16px] font-bold text-[#111827]">
                {t('admin.approval_section')}
              </h3>
            </div>

            <div className="p-6">
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
                <div className="mb-6 p-4 rounded-lg border-2 border-red-200 bg-red-50">
                  <label className="block text-[12px] font-semibold text-[#111827] uppercase mb-2">
                    {t('admin.rejection_reason')}
                  </label>
                  <p className="text-[12px] text-[#6B7280] mb-2">
                    {t('admin.rejection_reason_helper_laundry')}
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t('admin.rejection_reason_placeholder')}
                    className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>
              )}

              {!isApproved && !isRejected && showApproveConfirm && (
                <div className="mb-6 p-4 rounded-lg border-2 border-green-200 bg-green-50">
                  <p className="text-[13px] text-[#111827] font-medium mb-3">
                    {t('admin.approve_confirmation')}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200"
                    >
                      {isProcessing ? t('admin.approving') : t('admin.approve_button')}
                    </button>
                    <button
                      onClick={() => setShowApproveConfirm(false)}
                      disabled={isProcessing}
                      className="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {!isApproved && !isRejected && (
                  <>
                    {!showRejectModal && !showApproveConfirm && (
                      <button
                        onClick={() => {
                          setShowApproveConfirm(true);
                          setShowRejectModal(false);
                        }}
                        disabled={isProcessing}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <img src={DoneIcon} alt="" className="w-[15px] h-[15px]" />
                        {isProcessing ? t('admin.approving') : t('admin.approve_button')}
                      </button>
                    )}

                    {!showRejectModal && !showApproveConfirm ? (
                      <button
                        onClick={() => {
                          setShowRejectModal(true);
                          setShowApproveConfirm(false);
                        }}
                        disabled={isProcessing}
                        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <img src={WhiteCrossIcon} alt="" className="w-[15px] h-[15px]" />
                        {t('admin.reject_button')}
                      </button>
                    ) : showRejectModal ? (
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
                    ) : null}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLaundryDetails;
