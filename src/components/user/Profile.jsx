import Edit from '../../assets/images/icons/edit.svg';
import User from '../../assets/images/icons/User-Shield.svg';
import Error from '../../assets/images/icons/Error.svg';
import Remove from '../../assets/images/icons/Remove.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ isDarkTheme, toggleDarkTheme }) => {
  const navigate = useNavigate();
  const [userInfo] = useState({
    firstName: 'John',
    lastName: 'Doe', 
    email: 'john.doe@example.com',
    memberSince: '15 Janvier 2025'
  });

  const [selectedLanguage, setSelectedLanguage] = useState('Français');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isEmailNotifications, setIsEmailNotifications] = useState(true);
  
  const languages = ['Français', 'English'];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
  };

  const toggleEmailNotifications = () => {
    setIsEmailNotifications(!isEmailNotifications);
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <div className={`min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-8 lg:p-12 ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex flex-col space-y-6 sm:space-y-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        
        {/* Premier rectangle */}
        <div className={`rounded-lg border p-4 sm:p-6 md:p-8 w-full flex flex-col items-start ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
                <h1 className="text-left text-base sm:text-lg md:text-xl text-[#3B82F6]">Informations personnelles</h1>
                <button 
                    onClick={handleEditProfile}
                    className="px-3 py-1 hover:underline flex items-center gap-2 text-[#3B82F6] text-sm sm:text-base">
                    <img src={Edit} alt="Modifier" className="w-4 h-4" />
                    <span>Modifier</span>
                </button>
            </div>
            <div className="flex flex-col items-start mt-4">
                <div className="mt-4">
                    <p className={`text-sm text-left ${
                      isDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'
                    }`}>Prénom & Nom</p>
                    <p className={`font-medium text-left text-[14px] ${
                      isDarkTheme ? 'text-gray-100' : 'text-[#111827]'
                    }`}>{userInfo.firstName} {userInfo.lastName}</p>
                </div>
                <div className="mt-4">
                    <p className={`text-sm text-left ${
                      isDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'
                    }`}>Email</p>
                    <p className={`font-medium text-left text-[14px] ${
                      isDarkTheme ? 'text-gray-100' : 'text-[#111827]'
                    }`}>{userInfo.email}</p>
                </div>
                <div className="mt-4">
                    <p className={`text-sm text-left ${
                      isDarkTheme ? 'text-gray-400' : 'text-[#6B7280]'
                    }`}>Membre depuis</p>
                    <p className={`font-medium text-left text-[14px] ${
                      isDarkTheme ? 'text-gray-100' : 'text-[#111827]'
                    }`}>{userInfo.memberSince}</p>
                </div>
            </div>
        </div>
        
        {/* Deuxième rectangle */}
        <div className={`rounded-lg border p-4 sm:p-6 md:p-8 w-full flex flex-col items-start justify-center ${
          isDarkTheme 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-[#E5E7EB] bg-white'
        }`}>
            <h1 className="text-left text-base sm:text-lg md:text-xl text-[#3B82F6]">Préférences</h1>
            <div className="flex flex-col items-start mt-4 space-y-6">
                <div className="flex items-start justify-between w-full gap-[26px]">
                    <div className="flex flex-col flex-1">
                        <h2 className={`text-sm font-medium text-left mb-2 ${
                          isDarkTheme ? 'text-gray-300' : 'text-[#374151]'
                        }`}>Langue</h2>
                        <p className={`font-regular text-left text-xs ${
                          isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'
                        }`}>Choisissez votre langue</p>
                        <p className={`font-regular text-left text-xs ${
                          isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'
                        }`}>préférée</p>
                    </div>
                    <div className="relative flex-shrink-0 ml-auto">
                        <button 
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className={`w-[140px] sm:w-[140px] h-9 text-center text-xs sm:text-sm border rounded-md px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between relative ${
                              isDarkTheme 
                                ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600' 
                                : 'bg-white border-gray-300 text-[#111827]'
                            }`}
                        >
                            <span>{selectedLanguage}</span>
                            <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isLanguageDropdownOpen && (
                            <div className={`absolute z-10 mt-1 w-full border rounded-md shadow-lg ${
                              isDarkTheme 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white border-gray-300'
                            }`}>
                                {languages.map((language) => (
                                    <button
                                        key={language}
                                        onClick={() => handleLanguageSelect(language)}
                                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm focus:outline-none ${
                                          isDarkTheme 
                                            ? 'text-gray-100 hover:bg-gray-600 focus:bg-gray-600' 
                                            : 'text-[#111827] hover:bg-blue-50 focus:bg-blue-50'
                                        }`}
                                    >
                                        {language}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-between items-center w-full gap-[83px]">
                    <div className="flex flex-col flex-1 pr-4">
                        <h2 className={`text-sm font-medium text-left mb-2 ${
                          isDarkTheme ? 'text-gray-300' : 'text-[#374151]'
                        }`}>Thème {isDarkTheme ? 'clair' : 'sombre'}</h2>
                        <p className={`text-xs text-left ${
                          isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'
                        }`}>Interface avec couleurs {isDarkTheme ? 'claires' : 'sombres'}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-auto">
                        <button
                            onClick={toggleDarkTheme}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                                isDarkTheme ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                    isDarkTheme ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center w-full gap-[79px]">
                    <div className="flex flex-col flex-1 pr-4">
                        <h2 className={`text-sm font-medium text-left mb-2 ${
                          isDarkTheme ? 'text-gray-300' : 'text-[#374151]'
                        }`}>Notifications email</h2>
                        <p className={`text-xs text-left ${
                          isDarkTheme ? 'text-[#374151]' : 'text-[#374151]'
                        }`}>Recevoir les notifications par email</p>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-auto">
                        <button
                            onClick={toggleEmailNotifications}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                                isEmailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                                    isEmailNotifications ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Troisième rectangle - Protection des données */}
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 sm:p-6 md:p-8 w-full flex flex-col items-start">
            <div className="flex items-center w-full gap-2">
                <img src={User} alt="Protection des données" className="w-[26px] h-[26px] flex-shrink-0" />
                <h1 className="text-left text-base sm:text-lg md:text-xl font-bold text-red-700">Protection des données</h1>
            </div>
            {/* Separation */}
            <div className="border-t border-[#FECACA] w-full my-4"></div>
            <div className="rounded-lg p-4 sm:p-6 w-full flex flex-col items-start justify-center bg-[#FFF1DF]">
                <div className="flex flex-col items-center gap-2 mb-2 w-full">
                    <img src={Error} alt="Attention" className="w-5 h-5" />
                    <p className="text-xs sm:text-sm text-[#C51D1D] font-light leading-relaxed text-left">
                        Conformément au RGPD, vous pouvez demander la suppression définitive de votre compte et de toutes vos données personnelles.
                        <strong className="font-extrabold"> Cette action est irréversible.</strong>
                    </p>
                </div>
            </div>
            <button className="mt-4 px-4 py-3 bg-[#C51D1D] w-full text-xs sm:text-sm text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2">
                <img src={Remove} alt="Supprimer" className="w-[17px] h-[17px]" />
                <span>Supprimer définitivement mon compte</span>
            </button>
        </div>
      </div>
    </div>
  )
}

export default Profile