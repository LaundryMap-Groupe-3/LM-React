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
import StackOfCoinsIcon from '../../assets/images/icons/stackOfCoins.svg';

const defaultValues = {
  establishmentName: '',
  contactPhone: '',
  description: '',
  logo: null,
  mediaFiles: null,
  washingMachines6kg: '',
  washingMachines8kg: '',
  washingMachines10kg: '',
  washingMachines12kgPlus: '',
  dryers6kg: '',
  dryers8kg: '',
  dryers10kg: '',
  dryers12kgPlus: '',
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
  street: '',
  postalCode: '',
  city: '',
  country: '',
  showPreciseAddress: false,
  wiLineReference: '',
  washingPrice6kg: '',
  washingPrice8kg: '',
  washingPrice10kg: '',
  washingPrice12kgPlus: '',
  dryingPrice6kg: '',
  dryingPrice8kg: '',
  dryingPrice10kg: '',
  dryingPrice12kgPlus: '',
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

const initialClosedDays = openingHoursDays.reduce((accumulator, day) => {
  accumulator[day.key] = false;
  return accumulator;
}, {});

const initialAdditionalSlots = openingHoursDays.reduce((accumulator, day) => {
  accumulator[day.key] = 0;
  return accumulator;
}, {});

const pricingByCapacity = [
  {
    key: '6kg',
    labelKey: 'professional.laundry_form.capacity_6kg',
    fallbackLabel: '6 kg',
    dryingLabelKey: 'professional.laundry_form.dryers_capacity_6kg',
    dryingFallbackLabel: 'Dryers 6 kg',
    washingField: 'washingPrice6kg',
    dryingField: 'dryingPrice6kg',
  },
  {
    key: '8kg',
    labelKey: 'professional.laundry_form.capacity_8kg',
    fallbackLabel: '8 kg',
    dryingLabelKey: 'professional.laundry_form.dryers_capacity_8kg',
    dryingFallbackLabel: 'Dryers 8 kg',
    washingField: 'washingPrice8kg',
    dryingField: 'dryingPrice8kg',
  },
  {
    key: '10kg',
    labelKey: 'professional.laundry_form.capacity_10kg',
    fallbackLabel: '10 kg',
    dryingLabelKey: 'professional.laundry_form.dryers_capacity_10kg',
    dryingFallbackLabel: 'Dryers 10 kg',
    washingField: 'washingPrice10kg',
    dryingField: 'dryingPrice10kg',
  },
  {
    key: '12kgPlus',
    labelKey: 'professional.laundry_form.capacity_12kg_plus',
    fallbackLabel: '12 kg+',
    dryingLabelKey: 'professional.laundry_form.dryers_capacity_12kg_plus',
    dryingFallbackLabel: 'Dryers 12 kg+',
    washingField: 'washingPrice12kgPlus',
    dryingField: 'dryingPrice12kgPlus',
  },
];

const ProfessionalLaundryForm = ({ isDarkTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditMode = Boolean(id);
  usePageTitle(isEditMode ? 'page_titles.edit_laundry' : 'page_titles.create_laundry', t);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
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

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues,
  });
  const selectedLogo = watch('logo');
  const showPreciseAddress = watch('showPreciseAddress');
  const wiLineReference = watch('wiLineReference');

  const appendMediaFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file instanceof File);
    if (files.length === 0) {
      return;
    }

    setPendingMediaFiles((current) => {
      const existingSignatures = new Set(
        current.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );

      const newUniqueFiles = files.filter((file) => {
        const signature = `${file.name}-${file.size}-${file.lastModified}`;
        if (existingSignatures.has(signature)) {
          return false;
        }
        existingSignatures.add(signature);
        return true;
      });

      return [...current, ...newUniqueFiles];
    });
  };

  const removePendingMediaFile = (indexToRemove) => {
    setPendingMediaFiles((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const toNumberOrZero = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const normalized = typeof value === 'string' ? value.replace(',', '.') : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalizeSelectedIds = (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(value.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
  };

  const isValidHourFormat = (value) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

  const validateOpeningHoursStep = () => {
    clearErrors('openingHours');
    clearErrors('openingHoursExtra');

    const openingHours = getValues('openingHours') || {};
    const openingHoursExtra = getValues('openingHoursExtra') || {};

    let hasError = false;

    for (const day of openingHoursDays) {
      const dayKey = day.key;
      const slots = [];

      const primary = openingHours[dayKey] || { open: '', close: '' };
      const primaryOpen = (primary.open || '').trim();
      const primaryClose = (primary.close || '').trim();

      if (primaryOpen !== '' || primaryClose !== '') {
        if (primaryOpen === '' || primaryClose === '') {
          setError(`openingHours.${dayKey}.open`, {
            type: 'manual',
            message: t('validation.opening_hours_slot_incomplete', 'Veuillez renseigner une heure d\'ouverture et de fermeture.'),
          });
          hasError = true;
        } else if (!isValidHourFormat(primaryOpen) || !isValidHourFormat(primaryClose)) {
          setError(`openingHours.${dayKey}.open`, {
            type: 'manual',
            message: t('validation.opening_hours_invalid_format', 'Format d\'horaire invalide.'),
          });
          hasError = true;
        } else if (primaryOpen >= primaryClose) {
          setError(`openingHours.${dayKey}.open`, {
            type: 'manual',
            message: t('validation.opening_hours_order_invalid', 'L\'heure d\'ouverture doit être antérieure à l\'heure de fermeture.'),
          });
          hasError = true;
        } else {
          slots.push({ open: primaryOpen, close: primaryClose });
        }
      }

      const extras = Array.isArray(openingHoursExtra[dayKey]) ? openingHoursExtra[dayKey] : [];
      extras.forEach((slot, index) => {
        const open = (slot?.open || '').trim();
        const close = (slot?.close || '').trim();

        if (open === '' && close === '') {
          return;
        }

        if (open === '' || close === '') {
          setError(`openingHoursExtra.${dayKey}.${index}.open`, {
            type: 'manual',
            message: t('validation.opening_hours_slot_incomplete', 'Veuillez renseigner une heure d\'ouverture et de fermeture.'),
          });
          hasError = true;
          return;
        }

        if (!isValidHourFormat(open) || !isValidHourFormat(close)) {
          setError(`openingHoursExtra.${dayKey}.${index}.open`, {
            type: 'manual',
            message: t('validation.opening_hours_invalid_format', 'Format d\'horaire invalide.'),
          });
          hasError = true;
          return;
        }

        if (open >= close) {
          setError(`openingHoursExtra.${dayKey}.${index}.open`, {
            type: 'manual',
            message: t('validation.opening_hours_order_invalid', 'L\'heure d\'ouverture doit être antérieure à l\'heure de fermeture.'),
          });
          hasError = true;
          return;
        }

        slots.push({ open, close });
      });

      if (slots.length > 1) {
        const sorted = [...slots].sort((a, b) => a.open.localeCompare(b.open));
        for (let i = 1; i < sorted.length; i += 1) {
          if (sorted[i].open < sorted[i - 1].close) {
            setError(`openingHours.${dayKey}.open`, {
              type: 'manual',
              message: t('validation.opening_hours_overlap', 'Deux créneaux horaires se chevauchent.'),
            });
            hasError = true;
            break;
          }
        }
      }
    }

    return !hasError;
  };

  const mapLaundryToFormValues = (laundry) => ({
    ...defaultValues,
    establishmentName: laundry?.establishmentName ?? '',
    contactPhone: laundry?.contactPhone ?? '',
    description: laundry?.description ?? '',
    street: laundry?.address?.street ?? '',
    postalCode: laundry?.address?.postalCode?.toString?.() ?? '',
    city: laundry?.address?.city ?? '',
    country: laundry?.address?.country ?? '',
    showPreciseAddress: Boolean(laundry?.showPreciseAddress),
    wiLineReference: laundry?.wiLineReference?.toString?.() ?? '',
    washingMachines6kg: laundry?.washingMachines6kg ?? '',
    washingMachines8kg: laundry?.washingMachines8kg ?? '',
    washingMachines10kg: laundry?.washingMachines10kg ?? '',
    washingMachines12kgPlus: laundry?.washingMachines12kgPlus ?? '',
    dryers6kg: laundry?.dryers6kg ?? '',
    dryers8kg: laundry?.dryers8kg ?? '',
    dryers10kg: laundry?.dryers10kg ?? '',
    dryers12kgPlus: laundry?.dryers12kgPlus ?? '',
    serviceIds: Array.isArray(laundry?.serviceIds) ? laundry.serviceIds.map((serviceId) => String(serviceId)) : [],
    paymentMethodIds: Array.isArray(laundry?.paymentMethodIds) ? laundry.paymentMethodIds.map((paymentId) => String(paymentId)) : [],
    openingHours: {
      ...defaultValues.openingHours,
      ...(laundry?.openingHours ?? {}),
    },
    washingPrice6kg: laundry?.washingPrice6kg ?? '',
    washingPrice8kg: laundry?.washingPrice8kg ?? '',
    washingPrice10kg: laundry?.washingPrice10kg ?? '',
    washingPrice12kgPlus: laundry?.washingPrice12kgPlus ?? '',
    dryingPrice6kg: laundry?.dryingPrice6kg ?? '',
    dryingPrice8kg: laundry?.dryingPrice8kg ?? '',
    dryingPrice10kg: laundry?.dryingPrice10kg ?? '',
    dryingPrice12kgPlus: laundry?.dryingPrice12kgPlus ?? '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const options = await professionalService.getLaundryOptions();
        setServiceOptions(Array.isArray(options?.services) ? options.services : []);
        setPaymentMethodOptions(Array.isArray(options?.paymentMethods) ? options.paymentMethods : []);
      } catch (error) {
        setServiceOptions([]);
        setPaymentMethodOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      reset(defaultValues);
      setCurrentLogo(null);
      setCurrentMedias([]);
      setPendingMediaFiles([]);
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

        const additionalSlots = openingHoursDays.reduce((accumulator, day) => {
          const slots = laundry?.openingHoursExtra?.[day.key];
          accumulator[day.key] = Array.isArray(slots) ? slots.length : 0;
          return accumulator;
        }, {});
        setAdditionalSlotsByDay(additionalSlots);

        const closed = openingHoursDays.reduce((accumulator, day) => {
          const openingHours = laundry?.openingHours?.[day.key];
          accumulator[day.key] = !openingHours?.open && !openingHours?.close;
          return accumulator;
        }, {});
        setClosedDays(closed);
      } catch (error) {
        navigate('/professional-dashboard', { replace: true });
      } finally {
        setLoadingLaundry(false);
      }
    };

    loadLaundry();
  }, [id, isEditMode, navigate, reset]);

  useEffect(() => {
    if (!showPreciseAddress) {
      setWiLineError('');
      setWiLineLoading(false);
      setWiLineAutoFillSuccess(false);
      return;
    }

    const clientCode = (wiLineReference || '').trim();
    if (clientCode === '') {
      setWiLineError('');
      setWiLineAutoFillSuccess(false);
      return;
    }

    if (!/^\d+$/.test(clientCode)) {
      setWiLineError(t('validation.wiline_client_code_invalid', 'Le code client WI-LINE doit contenir uniquement des chiffres.'));
      setWiLineAutoFillSuccess(false);
      return;
    }

    if (clientCode === lastFetchedWiLineCode) {
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setWiLineLoading(true);
      setWiLineError('');
      setWiLineAutoFillSuccess(false);

      try {
        const result = await professionalService.fetchWiLineClientMachines(clientCode);
        const autoFill = result?.autoFill || {};
        const hasValidLaundry = Number.isInteger(Number(result?.laundry?.id)) && Number(result?.laundry?.id) > 0;
        const fieldsToAutoFill = [
          'washingMachines6kg',
          'washingMachines8kg',
          'washingMachines10kg',
          'washingMachines12kgPlus',
          'dryers6kg',
          'dryers8kg',
          'dryers10kg',
          'dryers12kgPlus',
          'washingPrice6kg',
          'washingPrice8kg',
          'washingPrice10kg',
          'washingPrice12kgPlus',
          'dryingPrice6kg',
          'dryingPrice8kg',
          'dryingPrice10kg',
          'dryingPrice12kgPlus',
        ];

        if (cancelled) {
          return;
        }

        fieldsToAutoFill.forEach((fieldName) => {
          if (Object.prototype.hasOwnProperty.call(autoFill, fieldName)) {
            setValue(fieldName, autoFill[fieldName] ?? '');
          }
        });

        setLastFetchedWiLineCode(clientCode);
        setWiLineAutoFillSuccess(hasValidLaundry);

        if (!hasValidLaundry) {
          setWiLineError(t('errors.wiline_client_not_found', 'Code client WI-LINE introuvable.'));
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const backendErrorKey = error?.body?.error;
        setWiLineError(t(backendErrorKey || 'errors.wiline_fetch_failed', 'Impossible de récupérer les machines WI-LINE.'));
        setWiLineAutoFillSuccess(false);
      } finally {
        if (!cancelled) {
          setWiLineLoading(false);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [showPreciseAddress, wiLineReference, lastFetchedWiLineCode, setValue, t]);

  const onSubmit = async (values, event) => {
    const submitter = event?.nativeEvent?.submitter;
    const isFinalSave = submitter?.getAttribute('data-submit-intent') === 'final-save';

    if (currentStep !== totalSteps || !isFinalSave) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      establishmentName: values.establishmentName?.trim() || '',
      contactPhone: values.contactPhone?.trim() || '',
      description: values.description?.trim() || '',
      showPreciseAddress: Boolean(values.showPreciseAddress),
      wiLineReference: values.showPreciseAddress
        ? (values.wiLineReference?.trim() || null)
        : null,
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
      washingMachines6kg: toNumberOrZero(values.washingMachines6kg),
      washingMachines8kg: toNumberOrZero(values.washingMachines8kg),
      washingMachines10kg: toNumberOrZero(values.washingMachines10kg),
      washingMachines12kgPlus: toNumberOrZero(values.washingMachines12kgPlus),
      dryers6kg: toNumberOrZero(values.dryers6kg),
      dryers8kg: toNumberOrZero(values.dryers8kg),
      dryers10kg: toNumberOrZero(values.dryers10kg),
      dryers12kgPlus: toNumberOrZero(values.dryers12kgPlus),
      washingPrice6kg: toNumberOrZero(values.washingPrice6kg),
      washingPrice8kg: toNumberOrZero(values.washingPrice8kg),
      washingPrice10kg: toNumberOrZero(values.washingPrice10kg),
      washingPrice12kgPlus: toNumberOrZero(values.washingPrice12kgPlus),
      dryingPrice6kg: toNumberOrZero(values.dryingPrice6kg),
      dryingPrice8kg: toNumberOrZero(values.dryingPrice8kg),
      dryingPrice10kg: toNumberOrZero(values.dryingPrice10kg),
      dryingPrice12kgPlus: toNumberOrZero(values.dryingPrice12kgPlus),
    };

    try {
      const savedLaundry = isEditMode
        ? await professionalService.updateLaundry(id, payload)
        : await professionalService.createLaundry(payload);

      const selectedLogoFile = values?.logo?.[0];
      if (selectedLogoFile instanceof File) {
        await professionalService.uploadLaundryLogo(savedLaundry.id, selectedLogoFile);
      } else {
        // keep existing logo untouched when no new file is selected
      }

      const mediaFiles = pendingMediaFiles;
      if (mediaFiles.length > 0) {
        await professionalService.uploadLaundryMedias(savedLaundry.id, mediaFiles);
      }

      navigate('/professional-dashboard');
    } catch (error) {
      const apiErrors = error?.body?.errors;

      if (apiErrors && typeof apiErrors === 'object') {
        Object.entries(apiErrors).forEach(([field, message]) => {
          setError(field, {
            type: 'server',
            message: t(message, message),
          });
        });
      }

      setSubmitError(t('errors.unexpected_error', 'Une erreur est survenue.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/professional-dashboard');
  };

  const goToNextStep = async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const fieldsByStep = {
      1: ['establishmentName', 'contactPhone', 'description', 'street', 'postalCode', 'city', 'country'],
      2: [],
      3: [],
      4: [],
    };

    const isValid = fieldsByStep[currentStep].length > 0 ? await trigger(fieldsByStep[currentStep]) : true;
    if (!isValid) {
      return;
    }

    if (currentStep === 2) {
      const hasValidOpeningHours = validateOpeningHoursStep();
      if (!hasValidOpeningHours) {
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addOpeningSlot = (dayKey) => {
    setAdditionalSlotsByDay((current) => ({
      ...current,
      [dayKey]: current[dayKey] + 1,
    }));
  };

  const removeOpeningSlot = (dayKey) => {
    setAdditionalSlotsByDay((current) => ({
      ...current,
      [dayKey]: Math.max(current[dayKey] - 1, 0),
    }));
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!isEditMode || !id || submitting) {
      return;
    }

    try {
      const updatedLaundry = await professionalService.deleteLaundryMedia(id, mediaId);
      setCurrentMedias(Array.isArray(updatedLaundry?.medias) ? updatedLaundry.medias : []);
      if (!updatedLaundry?.logo) {
        setCurrentLogo(null);
      }
    } catch (error) {
      setSubmitError(t('errors.generic_error', 'Une erreur est survenue. Veuillez réessayer.'));
    }
  };

  return (
    <div className={`min-h-screen mt-5 px-4 ${isDarkTheme ? 'text-gray-100' : ' text-gray-900'}`}>
        <div className="mb-5 flex">
          <button
            type="button"
            onClick={() => navigate('/professional-dashboard')}
            className={`mb-4 inline-flex cursor-pointer items-center px-4 py-2 text-sm
               transition-colors ${isDarkTheme ? 'text-gray-100 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
          >
            <img src={LeftArrowIcon} alt="Back" className="h-[24px] w-[25px]" />
          </button>

            <div className='flex flex-col items-start'>
                <h1 className={`text-[18px] font-semibold ${isDarkTheme ? 'text-[#3B82F6]' : 'text-[#3B82F6]'}`}>
                    {isEditMode
                      ? t('professional.laundry_form.edit_laundry_title', 'Modifier une laverie')
                      : t('professional.laundry_form.create_laundry_title', 'Ajouter une laverie')}
                </h1>
                <p className={`mt-2 text-[10px] ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                    {isEditMode
                      ? t('professional.laundry_form.edit_laundry_subtitle', 'Mettez à jour les informations de votre établissement')
                      : t('professional.laundry_form.create_laundry_subtitle', 'Renseignez les informations de votre établissement')}
                </p>
            </div>
        </div>
      <div className="mx-auto w-full flex flex-col">

        {loadingLaundry && isEditMode && (
          <div className="mb-4 rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-4 py-3 text-sm text-[#3B82F6]">
            {t('common.loading_text', 'Chargement...')}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          {currentStep === 1 && (
          <section>
            <h2 className="text-[17px] flex items-center font-bold text-left">
              <img src={ShopIcon} alt="" className="mr-2 inline-block h-[20px] w-[20px]" />
              {t('professional.laundry_form.laundry_identity')}
            </h2>
            <div className={`mt-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />
            <div className="mt-4 space-y-4 text-left">
              <div>
                <label htmlFor="establishmentName" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('professional.laundry_form.laundry_name')}<span className="text-[#F97316]">*</span>
                </label>
                <input
                  id="establishmentName"
                  type="text"
                  {...register('establishmentName', {
                    required: t('validation.company_name_required', 'Le nom de l’entreprise est requis.'),
                    maxLength: {
                      value: 50,
                      message: t('validation.company_name_max_length', 'Le nom de l\'entreprise ne peut pas dépasser 50 caractères.'),
                    },
                  })}
                  maxLength={50}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.establishmentName ? 'border-red-500' : ''}`}
                  placeholder={t('professional.laundry_form.laundry_name_placeholder')}
                />
                {errors.establishmentName && <p className="mt-1 text-xs text-red-500">{errors.establishmentName.message}</p>}
              </div>

              <div>
                <label htmlFor="contactPhone" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('auth.phone', 'Téléphone')}
                </label>
                <div className="relative">
                  <img src={PhoneIcon} alt="" className="absolute left-3 top-3.5 h-[15px] w-[15px] pointer-events-none" />
                  <input
                    id="contactPhone"
                    type="tel"
                    inputMode="tel"
                    {...register('contactPhone', {
                      pattern: {
                        value: /^[0-9+\s().-]{10,20}$/,
                        message: t('validation.phone_invalid', 'Le numéro de téléphone n\'est pas valide'),
                      },
                    })}
                    className={`w-full rounded-xl border pl-10 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.contactPhone ? 'border-red-500' : ''}`}
                    placeholder={t('auth.placeholder_phone', '01 23 45 67 89')}
                  />
                </div>
                {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
              </div>

              <div>
                <label htmlFor="description" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('professional.laundry_form.description')}
                </label>
                <textarea
                  id="description"
                  rows="5"
                  {...register('description')}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                  placeholder={t('professional.laundry_form.laundry_description_placeholder')}
                />
                <p className={`mt-1 flex items-center gap-1 text-[10px] ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                  <img src={InfoGrayIcon} alt="" className="h-[13px] w-[13px]" />
                  <span>{t('professional.laundry_form.description_helper', 'Une bonne description améliore votre visibilité')}</span>
                </p>
              </div>

              <div>
                <label htmlFor="street" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('auth.street', 'Rue')}<span className="text-[#F97316]">*</span>
                </label>
                <input
                  id="street"
                  type="text"
                  {...register('street', {
                    required: t('validation.street_required', 'La rue est requise.'),
                  })}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.street ? 'border-red-500' : ''}`}
                  placeholder={t('auth.placeholder_street', 'Ex: 12 rue de Paris')}
                />
                {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="postalCode" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                    {t('auth.postal_code', 'Code postal')}<span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    {...register('postalCode', {
                      required: t('validation.postal_code_required', 'Le code postal est requis.'),
                      pattern: {
                        value: /^\d{5}$/,
                        message: t('validation.postal_code_invalid', 'Le code postal doit contenir 5 chiffres.'),
                      },
                    })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.postalCode ? 'border-red-500' : ''}`}
                    placeholder="75000"
                  />
                  {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
                </div>

                <div>
                  <label htmlFor="city" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                    {t('auth.city', 'Ville')}<span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    {...register('city', {
                      required: t('validation.city_required', 'La ville est requise.'),
                    })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.city ? 'border-red-500' : ''}`}
                    placeholder={t('auth.placeholder_city', 'Paris')}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="country" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('auth.country', 'Pays')}<span className="text-[#F97316]">*</span>
                </label>
                <input
                  id="country"
                  type="text"
                  {...register('country', {
                    required: t('validation.country_required', 'Le pays est requis.'),
                  })}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.country ? 'border-red-500' : ''}`}
                  placeholder={t('auth.placeholder_country', 'France')}
                />
                {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
              </div>

              <div>
                <label htmlFor="logo" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('professional.laundry_form.logo', 'Logo')}
                </label>
                <label
                  htmlFor="logo"
                  className={`flex flex-col w-full cursor-pointer items-center rounded-xl border border-dashed px-4 py-3 text-sm transition ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    {...register('logo')}
                    className="sr-only"
                  />
                  <img src={UploadIcon} alt="Upload" className="mr-3 h-[32px] w-[32px]" />
                  <span className={isDarkTheme ? 'text-gray-100' : 'text-slate-700'}>
                    {selectedLogo?.[0]?.name
                      || currentLogo?.originalName
                      || t('professional.laundry_form.logo_placeholder', 'Glisser ou cliquer pour uploader')}
                  </span>
                </label>
                {currentLogo?.location && !selectedLogo?.[0]?.name && (
                  <p className={`mt-1 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-500'}`}>
                    {t('professional.laundry_form.current_logo', 'Logo actuel')}: {currentLogo.originalName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="mediaFiles" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                  {t('professional.laundry_form.gallery_media', 'Photos de la laverie')}
                </label>
                <label
                  htmlFor="mediaFiles"
                  className={`flex flex-col w-full cursor-pointer items-center rounded-xl border border-dashed px-4 py-3 text-sm transition ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                >
                  <input
                    id="mediaFiles"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      appendMediaFiles(event.target.files);
                      event.target.value = '';
                    }}
                    className="sr-only"
                  />
                  <img src={UploadIcon} alt="Upload" className="mr-3 h-[32px] w-[32px]" />
                  <span className={isDarkTheme ? 'text-gray-100' : 'text-slate-700'}>
                    {pendingMediaFiles.length > 0
                      ? t('professional.laundry_form.gallery_files_selected', '{{count}} fichier(s) sélectionné(s)').replace('{{count}}', String(pendingMediaFiles.length))
                      : t('professional.laundry_form.gallery_placeholder', 'Glisser ou cliquer pour ajouter plusieurs photos')}
                  </span>
                </label>

                {pendingMediaFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {pendingMediaFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <span className={`truncate text-xs ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePendingMediaFile(index)}
                          className="ml-2 text-xs text-red-500 hover:text-red-600"
                        >
                          {t('common.delete', 'Supprimer')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {currentMedias.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {currentMedias.map((media) => (
                      <div
                        key={media.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <span className={`truncate text-xs ${isDarkTheme ? 'text-gray-200' : 'text-slate-700'}`}>
                          {media.originalName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(media.id)}
                          className="ml-2 text-xs text-red-500 hover:text-red-600"
                        >
                          {t('common.delete', 'Supprimer')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
             
            </div>
          </section>
          )}

          {currentStep === 2 && (
          <section>
            <h2 className="text-[17px] flex items-center font-bold text-left">
                <img src={OpenSignIcon} alt="" className="inline-block h-[20px] w-[20px] mr-2" />
                {t('professional.laundry_form.opening_hours', 'Horaires d’ouverture')}
            </h2>
            <div className={`mt-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />
            <div className="mt-4 overflow-hidden rounded-xl border border-[#D1D5DB]">
              <table className="min-w-full border-collapse text-left text-sm">
                <tbody className={isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-slate-900'}>
                  {openingHoursDays.map((day) => {
                    const isClosed = closedDays[day.key];

                    return (
                      <Fragment key={day.key}>
                        <tr key={`${day.key}-header`} className={`border-b ${isDarkTheme ? 'border-gray-700' : 'border-[#D1D5DB]'}`}>
                          <td colSpan={2} className="px-4 py-4 align-top">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-regular">{t(day.labelKey, day.fallbackLabel)}</span>
                              <button
                                type="button"
                                onClick={() => setClosedDays((current) => ({ ...current, [day.key]: !current[day.key] }))}
                                className={`text-[12px] w-[58px] h-[18px] rounded-[5px] flex items-center justify-center ${isClosed ? 'bg-[#F97316] text-white hover:bg-[#EA580C]' : 'border border-[#9CA3AF]'}`}
                              >
                                {t('common.closed', 'Fermé')}
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr key={`${day.key}-form`} className={`border-b last:border-b-0 ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`}>
                          <td colSpan={2} className={`px-4 py-4 ${isClosed ? 'opacity-60' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className="grid flex-1 grid-cols-2 gap-3">
                                <div>
                                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-700' : 'border-slate-300 bg-white'}`}>
                                    <input
                                      type="time"
                                      disabled={isClosed}
                                      {...register(`openingHours.${day.key}.open`)}
                                      className={`w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 ${isDarkTheme ? 'text-gray-100 disabled:text-gray-500' : 'text-slate-900'}`}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-gray-600 bg-gray-700' : 'border-slate-300 bg-white'}`}>
                                    <input
                                      type="time"
                                      disabled={isClosed}
                                      {...register(`openingHours.${day.key}.close`)}
                                      className={`w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 ${isDarkTheme ? 'text-gray-100 disabled:text-gray-500' : 'text-slate-900'}`}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <button
                                  type="button"
                                  onClick={() => addOpeningSlot(day.key)}
                                  disabled={isClosed}
                                  className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] bg-white text-[22px] leading-none text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={t('professional.laundry_form.add_opening_slot', 'Ajouter un créneau horaire')}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {Array.from({ length: additionalSlotsByDay[day.key] }).map((_, slotIndex) => (
                              <div key={`${day.key}-extra-${slotIndex}`} className="mt-3 flex items-start gap-2">
                                <div className="grid flex-1 grid-cols-2 gap-3">
                                  <div>
                                    <input
                                      type="time"
                                      disabled={isClosed}
                                      {...register(`openingHoursExtra.${day.key}.${slotIndex}.open`)}
                                      className={`w-full rounded-lg border border-dashed px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100 disabled:bg-gray-700 disabled:text-gray-500' : 'border-slate-300 bg-white text-slate-900'}`}
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="time"
                                      disabled={isClosed}
                                      {...register(`openingHoursExtra.${day.key}.${slotIndex}.close`)}
                                      className={`w-full rounded-lg border border-dashed px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100 disabled:bg-gray-700 disabled:text-gray-500' : 'border-slate-300 bg-white text-slate-900'}`}
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeOpeningSlot(day.key)}
                                  disabled={isClosed}
                                  className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] bg-white text-[22px] leading-none text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={t('professional.laundry_form.remove_opening_slot', 'Retirer un créneau horaire')}
                                >
                                  -
                                </button>
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

          {currentStep === 3 && (
          <section>
            <h2 className="text-[17px] flex items-center font-bold">
              <img src={ServicesIcon} alt="" className="mr-2 inline-block h-[20px] w-[20px]" />
              {t('professional.laundry_form.services_and_equipment', 'Machines & Équipements')}
            </h2>
            <div className={`mt-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />
            <h3 className={`mt-3 text-[14px] font-regular text-left ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
              {t('professional.laundry_form.washing_machines_by_capacity', 'Machines à laver (par capacité)')}
            </h3>
            <div className="mt-4 space-y-4">
              <div className={`rounded-xl border p-4 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-300 bg-white'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="washingMachines6kg" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.capacity_6kg', 'Machines 6 kg')}
                    </label>
                    <input
                      id="washingMachines6kg"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('washingMachines6kg', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.washingMachines6kg ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 12')}
                    />
                    {errors.washingMachines6kg && <p className="mt-1 text-xs text-red-500">{errors.washingMachines6kg.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="washingMachines8kg" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.capacity_8kg', 'Machines 8 kg')}
                    </label>
                    <input
                      id="washingMachines8kg"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('washingMachines8kg', {
                          min: {
                            value: 0,
                            message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                          },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.washingMachines8kg ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 8')}
                    />
                    {errors.washingMachines8kg && <p className="mt-1 text-xs text-red-500">{errors.washingMachines8kg.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="washingMachines10kg" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.capacity_10kg', 'Machines 10 kg')}
                    </label>
                    <input
                      id="washingMachines10kg"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('washingMachines10kg', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.washingMachines10kg ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 4')}
                    />
                    {errors.washingMachines10kg && <p className="mt-1 text-xs text-red-500">{errors.washingMachines10kg.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="washingMachines12kgPlus" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.capacity_12kg_plus', 'Machines 12 kg+')}
                    </label>
                    <input
                      id="washingMachines12kgPlus"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('washingMachines12kgPlus', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.washingMachines12kgPlus ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 2')}
                    />
                    {errors.washingMachines12kgPlus && <p className="mt-1 text-xs text-red-500">{errors.washingMachines12kgPlus.message}</p>}
                  </div>
                </div>
              </div>

              <h3 className={`mt-4 text-[14px] font-regular text-left ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                {t('professional.laundry_form.dryers_by_capacity', 'Sèche-linge (par capacité)')}
              </h3>
              <div className={`rounded-xl border p-4 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-300 bg-white'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dryers6kg" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.dryers_capacity_6kg', 'Sèche-linge 6 kg')}
                    </label>
                    <input
                      id="dryers6kg"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('dryers6kg', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.dryers6kg ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 12')}
                    />
                    {errors.dryers6kg && <p className="mt-1 text-xs text-red-500">{errors.dryers6kg.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="dryers8kg" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.dryers_capacity_8kg', 'Sèche-linge 8 kg')}
                    </label>
                    <input
                      id="dryers8kg"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('dryers8kg', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.dryers8kg ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 8')}
                    />
                    {errors.dryers8kg && <p className="mt-1 text-xs text-red-500">{errors.dryers8kg.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="dryers10kg" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.dryers_capacity_10kg', 'Sèche-linge 10 kg')}
                    </label>
                    <input
                      id="dryers10kg"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('dryers10kg', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.dryers10kg ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 4')}
                    />
                    {errors.dryers10kg && <p className="mt-1 text-xs text-red-500">{errors.dryers10kg.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="dryers12kgPlus" className={`mb-2 block text-[12px] font-regular text-left ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                      {t('professional.laundry_form.dryers_capacity_12kg_plus', 'Sèche-linge 12 kg+')}
                    </label>
                    <input
                      id="dryers12kgPlus"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      {...register('dryers12kgPlus', {
                        min: {
                          value: 0,
                          message: t('validation.machine_count_min', 'La valeur doit être supérieure ou égale à 0.'),
                        },
                      })}
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.dryers12kgPlus ? 'border-red-500' : ''}`}
                      placeholder={t('professional.laundry_form.machine_count_placeholder', 'Ex: 2')}
                    />
                    {errors.dryers12kgPlus && <p className="mt-1 text-xs text-red-500">{errors.dryers12kgPlus.message}</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className={`mt-4 text-[14px] font-regular text-left ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                  {t('professional.laundry_form.services_title', 'Services disponibles')}
                </h3>
              </div>
              <div className={`r p-4 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-300 bg-white'}`}>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {loadingOptions ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-500'}`}>
                      {t('common.loading_text', 'Chargement...')}
                    </p>
                  ) : serviceOptions.length === 0 ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-500'}`}>
                      {t('professional.laundry_form.no_services_available', 'Aucun service disponible')}
                    </p>
                  ) : (
                    serviceOptions.map((service, index) => (
                      <label key={service.id} className={`flex items-center gap-2 text-[10px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                        <input
                          type="checkbox"
                          value={String(service.id)}
                          {...register('serviceIds')}
                          className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <span>{t(service.translationKey, service.name)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
          )}

          {currentStep === 4 && (
          <section>
            <h2 className="text-[17px] flex items-center font-bold text-left">
              <img src={WifiBlueIcon} alt="" className="mr-2 inline-block h-[20px] w-[20px]" />
              {t('professional.laundry_form.wi_line_connectivity', 'Connectivité WI-LINE (Optionnel)')}
            </h2>
            <div className={`mt-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="showPreciseAddress"
                  className={`flex w-full cursor-pointer items-center justify-center gap-5 rounded-xl border border-dashed px-4 py-3 text-sm transition ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-[#F9FAFB] text-slate-900'}`}
                >
                  <span
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showPreciseAddress ? 'bg-[#3B82F6]' : isDarkTheme ? 'bg-gray-600' : 'bg-slate-300'}`}
                  >
                  <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showPreciseAddress ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </span>
                  <span className={`text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-[#9CA3AF]'}`}>
                      {t('professional.laundry_form.address_visibility_helper', 'Ma laverie possède des machines WI-LINE')}
                    </span>
                  
                  <input
                    id="showPreciseAddress"
                    type="checkbox"
                    {...register('showPreciseAddress')}
                    className="sr-only"
                  />
                </label>
              </div>

              {showPreciseAddress && (
                <div>
                  <label htmlFor="wiLineReference" className={`mb-2 block text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}>
                    {t('professional.laundry_form.wiline_client_code', 'Code client WI-LINE')}<span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    id="wiLineReference"
                    type="text"
                    inputMode="numeric"
                    {...register('wiLineReference', {
                      validate: (value) => {
                        if (!showPreciseAddress) {
                          return true;
                        }

                        const trimmed = (value || '').trim();
                        if (trimmed === '') {
                          return t('validation.wiline_client_code_required', 'Le code client WI-LINE est requis.');
                        }

                        if (!/^\d+$/.test(trimmed)) {
                          return t('validation.wiline_client_code_invalid', 'Le code client WI-LINE doit contenir uniquement des chiffres.');
                        }

                        return true;
                      },
                    })}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors.wiLineReference ? 'border-red-500' : ''}`}
                    placeholder={t('professional.laundry_form.wiline_client_code_placeholder', 'Ex: 1554')}
                  />
                  {errors.wiLineReference && <p className="mt-1 text-xs text-red-500">{errors.wiLineReference.message}</p>}
                  {!errors.wiLineReference && wiLineError && <p className="mt-1 text-xs text-red-500">{wiLineError}</p>}
                  {!errors.wiLineReference && !wiLineError && wiLineLoading && (
                    <p className={`mt-1 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                      {t('professional.laundry_form.wiline_loading', 'Récupération des machines WI-LINE...')}
                    </p>
                  )}
                  {!errors.wiLineReference && !wiLineError && !wiLineLoading && wiLineAutoFillSuccess && lastFetchedWiLineCode === (wiLineReference || '').trim() && (wiLineReference || '').trim() !== '' && (
                    <p className="mt-1 text-xs text-green-600">
                      {t('professional.laundry_form.wiline_autofill_done', 'Machines WI-LINE récupérées et champs mis à jour.')}
                    </p>
                  )}
                </div>
              )}
            </div>
            <h2 className="mt-6 flex items-center text-left text-[17px] font-bold">
              <img src={EuroIcon} alt="" className="mr-2 inline-block h-[20px] w-[20px]" />
              {t('professional.laundry_form.tarifications', 'Tarifications')}
            </h2>
            <div className={`mt-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-slate-200'}`} />
            <div className="mt-4 space-y-4">
              <div>
                <h3 className={`mb-3 text-left text-[14px] font-regular ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                  {t('professional.laundry_form.washing_price', 'Prix lavage (€)')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {pricingByCapacity.map((capacity) => (
                    <div key={`washing-${capacity.key}`}>
                      <label
                        htmlFor={capacity.washingField}
                        className={`mb-2 block text-left text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}
                      >
                        {t(capacity.labelKey, capacity.fallbackLabel)}
                      </label>
                      <input
                        id={capacity.washingField}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        {...register(capacity.washingField, {
                          min: {
                            value: 0,
                            message: t('validation.price_min', 'Le prix doit être supérieur ou égal à 0.'),
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors[capacity.washingField] ? 'border-red-500' : ''}`}
                        placeholder={t('professional.laundry_form.price_placeholder', 'Ex: 5,00')}
                      />
                      {errors[capacity.washingField] && <p className="mt-1 text-xs text-red-500">{errors[capacity.washingField].message}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`mb-3 text-left text-[14px] font-regular ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                  {t('professional.laundry_form.drying_price', 'Prix séchage (€)')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {pricingByCapacity.map((capacity) => (
                    <div key={`drying-${capacity.key}`}>
                      <label
                        htmlFor={capacity.dryingField}
                        className={`mb-2 block text-left text-[12px] font-regular ${isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'}`}
                      >
                        {t(capacity.dryingLabelKey, capacity.dryingFallbackLabel)}
                      </label>
                      <input
                        id={capacity.dryingField}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        {...register(capacity.dryingField, {
                          min: {
                            value: 0,
                            message: t('validation.price_min', 'Le prix doit être supérieur ou égal à 0.'),
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'} ${errors[capacity.dryingField] ? 'border-red-500' : ''}`}
                        placeholder={t('professional.laundry_form.price_placeholder', 'Ex: 5,00')}
                      />
                      {errors[capacity.dryingField] && <p className="mt-1 text-xs text-red-500">{errors[capacity.dryingField].message}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={`mb-3 text-left text-[14px] font-regular ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                  {t('professional.laundry_form.payment_methods_title', 'Modes de paiement acceptés')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {loadingOptions ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-500'}`}>
                      {t('common.loading_text', 'Chargement...')}
                    </p>
                  ) : paymentMethodOptions.length === 0 ? (
                    <p className={`col-span-2 text-xs ${isDarkTheme ? 'text-gray-300' : 'text-slate-500'}`}>
                      {t('professional.laundry_form.no_payment_methods_available', 'Aucun mode de paiement disponible')}
                    </p>
                  ) : (
                    paymentMethodOptions.map((paymentMethod) => (
                      <label key={paymentMethod.id} className={`flex items-center gap-2 text-[12px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                        <input
                          type="checkbox"
                          value={String(paymentMethod.id)}
                          {...register('paymentMethodIds')}
                          className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <span>{t(paymentMethod.translationKey, paymentMethod.name)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
          )}

          <div className="flex w-full flex-col items-end gap-2">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={submitting}
                  className={`flex h-[34px] w-[114px] items-center justify-center rounded-[6px] border border-[#D1D5DB] bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 ${isDarkTheme ? 'bg-white text-slate-700 hover:bg-slate-50' : ''}`}
                >
                  {t('common.previous')}
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  key="next-step"
                  type="button"
                  onClick={(event) => goToNextStep(event)}
                  disabled={submitting}
                  className="flex items-center justify-center rounded-[6px] w-[114px] h-[34px] bg-[#3B82F6] px-5 py-3 text-sm text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {t('common.next')}
                  <img src={ArrowIcon} alt="" className="ml-2 inline-block h-[18px] w-[20px] align-middle" />
                </button>
              ) : (
                <button
                  key="final-save"
                  type="submit"
                  data-submit-intent="final-save"
                  disabled={submitting}
                  className="flex items-center justify-center rounded-[6px] w-[114px] h-[34px] bg-[#3B82F6] px-5 py-3 text-sm text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50 gap-1"
                >
                  <img src={SaveIcon} alt="" className="ml-2 h-[14px] w-[14px]" />
                  {submitting ? (
                    t('common.loading_text', 'Chargement...')
                  ) : (
                    <>
                      {t('common.save', 'Enregistrer')}
                    </>
                  )}
                </button>
              )}
            </div>
            {currentStep === totalSteps && (
              <p className={`text-right text-[10px] ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
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