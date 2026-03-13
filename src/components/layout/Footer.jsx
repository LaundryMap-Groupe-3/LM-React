import LogoFacebook from '../../assets/images/logos/logo-facebook.svg';
import LogoTwitter from '../../assets/images/logos/logo-twitter.svg';
import LogoInstagram from '../../assets/images/logos/logo-instagram.svg';
import LogoLinkedIn from '../../assets/images/logos/logo-linkedin.svg';

const Footer = ({ isDarkTheme, isLoggedIn }) => {
  return (
    <footer className={isDarkTheme ? 'bg-[#1E293B] text-[#E2E8F0]' : 'bg-white text-[#64748B]'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 lg:py-12 xl:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12 xl:gap-16 text-left">
          <div className="space-y-4 lg:space-y-6">
            {/*Titre */}
            <h3 className="font-semibold text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] text-[#3B82F6]">LaundryMap</h3>
            {/* Liens rapides */}
            <div>
              <ul className="text-left space-y-2 lg:space-y-3 xl:space-y-4">
                <li>
                  <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                    Aide & Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Contact */}
          <div className="space-y-4 lg:space-y-6">
            <h3 className="font-semibold text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] text-[#3B82F6]">Contact</h3>
            <ul className="space-y-2 lg:space-y-3 xl:space-y-4 text-gray-300">
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                 À propos
                </a>
              </li>
              <li>
                <a href='#' className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium flex items-center transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  contact@laundrymap.fr
                </a>
              </li>
              <li>
                <a href='#' className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium flex items-center transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  01 23 45 67 89
                </a>
              </li>
              <li>
                <a href='#' className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium flex items-center transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  Centre d'aide
                </a>
              </li>
            </ul>
          </div>
          
          {/* Colonnes supplémentaires pour desktop */}
          <div className="hidden lg:block space-y-4 lg:space-y-6">
            <h3 className="font-semibold text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] text-[#3B82F6]">Services</h3>
            <ul className="space-y-2 lg:space-y-3 xl:space-y-4">
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  Trouver une laverie
                </a>
              </li>
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  Espace professionnel
                </a>
              </li>
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  API
                </a>
              </li>
            </ul>
          </div>
          
          <div className="hidden lg:block space-y-4 lg:space-y-6">
            <h3 className="font-semibold text-[12px] md:text-[14px] lg:text-[16px] xl:text-[18px] text-[#3B82F6]">Légal</h3>
            <ul className="space-y-2 lg:space-y-3 xl:space-y-4">
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className={`text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-medium transition duration-300 hover:translate-x-1 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/*Réseaux sociaux */}
        <div className="flex justify-center gap-4 lg:gap-6 xl:gap-8 space-x-2 lg:space-x-4 mt-8 lg:mt-12 xl:mt-16">
          <a href="#" className={`transition duration-300 transform hover:scale-110 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#3B82F6]`}>
              <img src={LogoFacebook} alt="Logo Facebook" className="w-5 h-5 lg:w-6 lg:h-6"/>
            </div>
          </a>
          <a href="#" className={`transition duration-300 transform hover:scale-110 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#3B82F6]`}>
              <img src={LogoTwitter} alt="Logo Twitter" className="w-5 h-5 lg:w-6 lg:h-6"/>
            </div>
          </a>
          <a href="#" className={`transition duration-300 transform hover:scale-110 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#3B82F6]`}>
              <img src={LogoInstagram} alt="Logo Instagram" className="w-5 h-5 lg:w-6 lg:h-6"/>
            </div>
          </a>
          <a href="#" className={`transition duration-300 transform hover:scale-110 ${isDarkTheme || isLoggedIn ? 'hover:text-[#3B82F6]' : 'hover:text-[#3B82F6]'}`}>
            <div className={`w-9 h-9 lg:w-11 lg:h-11 xl:w-12 xl:h-12 ${isDarkTheme || isLoggedIn ? 'bg-[#334155]' : 'bg-[#F1F5F9]'} rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#3B82F6]`}>
              <img src={LogoLinkedIn} alt="Logo LinkedIn" className="w-5 h-5 lg:w-6 lg:h-6"/>
            </div>
          </a>
        </div>
      </div>

      {/* Ligne de séparation full-width */}
      <div className={`border-t ${isDarkTheme || isLoggedIn ? 'border-[#334155]' : 'border-[#F1F5F9]'}`}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="py-6 lg:py-8 xl:py-10 text-center">
          <p className={`text-[10px] md:text-[12px] lg:text-[14px] xl:text-[16px] font-regular mb-4 lg:mb-6 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
            © {new Date().getFullYear()} LaundryMap. Tous droits réservés.
          </p>
          {/* Liens légaux */}
          <div className="flex sm:flex-row justify-center items-center gap-2 sm:gap-6 mb-4">
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              Mentions légales
            </a>
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              CGU
            </a>
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              Politique de confidentialité
            </a>
            <a href="#" className={`text-[10px] font-regular transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;