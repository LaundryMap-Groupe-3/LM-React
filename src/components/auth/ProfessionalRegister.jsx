import { useMemo, useState } from 'react';
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

const ProfessionalRegister = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.register_professional', t);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
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
    siretRequired: t('validation.siret_required'),
    siretInvalidLength: t('validation.siret_invalid_length'),
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
      siret: '',
      companyName: '',
      phone: '',
      street: '',
      postalCode: '',
      city: '',
      country: '',
      acceptCGU: false,
    },
  });

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8">
        <h1 className="text-center text-[#3B82F6] font-semibold text-2xl mb-4 sm:mb-6 font-sans">
          {t('auth.register_professional_title', 'Créer un compte professionnel')}
        </h1>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm whitespace-pre-line">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          {/* INFORMATIONS PERSONNELLES */}
          <h2 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans">
            {t('auth.personal_info')}
          </h2>

          <FormField label={t('auth.last_name')} error={errors.name?.message} required>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: validationMessages.lastNameRequired,
                maxLength: { value: 50, message: validationMessages.nameMaxLength },
              })}
              maxLength={50}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_last_name')}
            />
          </FormField>

          <FormField label={t('auth.first_name')} error={errors.firstName?.message} required>
            <input
              type="text"
              id="firstName"
              {...register('firstName', {
                required: validationMessages.firstNameRequired,
                maxLength: { value: 50, message: validationMessages.nameMaxLength },
              })}
              maxLength={50}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_first_name')}
            />
          </FormField>

          {/* INFORMATIONS PROFESSIONNELLES */}
          <h2 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans mt-6">
            {t('auth.company_section_title')}
          </h2>

          <FormField label={t('auth.siret')} error={errors.siret?.message} required>
            <input
              type="text"
              id="siret"
              {...register('siret', {
                required: validationMessages.siretRequired,
                pattern: { value: /^\d{13,14}$/, message: validationMessages.siretInvalidLength },
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.siret ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_siret')}
            />
          </FormField>

          <FormField label={t('auth.company_name')} error={errors.companyName?.message} required>
            <input
              type="text"
              id="companyName"
              {...register('companyName', {
                required: validationMessages.companyNameRequired,
                maxLength: { value: 50, message: validationMessages.companyNameMaxLength },
              })}
              maxLength={50}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_company_name')}
            />
          </FormField>

          <FormField label={t('auth.phone')} error={errors.phone?.message} required>
            <input
              type="tel"
              id="phone"
              {...register('phone', { required: validationMessages.phoneRequired })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_phone')}
            />
          </FormField>

          <FormField label={t('auth.street')} error={errors.street?.message} required>
            <input
              type="text"
              id="street"
              {...register('street', { required: validationMessages.streetRequired })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_street')}
            />
          </FormField>

          <FormField label={t('auth.postal_code')} error={errors.postalCode?.message} required>
            <input
              type="text"
              id="postalCode"
              {...register('postalCode', {
                required: validationMessages.postalCodeRequired,
                pattern: { value: /^\d{5}$/, message: validationMessages.postalCodeInvalid },
              })}
              className={`w-full h-[44px] px-3 border text-[#9CA3AF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_postal_code')}
            />
          </FormField>

          <FormField label={t('auth.city')} error={errors.city?.message} required>
            <input
              type="text"
              id="city"
              {...register('city', { required: validationMessages.cityRequired })}
              className={`w-full h-[44px] px-3 border text-[#9CA3AF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_city')}
            />
          </FormField>

          <FormField label={t('auth.country')} error={errors.country?.message} required>
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
                  borderColor: errors.country ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none',
                  '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#9ca3af' },
                }),
                menu: (base) => ({ ...base, zIndex: 30 }),
              }}
            />
            <input type="hidden" {...register('country', { required: validationMessages.countryRequired })} />
          </FormField>

          {/* INFORMATIONS DE CONNEXION */}
          <h2 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans mt-6">
            {t('auth.connection_info')}
          </h2>

          <FormField label={t('auth.email')} error={errors.email?.message} required>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: validationMessages.emailRequired,
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: validationMessages.emailInvalid },
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder={t('auth.placeholder_email')}
            />
          </FormField>

          <PasswordField
            label={t('auth.password')}
            id="password"
            error={errors.password?.message}
            required
            inputProps={register('password', getStrongPasswordRules(t))}
          />

          <PasswordField
            label={t('auth.confirm_password')}
            id="confirmPassword"
            error={errors.confirmPassword?.message}
            required
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
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <label htmlFor="acceptCGU" className="block text-[13px] text-gray-700 text-left">
                {t('auth.accept_cgu')}
                <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                  {t('auth.cgu_link')}
                </a>
                <span className="text-red-500">*</span>
              </label>
              {errors.acceptCGU && (
                <p className="text-red-500 text-xs mt-1">{errors.acceptCGU.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 sm:py-2 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? t('auth.register_loading') : t('auth.register_professional_cta', 'Créer mon compte')}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center mt-4 text-sm text-gray-600">
          {t('navigation.have_account')}{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#3B82F6] hover:text-blue-700 font-medium underline"
          >
            {t('auth.login')}
          </button>
        </p>

        {/* Link to regular registration */}
        <p className="text-center mt-2 text-sm text-gray-600">
          {t('common.or')}{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#3B82F6] hover:text-blue-700 font-medium underline"
          >
            {t('auth.register_user')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ProfessionalRegister;
