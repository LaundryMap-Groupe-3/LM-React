import LogoFacebook from '../../assets/images/logos/logo-facebook.svg';
import LogoTwitter from '../../assets/images/logos/logo-twitter.svg';
import LogoInstagram from '../../assets/images/logos/logo-instagram.svg';
import LogoLinkedIn from '../../assets/images/logos/logo-linkedin.svg';

const Footer = ({ isDarkTheme, isLoggedIn }) => {
  return (
    <footer className={isDarkTheme ? 'bg-[#1E293B] text-[#E2E8F0]' : 'bg-white text-[#64748B]'}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-left justify-items-center">
          <div>
            {/*Titre */}
            <h3 className="font-semibold text-[12px] text-[#3B82F6] mb-2">LaundryMap</h3>
            <div className="flex flex-col text-left space-y-2">
              <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                Trouver une laverie
              </a>
              <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                Espace utilisateur
              </a>
              <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                Espace professionnel
              </a>
              <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                Produits Wi-line
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[12px] text-[#3B82F6] mb-2">Contact</h3>
            <div className="flex flex-col text-left space-y-2">
              <a href="#" className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1] hover:text-[#3B82F6]' : 'text-[#64748B] hover:text-[#3B82F6]'}`}>
                À propos
              </a>
              <a href='#' className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                contact@laundrymap.fr
              </a>
              <a href='#' className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                01 23 45 67 89
              </a>
              <a href='#' className={`text-[12px] font-medium transition duration-300 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
                Centre d'aide
              </a>
            </div>
          </div>
        </div>

        {/*Réseaux sociaux */}
        <div className="flex justify-center gap-3.5 space-x-4 mt-6">
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
          <p className={`font-regular text-[12px] mb-4 ${isDarkTheme || isLoggedIn ? 'text-[#CBD5E1]' : 'text-[#64748B]'}`}>
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