import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import { usePreferences } from '../../context/PreferencesContext';
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
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminLaundryDetails = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkTheme: preferenceDarkTheme } = usePreferences();
  const effectiveDarkTheme = preferenceDarkTheme ?? isDarkTheme;
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

  const formatCapacity = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return '-';
    return `${parsed} kg`;
  };

  const formatDuration = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return '-';
    return `${parsed} min`;
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
          <p className={`font-semibold ${effectiveDarkTheme ? 'text-red-400' : 'text-red-600'}`}>{t('errors.admin_access_required')}</p>
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

  if (!laundry) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${effectiveDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
        <div className={`p-8 rounded-lg border-2 ${effectiveDarkTheme ? 'border-red-500/60 bg-red-950/40' : 'border-red-500 bg-red-50'}`}>
          <p className={`font-semibold ${effectiveDarkTheme ? 'text-red-400' : 'text-red-600'}`}>{t('errors.generic_error')}</p>
        </div>
      </div>
    );
  }

  const isApproved = laundry.status === 'approved' || laundry.status === 'validated';
  const isRejected = laundry.status === 'rejected';
  const isAddressPending = laundry.address?.geolocalizationStatus === 'pending';
  const isRejectFlowActive = showRejectModal || rejectionReason.trim().length > 0;
  const laundryLocation = laundry.address
    ? `${laundry.address.street}, ${laundry.address.postalCode} ${laundry.address.city}`.trim()
    : '-';

  const owner = laundry.professional?.user || {};
  const logoUrl = resolveMediaUrl(laundry.logo?.location);
  const medias = Array.isArray(laundry.medias) ? laundry.medias : [];
  const openingHours = Array.isArray(laundry.openingHours) ? laundry.openingHours : [];
  const exceptionalClosures = Array.isArray(laundry.exceptionalClosures) ? laundry.exceptionalClosures : [];
  const serviceLabels = resolveLabelsFromIds(laundry.services || laundry.serviceIds);
  const paymentLabels = resolveLabelsFromIds(laundry.paymentMethods || laundry.paymentMethodIds);
  const equipmentItems = Array.isArray(laundry.equipments) ? laundry.equipments : [];

  const equipmentTypeOrder = {
    washing_machine: 1,
    dryer: 2,
    ironing_machine: 3,
    vacuum: 4,
    other: 5,
  };

  const equipmentTypeLabels = {
    washing_machine: t('admin.equipment_type_washing_machine'),
    dryer: t('admin.equipment_type_dryer'),
    ironing_machine: t('admin.equipment_type_ironing_machine'),
    vacuum: t('admin.equipment_type_vacuum'),
    other: t('admin.equipment_type_other'),
  };

  const sortedEquipmentItems = [...equipmentItems].sort((a, b) => {
    const orderA = equipmentTypeOrder[a?.type] ?? 99;
    const orderB = equipmentTypeOrder[b?.type] ?? 99;
    if (orderA !== orderB) return orderA - orderB;

    const capacityA = Number(a?.capacity) || 0;
    const capacityB = Number(b?.capacity) || 0;
    if (capacityA !== capacityB) return capacityA - capacityB;

    return String(a?.name || '').localeCompare(String(b?.name || ''), 'fr');
  });

  const washingMachineItems = sortedEquipmentItems.filter((equipment) => equipment?.type === 'washing_machine');
  const dryerItems = sortedEquipmentItems.filter((equipment) => equipment?.type === 'dryer');

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
    <div className={`min-h-screen ${effectiveDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/laundries')}
          className={`flex items-center gap-2 font-medium text-sm transition-colors ${effectiveDarkTheme ? 'text-blue-300 hover:text-blue-200' : 'text-[#3B82F6] hover:text-[#2563EB]'}`}
        >
          <ArrowLeft size={20} />
          {t('admin.back_to_list')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className={`text-[24px] font-bold ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                {laundry.establishmentName || '-'}
              </h1>
              <div className="flex gap-2">
                {isApproved && <StatusBadge status="approved" label={t('admin.approved')} darkTheme={effectiveDarkTheme} />}
                {isRejected && <StatusBadge status="rejected" label={t('admin.rejected')} darkTheme={effectiveDarkTheme} />}
                {!isApproved && !isRejected && (
                  <StatusBadge status="pending" label={t('admin.pending')} icon={<img src={PendingClockIcon} alt="" className="h-3 w-3" />} darkTheme={effectiveDarkTheme} />
                )}
              </div>
            </div>
            <p className={`flex text-[12px] items-center mt-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-gray-700'}`}>
              <img src={CalendarIcon} alt="Calendar Icon" className={`inline-block w-[13px] h-[13px] mr-1 ${effectiveDarkTheme ? 'brightness-0 invert' : ''}`} />
              {t('admin.request_date')} {formatDate(laundry.createdAt)}
            </p>
          </div>

          <div className={`rounded-lg shadow-md border overflow-hidden ${effectiveDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className={`px-6 py-4 border-b ${effectiveDarkTheme ? 'bg-gray-700/50 border-gray-700' : 'bg-[#F3F4F6] border-gray-200'}`}>
              <h2 className={`text-[16px] font-bold ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                {t('admin.laundry_section')}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('auth.email')}
                    </p>
                    <p className={`text-[14px] break-all ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {laundry.contactEmail || owner.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('dashboard.contact_phone')}
                    </p>
                    <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {laundry.contactPhone || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('dashboard.description')}
                    </p>
                    <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {laundry.description || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('dashboard.address')}
                    </p>
                    <p className={`text-[14px] ${isAddressPending ? (effectiveDarkTheme ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold') : (effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]')}`}>
                      <img src={LocationIcon} alt="Location Icon" className={`inline-block w-[13px] h-[13px] mr-1 ${effectiveDarkTheme ? 'brightness-0 invert' : ''}`} />
                      {laundryLocation}
                    </p>
                    {isAddressPending && (
                      <p className={`text-[12px] mt-1 ml-[18px] ${effectiveDarkTheme ? 'text-red-400' : 'text-red-600'}`}>
                        {t('admin.address_geolocation_pending')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

              <div>
                <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('admin.logo_and_photos')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('admin.logo')}
                    </p>
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={t('admin.logo')}
                        className={`mt-1 h-20 w-20 rounded-md border object-cover mx-auto block ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}
                      />
                    ) : (
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>-</p>
                    )}
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
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
                              className={`h-24 w-full rounded-md border object-cover ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

              <div>
                <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('dashboard.services_and_equipment')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('dashboard.services')}
                    </p>
                    {serviceLabels.length > 0 ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {serviceLabels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className={`w-fit self-center rounded-md px-2.5 py-1 text-[11px] ${effectiveDarkTheme ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-[#111827]'}`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>-</p>
                    )}
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                      {t('dashboard.payment_methods')}
                    </p>
                    {paymentLabels.length > 0 ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {paymentLabels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className={`w-fit self-center rounded-md px-2.5 py-1 text-[11px] ${effectiveDarkTheme ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-[#111827]'}`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>-</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

              <div>
                <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('dashboard.machines')}
                </h3>
                {sortedEquipmentItems.length > 0 ? (
                  <div className="mt-3 space-y-6">
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('admin.equipment_type_washing_machine')}
                      </p>
                      {washingMachineItems.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className={`min-w-[520px] mx-auto text-center text-[12px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                            <thead className={`text-[11px] uppercase ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                              <tr className={`border-b ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_name')}</th>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_capacity')}</th>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_price')}</th>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_duration')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {washingMachineItems.map((equipment, index) => (
                                <tr
                                  key={equipment?.id ?? `${equipment?.name || 'equipment'}-${index}`}
                                  className={`border-b last:border-b-0 ${effectiveDarkTheme ? 'border-gray-700/60' : 'border-gray-100'}`}
                                >
                                  <td className="py-2 px-3">{equipment?.name || '-'}</td>
                                  <td className="py-2 px-3">{formatCapacity(equipment?.capacity)}</td>
                                  <td className="py-2 px-3">{formatPrice(equipment?.price)}</td>
                                  <td className="py-2 px-3">{formatDuration(equipment?.duration)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>{t('admin.no_equipments')}</p>
                      )}
                    </div>
                    <div>
                      <p className={`text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('admin.equipment_type_dryer')}
                      </p>
                      {dryerItems.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className={`min-w-[520px] mx-auto text-center text-[12px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                            <thead className={`text-[11px] uppercase ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                              <tr className={`border-b ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_name')}</th>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_capacity')}</th>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_price')}</th>
                                <th className="py-2 px-3 font-semibold">{t('admin.equipment_duration')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dryerItems.map((equipment, index) => (
                                <tr
                                  key={equipment?.id ?? `${equipment?.name || 'equipment'}-${index}`}
                                  className={`border-b last:border-b-0 ${effectiveDarkTheme ? 'border-gray-700/60' : 'border-gray-100'}`}
                                >
                                  <td className="py-2 px-3">{equipment?.name || '-'}</td>
                                  <td className="py-2 px-3">{formatCapacity(equipment?.capacity)}</td>
                                  <td className="py-2 px-3">{formatPrice(equipment?.price)}</td>
                                  <td className="py-2 px-3">{formatDuration(equipment?.duration)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>{t('admin.no_equipments')}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>{t('admin.no_equipments')}</p>
                )}
              </div>

              <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

              <div>
                <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('dashboard.opening_hours')}
                </h3>
                {openingHoursRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className={`min-w-full text-[13px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      <thead className={`text-[11px] uppercase ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        <tr className={`border-b ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className="py-2 px-3 text-center font-semibold">{t('common.day')}</th>
                          <th className="py-2 px-3 text-center font-semibold">{t('professional.laundry_form.opening_hours')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openingHoursRows.map((row) => (
                          <tr key={row.key} className={`border-b last:border-b-0 ${effectiveDarkTheme ? 'border-gray-700/60' : 'border-gray-100'}`}>
                            <td className="py-2 px-3 font-medium capitalize">{row.label}</td>
                            <td className="py-2 px-3">
                              {row.slots.length > 0 ? (
                                <span className="flex flex-col gap-1">
                                  {row.slots.map((slot, i) => (
                                    <span key={i}>{slot}</span>
                                  ))}
                                </span>
                              ) : (
                                <span className={effectiveDarkTheme ? 'text-gray-400' : 'text-gray-500'}>{t('common.closed')}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : openingHours.length > 0 ? (
                  <ul className="space-y-1">
                    {openingHours.map((entry, index) => (
                      <li key={index} className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                        {entry}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>-</p>
                )}
              </div>

              {exceptionalClosures.length > 0 && (
                <>
                  <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>
                  <div>
                    <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {t('admin.exceptional_closures')}
                    </h3>
                    <ul className="space-y-1">
                      {exceptionalClosures.map((closure, index) => (
                        <li
                          key={index}
                          className={`text-[13px] px-3 py-2 rounded-md ${effectiveDarkTheme ? 'bg-gray-700/50 text-gray-100' : 'bg-gray-50 text-[#111827]'}`}
                        >
                          {closure.date ? formatDateOnly(closure.date) : '-'}
                          {closure.label ? ` — ${closure.label}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

              <div>
                <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('admin.professional_section')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('auth.first_name')}</p>
                    <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      <img src={UserIcon} alt="User Icon" className={`inline-block w-[13px] h-[13px] mr-1 ${effectiveDarkTheme ? 'brightness-0 invert' : ''}`} />
                      {owner.firstName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('auth.last_name')}</p>
                    <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {owner.lastName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('auth.email')}</p>
                    <p className={`text-[14px] break-all ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      <img src={EmailIcon} alt="Email Icon" className={`inline-block w-[13px] h-[13px] mr-1 ${effectiveDarkTheme ? 'brightness-0 invert' : ''}`} />
                      {owner.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('auth.company_name')}</p>
                    <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      <img src={DepartmentIcon} alt="Department Icon" className={`inline-block w-[13px] h-[13px] mr-1 ${effectiveDarkTheme ? 'brightness-0 invert' : ''}`} />
                      {laundry.professional?.companyName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('admin.siren')}</p>
                    <p className={`text-[14px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                      {laundry.professional?.siren || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}></div>

              <div>
                <h3 className={`text-[14px] font-semibold mb-4 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  {t('dashboard.timeline')}
                </h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('dashboard.created_at')}</p>
                    <p>{formatDate(laundry.createdAt)}</p>
                  </div>
                  <div>
                    <p className={`text-[12px] font-semibold uppercase mb-1 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>{t('dashboard.updated_at')}</p>
                    <p>{formatDate(laundry.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className={`rounded-lg shadow-md border overflow-hidden sticky top-6 ${effectiveDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className={`px-6 py-4 border-b ${effectiveDarkTheme ? 'bg-gray-700/50 border-gray-700' : 'bg-[#F3F4F6] border-gray-200'}`}>
              <h3 className={`text-[16px] font-bold ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                {t('admin.approval_section')}
              </h3>
            </div>

            <div className="p-6">
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
                  {isRejected && laundry.rejectionReason && (
                    <div className={`mt-3 pt-3 border-t ${effectiveDarkTheme ? 'border-gray-700' : 'border-gray-300'}`}>
                      <p className={`text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                        {t('admin.rejection_reason')}
                      </p>
                      <p className={`text-[13px] ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>{laundry.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}

              {!isApproved && !isRejected && showRejectModal && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${effectiveDarkTheme ? 'border-red-500/40 bg-red-950/30' : 'border-red-200 bg-red-50'}`}>
                  <label className={`block text-[12px] font-semibold uppercase mb-2 ${effectiveDarkTheme ? 'text-gray-100' : 'text-[#111827]'}`}>
                    {t('admin.rejection_reason')}
                  </label>
                  <p className={`text-[12px] mb-2 ${effectiveDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'}`}>
                    {t('admin.rejection_reason_helper_laundry')}
                  </p>
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

              <div className="space-y-2">
                {!isApproved && !isRejected && (
                  <>
                    {!showRejectModal && !showApproveConfirm && (
                      <Button variant="success" onClick={() => { setShowApproveConfirm(true); setShowRejectModal(false); }} disabled={isProcessing} className="w-full py-2 text-[13px]">
                        <img src={DoneIcon} alt="" className="w-[15px] h-[15px]" />
                        {t('admin.approve_button')}
                      </Button>
                    )}

                    {!showRejectModal && !showApproveConfirm ? (
                      <Button variant="danger" onClick={() => { setShowRejectModal(true); setShowApproveConfirm(false); }} disabled={isProcessing} className="w-full py-2 text-[13px]">
                        <img src={WhiteCrossIcon} alt="" className="w-[15px] h-[15px]" />
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
                <Button onClick={() => navigate('/admin/laundries')} className="w-full py-2 text-[13px]">
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

export default AdminLaundryDetails;
