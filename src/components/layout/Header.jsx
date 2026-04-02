import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import IconAccueil from '../../assets/images/icons/Home-black.svg';
import IconConnexion from '../../assets/images/icons/Login-white.svg';
import IconSpeedometer from '../../assets/images/icons/Speedometer.svg';
import IconUtilisateur from '../../assets/images/icons/User-black.svg';
import IconAdmistrateur from '../../assets/images/icons/Administrator-black.svg';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ isDarkTheme, isLoggedIn, toggleDarkTheme, toggleLogin, onLogout, userType }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const getConnectedSpaceLabel = () => {
    if (userType === 'admin') return t('navigation.admin_space');
    if (userType === 'professional') return t('navigation.professional_space');
    return t('navigation.my_space');
  };

  const getMenuIconClassName = (isActive) => {
    if (isDarkTheme) {
      return isActive ? 'invert' : 'brightness-0 invert group-hover:brightness-100';
    }

    return isActive ? 'invert' : 'brightness-0 group-hover:brightness-100';
  };

  return (
    <header className={`${isDarkTheme ? 'bg-[#1E293B] border-b border-[#334155]' : 'bg-white border-b border-[#E5E7EB]'}`}>
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Menu Hamburger */}
          <button 
            onClick={toggleMenu}
            className={`flex flex-col space-y-1 p-2 hover:bg-gray-100 rounded-md transition-colors ${isMenuOpen ? 'hidden' : ''}`}
            aria-label="Menu"
          >
            <div className={`w-6 h-0.5 ${isDarkTheme ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full`}></div>
            <div className={`w-6 h-0.5 ${isDarkTheme ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full`}></div>
            <div className={`w-6 h-0.5 ${isDarkTheme ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full`}></div>
          </button>
          
          {/* Logo à droite */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg justify-center items-center flex">
                <img src={Logo} alt='LaundryMap Logo' className="w-5 h-5 object-contain" />
            </div>
            <div className="ml-3 text-[18px] font-semibold text-[#3B82F6]">LaundryMap</div>
          </div>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <>
            {/* Overlay semi-transparent */}
            <div 
              className="fixed inset-0 bg-black opacity-33 z-40"
              onClick={toggleMenu}
            ></div>
            
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-70 rounded-[0_12px_0_12px] ${isDarkTheme ? 'bg-[#1E293B]' : 'bg-white'} shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className={`p-4 border-b ${isDarkTheme ? 'border-[#334155]' : 'border-[#E5E7EB]'} flex items-center justify-between`}>
                {/* Logo dans la sidebar */}
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[#3B82F6] rounded-lg justify-center items-center flex">
                    <img src={Logo} alt='LaundryMap Logo' className="w-5 h-5 object-contain" />
                  </div>
                  <div className="ml-3 text-[18px] font-semibold text-[#3B82F6]">LaundryMap</div>
                </div>
                {/* Bouton de fermeture */}
                <button 
                  onClick={toggleMenu}
                  className={`p-2 rounded-md transition-colors ${isDarkTheme ? 'hover:bg-[#334155]' : 'hover:bg-gray-100'}`}
                  aria-label="Fermer le menu"
                >
                  <svg className={`w-6 h-6 ${isDarkTheme ? 'text-[#E2E8F0]' : 'text-[#374151]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation dans la sidebar */}
              <nav className="flex flex-col p-4 space-y-2">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="font-semibold text-[14px] text-[#3B82F6]">
                    {isLoggedIn ? getConnectedSpaceLabel() : t('navigation.main_pages')}
                  </h3>
                  <LanguageSwitcher iconsOnly={true} />
                </div>
                <div className="flex flex-col space-y-2 text-left">
                    <Link to="/" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                        <img src={IconAccueil} alt={t('navigation.home')} className={`w-4 h-4 mr-2 filter transition-all ${getMenuIconClassName(isActivePage('/'))}`} />
                        {t('navigation.home')}
                    </Link>
                    {!isLoggedIn && (
                      <Link to="/login" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/login') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                            <img src={IconConnexion} alt={t('auth.login')} className={`w-4 h-4 mr-2 filter transition-all ${isDarkTheme ? (isActivePage('/login') ? 'brightness-100' : 'brightness-100') : (isActivePage('/login') ? 'brightness-100' : 'brightness-0 group-hover:brightness-100')}`} />
                            {t('auth.login')}
                      </Link>
                    )}
                    {isLoggedIn && userType !== 'admin' && (
                        <Link to="/profile" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/profile') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                            <img src={IconUtilisateur} alt={t('navigation.profile')} className={`w-4 h-4 mr-2 filter transition-all ${getMenuIconClassName(isActivePage('/profile'))}`} />
                            {t('navigation.profile')}
                        </Link>
                    )}
                    {isLoggedIn && userType === 'admin' && (
                      <Link to="/admin/profile" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/admin/profile') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                        <img src={IconUtilisateur} alt={t('navigation.profile')} className={`w-4 h-4 mr-2 filter transition-all ${getMenuIconClassName(isActivePage('/admin/profile'))}`} />
                        {t('navigation.profile')}
                      </Link>
                    )}
                    {isLoggedIn && userType === 'professional' && (
                      <Link to="/professional-dashboard" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/professional-dashboard') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                        <img src={IconSpeedometer} alt={t('navigation.dashboard_menu')} className={`w-4 h-4 mr-2 filter transition-all ${getMenuIconClassName(isActivePage('/professional-dashboard'))}`} />
                        {t('navigation.dashboard_menu')}
                      </Link>
                    )}
                    {isLoggedIn && userType === 'admin' && (
                      <Link to="/admin/dashboard" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/admin/dashboard') ? 'bg-[#3B82F6] text-white' : (isDarkTheme ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                      <img src={IconSpeedometer} alt={t('navigation.dashboard_menu')} className={`w-4 h-4 mr-2 filter transition-all ${getMenuIconClassName(isActivePage('/admin/dashboard'))}`} />
                        {t('navigation.dashboard_menu')}
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

              </nav>
              
              {/* Copyright */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 border-t text-center ${isDarkTheme ? 'border-[#334155]' : 'border-[#E5E7EB]'}`}>
                <p className={`text-[11px] ${isDarkTheme ? 'text-[#94A3B8]' : 'text-[#6B7280]'}`}>
                  {`© ${new Date().getFullYear()} LaundryMap`}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;