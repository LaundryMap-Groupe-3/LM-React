import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import { translateErrorKey, formatValidationErrors } from '../../utils/translateErrorKey';
import { getStrongPasswordRules } from '../../utils/passwordValidation';
import { useGoogleLogin } from '@react-oauth/google';
import FormField from '../common/FormField';
import PasswordField from '../common/PasswordField';

const Register = ({ onLoginSuccess, isDarkTheme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.register', t);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

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
      try {
        const data = await authService.handleGoogleSuccess(tokenResponse.access_token);

        if (!data) {
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
      } catch (err) {
        console.error('Échec connexion Google', err);
        setApiError(t('auth.login_with_google_error'));
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

  const inputClass = (hasError) =>
    `w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
      isDarkTheme
        ? 'bg-gray-700 text-white placeholder-gray-400'
        : 'bg-white text-gray-900'
    } ${hasError ? 'border-red-500' : isDarkTheme ? 'border-gray-600' : 'border-gray-300'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center py-8 px-4 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8 rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className="text-center text-[#3B82F6] font-semibold text-2xl mb-4 sm:mb-6 font-sans">
          {t('auth.create_account')}
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

        {/* Création avec Google sur la même ligne */}
        <div className="flex items-center justify-center gap-[17px] mb-6">
          <h2 className={`text-sm sm:text-base font-medium text-[14px] ${isDarkTheme ? 'text-gray-300' : 'text-[#374151]'}`}>
            {t('auth.sign_up_with')}
          </h2>

          <button
            type="button"
            className={`flex items-center justify-center gap-[14px] w-[118px] h-[48px] rounded-[6px] border-0 transition-colors shadow-sm sm:shadow-md text-sm font-semibold ${
              isDarkTheme
                ? 'bg-blue-900/50 hover:bg-blue-900/70 text-blue-300'
                : 'bg-[#C5DBFF] hover:bg-[#B7D2FF] text-[#3B82F6]'
            }`}
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
          <div className={`flex-1 border-t ${isDarkTheme ? 'border-gray-600' : 'border-[#6A7282]'}`}></div>
          <span className={`px-3 text-sm font-extrabold ${isDarkTheme ? 'text-gray-400' : 'text-[#6A7282]'}`}>{t('common.or')}</span>
          <div className={`flex-1 border-t ${isDarkTheme ? 'border-gray-600' : 'border-[#6A7282]'}`}></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
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
            {loading ? t('auth.register_loading') : t('auth.create_account')}
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

        {/* Link to professional registration */}
        <p className={`text-center mt-2 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('common.or')}{' '}
          <button
            onClick={() => navigate('/register/professional')}
            className="text-[#3B82F6] hover:text-blue-400 font-medium underline"
          >
            {t('auth.register_professional')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;