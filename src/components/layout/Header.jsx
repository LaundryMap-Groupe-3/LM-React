import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import IconAccueil from '../../assets/images/icons/Home-black.svg';
import IconConnexion from '../../assets/images/icons/Login-white.svg';
import IconMotDePasseOublie from '../../assets/images/icons/Key-black.svg';
import IconUtilisateur from '../../assets/images/icons/User-black.svg';
import IconAdmistrateur from '../../assets/images/icons/Administrator-black.svg';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ isDarkTheme, isLoggedIn, toggleDarkTheme, toggleLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`${isDarkTheme ? 'bg-[#1E293B] border-b border-[#334155]' : 'bg-white border-b border-[#E5E7EB]'}`}>
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg justify-center items-center flex">
                <img src={Logo} alt='LaundryMap Logo' className="w-5 h-5 object-contain" />
            </div>
            <div className="ml-3 text-[18px] font-semibold text-[#3B82F6]">LaundryMap</div>
          </div>
          
          {/* Navigation Desktop - cachée sur mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActivePage('/') ? 'text-white bg-[#3B82F6]' : (isDarkTheme ? 'text-[#E2E8F0] hover:text-white hover:bg-[#3B82F6]' : 'text-gray-700 hover:text-white hover:bg-[#3B82F6]')} transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px]`}>{t('navigation.home')}</Link>
            {!isLoggedIn && (
              <a href="/login" className={`transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px] ${isDarkTheme ? 'text-[#E2E8F0] hover:text-white hover:bg-[#3B82F6]' : 'text-gray-700 hover:text-white hover:bg-[#3B82F6]'}`}>{t('auth.login')}</a>
            )}
            {isLoggedIn && (
              <Link to="/profile" className={`${isActivePage('/profile') ? 'text-white bg-[#3B82F6]' : (isDarkTheme ? 'text-[#E2E8F0] hover:text-white hover:bg-[#3B82F6]' : 'text-gray-700 hover:text-white hover:bg-[#3B82F6]')} transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px]`}>{t('navigation.profile')}</Link>
            )}
            {isLoggedIn && (
              <button onClick={onLogout} className={`transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px] ${isDarkTheme ? 'text-[#E2E8F0] hover:text-white hover:bg-red-600' : 'text-gray-700 hover:text-white hover:bg-red-600'}`}>{t('common.logout')}</button>
            )}
            {!isLoggedIn && (
              <Link to="/register" className={`${isActivePage('/register') ? 'text-white bg-[#3B82F6]' : (isDarkTheme ? 'text-[#E2E8F0] hover:text-white hover:bg-[#3B82F6]' : 'text-gray-700 hover:text-white hover:bg-[#3B82F6]')} transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px]`}>{t('auth.register')}</Link>
            )}
          </nav>

          {/* Language Switcher - Desktop */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          
          {/* Menu Hamburger */}
          <button 
            onClick={toggleMenu}
            className="md:hidden flex flex-col space-y-1 p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Menu"
          >
            <div className={`w-6 h-0.5 ${isDarkTheme ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-6 h-0.5 ${isDarkTheme ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 ${isDarkTheme ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <>
            {/* Overlay semi-transparent */}
            <div 
              className="fixed inset-0 bg-black opacity-33 z-40 md:hidden"
              onClick={toggleMenu}
            ></div>
            
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-70 rounded-[0_12px_0_12px] ${isDarkTheme ? 'bg-[#1E293B]' : 'bg-white'} shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className={`p-4 border-b ${isDarkTheme ? 'border-[#334155]' : 'border-[#E5E7EB]'}`}>
                {/* Logo dans la sidebar */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#3B82F6] rounded-lg justify-center items-center flex">
                    <img src={Logo} alt='LaundryMap Logo' className="w-5 h-5 object-contain" />
                  </div>
                  <div className="ml-3 text-[18px] font-semibold text-[#3B82F6]">LaundryMap</div>
                </div>
              </div>
              
              {/* Navigation dans la sidebar */}
              <nav className="flex flex-col p-4 space-y-2">
                <div className="flex flex-col space-y-2 text-left">
                    <h3 className="font-semibold text-[14px] text-[#3B82F6]">{t('navigation.main_pages')}</h3>
                    <Link to="/" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                        <img src={IconAccueil} alt={t('navigation.home')} className={`w-4 h-4 mr-2 ${isActivePage('/') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                        {t('navigation.home')}
                    </Link>
                    {!isLoggedIn && (
                        <a href="#" onClick={toggleMenu} className={`px-3 text-[12px] rounded-[5px] transition-colors font-medium flex items-center h-[38px] group ${isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white'}`}>
                            <img src={IconConnexion} alt={t('auth.login')} className="w-4 h-4 mr-2 brightness-0 group-hover:brightness-100 transition-all" />
                            {t('auth.login')}
                        </a>
                    )}
                    {isLoggedIn && (
                        <Link to="/profile" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/profile') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                            <img src={IconUtilisateur} alt={t('navigation.profile')} className={`w-4 h-4 mr-2 ${isActivePage('/profile') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                            {t('navigation.profile')}
                        </Link>
                    )}
                    {isLoggedIn && (
                        <button onClick={() => { onLogout(); toggleMenu(); }} className={`px-3 text-[12px] rounded-[5px] transition-colors font-medium flex items-center h-[38px] group w-full ${isDarkTheme ? 'text-[#E2E8F0] hover:bg-red-600 hover:text-white' : 'text-[#0F172A] hover:bg-red-600 hover:text-white'}`}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t('common.logout')}
                        </button>
                    )}
                </div>
                {!isLoggedIn && (
                    <div className="flex flex-col space-y-2 text-left">
                        <h3 className="font-semibold text-[14px] text-[#3B82F6]">{t('navigation.inscription')}</h3>
                        <Link to="/register" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/register') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                            <img src={IconUtilisateur} alt={t('auth.register_user')} className={`w-4 h-4 mr-2 ${isActivePage('/register') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                            {t('auth.register_user')}
                        </Link>
                        <Link to="/register-professional" onClick={toggleMenu} className={`px-3 text-[12px] rounded-[5px] transition-colors font-medium flex items-center h-[38px] group ${isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white'}`}>
                            <img src={IconAdmistrateur} alt={t('auth.register_professional')} className="w-4 h-4 mr-2 group-hover:filter group-hover:invert transition-all" />
                            {t('auth.register_professional')}
                        </Link>
                        <Link to="/forgot-password" onClick={toggleMenu} className={`px-3 text-[12px] rounded-[5px] transition-colors font-medium flex items-center h-[38px] group ${isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white'}`}>
                            <img src={IconMotDePasseOublie} alt={t('auth.forgot_password')} className="w-4 h-4 mr-2 group-hover:filter group-hover:invert transition-all" />
                            {t('auth.forgot_password')}
                        </Link>
                    </div>
                )}

                {/* Language Switcher - Mobile */}
                <div className={`pt-4 border-t ${isDarkTheme ? 'border-[#334155]' : 'border-[#E5E7EB]'}`}>
                    <h3 className="font-semibold text-[14px] text-[#3B82F6] mb-2">Langue</h3>
                    <LanguageSwitcher />
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;