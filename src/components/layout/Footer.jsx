import React from 'react';
import { useTranslation } from '../../context/I18nContext';
import LogoFacebook from '../../assets/images/logos/logo-facebook.svg';
import LogoTwitter from '../../assets/images/logos/logo-twitter.svg';
import LogoInstagram from '../../assets/images/logos/logo-instagram.svg';
import LogoLinkedIn from '../../assets/images/logos/logo-linkedIn.svg';

const Footer = ({ isDarkTheme, isLoggedIn }) => {
  const { t } = useTranslation();
  return (
    <footer className={isDarkTheme ? 'bg-[#1E293B] text-[#E2E8F0]' : 'bg-white text-[#64748B]'}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left justify-items-center md:justify-items-start">
          <div>
            {/*Titre */}
            <h3 className="font-semibold text-[12px] text-[#3B82F6]">{t('footer.laundrymap')}</h3>
            {/* Liens rapides */}
            <div>
              <ul className="text-left space-y-2">
                <li>
                  <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    {t('footer.about')}
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    {t('footer.how_it_works')}
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    {t('footer.blog')}
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    {t('footer.help_support')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[12px] text-[#3B82F6]">{t('footer.contact')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                 {t('footer.about')}
                </a>
              </li>
              <li>
                <a href='#' className={`text-[12px] font-medium flex items-center ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                  {t('footer.contact_email')}
                </a>
              </li>
              <li>
                <a href='#' className={`text-[12px] font-medium flex items-center ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                  {t('footer.contact_phone')}
                </a>
              </li>
              <li>
                <a href='#' className={`text-[12px] font-medium flex items-center ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                  {t('footer.help_center')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/*Réseaux sociaux */}
        <div className="flex justify-center gap-[14px] space-x-4 mt-4">
          <a href="#" className={`transition duration-300 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoFacebook} alt="Logo Facebook" className="w-5 h-5"/>
            </div>
          </a>
          <a href="#" className={`transition duration-300 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoTwitter} alt="Logo Twitter" className="w-5 h-5"/>
            </div>
          </a>
          <a href="#" className={`transition duration-300 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoInstagram} alt="Logo Instagram" className="w-5 h-5"/>
            </div>
          </a>
          <a href="#" className={`transition duration-300 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center`}>
              <img src={LogoLinkedIn} alt="Logo LinkedIn" className="w-5 h-5"/>
            </div>
          </a>
        </div>
      </div>

      {/* Ligne de séparation full-width */}
      <div className={`border-t ${isDarkTheme || isLoggedIn ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}></div>
      
      <div className="container mx-auto px-4">
        <div className="py-6 text-center">
          <p className={`text-[10px] font-regular text-[12px] mb-4 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            {t('footer.copyright').replace('{year}', new Date().getFullYear())}
          </p>
          {/* Liens légaux */}
          <div className="flex sm:flex-row justify-center items-center gap-2 sm:gap-6 mb-4">
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.legal')}
            </a>
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.cgu')}
            </a>
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.privacy')}
            </a>
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              {t('footer.cookies')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;