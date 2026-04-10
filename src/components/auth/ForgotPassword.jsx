import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ForgotPassword = ({ isDarkTheme }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.forgot_password', t);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          body: responseData,
        };
      }

      setSuccessMessage(t('auth.forgot_password_request_received'));
      setEmailSubmitted(true);
    } catch (error) {
      let errorMessage = t('errors.generic_error');

      if (error.body?.error) {
        errorMessage = t(`errors.${error.body.error}`);
      } else if (error.body?.errors) {
        errorMessage = Object.values(error.body.errors).join(', ');
      }

      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex justify-center py-8 px-4 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8 rounded-lg ${
        isDarkTheme ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/login')}
            className={`flex items-center gap-2 text-sm font-medium hover:underline ${
              isDarkTheme ? 'text-[#3B82F6]' : 'text-[#3B82F6]'
            }`}
          >
            <span>←</span>
            {t('common.back')}
          </button>
        </div>

        <h1 className={`text-center font-semibold text-2xl mb-2 font-sans ${
          isDarkTheme ? 'text-[#3B82F6]' : 'text-[#3B82F6]'
        }`}>
          {t('auth.forgot_password')}
        </h1>

        <p className={`text-center text-sm mb-6 ${
          isDarkTheme ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {t('auth.forgot_password_description')}
        </p>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {apiError}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            <p className="font-medium mb-2">{successMessage}</p>
            <p className={`text-xs ${isDarkTheme ? 'text-gray-600' : 'text-gray-700'}`}>
              {t('auth.check_email_for_reset_link')}
            </p>
          </div>
        )}

        {emailSubmitted ? (
          /* After Email Submission */
          <div className="space-y-4">

            <p className={`text-center text-sm ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('auth.email_sent_to')} <span className="font-semibold">{email}</span>
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors bg-[#3B82F6] hover:bg-blue-700"
            >
              {t('auth.back_to_login')}
            </button>
          </div>
        ) : (
          /* Email Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  required: t('validation.email_required'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('validation.email_invalid'),
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? t('common.loading') : t('auth.send_reset_link')}
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

export default ForgotPassword;
