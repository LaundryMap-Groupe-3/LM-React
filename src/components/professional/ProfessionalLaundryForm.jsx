import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import professionalService from '../../services/professionalService';
import LeftArrowIcon from '../../assets/images/icons/Left-Arrow.svg';
import ArrowIcon from '../../assets/images/icons/Arrow-white.svg';
import PhoneIcon from '../../assets/images/icons/Phone.svg';
import ShopIcon from '../../assets/images/icons/Shop-blue.svg';
import UploadIcon from '../../assets/images/icons/Upload.svg';
import InfoGrayIcon from '../../assets/images/icons/Info-gray.svg';
import OpenSignIcon from '../../assets/images/icons/Open-Sign.svg';
import ServicesIcon from '../../assets/images/icons/Services.svg';
import WifiBlueIcon from '../../assets/images/icons/Wi-Fi-blue.svg';
import EuroIcon from '../../assets/images/icons/Euro.svg';
import SaveIcon from '../../assets/images/icons/Save.svg';

const EQUIPMENT_CAPACITIES = ['6kg', '8kg', '10kg', '12kg+'];

const defaultValues = {
  wiLineReference: '',
  showPreciseAddress: false,
  establishmentName: '',
  contactPhone: '',
  description: '',
  logo: null,
  mediaFiles: null,
  street: '',
  postalCode: '',
  city: '',
  country: '',
  serviceIds: [],
  paymentMethodIds: [],
  openingHours: {
    monday: { open: '', close: '' },
    tuesday: { open: '', close: '' },
    wednesday: { open: '', close: '' },
    thursday: { open: '', close: '' },
    friday: { open: '', close: '' },
    saturday: { open: '', close: '' },
    sunday: { open: '', close: '' },
  },
};

const openingHoursDays = [
  { key: 'monday', labelKey: 'professional.laundry_form.monday', fallbackLabel: 'Lundi' },
  { key: 'tuesday', labelKey: 'professional.laundry_form.tuesday', fallbackLabel: 'Mardi' },
  { key: 'wednesday', labelKey: 'professional.laundry_form.wednesday', fallbackLabel: 'Mercredi' },
  { key: 'thursday', labelKey: 'professional.laundry_form.thursday', fallbackLabel: 'Jeudi' },
  { key: 'friday', labelKey: 'professional.laundry_form.friday', fallbackLabel: 'Vendredi' },
  { key: 'saturday', labelKey: 'professional.laundry_form.saturday', fallbackLabel: 'Samedi' },
  { key: 'sunday', labelKey: 'professional.laundry_form.sunday', fallbackLabel: 'Dimanche' },
];

const initialClosedDays = openingHoursDays.reduce((acc, day) => { acc[day.key] = false; return acc; }, {});
const initialAdditionalSlots = openingHoursDays.reduce((acc, day) => { acc[day.key] = 0; return acc; }, {});

const STEPS = [
  { id: 1, labelKey: 'professional.laundry_form.step_info', fallback: 'Infos & WI-LINE', icon: ShopIcon },
  { id: 2, labelKey: 'professional.laundry_form.step_hours', fallback: 'Horaires', icon: OpenSignIcon },
  { id: 3, labelKey: 'professional.laundry_form.step_equipment', fallback: 'Équipements', icon: ServicesIcon },
];

const createEquipment = (type = 'washing', capacity = '6kg') => ({
  id: `eq-${Date.now()}-${Math.random()}`,
  type,
  capacity,
  price: '',
});

const equipmentFromLegacy = (laundry) => {
  const items = [];
  const capacities = ['6kg', '8kg', '10kg', '12kgPlus'];
  const capacityLabel = { '6kg': '6kg', '8kg': '8kg', '10kg': '10kg', '12kgPlus': '12kg+' };

  capacities.forEach((cap) => {
    const washCount = Number(laundry?.[`washingMachines${cap}`]) || 0;
    const washPrice = laundry?.[`washingPrice${cap}`] ?? '';
    for (let i = 0; i < washCount; i++) {
      items.push({ id: `eq-${Date.now()}-${Math.random()}`, type: 'washing', capacity: capacityLabel[cap], price: String(washPrice) });
    }
    const dryCount = Number(laundry?.[`dryers${cap}`]) || 0;
    const dryPrice = laundry?.[`dryingPrice${cap}`] ?? '';
    for (let i = 0; i < dryCount; i++) {
      items.push({ id: `eq-${Date.now()}-${Math.random()}`, type: 'drying', capacity: capacityLabel[cap], price: String(dryPrice) });
    }
  });

  return items;
};

const equipmentToPayload = (equipments) => {
  const capacityKey = { '6kg': '6kg', '8kg': '8kg', '10kg': '10kg', '12kg+': '12kgPlus' };
  const result = {
    washingMachines6kg: 0, washingMachines8kg: 0, washingMachines10kg: 0, washingMachines12kgPlus: 0,
    dryers6kg: 0, dryers8kg: 0, dryers10kg: 0, dryers12kgPlus: 0,
    washingPrice6kg: 0, washingPrice8kg: 0, washingPrice10kg: 0, washingPrice12kgPlus: 0,
    dryingPrice6kg: 0, dryingPrice8kg: 0, dryingPrice10kg: 0, dryingPrice12kgPlus: 0,
  };

  equipments.forEach((eq) => {
    const key = capacityKey[eq.capacity] || '6kg';
    const price = parseFloat(String(eq.price).replace(',', '.')) || 0;
    if (eq.type === 'washing') {
      result[`washingMachines${key}`] += 1;
      result[`washingPrice${key}`] = price;
    } else {
      result[`dryers${key}`] += 1;
      result[`dryingPrice${key}`] = price;
    }
  });

  return result;
};

