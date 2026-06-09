import { useMemo, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import { translateErrorKey, formatValidationErrors } from '../../utils/translateErrorKey';
import { getStrongPasswordRules } from '../../utils/passwordValidation';
import FormField from '../common/FormField';
import PasswordField from '../common/PasswordField';

const ProfessionalRegister = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.register_professional', t);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sirenStatus, setSirenStatus] = useState(null); // 'checking' | 'verified' | 'not_found' | 'error'
  const sirenDebounceRef = useRef(null);
  const countryOptions = useMemo(() => countryList().getData(), []);

  // Validation messages
  const validationMessages = {
    lastNameRequired: t('validation.last_name_required'),
    firstNameRequired: t('validation.first_name_required'),
    nameMaxLength: t('validation.name_max_length'),
    emailRequired: t('validation.email_required'),
    emailInvalid: t('validation.email_invalid'),
    passwordConfirmationRequired: t('validation.password_confirmation_required'),
    acceptTerms: t('auth.accept_terms'),
    sirenRequired: t('validation.siren_required'),
    sirenInvalidLength: t('validation.siren_invalid_length'),
    streetRequired: t('validation.street_required'),
    postalCodeRequired: t('validation.postal_code_required'),
    postalCodeInvalid: t('validation.postal_code_invalid_exact'),
    cityRequired: t('validation.city_required'),
    countryRequired: t('validation.country_required'),
    phoneRequired: t('validation.phone_required'),
    phoneInvalid: t('validation.phone_invalid'),
    companyNameRequired: t('validation.company_name_required'),
    companyNameMaxLength: t('validation.company_name_max_length'),
  };

  // Configuration React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      siren: '',
      companyName: '',
      phone: '',
      street: '',
      postalCode: '',
      city: '',
      country: 'France',
      acceptCGU: false,
    },
  });

  const handleSirenChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setValue('siren', value);

    clearTimeout(sirenDebounceRef.current);

    if (value.length !== 9) {
      setSirenStatus(null);
      return;
    }

    setSirenStatus('checking');
    sirenDebounceRef.current = setTimeout(async () => {
      try {
        const info = await authService.lookupSiren(value);
        setValue('companyName', info.companyName, { shouldValidate: true });
        setValue('street', info.street, { shouldValidate: true });
        setValue('postalCode', info.postalCode, { shouldValidate: true });
        setValue('city', info.city, { shouldValidate: true });
        setValue('country', info.country, { shouldValidate: true, shouldDirty: true });
        setSirenStatus('verified');
      } catch (err) {
        setSirenStatus(err.message === 'not_found' ? 'not_found' : 'error');
      }
    }, 400);
  }, [setValue, sirenDebounceRef]);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);

    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        setApiError(t('auth.passwords_not_match'));
        setLoading(false);
        return;
      }

      // Validate CGU acceptance
      if (!data.acceptCGU) {
        setApiError(t('auth.accept_terms'));
        setLoading(false);
        return;
      }

      // Call professional registration API
      await authService.registerProfessional(data);

      navigate('/login', {
        state: { successMessage: t('auth.registration_request_received') },
      });
    } catch (error) {
      console.error('Professional registration error:', error);
      
      if (error.body?.error) {
        setApiError(translateErrorKey(error.body.error, t));
      } else if (error.body?.errors) {
        // Handle multiple field errors
        setApiError(formatValidationErrors(error.body.errors, t));
      } else if (error.message) {
        setApiError(error.message);
      } else {
        setApiError(t('auth.registration_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
      isDarkTheme
        ? 'bg-gray-700 text-white placeholder-gray-400'
        : 'bg-white text-gray-900'
    } ${hasError ? 'border-red-500' : isDarkTheme ? 'border-gray-600' : 'border-gray-300'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-6 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className="text-center text-[#3B82F6] font-semibold text-2xl mb-4 sm:mb-6 font-sans">
          {t('auth.register_professional_title', 'Créer un compte professionnel')}
        </h1>

        {/* Error Alert */}
        {apiError && (
          <div className={`mb-4 p-3 border rounded-md text-sm whitespace-pre-line ${
            isDarkTheme
              ? 'bg-red-900/40 border-red-700 text-red-300'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          {/* INFORMATIONS PERSONNELLES */}
          <h2 className={`text-left font-extrabold text-[14px] mb-4 sm:mb-6 font-sans ${isDarkTheme ? 'text-gray-300' : 'text-[#374151]'}`}>
            {t('auth.personal_info')}
          </h2>

          <FormField label={t('auth.last_name')} error={errors.name?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: validationMessages.lastNameRequired,
                maxLength: { value: 50, message: validationMessages.nameMaxLength },
              })}
              maxLength={50}
              className={inputClass(errors.name)}
              placeholder={t('auth.placeholder_last_name')}
            />
          </FormField>

          <FormField label={t('auth.first_name')} error={errors.firstName?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="firstName"
              {...register('firstName', {
                required: validationMessages.firstNameRequired,
                maxLength: { value: 50, message: validationMessages.nameMaxLength },
              })}
              maxLength={50}
              className={inputClass(errors.firstName)}
              placeholder={t('auth.placeholder_first_name')}
            />
          </FormField>

          {/* INFORMATIONS PROFESSIONNELLES */}
          <h2 className={`text-left font-extrabold text-[14px] mb-4 sm:mb-6 font-sans mt-6 ${isDarkTheme ? 'text-gray-300' : 'text-[#374151]'}`}>
            {t('auth.company_section_title')}
          </h2>

          <FormField label={t('auth.siren')} error={errors.siren?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="siren"
              {...register('siren', {
                required: validationMessages.sirenRequired,
                pattern: { value: /^\d{9}$/, message: validationMessages.sirenInvalidLength },
              })}
              onChange={handleSirenChange}
              maxLength={9}
              inputMode="numeric"
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                isDarkTheme
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-white text-gray-900'
              } ${
                errors.siren
                  ? 'border-red-500'
                  : sirenStatus === 'verified'
                    ? 'border-green-500'
                    : isDarkTheme ? 'border-gray-600' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_siren')}
            />
            {sirenStatus === 'checking' && (
              <p className={`text-xs mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{t('auth.siren_checking')}</p>
            )}
            {sirenStatus === 'verified' && (
              <p className="text-xs text-green-500 mt-1">✓ {t('auth.siren_verified')}</p>
            )}
            {sirenStatus === 'not_found' && (
              <p className="text-xs text-red-400 mt-1">{t('auth.siren_not_found_inline')}</p>
            )}
            {sirenStatus === 'error' && (
              <p className="text-xs text-red-400 mt-1">{t('auth.siren_error_inline')}</p>
            )}
          </FormField>

          <FormField label={t('auth.company_name')} error={errors.companyName?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="companyName"
              {...register('companyName', {
                required: validationMessages.companyNameRequired,
                maxLength: { value: 50, message: validationMessages.companyNameMaxLength },
              })}
              maxLength={50}
              className={inputClass(errors.companyName)}
              placeholder={t('auth.placeholder_company_name')}
            />
          </FormField>

          <FormField label={t('auth.phone')} error={errors.phone?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="tel"
              id="phone"
              {...register('phone', { required: validationMessages.phoneRequired })}
              className={inputClass(errors.phone)}
              placeholder={t('auth.placeholder_phone')}
            />
          </FormField>

          <FormField label={t('auth.street')} error={errors.street?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="street"
              {...register('street', { required: validationMessages.streetRequired })}
              className={inputClass(errors.street)}
              placeholder={t('auth.placeholder_street')}
            />
          </FormField>

          <FormField label={t('auth.postal_code')} error={errors.postalCode?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="postalCode"
              {...register('postalCode', {
                required: validationMessages.postalCodeRequired,
                pattern: { value: /^\d{5}$/, message: validationMessages.postalCodeInvalid },
              })}
              className={inputClass(errors.postalCode)}
              placeholder={t('auth.placeholder_postal_code')}
            />
          </FormField>

          <FormField label={t('auth.city')} error={errors.city?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="text"
              id="city"
              {...register('city', { required: validationMessages.cityRequired })}
              className={inputClass(errors.city)}
              placeholder={t('auth.placeholder_city')}
            />
          </FormField>

          <FormField label={t('auth.country')} error={errors.country?.message} required isDarkTheme={isDarkTheme}>
            <Select
              inputId="country"
              options={countryOptions}
              value={countryOptions.find((option) => option.label === watch('country')) || null}
              onChange={(option) => {
                setValue('country', option?.label || '', { shouldValidate: true, shouldDirty: true });
              }}
              placeholder={t('auth.placeholder_country')}
              className="text-sm"
              classNamePrefix="country-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 44,
                  backgroundColor: isDarkTheme ? '#374151' : base.backgroundColor,
                  borderColor: errors.country
                    ? '#ef4444'
                    : state.isFocused
                      ? '#3b82f6'
                      : isDarkTheme ? '#4b5563' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none',
                  '&:hover': { borderColor: state.isFocused ? '#3b82f6' : isDarkTheme ? '#6b7280' : '#9ca3af' },
                }),
                singleValue: (base) => ({
                  ...base,
                  color: isDarkTheme ? '#f9fafb' : base.color,
                }),
                input: (base) => ({
                  ...base,
                  color: isDarkTheme ? '#f9fafb' : base.color,
                }),
                placeholder: (base) => ({
                  ...base,
                  color: isDarkTheme ? '#9ca3af' : base.color,
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 30,
                  backgroundColor: isDarkTheme ? '#1f2937' : base.backgroundColor,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? isDarkTheme ? '#374151' : '#eff6ff'
                    : isDarkTheme ? '#1f2937' : base.backgroundColor,
                  color: isDarkTheme ? '#f9fafb' : base.color,
                }),
              }}
            />
            <input type="hidden" {...register('country', { required: validationMessages.countryRequired })} />
          </FormField>

          {/* INFORMATIONS DE CONNEXION */}
          <h2 className={`text-left font-extrabold text-[14px] mb-4 sm:mb-6 font-sans mt-6 ${isDarkTheme ? 'text-gray-300' : 'text-[#374151]'}`}>
            {t('auth.connection_info')}
          </h2>

          <FormField label={t('auth.email')} error={errors.email?.message} required isDarkTheme={isDarkTheme}>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: validationMessages.emailRequired,
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: validationMessages.emailInvalid },
              })}
              className={inputClass(errors.email)}
              placeholder={t('auth.placeholder_email')}
            />
          </FormField>

          <PasswordField
            label={t('auth.password')}
            id="password"
            error={errors.password?.message}
            required
            isDarkTheme={isDarkTheme}
            inputProps={register('password', getStrongPasswordRules(t))}
          />

          <PasswordField
            label={t('auth.confirm_password')}
            id="confirmPassword"
            error={errors.confirmPassword?.message}
            required
            isDarkTheme={isDarkTheme}
            inputProps={register('confirmPassword', { required: validationMessages.passwordConfirmationRequired })}
          />

          {/* Checkbox CGU */}
          <div className="flex items-center gap-3 text-left">
            <input
              type="checkbox"
              id="acceptCGU"
              {...register('acceptCGU', {
                required: validationMessages.acceptTerms,
              })}
              className={`mt-1 h-4 w-4 text-blue-600 border-2 rounded focus:ring-blue-500 ${isDarkTheme ? 'border-gray-500 bg-gray-700' : 'border-gray-300'}`}
            />
            <div>
              <label htmlFor="acceptCGU" className={`block text-[13px] text-left ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.accept_cgu')}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  {t('auth.cgu_link')}
                </a>
                <span className="text-red-400">*</span>
              </label>
              {errors.acceptCGU && (
                <p className="text-red-400 text-xs mt-1">{errors.acceptCGU.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 sm:py-2 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? t('auth.register_loading') : t('auth.register_professional_cta', 'Créer mon compte')}
          </button>
        </form>

        {/* Link to login */}
        <p className={`text-center mt-4 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('navigation.have_account')}{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#3B82F6] hover:text-blue-400 font-medium underline"
          >
            {t('auth.login')}
          </button>
        </p>

        {/* Link to regular registration */}
        <p className={`text-center mt-2 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('common.or')}{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#3B82F6] hover:text-blue-400 font-medium underline"
          >
            {t('auth.register_user')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ProfessionalRegister;
