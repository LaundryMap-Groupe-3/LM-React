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
import EyeIcon from '../../assets/images/icons/Eye.svg';
import InvisibleIcon from '../../assets/images/icons/Invisible.svg';

const ProfessionalRegister = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.register_professional', t);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          <h1 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans">
            {t('auth.personal_info')}
          </h1>

          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.last_name')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: validationMessages.lastNameRequired,
                maxLength: {
                  value: 50,
                  message: validationMessages.nameMaxLength,
                },
              })}
              maxLength={50}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_last_name')}
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
            )}
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="firstName" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.first_name')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              {...register('firstName', {
                required: validationMessages.firstNameRequired,
                maxLength: {
                  value: 50,
                  message: validationMessages.nameMaxLength,
                },
              })}
              maxLength={50}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_first_name')}
            />
            {errors.firstName && (
              <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>
            )}
          </div>

          {/* INFORMATIONS PROFESSIONNELLES */}
          <h1 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans mt-6">
            {t('auth.professional_info')}
          </h1>

          {/* SIRET */}
          <div>
            <label htmlFor="siret" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.siret')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="siret"
              {...register('siret', {
                required: validationMessages.siretRequired,
                pattern: {
                  value: /^\d{13,14}$/,
                  message: validationMessages.siretInvalidLength,
                },
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.siret ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_siret')}
            />
            {errors.siret && (
              <span className="text-red-500 text-xs mt-1">{errors.siret.message}</span>
            )}
          </div>

          {/* Nom de l'entreprise */}
          <div>
            <label htmlFor="companyName" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.company_name')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              {...register('companyName', {
                required: validationMessages.companyNameRequired,
                maxLength: {
                  value: 50,
                  message: validationMessages.companyNameMaxLength,
                },
              })}
              maxLength={50}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_company_name')}
            />
            {errors.companyName && (
              <span className="text-red-500 text-xs mt-1">{errors.companyName.message}</span>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.phone')}<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone', {
                required: validationMessages.phoneRequired,
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_phone')}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>
            )}
          </div>

          {/* Rue et numéro */}
          <div>
            <label htmlFor="street" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.street')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="street"
              {...register('street', {
                required: validationMessages.streetRequired,
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.street ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_street')}
            />
            {errors.street && (
              <span className="text-red-500 text-xs mt-1">{errors.street.message}</span>
            )}
          </div>

          {/* Code postal */}
          <div>
            <label htmlFor="postalCode" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.postal_code')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postalCode"
              {...register('postalCode', {
                required: validationMessages.postalCodeRequired,
                pattern: {
                  value: /^\d{5}$/,
                  message: validationMessages.postalCodeInvalid,
                },
              })}
              className={`w-full h-[44px] px-3 border text-[#9CA3AF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_postal_code')}
            />
            {errors.postalCode && (
              <span className="text-red-500 text-xs mt-1">{errors.postalCode.message}</span>
            )}
          </div>

          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.city')}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              {...register('city', {
                required: validationMessages.cityRequired,
              })}
              className={`w-full h-[44px] px-3 border text-[#9CA3AF] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_city')}
            />
            {errors.city && (
              <span className="text-red-500 text-xs mt-1">{errors.city.message}</span>
            )}
          </div>

          {/* Pays */}
          <div>
            <label htmlFor="country" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.country')}<span className="text-red-500">*</span>
            </label>
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
                  '&:hover': {
                    borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 30,
                }),
              }}
            />
            <input
              type="hidden"
              {...register('country', {
                required: validationMessages.countryRequired,
              })}
            />
            {errors.country && (
              <span className="text-red-500 text-xs mt-1">{errors.country.message}</span>
            )}
          </div>

          {/* INFORMATIONS DE CONNEXION */}
          <h1 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans mt-6">
            {t('auth.connection_info')}
          </h1>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.email')}<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: validationMessages.emailRequired,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: validationMessages.emailInvalid,
                },
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('auth.placeholder_email')}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.password')}<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password', getStrongPasswordRules(t))}
                className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center"
                aria-label={showPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
              >
                <img
                  src={showPassword ? InvisibleIcon : EyeIcon}
                  alt={showPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                  className="w-[17px] h-[17px]"
                />
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-sm text-gray-700 mb-1">
              {t('auth.confirm_password')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: validationMessages.passwordConfirmationRequired,
                })}
                className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center"
                aria-label={showConfirmPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
              >
                <img
                  src={showConfirmPassword ? InvisibleIcon : EyeIcon}
                  alt={showConfirmPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                  className="w-[17px] h-[17px]"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</span>
            )}
          </div>

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
