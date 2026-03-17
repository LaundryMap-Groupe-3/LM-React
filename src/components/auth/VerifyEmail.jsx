import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../index.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
        setMessage('Token non trouvé dans l\'URL');
        return;
      }

      const response = await fetch('http://localhost:8080/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email vérifié avec succès!');
        
        // Redirection vers login après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'La vérification a échoué');
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur s\'est produite: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Vérification en cours...</h2>
            <p style={styles.subtitle}>Veuillez patienter pendant que nous vérifions votre adresse email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Email vérifié avec succès!</h2>
            <p style={styles.subtitle}>{message}</p>
            <p style={styles.redirectMessage}>Redirection vers la connexion dans 3 secondes...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.title}>Erreur de vérification</h2>
            <p style={styles.errorMessage}>{message}</p>
            <button style={styles.button} onClick={() => navigate('/register')}>
              Retour à l'inscription
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '10px 0 30px 0',
  },
  successIcon: {
    fontSize: '60px',
    color: '#28a745',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  errorIcon: {
    fontSize: '60px',
    color: '#dc3545',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: '16px',
    color: '#dc3545',
    margin: '10px 0 30px 0',
  },
  redirectMessage: {
    fontSize: '14px',
    color: '#999',
    margin: '10px 0',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

// Ajoute l'animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
