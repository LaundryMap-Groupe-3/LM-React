import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import { translateErrorKey, formatValidationErrors } from '../../utils/translateErrorKey';
import { getStrongPasswordRules } from '../../utils/passwordValidation';
import { useGoogleLogin } from '@react-oauth/google';
import EyeIcon from '../../assets/images/icons/Eye.svg';
import InvisibleIcon from '../../assets/images/icons/Invisible.svg';

const Register = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.register', t);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation messages
  const validationMessages = {
    lastNameRequired: t('validation.last_name_required'),
    firstNameRequired: t('validation.first_name_required'),
    nameMaxLength: t('validation.name_max_length'),
    emailRequired: t('validation.email_required'),
    emailInvalid: t('validation.email_invalid'),
    passwordConfirmationRequired: t('validation.password_confirmation_required'),
    acceptTerms: t('auth.accept_terms'),
  };

  // Configuration React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptCGU: false,
    },
  });

  const siginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const data = await authService.handleGoogleSuccess(tokenResponse.access_token);

      if (!data) {
        console.error('Échec connexion Google');
        setApiError(t('auth.login_with_google_error'));
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      const user = await authService.getCurrentUser();
      if (user) {
        navigate('/');
      }
    },
    onError: () => {
      console.error('Échec connexion Google');
      setApiError(t('auth.login_with_google_error'));
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

      // Call registration API
      await authService.register(data);

      navigate('/login', {
        state: { successMessage: t('auth.registration_request_received') },
      });
    } catch (error) {
      if (error.body?.error) {
        setApiError(translateErrorKey(error.body.error, t));
      } else if (error.body?.errors) {
        // Handle multiple field errors
        setApiError(formatValidationErrors(error.body.errors, t));
      } else {
        setApiError(t('auth.registration_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8">
        <h1 className="text-center text-[#3B82F6] font-semibold text-2xl mb-4 sm:mb-6 font-sans">
          {t('auth.create_account')}
        </h1>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm whitespace-pre-line">
            {apiError}
          </div>
        )}

        {/* Création avec Google sur la même ligne */}
        <div className="flex items-center justify-center gap-[17px] mb-6">
          <h2 className="text-sm sm:text-base font-medium text-[#374151] text-[14px]">
            {t('auth.sign_up_with')}
          </h2>

          <button
            type="button"
            className="flex items-center justify-center gap-[14px] w-[118px] h-[48px] bg-[#C5DBFF] hover:bg-[#B7D2FF] text-[#3B82F6] rounded-[6px] border-0 transition-colors shadow-sm sm:shadow-md text-sm font-semibold"
            onClick={() => {
              siginWithGoogle();
            }}
          >
            <svg
              className="w-[22px] h-[22px] flex-shrink-0"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.668 6.053 29.61 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.668 6.053 29.61 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.518 0 10.48-2.113 14.209-5.548l-6.56-5.548C29.615 34.452 26.933 36 24 36c-5.176 0-9.625-3.329-11.29-7.946l-6.52 5.025C9.503 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.052 12.052 0 0 1-3.654 4.904l.003-.002 6.56 5.548C37.749 38.195 44 34 44 24c0-1.341-.138-2.651-.389-3.917z" />
            </svg>
            <span className="font-bold">Google</span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-[#6A7282]"></div>
          <span className="px-3 text-sm text-[#6A7282] font-extrabold">{t('common.or')}</span>
          <div className="flex-1 border-t border-[#6A7282]"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
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

          <h1 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans">
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
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                aria-pressed={showPassword}
              >
                <img
                  src={showPassword ? InvisibleIcon : EyeIcon}
                  alt=""
                  className="w-[17px] h-[17px]"
                  aria-hidden="true"
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
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showConfirmPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                aria-pressed={showConfirmPassword}
              >
                <img
                  src={showConfirmPassword ? InvisibleIcon : EyeIcon}
                  alt=""
                  className="w-[17px] h-[17px]"
                  aria-hidden="true"
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
            {loading ? t('auth.register_loading') : t('auth.create_account')}
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

        {/* Link to professional registration */}
        <p className="text-center mt-2 text-sm text-gray-600">
          {t('common.or')}{' '}
          <button
            onClick={() => navigate('/register/professional')}
            className="text-[#3B82F6] hover:text-blue-700 font-medium underline"
          >
            {t('auth.register_professional')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;