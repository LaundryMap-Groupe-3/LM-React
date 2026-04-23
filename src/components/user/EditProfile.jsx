import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import authService from '../../services/authService';
import userService from '../../services/userService';
import Toast from '../common/Toast.jsx';
import Save from '../../assets/images/icons/Save.svg';
import Shield from '../../assets/images/icons/Shield.svg';
import ShieldGrayIcon from '../../assets/images/icons/Shield-gray.svg'; 
import EyeIcon from '../../assets/images/icons/Eye.svg';
import InvisibleIcon from '../../assets/images/icons/Invisible.svg';

const EditProfile = ({ isDarkTheme, isLoggedIn, userType }) => {
  const { t } = useTranslation();
  usePageTitle('page_titles.edit_profile', t);

  const [profileLoading, setProfileLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [lastPasswordModifiedAt, setLastPasswordModifiedAt] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setError: setPasswordError,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({ mode: 'onBlur' });

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [currentUserResult, profileResult] = await Promise.allSettled([
          authService.getCurrentUser(),
          userService.getProfile(),
        ]);

        const currentUser = currentUserResult.status === 'fulfilled' ? currentUserResult.value : null;
        const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;

        const email =
          profile?.email ||
          profile?.user?.email ||
          currentUser?.user?.email ||
          currentUser?.email ||
          '';

        resetProfile({
          // Prefer profile endpoint values, fallback to authenticated user payload.
          firstName: profile?.firstName || currentUser?.firstName || '',
          lastName: profile?.lastName || currentUser?.lastName || '',
          email,
        });

        if (!currentUser && !profile) {
          throw new Error('No profile data available');
        }
<<<<<<< HEAD
      } catch (error) {
=======
      } catch {
>>>>>>> 72392c60df5524c779892edabc7fa2c7dd77c0cc
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
        email: data.email,
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
      setLastPasswordModifiedAt(new Date());
      setToastMessage(t('success.password_changed'));
      setToastType('success');
    } catch (error) {
      const validationErrors = error.body?.errors;
      if (validationErrors?.currentPassword) {
        setPasswordError('currentPassword', {
          type: 'server',
          message: t(validationErrors.currentPassword),
        });
      }
      if (validationErrors?.newPassword) {
        setPasswordError('newPassword', {
          type: 'server',
          message: t(validationErrors.newPassword),
        });
      }
      if (validationErrors?.confirmPassword) {
        setPasswordError('confirmPassword', {
          type: 'server',
          message: t(validationErrors.confirmPassword),
        });
      }

      if (validationErrors) {
        setToastMessage(Object.values(validationErrors).map((key) => t(key)).join(' '));
        setToastType('error');
        return;
      }

      const errorKey = error.body?.message || 'errors.password_change_error';
      if (errorKey === 'errors.invalid_current_password') {
        setPasswordError('currentPassword', {
          type: 'server',
          message: t('errors.invalid_current_password'),
        });
      } else if (errorKey === 'errors.same_password_as_old') {
        setPasswordError('newPassword', {
          type: 'server',
          message: t('errors.same_password_as_old'),
        });
      } else if (errorKey === 'auth.passwords_not_match') {
        setPasswordError('confirmPassword', {
          type: 'server',
          message: t('auth.passwords_not_match'),
        });
      } else {
        setPasswordError('root', {
          type: 'server',
          message: t(errorKey),
        });
      }
      setToastMessage(t(errorKey));
      setToastType('error');
    }
  };

  return (
    <div className={`min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-8 lg:p-12 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')}
      />
      
      <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Profile Edit Form */}
        <div className={`p-4 sm:p-6 md:p-8 w-full flex flex-col items-start ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <form id="edit-profile-form" onSubmit={handleSubmitProfile(onProfileSubmit)} className="w-full space-y-6 text-left">
            <h2 className="text-left font-bold text-xl sm:text-2xl text-[#3B82F6]">
              {t('profile.my_information')}
            </h2>

            <div>
              <label 
                htmlFor="firstName"
                className="block text-[12px] font-normal mb-2 text-[#374151]"
              >
                {t('auth.first_name')}
              </label>
              <input
                type="text"
                id="firstName"
                {...registerProfile('firstName', {
                  required: t('validation.first_name_required'),
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                  maxLength: { value: 50, message: t('validation.name_max_length') },
                })}
                maxLength={50}
                className={`w-full min-h-[44px] px-3 py-2 text-[11px] font-normal border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } placeholder:text-[11px] placeholder:font-normal placeholder:text-black ${profileErrors.firstName ? 'border-red-500' : ''}`}
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
                className="block text-[12px] font-normal mb-2 text-[#374151]"
              >
                {t('auth.last_name')}
              </label>
              <input
                type="text"
                id="lastName"
                {...registerProfile('lastName', {
                  required: t('validation.last_name_required'),
                  minLength: { value: 2, message: 'Minimum 2 caractères' },
                  maxLength: { value: 50, message: t('validation.name_max_length') },
                })}
                maxLength={50}
                className={`w-full min-h-[44px] px-3 py-2 text-[11px] font-normal border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } placeholder:text-[11px] placeholder:font-normal placeholder:text-black ${profileErrors.lastName ? 'border-red-500' : ''}`}
                placeholder={t('profile.placeholder_last_name')}
                disabled={profileLoading || isProfileSubmitting}
              />
              {profileErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.lastName.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-normal mb-2 text-[#374151]"
              >
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                {...registerProfile('email', {
                  required: t('validation.email_required'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('validation.email_invalid'),
                  },
                })}
                className={`w-full min-h-[44px] px-3 py-2 text-[11px] font-normal border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100'
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                } placeholder:text-[11px] placeholder:font-normal placeholder:text-black`}
                placeholder={t('profile.placeholder_email')}
                disabled={profileLoading || isProfileSubmitting}
              />
              {profileErrors.email && (
                <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>
              )}
            </div>

            <div className="flex sm:flex-row gap-4 w-full">
              <button
                type="submit"
                disabled={profileLoading || isProfileSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500 disabled:opacity-50"
              >
                <img src={Save} alt="Sauvegarder" className="w-4 h-4" />
                <span>{isProfileSubmitting ? t('common.loading_text') : t('common.save')}</span>
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
            <h2 className="text-left font-bold text-xl sm:text-2xl text-[#3B82F6]">
              {t('profile.edit_password')}
            </h2>

            {passwordErrors.root?.message && (
              <p className="text-red-500 text-sm mt-2">{passwordErrors.root.message}</p>
            )}

            <div>
              <label 
                htmlFor="currentPassword"
                className="block text-[12px] font-normal mb-2 text-[#374151]"
              >
                {t('profile.current_password')}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  {...registerPassword('currentPassword', {
                    required: t('validation.password_required'),
                  })}
                  className={`w-full min-h-[44px] px-3 pr-10 py-2 text-[11px] font-normal border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                      : 'bg-white border-[#D1D5DB] text-[#111827]'
                  } placeholder:text-[11px] placeholder:font-normal placeholder:text-black ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                  placeholder={t('profile.placeholder_current_password')}
                  disabled={isPasswordSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showCurrentPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                  aria-pressed={showCurrentPassword}
                >
                  <img
                    src={showCurrentPassword ? InvisibleIcon : EyeIcon}
                    alt=""
                    className="w-[17px] h-[17px]"
                    aria-hidden="true"
                  />
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="newPassword"
                className="block text-[12px] font-normal mb-2 text-[#374151]"
              >
                {t('profile.new_password')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
<<<<<<< HEAD
                  {...registerPassword('newPassword', {
                    required: t('validation.password_required'),
                    minLength: {
                      value: 8,
                      message: t('validation.password_too_short'),
                    },
                  })}
=======
                  {...registerPassword('newPassword', getStrongPasswordRules(t))}
>>>>>>> 72392c60df5524c779892edabc7fa2c7dd77c0cc
                  className={`w-full min-h-[44px] px-3 pr-10 py-2 text-[11px] font-normal border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                      : 'bg-white border-[#D1D5DB] text-[#111827]'
                  } placeholder:text-[11px] placeholder:font-normal placeholder:text-black ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                  placeholder={t('profile.placeholder_new_password')}
                  disabled={isPasswordSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showNewPassword ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
                  aria-pressed={showNewPassword}
                >
                  <img
                    src={showNewPassword ? InvisibleIcon : EyeIcon}
                    alt=""
                    className="w-[17px] h-[17px]"
                    aria-hidden="true"
                  />
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirmNewPassword"
                className="block text-[12px] font-normal mb-2 text-[#374151]"
              >
                {t('profile.confirm_new_password')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmNewPassword"
                  {...registerPassword('confirmPassword', {
                    required: t('validation.password_confirmation_required'),
                    validate: (value) =>
                      value === newPassword || t('auth.passwords_not_match'),
                  })}
                  className={`w-full min-h-[44px] px-3 pr-10 py-2 text-[11px] font-normal border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkTheme ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' : 'bg-white border-[#D1D5DB] text-[#111827]'
                  } placeholder:text-[11px] placeholder:font-normal placeholder:text-black ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder={t('profile.placeholder_confirm_password')}
                  disabled={isPasswordSubmitting}
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
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
              <p className={`text-xs mt-2 flex items-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                <img src={ShieldGrayIcon} alt="Sécurité" className="inline w-3 h-3 mr-1" />
                {t('profile.last_modified')}: {lastPasswordModifiedAt ? new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(lastPasswordModifiedAt) : '-'}
              </p>
            </div>

            <div className="flex sm:flex-row gap-4 w-full">
              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500 disabled:opacity-50"
              >
                <img src={Save} alt="Sauvegarder" className="w-4 h-4" />
                <span>{isPasswordSubmitting ? t('common.loading_text') : t('profile.change_password')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;