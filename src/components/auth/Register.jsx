import { useForm } from 'react-hook-form'

const Register = ({ isDarkTheme, isLoggedIn }) => {
  // Configuration React Hook Form
  const {
    register,
    handleSubmit
  } = useForm()

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8">
        <h1 className="text-center text-[#3B82F6] font-semibold text-2xl mb-4 sm:mb-6 font-sans">
          Créer un compte
        </h1>
        {/* Création avec Google sur la même ligne */}
        <div className="flex items-center justify-center gap-[17px] mb-6">
          <h2 className="text-sm sm:text-base font-medium text-[#374151] text-[14px]">
            Création avec :
          </h2>
          
          <button
            type="button"
            className="flex items-center justify-center gap-[14px] w-[118px] h-[48px] bg-[#C5DBFF] hover:bg-[#B7D2FF] text-[#3B82F6] rounded-[6px] border-0 transition-colors shadow-sm sm:shadow-md text-sm font-semibold"
            onClick={() => {
              console.log('Connexion avec Google')
            }}
          >
            <svg
              className="w-[22px] h-[22px] flex-shrink-0"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.668 6.053 29.61 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.668 6.053 29.61 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.518 0 10.48-2.113 14.209-5.548l-6.56-5.548C29.615 34.452 26.933 36 24 36c-5.176 0-9.625-3.329-11.29-7.946l-6.52 5.025C9.503 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.052 12.052 0 0 1-3.654 4.904l.003-.002 6.56 5.548C37.749 38.195 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
            </svg>
            <span className="font-bold">Google</span>
          </button>
        </div>
        
        {/* Séparateur */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-[#6A7282]"></div>
          <span className="px-3 text-sm text-[#6A7282] font-extrabold">OU</span>
          <div className="flex-1 border-t border-[#6A7282]"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <h1 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans">
            Mes informations personnels
          </h1>
          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-left text-sm text-gray-700 mb-1">
              Nom<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              placeholder="Dupont"
            />
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="firstName" className="block text-left text-sm text-gray-700 mb-1">
              Prénom<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              {...register('firstName')}
              className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              placeholder="Jean"
            />
          </div>

          <h1 className="text-left text-[#374151] font-extrabold text-[14px] mb-4 sm:mb-6 font-sans">
            Mes informations de connexion
          </h1>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-left text-sm text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              placeholder="jean.dupont@exemple.fr"
            />
          </div>

          {/* Mot de passe */}    
          <div>
            <label htmlFor="password" className="block text-left text-sm text-gray-700 mb-1">
              Mot de passe<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              {...register('password')}
              className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              placeholder="•••"
            />
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-sm text-gray-700 mb-1">
              Confirmation mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              className="w-full h-[44px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Checkbox CGU */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptCGU"
              {...register('acceptCGU')}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="acceptCGU" className="text-sm text-gray-700">
              J'accepte les{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                conditions générales d'utilisation
              </a>
              <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full py-3 sm:py-2 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Créer mon compte
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register