import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import Toast from '../common/Toast.jsx';
import professionalService from '../../services/professionalService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ProfessionalLaundryDetails = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('dashboard.view_sheet', t);

  const [loading, setLoading] = useState(true);
  const [laundry, setLaundry] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const loadLaundry = async () => {
      try {
        const [data, options] = await Promise.all([
          professionalService.getLaundry(id),
          professionalService.getLaundryOptions().catch(() => ({ services: [], paymentMethods: [] })),
        ]);

        setLaundry(data);
        setServiceOptions(Array.isArray(options?.services) ? options.services : []);
        setPaymentMethodOptions(Array.isArray(options?.paymentMethods) ? options.paymentMethods : []);
      } catch (error) {
        setToastType('error');
        setToastMessage(t('dashboard.laundry_load_error'));
        setTimeout(() => {
          navigate('/professional-dashboard', { replace: true });
        }, 700);
      } finally {
        setLoading(false);
      }
    };

    loadLaundry();
  }, [id, navigate, t]);

  const formatDate = (value) => {
    if (!value) {
      return '--';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return '--';
    }

    return parsedDate.toLocaleString('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') {
      return '--';
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return '--';
    }

    return `${parsed.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
  };

  const resolveMediaUrl = (location) => {
    if (!location || typeof location !== 'string') {
      return '';
    }

    try {
      const absoluteUrl = new URL(location);

      // Avoid mixed-content blocking in local HTTPS dev environments.
      if (
        typeof window !== 'undefined'
        && window.location.protocol === 'https:'
        && absoluteUrl.protocol === 'http:'
        && ['localhost', '127.0.0.1'].includes(absoluteUrl.hostname)
      ) {
        absoluteUrl.protocol = 'https:';
      }

      return absoluteUrl.toString();
    } catch {
      const normalizedPath = location.startsWith('/') ? location : `/${location}`;
      return `${API_BASE_URL}${normalizedPath}`;
    }
  };

  const getDisplayValue = (value) => {
    if (value === 0) {
      return '0';
    }

    return value || '--';
  };

  const dayDefinitions = [
    { key: 'monday', labelKey: 'professional.laundry_form.monday' },
    { key: 'tuesday', labelKey: 'professional.laundry_form.tuesday' },
    { key: 'wednesday', labelKey: 'professional.laundry_form.wednesday' },
    { key: 'thursday', labelKey: 'professional.laundry_form.thursday' },
    { key: 'friday', labelKey: 'professional.laundry_form.friday' },
    { key: 'saturday', labelKey: 'professional.laundry_form.saturday' },
    { key: 'sunday', labelKey: 'professional.laundry_form.sunday' },
  ];

  const resolveLabelsFromIds = (ids, options) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    return ids.map((id) => {
      const option = options.find((candidate) => Number(candidate.id) === Number(id));
      if (!option) {
        return `#${id}`;
      }

      return option.translationKey ? t(option.translationKey) : option.name;
    });
  };

  const serviceLabels = useMemo(
    () => resolveLabelsFromIds(laundry?.serviceIds, serviceOptions),
    [laundry?.serviceIds, serviceOptions]
  );

  const paymentMethodLabels = useMemo(
    () => resolveLabelsFromIds(laundry?.paymentMethodIds, paymentMethodOptions),
    [laundry?.paymentMethodIds, paymentMethodOptions]
  );

  const openingHoursRows = useMemo(() => {
    if (!laundry) {
      return [];
    }

    return dayDefinitions.map((day) => {
      const primarySlot = laundry.openingHours?.[day.key];
      const extraSlots = Array.isArray(laundry.openingHoursExtra?.[day.key]) ? laundry.openingHoursExtra[day.key] : [];
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
        key: day.key,
        label: t(day.labelKey),
        slots: allSlots,
      };
    });
  }, [laundry, t]);

  const mediaItems = useMemo(() => {
    if (!Array.isArray(laundry?.medias)) {
      return [];
    }

    return laundry.medias
      .map((media) => ({
        ...media,
        resolvedUrl: resolveMediaUrl(media?.location),
      }))
      .filter((media) => Boolean(media.resolvedUrl));
  }, [laundry?.medias]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <p className="text-sm font-medium text-[#3B82F6]">{t('common.loading_text', 'Chargement...')}</p>
      </div>
    );
  }

  if (!laundry) {
    return null;
  }

  const statusLabel = laundry.status === 'approved'
    ? t('dashboard.status.approved')
    : laundry.status === 'pending'
      ? t('dashboard.status.pending')
      : t('dashboard.status.rejected');

  return (
    <div className={`min-h-screen px-4 py-8 md:px-10 md:py-12 lg:px-24 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-white to-sky-50 text-gray-900'}`}>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className={`rounded-[18px] p-6 md:p-8 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl text-[#1B4965] dark:text-blue-100 lg:text-start">
                {laundry.establishmentName}
              </h1>
              <p className={`mt-2 text-sm md:text-base ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                {laundry.address?.address || `${laundry.address?.street || ''} ${laundry.address?.postalCode || ''} ${laundry.address?.city || ''}`.trim()}
              </p>
            </div>

            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${laundry.status === 'approved' ? 'bg-[#DCFCE7] text-[#008236]' : laundry.status === 'pending' ? 'bg-[#FFF7ED] text-[#C2410C]' : 'bg-red-100 text-red-700'}`}>
              {statusLabel}
            </span>
          </div>

          {laundry.status === 'pending' && (
            <p className="mt-4 rounded-xl border border-[#F59E0B]/20 bg-[#FFF7ED] px-4 py-3 text-sm text-[#C2410C]">
              {t('dashboard.pending_validation')}
            </p>
          )}
          {laundry.status === 'rejected' && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {t('dashboard.laundry_refused')}
            </p>
          )}
        </header>

        <section className={`grid gap-6 md:grid-cols-2 ${isDarkTheme ? 'text-gray-100' : 'text-slate-900'}`}>
          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.laundry_identity')}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">{t('dashboard.laundry_name')}</dt>
                <dd className="mt-1 text-base font-semibold">{laundry.establishmentName}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('dashboard.contact_phone')}</dt>
                <dd className="mt-1 text-base">{laundry.contactPhone || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('dashboard.description')}</dt>
                <dd className="mt-1 whitespace-pre-line text-base">{laundry.description || '--'}</dd>
              </div>
            </dl>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.address')}</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-slate-500">{t('auth.street')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.street || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.postal_code')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.postalCode || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.city')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.city || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('auth.country')}</dt>
                <dd className="mt-1 text-base">{laundry.address?.country || '--'}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">{t('dashboard.show_precise_address')}</dt>
                <dd className="mt-1 text-base">{laundry.showPreciseAddress ? t('common.yes') : t('common.no')}</dd>
              </div>
              {laundry.wiLineReference && (
                <div>
                  <dt className="font-medium text-slate-500">{t('dashboard.wiline_reference')}</dt>
                  <dd className="mt-1 text-base">{laundry.wiLineReference}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.services_and_equipment')}</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-500">{t('dashboard.services')}</p>
                {serviceLabels.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {serviceLabels.map((label, index) => (
                      <span
                        key={`${label}-${index}`}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkTheme ? 'bg-gray-700 text-gray-100' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-base">--</p>
                )}
              </div>

              <div>
                <p className="font-medium text-slate-500">{t('dashboard.payment_methods')}</p>
                {paymentMethodLabels.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {paymentMethodLabels.map((label, index) => (
                      <span
                        key={`${label}-${index}`}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkTheme ? 'bg-gray-700 text-gray-100' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-base">--</p>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.machines')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_6kg')}</p>
                <p className="mt-1 text-base">{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines6kg)}</p>
                <p className="mt-1 text-base">{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers6kg)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_8kg')}</p>
                <p className="mt-1 text-base">{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines8kg)}</p>
                <p className="mt-1 text-base">{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers8kg)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_10kg')}</p>
                <p className="mt-1 text-base">{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines10kg)}</p>
                <p className="mt-1 text-base">{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers10kg)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_12kg_plus')}</p>
                <p className="mt-1 text-base">{t('dashboard.washing_machines')}: {getDisplayValue(laundry.washingMachines12kgPlus)}</p>
                <p className="mt-1 text-base">{t('dashboard.dryers')}: {getDisplayValue(laundry.dryers12kgPlus)}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.pricing')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_6kg')}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice6kg)}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice6kg)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_8kg')}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice8kg)}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice8kg)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_10kg')}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice10kg)}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice10kg)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('professional.laundry_form.capacity_12kg_plus')}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.washing_price')}: {formatPrice(laundry.washingPrice12kgPlus)}</p>
                <p className="mt-1 text-base">{t('professional.laundry_form.drying_price')}: {formatPrice(laundry.dryingPrice12kgPlus)}</p>
              </div>
            </div>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg md:col-span-2 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.opening_hours')}</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {openingHoursRows.map((row) => (
                <div key={row.key} className={`rounded-xl p-3 ${isDarkTheme ? 'bg-gray-700/60' : 'bg-slate-50'}`}>
                  <p className="font-medium text-slate-500">{row.label}</p>
                  {row.slots.length > 0 ? (
                    row.slots.map((slot) => (
                      <p key={`${row.key}-${slot}`} className="mt-1 text-base">{slot}</p>
                    ))
                  ) : (
                    <p className="mt-1 text-base">{t('common.closed')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg md:col-span-2 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.media_gallery')}</h2>
            {mediaItems.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {mediaItems.map((media) => (
                  <img
                    key={media.id}
                    src={media.resolvedUrl}
                    alt={media.originalName || laundry.establishmentName}
                    className="h-28 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-base">{t('dashboard.no_media')}</p>
            )}
          </div>

          <div className={`rounded-[18px] p-6 shadow-lg md:col-span-2 ${isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-slate-200'}`}>
            <h2 className="text-lg font-semibold text-[#3B82F6]">{t('dashboard.timeline')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="font-medium text-slate-500">{t('dashboard.created_at')}</p>
                <p className="mt-1 text-base">{formatDate(laundry.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">{t('dashboard.updated_at')}</p>
                <p className="mt-1 text-base">{formatDate(laundry.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/professional-dashboard')}
                className={`rounded-full px-5 py-3 text-sm font-medium transition-colors ${isDarkTheme ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/edit-laundry/${laundry.id}`)}
                className="rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
              >
                {t('dashboard.edit')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfessionalLaundryDetails;