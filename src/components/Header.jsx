import React, { useState } from 'react';
import Logo from '../assets/images/logos/logo-laundrymap.svg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
            <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">Accueil</a>
            <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">Services</a>
            <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">À propos</a>
            <a href="#" className="text-gray-700 hover:text-[#3B82F6] transition-colors font-medium">Contact</a>
          </nav>
          
          {/* Menu Hamburger - visible uniquement sur mobile */}
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
        
        {/* Menu mobile (affiché quand hamburger cliqué) */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden">
            <nav className="flex flex-col space-y-2">
              <a href="#" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Accueil</a>
              <a href="#" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Services</a>
              <a href="#" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">À propos</a>
              <a href="#" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Contact</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;