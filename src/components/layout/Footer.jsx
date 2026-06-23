import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import LogoYoutube from '../../assets/images/logos/logo-youtube.svg';
import LogoX from '../../assets/images/logos/logo-x.svg';
import LogoLinkedIn from '../../assets/images/logos/logo-linkedin.svg';

const Footer = ({ isDarkTheme, isLoggedIn }) => {
  const { t } = useTranslation();
  return (
    <footer className={isDarkTheme ? 'bg-[#1E293B] text-[#E2E8F0]' : 'bg-white text-[#64748B]'}>
      <div className="container mx-auto px-4 py-8">
        {/*Réseaux sociaux */}
        <div className="flex justify-center gap-[14px] space-x-4 mt-4">
          <Link to="https://www.youtube.com/@ec2enews" target="_blank" rel="noopener noreferrer" className={`transition duration-300 ${isDarkTheme ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoYoutube} alt="Logo YouTube" className="w-5 h-5"/>
            </div>
          </Link>
          <Link to="https://x.com/EC2E10" target="_blank" rel="noopener noreferrer" className={`transition duration-300 ${isDarkTheme ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoX} alt="Logo X (Twitter)" className="w-5 h-5"/>
            </div>
          </Link>
          <Link to="https://www.linkedin.com/company/ec2e/" target="_blank" rel="noopener noreferrer" className={`transition duration-300 ${isDarkTheme ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoLinkedIn} alt="Logo LinkedIn" className="w-5 h-5"/>
            </div>
          </Link>
        </div>
      </div>

      {/* Ligne de séparation full-width */}
      <div className={`border-t ${isDarkTheme ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}></div>
      
      <div className="container mx-auto px-4">
        <div className="py-6 text-center">
          <p className={`text-[10px] font-regular text-[12px] mb-4 ${isDarkTheme ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            {t('footer.copyright').replace('{year}', new Date().getFullYear())}
          </p>
          {/* Liens légaux */}
          <div className="flex sm:flex-row justify-center items-center gap-2 sm:gap-6 mb-4">
            <Link to="/mentions-legales" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.legal')}
            </Link>
            <Link to="/cgu" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.cgu')}
            </Link>
            <Link to="/politique-de-confidentialite" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.privacy')}
            </Link>
            <Link to="/cookies" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.cookies')}
            </Link>
            <Link to="/accessibilite" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.accessibility')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;