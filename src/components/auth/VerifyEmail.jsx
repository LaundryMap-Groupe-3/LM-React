import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/I18nContext';
import usePageTitle from '../../hooks/usePageTitle';
import { translateErrorKey } from '../../utils/translateErrorKey';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VerifyEmail = ({ isDarkTheme }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  usePageTitle('page_titles.verify_email', t);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage(t('auth.token_not_found') || 'Token non trouvé dans l\'URL');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('auth.email_verified_success') || 'Email vérifié avec succès!');
        
        // Redirection vers login après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        // Translate error key if it comes from backend
        let errorMessage = data.error || data.message || t('auth.verification_failed');
        errorMessage = translateErrorKey(errorMessage, t);
        setMessage(errorMessage);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatus('error');
      setMessage((t('auth.error_occurred') || 'Une erreur s\'est produite: ') + error.message);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-8 px-4 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-lg shadow-lg ${
        isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-3">
              {t('auth.verification_in_progress') || 'Vérification en cours...'}
            </h2>
            <p className={`text-center text-base ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {t('auth.please_wait_verification') || 'Veuillez patienter pendant que nous vérifions votre adresse email.'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="text-6xl font-bold text-green-500">✓</div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-3 text-green-600">
              {t('auth.email_verified') || 'Email vérifié avec succès!'}
            </h2>
            <p className={`text-center text-base mb-3 ${
              isDarkTheme ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {message}
            </p>
            <p className={`text-center text-sm italic ${
              isDarkTheme ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {t('auth.redirecting_in_3_seconds') || 'Redirection vers la connexion dans 3 secondes...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="text-6xl font-bold text-red-500">✕</div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-3 text-red-600">
              {t('auth.verification_error') || 'Erreur de vérification'}
            </h2>
            <p className={`text-center text-base mb-6 ${
              isDarkTheme ? 'text-red-400' : 'text-red-600'
            }`}>
              {message}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition-colors shadow-sm"
            >
              {t('auth.back_to_registration') || 'Retour à l\'inscription'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
