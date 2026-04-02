import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import userService from '../../services/userService';
import Toast from '../common/Toast.jsx';
import Save from '../../assets/images/icons/Save.svg';
import Back from '../../assets/images/icons/Back.svg';
import Shield from '../../assets/images/icons/Shield.svg';

const EditProfile = ({ isDarkTheme, isLoggedIn, userType }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.edit_profile', t);

  const [profileLoading, setProfileLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [currentUserType, setCurrentUserType] = useState(userType || null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({ mode: 'onBlur' });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({ mode: 'onBlur' });

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser?.type) {
          setCurrentUserType(currentUser.type);
        }

        const profile = await userService.getProfile();
        resetProfile({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
        });
      } catch (error) {
        setToastMessage(t('errors.profile_load_error'));
        setToastType('error');
      } finally {
        setProfileLoading(false);
      }
    };

    if (isLoggedIn) {
      loadProfile();
    }
  }, [isLoggedIn, resetProfile, t]);

  const onProfileSubmit = async (data) => {
    try {
      await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setToastMessage(t('success.profile_updated'));
      setToastType('success');
    } catch (error) {
      const errorKey = error.body?.message || 'errors.profile_update_error';
      setToastMessage(t(errorKey));
      setToastType('error');
    }
  };

  const newPassword = watch('newPassword');

  const onPasswordSubmit = async (data) => {
    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      resetPassword();
      setToastMessage(t('success.password_changed'));
      setToastType('success');
    } catch (error) {
      const errorKey = error.body?.message || 'errors.password_change_error';
      setToastMessage(t(errorKey));
      setToastType('error');
    }
  };

  const handleCancel = () => {
    navigate(currentUserType === 'admin' ? '/admin/profile' : '/profile');
  };
  return (
    <div className={`min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-8 lg:p-12 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')}
      />
      
      <div className="flex flex-col space-y-6 sm:space-y-8 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        
        {/* Profile Edit Form */}
        <div className={`p-4 sm:p-6 md:p-8 w-full flex flex-col items-start ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <form id="edit-profile-form" onSubmit={handleSubmitProfile(onProfileSubmit)} className="w-full space-y-6 text-left">
            <h2 className="text-left font-bold text-[20px] sm:text-lg md:text-xl text-[#3B82F6]">
              {t('profile.edit_personal_info')}
            </h2>

            <div>
              <label 
                htmlFor="firstName"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                {t('auth.first_name')}
              </label>
              <input
                type="text"
                id="firstName"
                {...registerProfile('firstName', {
                  required: t('validation.first_name_required'),
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                })}
                className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } ${profileErrors.firstName ? 'border-red-500' : ''}`}
                placeholder={t('profile.placeholder_first_name')}
                disabled={profileLoading || isProfileSubmitting}
              />
              {profileErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.firstName.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="lastName"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                {t('auth.last_name')}
              </label>
              <input
                type="text"
                id="lastName"
                {...registerProfile('lastName', {
                  required: t('validation.last_name_required'),
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                })}
                className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } ${profileErrors.lastName ? 'border-red-500' : ''}`}
                placeholder={t('profile.placeholder_last_name')}
                disabled={profileLoading || isProfileSubmitting}
              />
              {profileErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.lastName.message}</p>
              )}
            </div>

            <div className="flex sm:flex-row gap-4 w-full">
              <button
                type="submit"
                disabled={profileLoading || isProfileSubmitting}
                className="w-full sm:w-[210px] h-[34px] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500 text-[11px] disabled:opacity-50"
              >
                <img src={Save} alt="Sauvegarder" className="w-4 h-4" />
                <span>{isProfileSubmitting ? t('common.loading_text') : t('common.save')}</span>
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isProfileSubmitting}
                className={`w-full sm:w-[116px] h-[34px] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 ${
                isDarkTheme 
                  ? 'border-[#D1D5DB] text-[#374151] hover:bg-gray-700 focus:ring-gray-500' 
                  : 'border-[#D1D5DB] text-[#374151] hover:bg-gray-50 focus:ring-gray-500'
                }`}
              >
                <img src={Back} alt="Retour" className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Password Reset Form */}
        <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-start ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <form id="reset-password-form" onSubmit={handleSubmitPassword(onPasswordSubmit)} className="w-full space-y-6 text-left">
            <h2 className="text-left font-bold text-[20px] sm:text-lg md:text-xl text-[#3B82F6]">
              {t('profile.edit_password')}
            </h2>

            <div>
              <label 
                htmlFor="currentPassword"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                {t('profile.current_password')}
              </label>
              <input
                type="password"
                id="currentPassword"
                {...registerPassword('currentPassword', {
                  required: t('validation.password_required'),
                })}
                className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                placeholder={t('profile.placeholder_current_password')}
                disabled={isPasswordSubmitting}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="newPassword"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                {t('profile.new_password')}
              </label>
              <input
                type="password"
                id="newPassword"
                {...registerPassword('newPassword', {
                  required: t('validation.password_required'),
                  minLength: {
                    value: 8,
                    message: t('validation.password_too_short'),
                  },
                })}
                className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                placeholder={t('profile.placeholder_new_password')}
                disabled={isPasswordSubmitting}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirmNewPassword"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                {t('profile.confirm_new_password')}
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                {...registerPassword('confirmPassword', {
                  required: t('validation.password_confirmation_required'),
                  validate: (value) =>
                    value === newPassword || t('auth.passwords_not_match'),
                })}
                className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' : 'bg-white border-[#D1D5DB] text-[#111827]'
                } ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder={t('profile.placeholder_confirm_password')}
                disabled={isPasswordSubmitting}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex sm:flex-row gap-4 w-full">
              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="w-full sm:w-[210px] h-[34px] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500 text-[11px] disabled:opacity-50"
              >
                <img src={Save} alt="Sauvegarder" className="w-4 h-4" />
                <span>{isPasswordSubmitting ? t('common.loading_text') : t('profile.change_password')}</span>
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isPasswordSubmitting}
                className={`w-full sm:w-[116px] h-[34px] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 ${
                isDarkTheme 
                  ? 'border-[#D1D5DB] text-[#374151] hover:bg-gray-700 focus:ring-gray-500' 
                  : 'border-[#D1D5DB] text-[#374151] hover:bg-gray-50 focus:ring-gray-500'
                }`}
              >
                <img src={Back} alt="Retour" className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;