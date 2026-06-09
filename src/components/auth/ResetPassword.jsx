import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import { getStrongPasswordRules } from '../../utils/passwordValidation';
import Alert from '../common/Alert';
import Button from '../common/Button';

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
      } catch {
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
        errorMessage = t(error.body.error);
      } else if (error.body?.errors) {
        errorMessage = Object.values(error.body.errors).map(k => t(k)).join(', ');
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
          <Alert type="error" isDarkTheme={isDarkTheme}>
            {apiError || t('auth.token_not_found')}
            <button
              onClick={() => navigate('/forgot-password')}
              className="block mt-3 underline font-semibold hover:no-underline focus:outline-none focus:ring-2 focus:ring-current rounded"
            >
              {t('auth.request_new_reset_link')}
            </button>
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert type="success" isDarkTheme={isDarkTheme}>
            <p className="font-medium">{successMessage}</p>
            <p className="text-xs mt-1 opacity-80">{t('auth.redirecting_to_login')}</p>
          </Alert>
        )}

        {tokenValid && !successMessage && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-left text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {t('auth.new_password')}<span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', getStrongPasswordRules(t))}
                  className={`w-full h-[44px] px-3 pr-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                    isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder={t('auth.placeholder_new_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('auth.hide') : t('auth.show')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                    isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {showPassword ? t('auth.hide') : t('auth.show')}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-left text-sm font-medium mb-2 ${
                isDarkTheme ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {t('auth.confirm_password')}<span className="text-red-400">*</span>
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
                  className={`w-full h-[44px] px-3 pr-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                    isDarkTheme ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder={t('auth.placeholder_confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('auth.hide') : t('auth.show')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                    isDarkTheme ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {showConfirmPassword ? t('auth.hide') : t('auth.show')}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-red-400 text-xs mt-1 block">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Password Requirements */}
            <div className={`p-3 rounded-md text-xs space-y-1 ${
              isDarkTheme ? 'bg-gray-700/60' : 'bg-gray-100'
            }`}>
              <p className={`font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('auth.password_requirements')}
              </p>
              <ul className={`list-disc list-inside space-y-0.5 ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <li>{t('auth.password_min_12_chars')}</li>
                <li>{t('auth.password_one_lowercase')}</li>
                <li>{t('auth.password_one_uppercase')}</li>
                <li>{t('auth.password_one_number')}</li>
                <li>{t('auth.password_one_special')}</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" loading={loading} loadingLabel={t('common.loading')} className="w-full py-3">
              {t('auth.reset_password')}
            </Button>

            <Button type="button" variant="secondary" isDarkTheme={isDarkTheme} onClick={() => navigate('/login')} className="w-full py-3">
              {t('common.cancel')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
