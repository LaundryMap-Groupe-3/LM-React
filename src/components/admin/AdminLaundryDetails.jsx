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
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]" />
      </div>
    );
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
  const laundryLocation = laundry.address?.street
    ? `${laundry.address.street || ''}, ${laundry.address.postalCode || ''} ${laundry.address.city || ''}`.trim()
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
                {isApproved && <StatusBadge status="approved" label={t('admin.approved')} />}
                {isRejected && <StatusBadge status="rejected" label={t('admin.rejected')} />}
                {!isApproved && !isRejected && (
                  <StatusBadge status="pending" label={t('admin.pending')} icon={<img src={PendingClockIcon} alt="" className="h-3 w-3" />} />
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
                        className="mt-1 h-20 w-20 rounded-md border border-gray-200 object-cover mx-auto block"
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
                {sortedEquipmentItems.length > 0 ? (
                  <div className="mt-3 space-y-6">
                    <div>
                      <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-2">
                        {t('admin.equipment_type_washing_machine')}
                      </p>
                      {washingMachineItems.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-[520px] mx-auto text-center text-[12px] text-[#111827]">
                            <thead className="text-[11px] uppercase text-[#6B7280]">
                              <tr className="border-b border-gray-200">
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
                                  className="border-b border-gray-100 last:border-b-0"
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
                        <p className="text-[14px] text-[#111827]">{t('admin.no_equipments')}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-2">
                        {t('admin.equipment_type_dryer')}
                      </p>
                      {dryerItems.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-[520px] mx-auto text-center text-[12px] text-[#111827]">
                            <thead className="text-[11px] uppercase text-[#6B7280]">
                              <tr className="border-b border-gray-200">
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
                                  className="border-b border-gray-100 last:border-b-0"
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
                        <p className="text-[14px] text-[#111827]">{t('admin.no_equipments')}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] text-[#111827]">{t('admin.no_equipments')}</p>
                )}
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
                    <p className="text-[12px] font-semibold text-[#6B7280] uppercase mb-1">{t('admin.siren')}</p>
                    <p className="text-[14px] text-[#111827]">
                      {laundry.professional?.siren || '-'}
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
  );
};

export default AdminLaundryDetails;
