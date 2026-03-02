import { useState } from 'react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptCGU: false
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Regex pour validation du mot de passe
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  // Regex pour validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Supprimer l'erreur lors de la saisie
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validation nom
    if (!formData.name) {
      newErrors.name = 'Le nom est requis'
    }

    // Validation prénom
    if (!formData.firstName) {
      newErrors.firstName = 'Le prénom est requis'
    }

    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Veuillez saisir un email valide'
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    }

    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les deux mots de passe ne correspondent pas'
    }

    // Validation CGU
    if (!formData.acceptCGU) {
      newErrors.acceptCGU = 'Vous devez accepter les conditions générales'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validationErrors = validateForm()
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Inscription réussie ! Bienvenue sur LaundryMap')
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        firstName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptCGU: false
      })
    } catch (error) {
      setErrors({ submit: 'Une erreur est survenue lors de l\'inscription' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="max-w-sm mx-auto sm:max-w-md bg-white rounded-lg sm:shadow-lg p-4 sm:p-6">
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

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-[354px] h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 text-base sm:text-sm ${
                errors.name 
                  ? 'border-[#C51D1D] focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Dupont"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.name}</p>
            )}
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="firstName" className="block text-left text-sm text-gray-700 mb-1">
              Prénom<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-[354px] h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 text-base sm:text-sm ${
                errors.firstName 
                  ? 'border-[#C51D1D] focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Jean"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.firstName}</p>
            )}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-[354px] h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 text-base sm:text-sm ${
                errors.email 
                  ? 'border-[#C51D1D] focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="jean.dupont@exemple.fr"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.email}</p>
            )}
          </div>

            {/* Mot de passe */}    
            <div>
            <label htmlFor="password" className="block text-left text-sm text-gray-700 mb-1">
              Mot de passe<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-[354px] h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 text-base sm:text-sm ${
                  errors.password 
                    ? 'border-[#C51D1D] focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="•••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.password}</p>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-sm text-gray-700 mb-1">
              Confirmation mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-[354px] h-[44px] px-3 pr-10 border rounded-md focus:outline-none focus:ring-2 text-base sm:text-sm ${
                  errors.confirmPassword 
                    ? 'border-[#C51D1D] focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Checkbox CGU */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptCGU"
              name="acceptCGU"
              checked={formData.acceptCGU}
              onChange={handleChange}
              className={`mt-1 h-4 w-4 text-blue-600 border-2 rounded focus:ring-blue-500 ${
                errors.acceptCGU
                  ? 'border-[#C51D1D]'
                  : 'border-gray-300'
              }`}
            />
            <label htmlFor="acceptCGU" className="text-sm text-gray-700">
              J'accepte les{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                conditions générales d'utilisation
              </a>
              <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.acceptCGU && (
            <p className="text-sm text-red-600 text-left">{errors.acceptCGU}</p>
          )}

          {/* Erreur générale */}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-left">
              {errors.submit}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 sm:py-2 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Inscription en cours...' : 'Créer mon compte'}
          </button>

          {/* Message d'attention pour les champs - s'affiche seulement s'il y a des erreurs */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800 text-left">
                Des champs nécessitent votre attention.
              </p>
            </div>
          )}
        </form>
      </div>
  )
}

export default Register