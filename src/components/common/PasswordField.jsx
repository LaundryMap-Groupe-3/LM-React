import { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import EyeIcon from '../../assets/images/icons/Eye.svg';
import InvisibleIcon from '../../assets/images/icons/Invisible.svg';
import FormField from './FormField';

const PasswordField = ({ label, id, error, required, inputProps = {} }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  return (
    <FormField label={label} error={error} required={required}>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          id={id}
          className={`w-full h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="••••••••"
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-label={show ? t('auth.hide_password', 'Masquer le mot de passe') : t('auth.show_password', 'Afficher le mot de passe')}
          aria-pressed={show}
        >
          <img src={show ? InvisibleIcon : EyeIcon} alt="" className="w-[17px] h-[17px]" aria-hidden="true" />
        </button>
      </div>
    </FormField>
  );
};

export default PasswordField;
