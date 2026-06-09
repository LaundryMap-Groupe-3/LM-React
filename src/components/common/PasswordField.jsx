import { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import EyeIcon from '../../assets/images/icons/Eye.svg';
import InvisibleIcon from '../../assets/images/icons/Invisible.svg';
import FormField from './FormField';

const PasswordField = ({ label, id, error, required, isDarkTheme, inputProps = {} }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <FormField label={label} error={error} required={required} isDarkTheme={isDarkTheme}>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
            isDarkTheme
              ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
              : 'bg-white text-gray-900 border-gray-300'
          }`}
          placeholder="••••••••"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className={`absolute inset-y-0 right-0 flex items-center pr-3 rounded focus:outline-none focus:ring-blue-500 ${
            isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label={show ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
          aria-pressed={show}
        >
          <img src={show ? InvisibleIcon : EyeIcon} alt="" className="w-[17px] h-[17px]" style={isDarkTheme ? { filter: 'brightness(0) invert(1)' } : undefined} aria-hidden="true" />
        </button>
      </div>
    </FormField>
  );
};

export default PasswordField;
