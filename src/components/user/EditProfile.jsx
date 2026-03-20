import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import Save from '../../assets/images/icons/Save.svg';
import Back from '../../assets/images/icons/Back.svg';
import Shield from '../../assets/images/icons/Shield.svg';

const EditProfile = ({ isDarkTheme, isLoggedIn }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.edit_profile', t);

  const {
    register,
    handleSubmit
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className={`min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-8 lg:p-12 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex flex-col space-y-6 sm:space-y-8 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        
        {/* Formulaire d'édition du profil */}
        <div className={`p-4 sm:p-6 md:p-8 w-full flex flex-col items-start ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6 text-left">
            <h2 className="text-left font-bold text-[20px] sm:text-lg md:text-xl text-[#3B82F6]">Modifier mes informations</h2>
            <div>
              <label 
                htmlFor="firstName"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className={`w-[342px] px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                }`}
                placeholder="Entrez votre prénom"
              />
            </div>
            <div>
              <label 
                htmlFor="lastName"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className={`w-[342px] px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                }`}
                placeholder="Entrez votre nom"
              />
            </div>
            <div>
                <label 
                    htmlFor="email"
                    className={`block text-sm font-medium mb-2 ${
                        isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                    }`}
                >
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`w-[342px] px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkTheme ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' : 'bg-white border-[#D1D5DB] text-[#111827]'
                    }`}
                    placeholder="Entrez votre adresse email"
                />
            </div>
            {/* Boutons d'action */}
            <div className="flex sm:flex-row gap-4 w-[342px]">
                <button
                    type="submit"
                    className="w-[210px] h-[34px] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500 text-[11px]"
                >
                    <img src={Save} alt="Sauvegarder" className="w-4 h-4" />
                    <span>Enregistrer</span>
                </button>

                <button
                    type="button"
                    onClick={handleCancel}
                    className={`w-[116px] h-[34px] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                    isDarkTheme 
                        ? 'border-[#D1D5DB] text-[#374151] hover:bg-gray-700 focus:ring-gray-500' 
                        : 'border-[#D1D5DB] text-[#374151] hover:bg-gray-50 focus:ring-gray-500'
                    }`}
                >
                    <img src={Back} alt="Retour" className="w-4 h-4" />
                    <span>Retour</span>
                </button>
            </div>
          </form>
        </div>

        {/* Formulaire réinitialisation du mot de passe */}
        <div className={`p-4 sm:p-6 md:p-8 flex flex-col items-start ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
          <form id="reset-password-form" className="w-full space-y-6 text-left">
            <h2 className="text-left font-bold text-[20px] sm:text-lg md:text-xl text-[#3B82F6]">Réinitialiser mon mot de passe</h2>
            <div>
              <label 
                htmlFor="currentPassword"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                className={`w-[342px] px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                }`}
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>
            <div>
              <label 
                htmlFor="newPassword"
                className={`block text-sm font-medium mb-2 ${
                  isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                }`}
              >
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                className={`w-[342px] px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkTheme 
                    ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' 
                    : 'bg-white border-[#D1D5DB] text-[#111827]'
                }`}
                placeholder="Entrez votre nouveau mot de passe"
              />
            </div>
            <div>
                <label 
                    htmlFor="confirmNewPassword"
                    className={`block text-sm font-medium mb-2 ${
                        isDarkTheme ? 'text-[#374151] text-[12px]' : 'text-[#374151] text-[12px]'
                    }`}
                >
                    Confirmer le nouveau mot de passe
                </label>
                <input
                    type="password"
                    id="confirmNewPassword"
                    className={`w-[342px] px-3 py-2 border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkTheme ? 'bg-gray-700 border-[#D1D5DB] text-gray-100' : 'bg-white border-[#D1D5DB] text-[#111827]'
                    }`}
                    placeholder="Confirmez votre nouveau mot de passe"
                />
            </div>
            {/* Information dernière mise à jour */}
            <div className="text-sm text-[#374151] mt-2 flex justify-between">
                <p>
                    <img src={Shield} alt="Sécurité" className="inline w-4 h-4 mr-1" />
                    Dernière modification
                </p>
                <p>28 janvier 2026</p>
            </div>
            {/* Boutons d'action */}
            <div className="flex sm:flex-row gap-4 w-[342px]">
                <button
                    type="submit"
                    className={`w-[210px] h-[34px] px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                        'bg-[#3B82F6] text-white hover:bg-[#2563EB] focus:ring-blue-500 text-[11px]'
                    }`}
                >
                    <img src={Save} alt="Sauvegarder" className="w-4 h-4" />
                    <span>Modifier le mot de passe</span>
                </button>

                <button
                    type="button"
                    onClick={handleCancel}
                    className={`w-[116px] h-[34px] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                    isDarkTheme 
                        ? 'border-[#D1D5DB] text-[#374151] hover:bg-gray-700 focus:ring-gray-500' 
                        : 'border-[#D1D5DB] text-[#374151] hover:bg-gray-50 focus:ring-gray-500'
                    }`}
                >
                    <img src={Back} alt="Retour" className="w-4 h-4" />
                    <span>Retour</span>
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;