const ProfessionalLaundryForm = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditMode = Boolean(id);
  usePageTitle(isEditMode ? 'page_titles.edit_laundry' : 'page_titles.create_laundry', t);

  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [closedDays, setClosedDays] = useState(initialClosedDays);
  const [additionalSlotsByDay, setAdditionalSlotsByDay] = useState(initialAdditionalSlots);
  const [loadingLaundry, setLoadingLaundry] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [currentMedias, setCurrentMedias] = useState([]);
  const [pendingMediaFiles, setPendingMediaFiles] = useState([]);
  const [wiLineLoading, setWiLineLoading] = useState(false);
  const [wiLineError, setWiLineError] = useState('');
  const [lastFetchedWiLineCode, setLastFetchedWiLineCode] = useState('');
  const [wiLineAutoFillSuccess, setWiLineAutoFillSuccess] = useState(false);
  const [equipments, setEquipments] = useState([]);

  const {
    register, handleSubmit, watch, reset, setValue,
    unregister, setError,
    formState: { errors },
  } = useForm({ mode: 'onBlur', defaultValues });

  const selectedLogo = watch('logo');
  const showPreciseAddress = watch('showPreciseAddress');
  const wiLineReference = watch('wiLineReference');

  const appendMediaFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f instanceof File);
    if (!files.length) return;
    setPendingMediaFiles((current) => {
      const sigs = new Set(current.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      return [...current, ...files.filter((f) => {
        const sig = `${f.name}-${f.size}-${f.lastModified}`;
        if (sigs.has(sig)) return false;
        sigs.add(sig);
        return true;
      })];
    });
  };

  const removePendingMediaFile = (idx) => {
    setPendingMediaFiles((current) => current.filter((_, i) => i !== idx));
  };

  const normalizeSelectedIds = (value) => {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map((i) => Number(i)).filter((i) => Number.isInteger(i) && i > 0))];
  };

  const mapLaundryToFormValues = (laundry) => ({
    ...defaultValues,
    wiLineReference: laundry?.wiLineReference?.toString?.() ?? '',
    showPreciseAddress: Boolean(laundry?.showPreciseAddress),
    establishmentName: laundry?.establishmentName ?? '',
    contactPhone: laundry?.contactPhone ?? '',
    description: laundry?.description ?? '',
    street: laundry?.address?.street ?? '',
    postalCode: laundry?.address?.postalCode?.toString?.() ?? '',
    city: laundry?.address?.city ?? '',
    country: laundry?.address?.country ?? '',
    serviceIds: Array.isArray(laundry?.serviceIds) ? laundry.serviceIds.map((i) => String(i)) : [],
    paymentMethodIds: Array.isArray(laundry?.paymentMethodIds) ? laundry.paymentMethodIds.map((i) => String(i)) : [],
    openingHours: { ...defaultValues.openingHours, ...(laundry?.openingHours ?? {}) },
    openingHoursExtra: laundry?.openingHoursExtra ?? {},
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const options = await professionalService.getLaundryOptions();
        setServiceOptions(Array.isArray(options?.services) ? options.services : []);
        setPaymentMethodOptions(Array.isArray(options?.paymentMethods) ? options.paymentMethods : []);
      } catch {
        setServiceOptions([]); setPaymentMethodOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      reset(defaultValues);
      setCurrentLogo(null); setCurrentMedias([]); setPendingMediaFiles([]); setEquipments([]);
      return;
    }
    const loadLaundry = async () => {
      setLoadingLaundry(true);
      try {
        const laundry = await professionalService.getLaundry(id);
        reset(mapLaundryToFormValues(laundry));
        setCurrentLogo(laundry?.logo ?? null);
        setCurrentMedias(Array.isArray(laundry?.medias) ? laundry.medias : []);
        setPendingMediaFiles([]);
        setEquipments(equipmentFromLegacy(laundry));

        const additionalSlots = openingHoursDays.reduce((acc, day) => {
          const slots = laundry?.openingHoursExtra?.[day.key];
          acc[day.key] = Array.isArray(slots) ? slots.length : 0;
          return acc;
        }, {});
        setAdditionalSlotsByDay(additionalSlots);

        const closed = openingHoursDays.reduce((acc, day) => {
          const oh = laundry?.openingHours?.[day.key];
          acc[day.key] = !oh?.open && !oh?.close;
          return acc;
        }, {});
        setClosedDays(closed);
      } catch {
        navigate('/professional-dashboard', { replace: true });
      } finally {
        setLoadingLaundry(false);
      }
    };
    loadLaundry();
  }, [id, isEditMode, navigate, reset]);

  useEffect(() => {
    if (!showPreciseAddress) {
      setWiLineError(''); setWiLineLoading(false); setWiLineAutoFillSuccess(false);
      return;
    }
    const clientCode = (wiLineReference || '').trim();
    if (clientCode === '') { setWiLineError(''); setWiLineAutoFillSuccess(false); return; }
    if (!/^\d+$/.test(clientCode)) {
      setWiLineError(t('validation.wiline_client_code_invalid', 'Le code client WI-LINE doit contenir uniquement des chiffres.'));
      setWiLineAutoFillSuccess(false); return;
    }
    if (clientCode === lastFetchedWiLineCode) return;

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setWiLineLoading(true); setWiLineError(''); setWiLineAutoFillSuccess(false);
      try {
        const result = await professionalService.fetchWiLineClientMachines(clientCode);
        const autoFill = result?.autoFill || {};
        const hasValidLaundry = Number.isInteger(Number(result?.laundry?.id)) && Number(result?.laundry?.id) > 0;

        if (cancelled) return;

        const capacities = ['6kg', '8kg', '10kg', '12kgPlus'];
        const capLabel = { '6kg': '6kg', '8kg': '8kg', '10kg': '10kg', '12kgPlus': '12kg+' };
        const newItems = [];
        capacities.forEach((cap) => {
          const wCount = Number(autoFill[`washingMachines${cap}`]) || 0;
          const wPrice = autoFill[`washingPrice${cap}`] ?? '';
          for (let i = 0; i < wCount; i++) newItems.push({ id: `eq-${Date.now()}-${Math.random()}`, type: 'washing', capacity: capLabel[cap], price: String(wPrice) });
          const dCount = Number(autoFill[`dryers${cap}`]) || 0;
          const dPrice = autoFill[`dryingPrice${cap}`] ?? '';
          for (let i = 0; i < dCount; i++) newItems.push({ id: `eq-${Date.now()}-${Math.random()}`, type: 'drying', capacity: capLabel[cap], price: String(dPrice) });
        });
        if (newItems.length > 0) setEquipments(newItems);

        setLastFetchedWiLineCode(clientCode);
        setWiLineAutoFillSuccess(hasValidLaundry);
        if (!hasValidLaundry) setWiLineError(t('errors.wiline_client_not_found', 'Code client WI-LINE introuvable.'));
      } catch (error) {
        if (cancelled) return;
        const backendErrorKey = error?.body?.error;
        setWiLineError(t(backendErrorKey || 'errors.wiline_fetch_failed', 'Impossible de récupérer les machines WI-LINE.'));
        setWiLineAutoFillSuccess(false);
      } finally {
        if (!cancelled) setWiLineLoading(false);
      }
    }, 600);

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [showPreciseAddress, wiLineReference, lastFetchedWiLineCode, setValue, t]);

  const onSubmit = async (values, event) => {
    const submitter = event?.nativeEvent?.submitter;
    const isFinalSave = submitter?.getAttribute('data-submit-intent') === 'final-save';
    if (currentStep !== totalSteps || !isFinalSave) return;

    setSubmitting(true); setSubmitError('');

    const equipmentPayload = equipmentToPayload(equipments);

    const payload = {
      establishmentName: values.establishmentName?.trim() || '',
      contactPhone: values.contactPhone?.trim() || '',
      description: values.description?.trim() || '',
      showPreciseAddress: Boolean(values.showPreciseAddress),
      wiLineReference: values.showPreciseAddress ? (values.wiLineReference?.trim() || null) : null,
      address: {
        street: values.street?.trim() || '',
        postalCode: values.postalCode?.trim() || '',
        city: values.city?.trim() || '',
        country: values.country?.trim() || '',
      },
      serviceIds: normalizeSelectedIds(values.serviceIds),
      paymentMethodIds: normalizeSelectedIds(values.paymentMethodIds),
      openingHours: values.openingHours || defaultValues.openingHours,
      openingHoursExtra: values.openingHoursExtra || {},
      ...equipmentPayload,
    };

    try {
      const savedLaundry = isEditMode
        ? await professionalService.updateLaundry(id, payload)
        : await professionalService.createLaundry(payload);

      const selectedLogoFile = values?.logo?.[0];
      if (selectedLogoFile instanceof File) await professionalService.uploadLaundryLogo(savedLaundry.id, selectedLogoFile);

      if (pendingMediaFiles.length > 0) await professionalService.uploadLaundryMedias(savedLaundry.id, pendingMediaFiles);

      navigate('/professional-dashboard');
    } catch (error) {
      const apiErrors = error?.body?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([field, message]) => setError(field, { type: 'server', message: t(message, message) }));
      }
      setSubmitError(t('errors.unexpected_error', 'Une erreur est survenue.'));
    } finally {
      setSubmitting(false);
    }
  };

  const goToNextStep = (event) => {
    event?.preventDefault?.(); event?.stopPropagation?.();
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const goToPreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const addOpeningSlot = (dayKey) => setAdditionalSlotsByDay((c) => ({ ...c, [dayKey]: c[dayKey] + 1 }));
  const removeOpeningSlot = (dayKey) => setAdditionalSlotsByDay((c) => {
    const newCount = Math.max(c[dayKey] - 1, 0);
    const removedIdx = c[dayKey] - 1;
    if (removedIdx >= 0) { unregister(`openingHoursExtra.${dayKey}.${removedIdx}.open`); unregister(`openingHoursExtra.${dayKey}.${removedIdx}.close`); }
    return { ...c, [dayKey]: newCount };
  });

  const handleDeleteMedia = async (mediaId) => {
    if (!isEditMode || !id || submitting) return;
    try {
      const updatedLaundry = await professionalService.deleteLaundryMedia(id, mediaId);
      setCurrentMedias(Array.isArray(updatedLaundry?.medias) ? updatedLaundry.medias : []);
      if (!updatedLaundry?.logo) setCurrentLogo(null);
    } catch {
      setSubmitError(t('errors.generic_error', 'Une erreur est survenue. Veuillez réessayer.'));
    }
  };

  const addEquipment = (type) => setEquipments((prev) => [...prev, createEquipment(type, '6kg')]);
  const removeEquipment = (eqId) => setEquipments((prev) => prev.filter((eq) => eq.id !== eqId));
  const updateEquipment = (eqId, field, value) => setEquipments((prev) => prev.map((eq) => eq.id === eqId ? { ...eq, [field]: value } : eq));

  const inputClass = (hasError) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${hasError ? 'border-red-500' : ''}`;

  const labelClass = `mb-2 block text-[12px] font-medium ${isDarkTheme ? 'text-gray-300' : 'text-[#374151]'}`;

  const washingEquipments = equipments.filter((eq) => eq.type === 'washing');
  const dryingEquipments = equipments.filter((eq) => eq.type === 'drying');

  return (
    <div className={`min-h-screen mt-5 px-4 mx-4 pb-10 ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/professional-dashboard')}
          className={`flex-shrink-0 inline-flex cursor-pointer items-center px-2 py-2 rounded-lg transition-colors ${isDarkTheme ? 'text-gray-100 hover:bg-gray-700' : 'text-slate-700 hover:bg-slate-100'}`}
        >
          <img src={LeftArrowIcon} alt="Back" className="h-[22px] w-[22px]" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-[#3B82F6]">
            {isEditMode ? t('professional.laundry_form.edit_laundry_title', 'Modifier une laverie') : t('professional.laundry_form.create_laundry_title', 'Ajouter une laverie')}
          </h1>
          <p className={`text-[11px] mt-0.5 ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
            {isEditMode ? t('professional.laundry_form.edit_laundry_subtitle', 'Mettez à jour les informations de votre établissement') : t('professional.laundry_form.create_laundry_subtitle', 'Renseignez les informations de votre établissement')}
          </p>
        </div>
      </div>

      {loadingLaundry && isEditMode && (
        <div className="mb-4 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-4 py-3 text-sm text-[#3B82F6]">
          {t('common.loading_text', 'Chargement...')}
        </div>
      )}

      {/* Step nav */}
      <div className={`mb-6 flex rounded-xl overflow-hidden border ${isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-slate-50'}`}>
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(step.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 text-[11px] font-medium transition-colors relative
                ${isActive ? 'bg-[#3B82F6] text-white' : isDone ? (isDarkTheme ? 'bg-gray-700 text-[#3B82F6]' : 'bg-white text-[#3B82F6]') : (isDarkTheme ? 'bg-gray-800 text-gray-400' : 'bg-slate-50 text-slate-400')}
                ${idx < STEPS.length - 1 ? `border-r ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}` : ''}
              `}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold leading-none
                ${isActive ? 'bg-white/20 text-white' : isDone ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : (isDarkTheme ? 'bg-gray-700 text-gray-400' : 'bg-slate-200 text-slate-500')}
              `}>
                {isDone ? '✓' : step.id}
              </div>
              <span>{t(step.labelKey, step.fallback)}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">

          {/* ───────── STEP 1 : WI-LINE & Infos ───────── */}
          {currentStep === 1 && (
            <section className="space-y-6">
              {/* WI-LINE block en premier */}
              <div className={`rounded-2xl border p-5 ${isDarkTheme ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-blue-50/40'}`}>
                <h2 className="text-[15px] flex items-center font-bold mb-4">
                  <img src={WifiBlueIcon} alt="" className="mr-2 h-[18px] w-[18px]" />
                  {t('professional.laundry_form.wi_line_connectivity', 'Connectivité WI-LINE')}
                  <span className={`ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full ${isDarkTheme ? 'bg-gray-700 text-gray-400' : 'bg-slate-200 text-slate-500'}`}>
                    {t('common.optional', 'Optionnel')}
                  </span>
                </h2>

                <label
                  htmlFor="showPreciseAddress"
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border border-dashed px-4 py-3 text-sm transition mb-4 ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                  <span className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${showPreciseAddress ? 'bg-[#3B82F6]' : isDarkTheme ? 'bg-gray-600' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${showPreciseAddress ? 'translate-x-5' : 'translate-x-1'}`} />
                  </span>
                  <span className={`text-[12px] ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                    {t('professional.laundry_form.address_visibility_helper', 'Ma laverie possède des machines WI-LINE')}
                  </span>
                  <input id="showPreciseAddress" type="checkbox" {...register('showPreciseAddress')} className="sr-only" />
                </label>

                {showPreciseAddress && (
                  <div>
                    <label htmlFor="wiLineReference" className={labelClass}>
                      {t('professional.laundry_form.wiline_client_code', 'Code client WI-LINE')}<span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <input
                      id="wiLineReference"
                      type="text"
                      inputMode="numeric"
                      {...register('wiLineReference', {
                        validate: (value) => {
                          if (!showPreciseAddress) return true;
                          const trimmed = (value || '').trim();
                          if (trimmed === '') return t('validation.wiline_client_code_required', 'Le code client WI-LINE est requis.');
                          if (!/^\d+$/.test(trimmed)) return t('validation.wiline_client_code_invalid', 'Le code client WI-LINE doit contenir uniquement des chiffres.');
                          return true;
                        },
                      })}
                      className={inputClass(errors.wiLineReference)}
                      placeholder={t('professional.laundry_form.wiline_client_code_placeholder', 'Ex: 1554')}
                    />
                    {errors.wiLineReference && <p className="mt-1 text-xs text-red-500">{errors.wiLineReference.message}</p>}
                    {!errors.wiLineReference && wiLineError && <p className="mt-1 text-xs text-red-500">{wiLineError}</p>}
                    {!errors.wiLineReference && !wiLineError && wiLineLoading && (
                      <p className={`mt-1 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>{t('professional.laundry_form.wiline_loading', 'Récupération des machines WI-LINE...')}</p>
                    )}
                    {!errors.wiLineReference && !wiLineError && !wiLineLoading && wiLineAutoFillSuccess && lastFetchedWiLineCode === (wiLineReference || '').trim() && (wiLineReference || '').trim() !== '' && (
                      <p className="mt-1 text-xs text-green-600">{t('professional.laundry_form.wiline_autofill_done', 'Machines WI-LINE récupérées et champs mis à jour.')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Infos générales */}
              <div>
                <h2 className="text-[15px] flex items-center font-bold mb-4">
                  <img src={ShopIcon} alt="" className="mr-2 h-[18px] w-[18px]" />
                  {t('professional.laundry_form.laundry_identity', 'Informations générales')}
                </h2>
                <div className={`mt-1 border-b mb-4 ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />

                <div className="space-y-4">
                  <div>
                    <label htmlFor="establishmentName" className={labelClass}>
                      {t('professional.laundry_form.laundry_name', 'Nom de la laverie')}<span className="text-[#F97316] ml-0.5">*</span>
                    </label>
                    <input
                      id="establishmentName"
                      type="text"
                      {...register('establishmentName', {
                        required: t('validation.company_name_required', 'Le nom de l\'entreprise est requis.'),
                        maxLength: { value: 50, message: t('validation.company_name_max_length', 'Le nom ne peut pas dépasser 50 caractères.') },
                      })}
                      maxLength={50}
                      className={inputClass(errors.establishmentName)}
                      placeholder={t('professional.laundry_form.laundry_name_placeholder', 'Ex: Laverie du Centre')}
                    />
                    {errors.establishmentName && <p className="mt-1 text-xs text-red-500">{errors.establishmentName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className={labelClass}>{t('auth.phone', 'Téléphone')}</label>
                    <div className="relative">
                      <img src={PhoneIcon} alt="" className="absolute left-3 top-3.5 h-[15px] w-[15px] pointer-events-none" />
                      <input
                        id="contactPhone"
                        type="tel"
                        inputMode="tel"
                        {...register('contactPhone', {
                          pattern: { value: /^[0-9+\s().-]{10,20}$/, message: t('validation.phone_invalid', 'Numéro de téléphone invalide') },
                        })}
                        className={`w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.contactPhone ? 'border-red-500' : ''}`}
                        placeholder={t('auth.placeholder_phone', '01 23 45 67 89')}
                      />
                    </div>
                    {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className={labelClass}>{t('professional.laundry_form.description', 'Description')}</label>
                    <textarea
                      id="description"
                      rows="4"
                      {...register('description')}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] resize-none ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                      placeholder={t('professional.laundry_form.laundry_description_placeholder', 'Décrivez votre laverie...')}
                    />
                    <p className={`mt-1 flex items-center gap-1 text-[10px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                      <img src={InfoGrayIcon} alt="" className="h-[12px] w-[12px]" />
                      {t('professional.laundry_form.description_helper', 'Une bonne description améliore votre visibilité')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h3 className={`text-[13px] font-semibold mb-3 ${isDarkTheme ? 'text-gray-300' : 'text-slate-700'}`}>
                  {t('professional.laundry_form.address', 'Adresse')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="street" className={labelClass}>{t('auth.street', 'Rue')}<span className="text-[#F97316] ml-0.5">*</span></label>
                    <input
                      id="street"
                      type="text"
                      {...register('street', { required: t('validation.street_required', 'La rue est requise.') })}
                      className={inputClass(errors.street)}
                      placeholder={t('auth.placeholder_street', 'Ex: 12 rue de Paris')}
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className={labelClass}>{t('auth.postal_code', 'Code postal')}<span className="text-[#F97316] ml-0.5">*</span></label>
                      <input
                        id="postalCode"
                        type="text"
                        inputMode="numeric"
                        {...register('postalCode', {
                          required: t('validation.postal_code_required', 'Le code postal est requis.'),
                          pattern: { value: /^\d{5}$/, message: t('validation.postal_code_invalid', 'Le code postal doit contenir 5 chiffres.') },
                        })}
                        className={inputClass(errors.postalCode)}
                        placeholder="75000"
                      />
                      {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="city" className={labelClass}>{t('auth.city', 'Ville')}<span className="text-[#F97316] ml-0.5">*</span></label>
                      <input
                        id="city"
                        type="text"
                        {...register('city', { required: t('validation.city_required', 'La ville est requise.') })}
                        className={inputClass(errors.city)}
                        placeholder={t('auth.placeholder_city', 'Paris')}
                      />
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className={labelClass}>{t('auth.country', 'Pays')}<span className="text-[#F97316] ml-0.5">*</span></label>
                    <input
                      id="country"
                      type="text"
                      {...register('country', { required: t('validation.country_required', 'Le pays est requis.') })}
                      className={inputClass(errors.country)}
                      placeholder={t('auth.placeholder_country', 'France')}
                    />
                    {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
                  </div>
                </div>
              </div>

              {/* Médias */}
              <div>
                <h3 className={`text-[13px] font-semibold mb-3 ${isDarkTheme ? 'text-gray-300' : 'text-slate-700'}`}>
                  {t('professional.laundry_form.medias_title', 'Visuels')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>{t('professional.laundry_form.logo', 'Logo')}</label>
                    <label
                      htmlFor="logo"
                      className={`flex flex-col w-full cursor-pointer items-center rounded-xl border border-dashed px-4 py-4 text-sm transition ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-700'} hover:border-[#3B82F6]`}
                    >
                      <input id="logo" type="file" accept="image/*" {...register('logo')} className="sr-only" />
                      <img src={UploadIcon} alt="Upload" className="mb-2 h-[28px] w-[28px] opacity-60" />
                      <span className="text-[12px]">
                        {selectedLogo?.[0]?.name || currentLogo?.originalName || t('professional.laundry_form.logo_placeholder', 'Cliquer pour uploader')}
                      </span>
                    </label>
                    {currentLogo?.location && !selectedLogo?.[0]?.name && (
                      <p className={`mt-1 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                        {t('professional.laundry_form.current_logo', 'Logo actuel')}: {currentLogo.originalName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>{t('professional.laundry_form.gallery_media', 'Photos de la laverie')}</label>
                    <label
                      htmlFor="mediaFiles"
                      className={`flex flex-col w-full cursor-pointer items-center rounded-xl border border-dashed px-4 py-4 text-sm transition ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-700'} hover:border-[#3B82F6]`}
                    >
                      <input
                        id="mediaFiles"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => { appendMediaFiles(e.target.files); e.target.value = ''; }}
                        className="sr-only"
                      />
                      <img src={UploadIcon} alt="Upload" className="mb-2 h-[28px] w-[28px] opacity-60" />
                      <span className="text-[12px]">
                        {pendingMediaFiles.length > 0
                          ? t('professional.laundry_form.gallery_files_selected', '{{count}} fichier(s) sélectionné(s)').replace('{{count}}', String(pendingMediaFiles.length))
                          : t('professional.laundry_form.gallery_placeholder', 'Cliquer pour ajouter plusieurs photos')}
                      </span>
                    </label>

                    {pendingMediaFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {pendingMediaFiles.map((file, idx) => (
                          <div key={`${file.name}-${file.size}-${file.lastModified}`} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-200 bg-slate-50'}`}>
                            <span className={`truncate text-xs ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>{file.name}</span>
                            <button type="button" onClick={() => removePendingMediaFile(idx)} className="ml-2 text-xs text-red-500 hover:text-red-600">{t('common.delete', 'Supprimer')}</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentMedias.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {currentMedias.map((media) => (
                          <div key={media.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-200 bg-slate-50'}`}>
                            <span className={`truncate text-xs ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>{media.originalName}</span>
                            <button type="button" onClick={() => handleDeleteMedia(media.id)} className="ml-2 text-xs text-red-500 hover:text-red-600">{t('common.delete', 'Supprimer')}</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ───────── STEP 2 : Horaires ───────── */}
          {currentStep === 2 && (
            <section>
              <h2 className="text-[15px] flex items-center font-bold mb-4">
                <img src={OpenSignIcon} alt="" className="mr-2 h-[18px] w-[18px]" />
                {t('professional.laundry_form.opening_hours', "Horaires d'ouverture")}
              </h2>
              <div className={`border-b mb-4 ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />
              <div className={`overflow-hidden rounded-xl border ${isDarkTheme ? 'border-gray-700' : 'border-[#D1D5DB]'}`}>
                <table className="min-w-full border-collapse text-left text-sm">
                  <tbody className={isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-900'}>
                    {openingHoursDays.map((day) => {
                      const isClosed = closedDays[day.key];
                      return (
                        <Fragment key={day.key}>
                          <tr className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-[#D1D5DB]'}`}>
                            <td colSpan={2} className="px-4 py-3 align-top">
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-[13px]">{t(day.labelKey, day.fallbackLabel)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nowClosed = !closedDays[day.key];
                                    setClosedDays((c) => ({ ...c, [day.key]: nowClosed }));
                                    if (nowClosed) {
                                      setValue(`openingHours.${day.key}.open`, '');
                                      setValue(`openingHours.${day.key}.close`, '');
                                      for (let i = 0; i < additionalSlotsByDay[day.key]; i++) {
                                        setValue(`openingHoursExtra.${day.key}.${i}.open`, '');
                                        setValue(`openingHoursExtra.${day.key}.${i}.close`, '');
                                      }
                                    }
                                  }}
                                  className={`text-[11px] px-3 h-[22px] rounded-full flex items-center justify-center font-medium transition ${isClosed ? 'bg-[#F97316] text-white' : `border ${isDarkTheme ? 'border-gray-600 text-gray-400' : 'border-[#9CA3AF] text-slate-500'}`}`}
                                >
                                  {t('common.closed', 'Fermé')}
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className={`border-b last:border-b-0 ${isDarkTheme ? 'border-gray-700' : 'border-slate-100'}`}>
                            <td colSpan={2} className={`px-4 py-3 ${isClosed ? 'opacity-50' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className="grid flex-1 grid-cols-2 gap-3">
                                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-700' : 'border-slate-300 bg-white'}`}>
                                    <input type="time" disabled={isClosed} {...register(`openingHours.${day.key}.open`)} className={`w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed ${isDarkTheme ? 'text-gray-100 disabled:text-gray-500' : 'text-slate-900 disabled:text-slate-400'}`} />
                                  </div>
                                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-700' : 'border-slate-300 bg-white'}`}>
                                    <input type="time" disabled={isClosed} {...register(`openingHours.${day.key}.close`)} className={`w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed ${isDarkTheme ? 'text-gray-100 disabled:text-gray-500' : 'text-slate-900 disabled:text-slate-400'}`} />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addOpeningSlot(day.key)}
                                  disabled={isClosed}
                                  className={`flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-dashed text-[22px] leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-[#D1D5DB] bg-white text-slate-600 hover:bg-slate-50'}`}
                                  aria-label={t('professional.laundry_form.add_opening_slot', 'Ajouter un créneau')}
                                >+</button>
                              </div>
                              {errors.openingHours?.[day.key]?.open && (
                                <p className="mt-1 text-xs text-red-500">{errors.openingHours[day.key].open.message}</p>
                              )}
                              {Array.from({ length: additionalSlotsByDay[day.key] }).map((_, slotIdx) => (
                                <div key={`${day.key}-extra-${slotIdx}`} className="mt-3 flex items-start gap-2">
                                  <div className="grid flex-1 grid-cols-2 gap-3">
                                    <input type="time" disabled={isClosed} {...register(`openingHoursExtra.${day.key}.${slotIdx}.open`)} className={`w-full rounded-lg border border-dashed px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] disabled:cursor-not-allowed ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100 disabled:text-gray-500' : 'border-slate-300 bg-white text-slate-900 disabled:text-slate-400'}`} />
                                    <input type="time" disabled={isClosed} {...register(`openingHoursExtra.${day.key}.${slotIdx}.close`)} className={`w-full rounded-lg border border-dashed px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] disabled:cursor-not-allowed ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100 disabled:text-gray-500' : 'border-slate-300 bg-white text-slate-900 disabled:text-slate-400'}`} />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeOpeningSlot(day.key)}
                                    disabled={isClosed}
                                    className={`flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-dashed text-[22px] leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-[#D1D5DB] bg-white text-slate-600 hover:bg-slate-50'}`}
                                    aria-label={t('professional.laundry_form.remove_opening_slot', 'Retirer un créneau')}
                                  >-</button>
                                </div>
                              ))}
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ───────── STEP 3 : Équipements ───────── */}
          {currentStep === 3 && (
            <section className="space-y-6">
              <div>
                <h2 className="text-[15px] flex items-center font-bold mb-1">
                  <img src={ServicesIcon} alt="" className="mr-2 h-[18px] w-[18px]" />
                  {t('professional.laundry_form.services_and_equipment', 'Machines & Équipements')}
                </h2>
                <div className={`border-b mb-4 ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />

                {/* Machines à laver */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-[13px] font-semibold ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                      {t('professional.laundry_form.washing_machines_by_capacity', 'Machines à laver')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => addEquipment('washing')}
                      className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#2563EB] transition"
                    >
                      <span className="text-[16px] leading-none">+</span>
                      {t('professional.laundry_form.add_washing_machine', 'Ajouter')}
                    </button>
                  </div>

                  {washingEquipments.length === 0 ? (
                    <div className={`rounded-xl border border-dashed px-4 py-6 text-center text-[12px] ${isDarkTheme ? 'border-gray-600 text-gray-500' : 'border-slate-300 text-slate-400'}`}>
                      {t('professional.laundry_form.no_washing_machines', 'Aucune machine à laver ajoutée')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {washingEquipments.map((eq, idx) => (
                        <div key={eq.id} className={`rounded-xl border p-4 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-200 bg-white'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[12px] font-medium ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                              Machine #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeEquipment(eq.id)}
                              className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                            >
                              {t('common.delete', 'Supprimer')}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>{t('professional.laundry_form.capacity', 'Capacité')}</label>
                              <select
                                value={eq.capacity}
                                onChange={(e) => updateEquipment(eq.id, 'capacity', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                              >
                                {EQUIPMENT_CAPACITIES.map((cap) => (
                                  <option key={cap} value={cap}>{cap}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>
                                {t('professional.laundry_form.price_per_wash', 'Prix (€)')}
                                <img src={EuroIcon} alt="" className="inline ml-1 h-[11px] w-[11px]" />
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                value={eq.price}
                                onChange={(e) => updateEquipment(eq.id, 'price', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                                placeholder="Ex: 4.50"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sèche-linge */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-[13px] font-semibold ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                      {t('professional.laundry_form.dryers_by_capacity', 'Sèche-linge')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => addEquipment('drying')}
                      className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#2563EB] transition"
                    >
                      <span className="text-[16px] leading-none">+</span>
                      {t('professional.laundry_form.add_dryer', 'Ajouter')}
                    </button>
                  </div>

                  {dryingEquipments.length === 0 ? (
                    <div className={`rounded-xl border border-dashed px-4 py-6 text-center text-[12px] ${isDarkTheme ? 'border-gray-600 text-gray-500' : 'border-slate-300 text-slate-400'}`}>
                      {t('professional.laundry_form.no_dryers', 'Aucun sèche-linge ajouté')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dryingEquipments.map((eq, idx) => (
                        <div key={eq.id} className={`rounded-xl border p-4 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-200 bg-white'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[12px] font-medium ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                              Sèche-linge #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeEquipment(eq.id)}
                              className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                            >
                              {t('common.delete', 'Supprimer')}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelClass}>{t('professional.laundry_form.capacity', 'Capacité')}</label>
                              <select
                                value={eq.capacity}
                                onChange={(e) => updateEquipment(eq.id, 'capacity', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                              >
                                {EQUIPMENT_CAPACITIES.map((cap) => (
                                  <option key={cap} value={cap}>{cap}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>
                                {t('professional.laundry_form.price_per_dry', 'Prix (€)')}
                                <img src={EuroIcon} alt="" className="inline ml-1 h-[11px] w-[11px]" />
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                value={eq.price}
                                onChange={(e) => updateEquipment(eq.id, 'price', e.target.value)}
                                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                                placeholder="Ex: 2.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className={`text-[13px] font-semibold mb-3 ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                  {t('professional.laundry_form.services_title', 'Services disponibles')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {loadingOptions ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>{t('common.loading_text', 'Chargement...')}</p>
                  ) : serviceOptions.length === 0 ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>{t('professional.laundry_form.no_services_available', 'Aucun service disponible')}</p>
                  ) : (
                    serviceOptions.map((service) => (
                      <label key={service.id} className={`flex items-center gap-2 text-[12px] cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                        <input type="checkbox" value={String(service.id)} {...register('serviceIds')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                        <span>{t(service.translationKey, service.name)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Modes de paiement */}
              <div>
                <h3 className={`text-[13px] font-semibold mb-3 ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                  {t('professional.laundry_form.payment_methods_title', 'Modes de paiement acceptés')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {loadingOptions ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>{t('common.loading_text', 'Chargement...')}</p>
                  ) : paymentMethodOptions.length === 0 ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>{t('professional.laundry_form.no_payment_methods_available', 'Aucun mode de paiement disponible')}</p>
                  ) : (
                    paymentMethodOptions.map((pm) => (
                      <label key={pm.id} className={`flex items-center gap-2 text-[12px] cursor-pointer ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                        <input type="checkbox" value={String(pm.id)} {...register('paymentMethodIds')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                        <span>{t(pm.translationKey, pm.name)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ───────── Navigation buttons ───────── */}
          <div className="flex w-full flex-col items-end gap-2 pt-2">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={submitting}
                  className={`flex h-[36px] w-[110px] items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' : 'border-[#D1D5DB] bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {t('common.previous', 'Précédent')}
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={(e) => goToNextStep(e)}
                  disabled={submitting}
                  className="flex items-center justify-center rounded-lg w-[110px] h-[36px] bg-[#3B82F6] text-sm text-white font-medium transition-colors hover:bg-[#2563EB] disabled:opacity-50 gap-2"
                >
                  {t('common.next', 'Suivant')}
                  <img src={ArrowIcon} alt="" className="h-[16px] w-[18px]" />
                </button>
              ) : (
                <button
                  type="submit"
                  data-submit-intent="final-save"
                  disabled={submitting}
                  className="flex items-center justify-center rounded-lg w-[120px] h-[36px] bg-[#3B82F6] text-sm text-white font-medium transition-colors hover:bg-[#2563EB] disabled:opacity-50 gap-1.5"
                >
                  <img src={SaveIcon} alt="" className="h-[13px] w-[13px]" />
                  {submitting ? t('common.loading_text', 'Chargement...') : t('common.save', 'Enregistrer')}
                </button>
              )}
            </div>
            {currentStep === totalSteps && (
              <p className={`text-right text-[10px] ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
                {t('professional.laundry_form.form_local_only', 'Après soumission, votre laverie sera en attente de validation.')}
              </p>
            )}
          </div>

          {submitError && <p className="text-right text-xs text-red-500">{submitError}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfessionalLaundryForm;
