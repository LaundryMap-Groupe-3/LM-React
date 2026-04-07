import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import LeftArrowIcon from '../../assets/images/icons/Left-Arrow.svg';
import ArrowIcon from '../../assets/images/icons/Arrow-white.svg';
import PhoneIcon from '../../assets/images/icons/Phone.svg';
import ShopIcon from '../../assets/images/icons/Shop-blue.svg';
import UploadIcon from '../../assets/images/icons/Upload.svg';
import InfoGrayIcon from '../../assets/images/icons/Info-gray.svg';
import OpenSignIcon from '../../assets/images/icons/Open-Sign.svg';
import ServicesIcon from '../../assets/images/icons/Services.svg';
import LocationIcon from '../../assets/images/icons/Location.svg';
import BenchIcon from '../../assets/images/icons/Bench.svg';
import SoapBubbleIcon from '../../assets/images/icons/Soap Bubble.svg';
import TVIcon from '../../assets/images/icons/TV.svg';
import StackOfCoinsIcon from '../../assets/images/icons/Stack of Coins.svg';
import ParkingIcon from '../../assets/images/icons/Parking.svg';
import WifiIcon from '../../assets/images/icons/Wi-Fi Logo.svg';
import WifiBlueIcon from '../../assets/images/icons/Wi-Fi-blue.svg';
import EuroIcon from '../../assets/images/icons/Euro.svg';
import SaveIcon from '../../assets/images/icons/Save.svg';
import PaymentCardIcon from '../../assets/images/icons/Magnetic Card.svg';
import PayIcon from '../../assets/images/icons/Pay.svg';
import MobilePaymentIcon from '../../assets/images/icons/iPhone SE.svg';

const defaultValues = {
  establishmentName: '',
  contactPhone: '',
  description: '',
  logo: null,
  washingMachines6kg: '',
  washingMachines8kg: '',
  washingMachines10kg: '',
  washingMachines12kgPlus: '',
  dryers6kg: '',
  dryers8kg: '',
  dryers10kg: '',
  dryers12kgPlus: '',
  services: {
    foldingArea: false,
    detergentDispenser: false,
    cardPayment: false,
    cashPayment: false,
    parking: false,
    wifi: false,
  },
  paymentMethods: {
    card: false,
    cash: false,
    contactless: false,
    mobile: false,
  },
  customServices: [],
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
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
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
    washingField: 'washingPrice6kg',
    dryingField: 'dryingPrice6kg',
  },
  {
    key: '8kg',
    labelKey: 'professional.laundry_form.capacity_8kg',
    fallbackLabel: '8 kg',
    washingField: 'washingPrice8kg',
    dryingField: 'dryingPrice8kg',
  },
  {
    key: '10kg',
    labelKey: 'professional.laundry_form.capacity_10kg',
    fallbackLabel: '10 kg',
    washingField: 'washingPrice10kg',
    dryingField: 'dryingPrice10kg',
  },
  {
    key: '12kgPlus',
    labelKey: 'professional.laundry_form.capacity_12kg_plus',
    fallbackLabel: '12 kg+',
    washingField: 'washingPrice12kgPlus',
    dryingField: 'dryingPrice12kgPlus',
  },
];

