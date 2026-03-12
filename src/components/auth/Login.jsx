import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import authService from '../../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Login = ({ isDarkTheme, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

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

      // Call onLoginSuccess callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Get user info and redirect
      const user = await authService.getCurrentUser();
      if (user) {
        // Redirect based on user type
        if (user.type === 'professional') {
          navigate('/professional/dashboard');
        } else if (user.type === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/profile');
        }
      }
    } catch (error) {
      if (error.body?.error) {
        setApiError(error.body.error);
      } else if (error.body?.errors) {
        const errorMessages = Object.entries(error.body.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        setApiError(errorMessages);
      } else {
        setApiError(t('auth.invalid_email_password'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-8 px-4 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8 rounded-lg ${
        isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h1 className={`text-center font-semibold text-2xl mb-6 sm:mb-8 font-sans ${
          isDarkTheme ? 'text-[#3B82F6]' : 'text-[#3B82F6]'
        }`}>
          {t('auth.login')}
        </h1>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm whitespace-pre-line">
            {apiError}
          </div>
        )}

        {/* Connexion avec Google */}
        <div className="flex items-center justify-center gap-[17px] mb-6">
          <h2 className={`text-sm sm:text-base font-medium text-[14px] ${
            isDarkTheme ? 'text-gray-300' : 'text-[#374151]'
          }`}>
            {t('auth.login_with')}
          </h2>

          <button
            type="button"
            className="flex items-center justify-center gap-[14px] w-[118px] h-[48px] bg-[#C5DBFF] hover:bg-[#B7D2FF] text-[#3B82F6] rounded-[6px] border-0 transition-colors shadow-sm sm:shadow-md text-sm font-semibold"
            onClick={() => {
              console.log('Connexion avec Google');
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
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email format is invalid',
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
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.password ? 'border-red-500' : isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
            )}
          </div>

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.remember_me')}
              </span>
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-[#3B82F6] hover:text-blue-700 font-medium text-sm"
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

        {/* Sign up link */}
        <p className={`text-center mt-6 text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('navigation.no_account')}{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#3B82F6] hover:text-blue-700 font-medium underline"
          >
            {t('auth.create_account')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
