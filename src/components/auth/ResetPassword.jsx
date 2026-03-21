import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResetPassword = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  usePageTitle('page_titles.reset_password', t);

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setApiError(t('auth.token_not_found'));
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setTokenValid(true);
        } else {
          const data = await response.json();
          let errorKey = data.error || 'invalid_or_expired_token';
          // Remove 'errors.' prefix if present
          errorKey = errorKey.replace('errors.', '');
          setApiError(t(`errors.${errorKey}`));
          setTokenValid(false);
        }
      } catch (error) {
        setApiError(t('errors.generic_error'));
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, t]);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
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

      setSuccessMessage(t('auth.password_reset_success'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      let errorMessage = t('errors.generic_error');

      if (error.body?.error) {
        let errorKey = error.body.error;
        // Remove 'errors.' prefix if present
        errorKey = errorKey.replace('errors.', '');
        errorMessage = t(`errors.${errorKey}`);
      } else if (error.body?.errors) {
        errorMessage = Object.values(error.body.errors).join(', ');
      }

      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className={`flex justify-center items-center py-8 px-4 min-h-screen ${
        isDarkTheme ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className={`text-center ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p>{t('auth.verification_in_progress')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center py-8 px-4 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8 rounded-lg ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h1 className={`text-center font-semibold text-2xl mb-6 font-sans ${
          isDarkTheme ? 'text-[#3B82F6]' : 'text-[#3B82F6]'
        }`}>
          {t('auth.reset_password')}
        </h1>

        {/* Error Alert */}
        {(apiError || !tokenValid) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {apiError || t('auth.token_not_found')}
            <button
              onClick={() => navigate('/forgot-password')}
              className="block mt-3 underline font-semibold hover:no-underline"
            >
              {t('auth.request_new_reset_link')}
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            <p className="font-medium">{successMessage}</p>
            <p className="text-xs mt-1">{t('auth.redirecting_to_login')}</p>
          </div>
        )}

        {tokenValid && !successMessage && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-left text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('auth.new_password')}<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', {
                    required: t('validation.password_required'),
                    minLength: {
                      value: 8,
                      message: t('validation.password_too_short'),
                    },
                  })}
                  className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                    errors.password ? 'border-red-500' : isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder={t('auth.placeholder_new_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                    isDarkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {showPassword ? t('auth.hide') : t('auth.show')}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-left text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('auth.confirm_password')}<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: t('validation.password_required'),
                    validate: (value) =>
                      value === password || t('auth.passwords_not_match'),
                  })}
                  className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                    errors.confirmPassword ? 'border-red-500' : isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder={t('auth.placeholder_confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${
                    isDarkTheme ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {showConfirmPassword ? t('auth.hide') : t('auth.show')}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Password Requirements */}
            <div className={`p-3 rounded-md text-xs space-y-1 ${
              isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className={`font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.password_requirements')}
              </p>
              <ul className={`list-disc list-inside ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <li>{t('auth.password_min_8_chars')}</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? t('common.loading') : t('auth.reset_password')}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors text-base sm:text-sm ${
                isDarkTheme
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t('common.cancel')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