const ProfessionalLaundryForm = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.create_laundry', t);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [submitting, setSubmitting] = useState(false);
  const [closedDays, setClosedDays] = useState(initialClosedDays);
  const [additionalSlotsByDay, setAdditionalSlotsByDay] = useState(initialAdditionalSlots);
  const [customServicesCount, setCustomServicesCount] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues,
  });
  const selectedLogo = watch('logo');
  const showPreciseAddress = watch('showPreciseAddress');

  const onSubmit = async () => {
    if (currentStep !== totalSteps) {
      return;
    }

    setSubmitting(true);
    setSubmitting(false);
  };

  const handleCancel = () => {
    navigate('/professional-dashboard');
  };

  const goToNextStep = async () => {
    const fieldsByStep = {
      1: ['establishmentName', 'contactPhone', 'description'],
      2: [],
      3: [],
      4: ['country'],
    };

    const isValid = fieldsByStep[currentStep].length > 0 ? await trigger(fieldsByStep[currentStep]) : true;
    if (!isValid) {
      return;
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

  const addCustomService = () => {
    setCustomServicesCount((current) => current + 1);
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
                    {t('professional.laundry_form.create_laundry_title', 'Ajouter une laverie')}
                </h1>
                <p className={`mt-2 text-[10px] ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
                    {t('professional.laundry_form.create_laundry_subtitle', 'Renseignez les informations de votre établissement')}
                </p>
            </div>
        </div>
      <div className="mx-auto w-full flex flex-col">

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
                  })}
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
                    {selectedLogo?.[0]?.name || t('professional.laundry_form.logo_placeholder', 'Glisser ou cliquer pour uploader')}
                  </span>
                </label>
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
                          <td className="px-4 py-4 pr-[135px] align-top font-regular">{day.label}</td>
                          <td className="px-4 py-4 align-top text-right">
                            <button
                              type="button"
                              onClick={() => setClosedDays((current) => ({ ...current, [day.key]: !current[day.key] }))}
                              className={`text-[12px] w-[58px] h-[18px] rounded-[5px] flex items-center justify-center ${isClosed ? 'bg-[#F97316] text-white hover:bg-[#EA580C]' : 'border border-[#9CA3AF]'}`}
                            >
                              {t('common.closed', 'Fermé')}
                            </button>
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addCustomService}
                    className={`flex h-[28px] w-[28px] items-center justify-center rounded-md border text-[18px] leading-none transition-colors ${isDarkTheme ? 'border-[#D1D5DB] bg-gray-700 text-[#D1D5DB] hover:bg-gray-600' : 'border-[#D1D5DB] bg-white text-[#D1D5DB] hover:bg-slate-50'}`}
                    aria-label={t('professional.laundry_form.add_service', 'Ajouter un service')}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={`r p-4 ${isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-slate-300 bg-white'}`}>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('services.foldingArea')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={BenchIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.service_folding_area', 'Banc disponible')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('services.detergentDispenser')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={SoapBubbleIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.service_detergent_dispenser', 'Distributeur de lessive')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('services.cardPayment')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={TVIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.service_card_payment', 'Télévision')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('services.cashPayment')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={StackOfCoinsIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.service_cash_payment', 'Paiement en espèces')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('services.parking')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={ParkingIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.service_parking', 'Parking')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[8px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('services.wifi')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={WifiIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.service_wifi', 'Wi-Fi')}</span>
                  </label>
                </div>
                {customServicesCount > 0 && (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: customServicesCount }).map((_, index) => (
                      <div key={`custom-service-${index}`}>
                        <input
                          type="text"
                          {...register(`customServices.${index}`)}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#3B82F6] ${isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-slate-300 bg-white text-slate-900'}`}
                          placeholder={t('professional.laundry_form.custom_service_placeholder', 'Nom du service')}
                        />
                      </div>
                    ))}
                  </div>
                )}
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
                        {t(capacity.labelKey, capacity.fallbackLabel)}
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
                  <label className={`flex items-center gap-2 text-[12px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('paymentMethods.card')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={PaymentCardIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.payment_card', 'Carte bancaire')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[12px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('paymentMethods.cash')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={StackOfCoinsIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.payment_cash', 'Espèces')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[12px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('paymentMethods.contactless')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={PayIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.payment_contactless', 'Sans contact')}</span>
                  </label>
                  <label className={`flex items-center gap-2 text-[12px] ${isDarkTheme ? 'text-gray-100' : 'text-slate-800'}`}>
                    <input type="checkbox" {...register('paymentMethods.mobile')} className="h-4 w-4 rounded border-slate-300 text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <img src={MobilePaymentIcon} alt="" className="h-[21px] w-[21px]" />
                    <span>{t('professional.laundry_form.payment_mobile', 'Paiement mobile')}</span>
                  </label>
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
                  type="button"
                  onClick={goToNextStep}
                  disabled={submitting}
                  className="flex items-center justify-center rounded-[6px] w-[114px] h-[34px] bg-[#3B82F6] px-5 py-3 text-sm text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {t('common.next')}
                  <img src={ArrowIcon} alt="" className="ml-2 inline-block h-[18px] w-[20px] align-middle" />
                </button>
              ) : (
                <button
                  type="submit"
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
                {t('professional.laundry_form.form_local_only', 'Après soumission, votre laverie sera en attente de validation')}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalLaundryForm;