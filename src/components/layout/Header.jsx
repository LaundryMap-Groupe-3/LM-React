import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../assets/images/logos/logo-laundrymap.svg';
import IconAccueil from '../../assets/images/icons/Home-black.svg';
import IconConnexion from '../../assets/images/icons/Login-white.svg';
import IconMotDePasseOublie from '../../assets/images/icons/Key-black.svg';
import IconUtilisateur from '../../assets/images/icons/add-User.svg';
import IconAdmistrateur from '../../assets/images/icons/Administrator-black.svg';

const Header = ({ isDarkTheme, isLoggedIn, toggleDarkTheme, toggleLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`${isDarkTheme || isLoggedIn ? 'bg-[#1E293B] border-b border-[#334155]' : 'bg-white border-b border-[#E5E7EB]'}`}>
      <div className="container mx-auto px-4 py-4 md:py-6 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] lg:w-[48px] lg:h-[48px] bg-[#3B82F6] rounded-[8px] justify-center items-center flex">
                <img src={Logo} alt='LaundryMap Logo' className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px] object-contain" />
            </div>
            <div className="ml-3 text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] font-semibold text-[#3B82F6]">LaundryMap</div>
          </div>
          
          {/* Menu Hamburger */}
          <button 
            onClick={toggleMenu}
            className="flex flex-col space-y-1 p-2 hover:bg-gray-100 rounded-md transition-colors ml-4"
            aria-label="Menu"
          >
            <div className={`w-6 h-0.5 ${isDarkTheme || isLoggedIn ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-6 h-0.5 ${isDarkTheme || isLoggedIn ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 ${isDarkTheme || isLoggedIn ? 'bg-[#E2E8F0]' : 'bg-[#374151]'} rounded-full transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <>
            {/* Overlay semi-transparent */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleMenu}
            ></div>
            
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[280px] lg:w-[320px] xl:w-[360px] rounded-[0_12px_0_12px] ${isDarkTheme || isLoggedIn ? 'bg-[#1E293B]' : 'bg-white'} shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className={`p-4 lg:p-6 xl:p-8 border-b ${isDarkTheme || isLoggedIn ? 'border-[#334155]' : 'border-[#E5E7EB]'}`}>
                {/* Logo dans la sidebar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-[32px] h-[32px] lg:w-[40px] lg:h-[40px] xl:w-[48px] xl:h-[48px] bg-[#3B82F6] rounded-[8px] justify-center items-center flex">
                      <img src={Logo} alt='LaundryMap Logo' className="w-[20px] h-[20px] lg:w-[24px] lg:h-[24px] xl:w-[28px] xl:h-[28px] object-contain" />
                    </div>
                    <div className="ml-3 text-[18px] lg:text-[20px] xl:text-[22px] font-semibold text-[#3B82F6]">LaundryMap</div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleMenu}
                    className={`w-10 h-10 rounded-[8px] flex items-center justify-center transition-colors ${isDarkTheme || isLoggedIn ? 'hover:bg-[#334155]' : 'hover:bg-[#F3F4F6]'}`}
                    aria-label="Fermer le menu"
                  >
                    <div className="relative w-4 h-4">
                      <span className="absolute top-1/2 left-0 w-4 h-0.5 -translate-y-1/2 rotate-45 bg-[#3B82F6]"></span>
                      <span className="absolute top-1/2 left-0 w-4 h-0.5 -translate-y-1/2 -rotate-45 bg-[#3B82F6]"></span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Navigation dans la sidebar */}
              <nav className="flex flex-col p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6">
                <div className="flex flex-col space-y-3 lg:space-y-4 text-left">
                    <h3 className="font-semibold text-[14px] lg:text-[16px] xl:text-[18px] text-[#3B82F6]">Pages principales</h3>
                    <Link to="/" onClick={toggleMenu} className={`px-3 lg:px-4 xl:px-5 text-[12px] lg:text-[14px] xl:text-[16px] ${isActivePage('/') ? (isDarkTheme || isLoggedIn ? 'bg-[#3B82F6] text-white' : 'bg-[#3B82F6] text-white') : (isDarkTheme || isLoggedIn ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] lg:h-[42px] xl:h-[46px] group`}>
                        <img src={IconAccueil} alt="Accueil" className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 lg:mr-3 xl:mr-4 ${isActivePage('/') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                        Accueil
                    </Link>
                    {!isLoggedIn && (
                        <a href="#" onClick={toggleMenu} className={`px-3 lg:px-4 xl:px-5 text-[12px] lg:text-[14px] xl:text-[16px] rounded-[5px] transition-colors font-medium flex items-center h-[38px] lg:h-[42px] xl:h-[46px] group ${isDarkTheme || isLoggedIn ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white'}`}>
                            <img src={IconConnexion} alt="Connexion" className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 lg:mr-3 xl:mr-4 brightness-0 group-hover:brightness-100 transition-all" />
                            Connexion
                        </a>
                    )}
                    {isLoggedIn && (
                        <Link to="/profile" onClick={toggleMenu} className={`px-3 lg:px-4 xl:px-5 text-[12px] lg:text-[14px] xl:text-[16px] ${isActivePage('/profile') ? (isDarkTheme || isLoggedIn ? 'bg-[#3B82F6] text-white' : 'bg-[#3B82F6] text-white') : (isDarkTheme || isLoggedIn ? 'text-[#E2E8F0] hover:bg-[#3B82F6] hover:text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white')} rounded-[5px] transition-colors font-medium flex items-center h-[38px] lg:h-[42px] xl:h-[46px] group`}>
                            <img src={IconUtilisateur} alt="Mon Profil" className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 mr-2 lg:mr-3 xl:mr-4 ${isActivePage('/profile') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                            Mon Profil
                        </Link>
                    )}
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