import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Register = ({ isDarkTheme, isLoggedIn }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Configuration React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptCGU: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Validate password confirmation
      if (data.password !== data.confirmPassword) {
        setApiError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate CGU acceptance
      if (!data.acceptCGU) {
        setApiError('You must accept the terms and conditions');
        setLoading(false);
        return;
      }

      // Call registration API
      const response = await authService.register(data);

      setSuccessMessage('Compte créé avec succès ! Un email de vérification a été envoyé à votre adresse. Veuillez consulter votre boîte de réception pour confirmer votre inscription.');
    } catch (error) {
      if (error.body?.error) {
        setApiError(error.body.error);
      } else if (error.body?.errors) {
        // Handle multiple field errors
        const errorMessages = Object.entries(error.body.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        setApiError(errorMessages);
      } else {
        setApiError('An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl p-4 sm:p-6 md:p-8">
        <h1 className="text-center text-[#3B82F6] font-semibold text-2xl mb-4 sm:mb-6 font-sans">
          Créer un compte
        </h1>

        {/* Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm whitespace-pre-line">
            {apiError}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {/* Création avec Google sur la même ligne */}
        <div className="flex items-center justify-center gap-[17px] mb-6">
          <h2 className="text-sm sm:text-base font-medium text-[#374151] text-[14px]">
            Création avec :
          </h2>

          <button
            type="button"
            className="flex items-center justify-center gap-[14px] w-[118px] h-[48px] bg-[#C5DBFF] hover:bg-[#B7D2FF] text-[#3B82F6] rounded-[6px] border-0 transition-colors shadow-sm sm:shadow-md text-sm font-semibold"
            onClick={() => {
              console.log('Connexion avec Google');
            }}
          >
            <svg
              className="w-[22px] h-[22px] flex-shrink-0"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.668 6.053 29.61 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.955 3.045l5.657-5.657C34.668 6.053 29.61 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.518 0 10.48-2.113 14.209-5.548l-6.56-5.548C29.615 34.452 26.933 36 24 36c-5.176 0-9.625-3.329-11.29-7.946l-6.52 5.025C9.503 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.052 12.052 0 0 1-3.654 4.904l.003-.002 6.56 5.548C37.749 38.195 44 34 44 24c0-1.341-.138-2.651-.389-3.917z" />
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
              {...register('name', {
                required: 'Last name is required',
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dupont"
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>
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
              {...register('firstName', {
                required: 'First name is required',
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Jean"
            />
            {errors.firstName && (
              <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>
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
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email format is invalid',
                },
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="jean.dupont@exemple.fr"
            />
            {errors.email && (
              <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-left text-sm text-gray-700 mb-1">
              Mot de passe<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long',
                },
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="•••"
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="confirmPassword" className="block text-left text-sm text-gray-700 mb-1">
              Confirmation mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Password confirmation is required',
              })}
              className={`w-full h-[44px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Checkbox CGU */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptCGU"
              {...register('acceptCGU', {
                required: 'You must accept the terms and conditions',
              })}
              className="mt-1 h-4 w-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <label htmlFor="acceptCGU" className="text-sm text-gray-700">
                J'accepte les{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                  conditions générales d'utilisation
                </a>
                <span className="text-red-500">*</span>
              </label>
              {errors.acceptCGU && (
                <p className="text-red-500 text-xs mt-1">{errors.acceptCGU.message}</p>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 sm:py-2 px-4 rounded-md text-white font-medium transition-colors text-base sm:text-sm ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3B82F6] hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center mt-4 text-sm text-gray-600">
          Vous avez déjà un compte?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#3B82F6] hover:text-blue-700 font-medium underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;