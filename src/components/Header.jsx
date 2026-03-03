import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/logos/logo-laundrymap.svg';
import IconAccueil from '../assets/images/icons/Home-black.svg';
import IconConnexion from '../assets/images/icons/Login-white.svg';
import IconMotDePasseOublie from '../assets/images/icons/Key-black.svg';
import IconUtilisateur from '../assets/images/icons/User-black.svg';
import IconAdmistrateur from '../assets/images/icons/Administrator-black.svg';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB]">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-[32px] h-[32px] bg-[#3B82F6] rounded-[8px] justify-center items-center flex">
                <img src={Logo} alt='LaundryMap Logo' className="w-[20px] h-[20px] object-contain" />
            </div>
            <div className="ml-3 text-[18px] font-semibold text-[#3B82F6]">LaundryMap</div>
          </div>
          
          {/* Navigation Desktop - cachée sur mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActivePage('/') ? 'text-white bg-[#3B82F6]' : 'text-gray-700 hover:text-white hover:bg-[#3B82F6]'} transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px]`}>Accueil</Link>
            <a href="#" className="text-gray-700 hover:text-white hover:bg-[#3B82F6] transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px]">Connexion</a>
            <Link to="/register" className={`${isActivePage('/register') ? 'text-white bg-[#3B82F6]' : 'text-gray-700 hover:text-white hover:bg-[#3B82F6]'} transition-colors font-medium px-4 h-[38px] flex items-center rounded-[5px]`}>Inscription</Link>
          </nav>
          
          {/* Menu Hamburger */}
          <button 
            onClick={toggleMenu}
            className="md:hidden flex flex-col space-y-1 p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Menu"
          >
            <div className={`w-6 h-0.5 bg-[#374151] rounded-full transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#374151] rounded-full transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-[#374151] rounded-full transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        </div>
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <>
            {/* Overlay semi-transparent */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={toggleMenu}
            ></div>
            
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[280px] rounded-[0_12px_0_12px] bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="p-4 border-b border-[#E5E7EB]">
                {/* Logo dans la sidebar */}
                <div className="flex items-center">
                  <div className="w-[32px] h-[32px] bg-[#3B82F6] rounded-[8px] justify-center items-center flex">
                    <img src={Logo} alt='LaundryMap Logo' className="w-[20px] h-[20px] object-contain" />
                  </div>
                  <div className="ml-3 text-[18px] font-semibold text-[#3B82F6]">LaundryMap</div>
                </div>
              </div>
              
              {/* Navigation dans la sidebar */}
              <nav className="flex flex-col p-4 space-y-2">
                <div className="flex flex-col space-y-2 text-left">
                    <h3 className="font-semibold text-[#3B82F6] text-[14px]">Pages principales</h3>
                    <Link to="/" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/') ? 'bg-[#3B82F6] text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white'} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                        <img src={IconAccueil} alt="Accueil" className={`w-4 h-4 mr-2 ${isActivePage('/') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                        Accueil
                    </Link>
                    <a href="#" onClick={toggleMenu} className="px-3 text-[12px] text-[#0F172A] hover:bg-[#3B82F6] hover:text-white rounded-[5px] transition-colors font-medium flex items-center h-[38px] group">
                        <img src={IconConnexion} alt="Connexion" className="w-4 h-4 mr-2 brightness-0 group-hover:brightness-100 transition-all" />
                        Connexion
                    </a>
                </div>
                <div className="flex flex-col space-y-2 text-left">
                    <h3 className="font-semibold text-[#3B82F6] text-[14px]">Inscription</h3>
                    <Link to="/register" onClick={toggleMenu} className={`px-3 text-[12px] ${isActivePage('/register') ? 'bg-[#3B82F6] text-white' : 'text-[#0F172A] hover:bg-[#3B82F6] hover:text-white'} rounded-[5px] transition-colors font-medium flex items-center h-[38px] group`}>
                        <img src={IconUtilisateur} alt="Inscription utilisateur" className={`w-4 h-4 mr-2 ${isActivePage('/register') ? 'filter invert' : 'group-hover:filter group-hover:invert'} transition-all`} />
                        Inscription utilisateur
                    </Link>
                    <a href="#" onClick={toggleMenu} className="px-3 text-[12px] text-[#0F172A] hover:bg-[#3B82F6] hover:text-white rounded-[5px] transition-colors font-medium flex items-center h-[38px] group">
                        <img src={IconAdmistrateur} alt="Inscription professionnelle" className="w-4 h-4 mr-2 group-hover:filter group-hover:invert transition-all" />
                        Inscription professionnelle
                    </a>
                    <a href="#" onClick={toggleMenu} className="px-3 text-[12px] text-[#0F172A] hover:bg-[#3B82F6] hover:text-white rounded-[5px] transition-colors font-medium flex items-center h-[38px] group">
                        <img src={IconMotDePasseOublie} alt="Mot de passe oublié" className="w-4 h-4 mr-2 group-hover:filter group-hover:invert transition-all" />
                        Mot de passe oublié
                    </a>
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