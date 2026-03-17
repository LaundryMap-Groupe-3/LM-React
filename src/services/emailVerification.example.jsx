// Example: React Frontend Integration for Email Verification

import React, { useState, useEffect } from 'react';

// Example 1: Verification Page Component
export function VerifyEmailPage() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      // Extract token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token not found in URL');
        return;
      }

      // Call verification endpoint
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred: ' + error.message);
    }
  };

  if (status === 'verifying') {
    return <div className="verify-container">Verifying your email...</div>;
  }

  if (status === 'success') {
    return (
      <div className="verify-container success">
        <h2>✓ {message}</h2>
      </div>
    );
  }

  return (
    <div className="verify-container error">
      <h2>Verification Failed</h2>
      <p>{message}</p>
      <a href="/resend-verification">Resend verification email</a>
    </div>
  );
}

// Example 2: Resend Verification Email Component
export function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/resend-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Check your inbox.');
        setEmail('');
      } else {
        setError(data.error || 'Failed to resend email');
      }
    } catch (err) {
      setError('An error occurred: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resend-container">
      <h2>Resend Verification Email</h2>
      <form onSubmit={handleResend}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Resend Email'}
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

// Example 3: Updated Registration Handler
export async function handleRegisterSubmit(formData) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      // Show verification email sent message
      return {
        success: true,
        message: data.message, // "User created successfully. Please check your email to verify your address."
        user: data.user
      };
    } else {
      return {
        success: false,
        errors: data.errors || { general: data.error }
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: { general: error.message }
    };
  }
}

// Example 4: CSS Styling
const styles = `
.verify-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: Arial, sans-serif;
}

.verify-container h2 {
  color: white;
  font-size: 24px;
  margin: 0;
}

.verify-container.success {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

.verify-container.error {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  flex-direction: column;
  padding: 20px;
  text-align: center;
}

.verify-container.error p {
  color: white;
  margin: 10px 0;
}

.verify-container.error a {
  color: white;
  text-decoration: underline;
  margin-top: 20px;
  display: inline-block;
}

.resend-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.resend-container form {
  display: flex;
  flex-direction: column;
}

.resend-container input {
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.resend-container button {
  padding: 12px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.resend-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  color: #43a047;
  margin-top: 16px;
}

.error-message {
  color: #e53935;
  margin-top: 16px;
}
`;

// Example 5: React Router Setup
/*
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        {/* ... other routes ... */}
      </Routes>
    </BrowserRouter>
  );
}
*/

export default {
  VerifyEmailPage,
  ResendVerificationPage,
  handleRegisterSubmit,
  styles
};
