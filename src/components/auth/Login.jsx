import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import { translateErrorKey, formatValidationErrors } from '../../utils/translateErrorKey';
import { useGoogleLogin } from '@react-oauth/google';
import UserBlackIcon from '../../assets/images/icons/add-User-black.svg';
import AdministratorBlackIcon from '../../assets/images/icons/Administrator-black.svg';
import EyeIcon from '../../assets/images/icons/Eye.svg';
import InvisibleIcon from '../../assets/images/icons/Invisible.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Login = ({ isDarkTheme, onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  usePageTitle('page_titles.login', t);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [successUserType, setSuccessUserType] = useState(null);
  const registrationSuccessMessage = location.state?.successMessage;

  // Auto-navigate on successful login
  useEffect(() => {
    if (loginSuccess && successUserType) {
      const routes = {
        admin: '/admin/dashboard',
        professional: '/professional-dashboard',
      };
      const redirectPath = routes[successUserType] || '/profile';
      // Use a small delay to ensure parent state is updated
      const timer = setTimeout(() => navigate(redirectPath), 100);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, successUserType, navigate]);

  // Validation messages
  const validationMessages = {
    emailRequired: t('validation.email_required'),
    emailInvalid: t('validation.email_invalid'),
    passwordRequired: t('validation.password_required'),
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const data = await authService.handleGoogleSuccess(tokenResponse.access_token);

      if (!data) {
        console.error('Échec connexion Google');
        setApiError(t('auth.login_with_google_error'));
        return;
      }

      const user = await authService.getCurrentUser();
      if (user?.type && onLoginSuccess) {
        // Pass user type to parent component to update state
        onLoginSuccess(user.type);
        // Trigger navigation via useEffect
        setSuccessUserType(user.type);
        setLoginSuccess(true);
      } else if (onLoginSuccess) {
        onLoginSuccess();
      }
    },
    onError: () => {
      console.error('Échec connexion Google');
      setApiError(t('auth.login_with_google_error'));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setErrorCode(null);
    setResendMessage(null);
    setLastAttemptedEmail(data.email);

    try {
      // Call login API - lexik_jwt_authentication will handle token
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          body: responseData,
        };
      }

      // The token should be in the response
      if (responseData.token) {
        localStorage.setItem('jwt_token', responseData.token);
      }

      // Get user info and pass to parent component
      const user = await authService.getCurrentUser();
      if (user?.type && onLoginSuccess) {
        // Pass user type to parent component to update state
        onLoginSuccess(user.type);
        // Trigger navigation via useEffect
        setSuccessUserType(user.type);
        setLoginSuccess(true);
      } else if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      let errorMessage = t('errors.invalid_email_password');
      let code = null;

      if (error.body?.error) {
        const errorCodeValue = error.body.error;
        code = errorCodeValue;
        errorMessage = translateErrorKey(errorCodeValue, t);
      } else if (error.body?.errors) {
        const errorMessages = formatValidationErrors(error.body.errors, t);
        errorMessage = errorMessages;
      }

      setApiError(errorMessage);
      setErrorCode(code);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: lastAttemptedEmail,
        }),
      });

      await response.json();

      if (response.ok) {
        setResendMessage({
          type: 'success',
          text: t('auth.email_sent_successfully'),
        });
      } else {
        setResendMessage({
          type: 'error',
          text: t('auth.resend_error'),
        });
      }
    } catch {
      setResendMessage({
        type: 'error',
        text: t('auth.resend_error'),
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={`flex justify-center py-8 px-4 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8 rounded-lg ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h1 className={`text-center font-semibold text-2xl mb-6 sm:mb-8 font-sans ${
          isDarkTheme ? 'text-[#3B82F6]' : 'text-[#3B82F6]'
        }`}>
          {t('auth.login_title', 'Connexion')}
        </h1>

        {registrationSuccessMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm whitespace-pre-line">
            {registrationSuccessMessage}
          </div>
        )}

        {/* Error Alert */}
        {apiError && !resendMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm whitespace-pre-line">
            <div className="flex flex-col gap-2">
              <p>{apiError}</p>
              
              {/* Resend Email Link for email_not_verified */}
              {errorCode === 'email_not_verified' && (
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className={`text-left underline font-semibold hover:no-underline transition-all ${
                    resendLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {resendLoading ? t('auth.resend_loading') : t('auth.resend_verification_email')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {resendMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            resendMessage.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {resendMessage.text}
          </div>
        )}

        {/* Connexion avec Google */}
        <div className="flex items-center justify-center gap-[17px] mb-6">
          <h2 className={`text-sm sm:text-base text-[#374151] font-extrabold text-[14px] ${
            isDarkTheme ? 'text-gray-300' : 'text-[#374151]'
          }`}>
            {t('auth.login_with')}
          </h2>

          <button
            type="button"
            className="flex items-center justify-center gap-[14px] w-[118px] h-[48px] bg-[#C5DBFF] hover:bg-[#B7D2FF] text-[#3B82F6] rounded-[6px] border-0 transition-colors shadow-sm sm:shadow-md text-sm font-semibold"
            onClick={loginWithGoogle}
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
          <span className={`px-3 text-sm font-extrabold ${
            isDarkTheme ? 'text-gray-400' : 'text-[#6A7282]'
          }`}>{t('common.or')}</span>
          <div className={`flex-1 border-t ${isDarkTheme ? 'border-gray-600' : 'border-[#6A7282]'}`}></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className={`block text-left text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
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
                errors.email ? 'border-red-500' : isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder={t('auth.placeholder_email')}
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={`block text-left text-sm font-medium mb-2 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('auth.password')}<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password', {
                  required: validationMessages.passwordRequired,
                })}
                className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                  errors.password ? 'border-red-500' : isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
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

          {/* Forgot password */}
          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="self-end text-[#3B82F6] hover:text-blue-700 font-medium text-sm underline"
            >
              {t('auth.forgot_password')}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 sm:py-2 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? t('auth.loading') : t('auth.login')}
          </button>
        </form>

        {/* Sign up paths */}
        <div className="mt-6 rounded-lg bg-[#C5DBFF] p-4 text-white">
          <h2 className="text-left text-[#3B82F6] text-[14px] font-extrabold mb-3">
            {t('auth.create_account', 'Créer un compte')}
          </h2>
          <p className="text-left text-[#374151] text-[11px] font-medium mb-4">
            {t('auth.signup_benefits_text', 'Pour beneficier de fonctionnalites supplementaires.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-start">
            <button
              onClick={() => navigate('/register')}
              className="w-full px-4 py-2 text-sm text-[#0F172A] font-semibold underline flex items-center justify-start gap-2"
            >
              <img src={UserBlackIcon} alt="" className="w-4 h-4" aria-hidden="true" />
              {t('auth.register_user')}
            </button>
            <button
              onClick={() => navigate('/register/professional')}
              className="w-full px-4 py-2 text-sm text-[#0F172A] font-semibold underline flex items-center justify-start gap-2"
            >
              <img src={AdministratorBlackIcon} alt="" className="w-4 h-4" aria-hidden="true" />
              {t('auth.register_professional_label', 'Inscription professionnel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
