import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from './context/I18nContext'
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import Profile from './components/user/Profile'
import EditProfile from './components/user/EditProfile'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import authService from './services/authService'
import './App.css'

// Composant pour la page d'accueil
const Home = ({ isDarkTheme, isLoggedIn }) => {
  const { t } = useTranslation()
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkTheme || isLoggedIn ? 'bg-[#1E293B]' : 'bg-white'}`}>
      <h1 className="text-3xl font-bold text-[#3B82F6]">{t('common.welcome')} {t('common.app_name')}</h1>
    </div>
  )
}

// Protected Route Component
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
        } else {
          // Token is invalid or expired
          authService.logout();
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };

    checkAuthentication();
  }, []);

  const toggleDarkTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <>
      <Header 
        isDarkTheme={isDarkTheme}
        isLoggedIn={isLoggedIn}
        toggleDarkTheme={toggleDarkTheme}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home isDarkTheme={isDarkTheme} isLoggedIn={isLoggedIn} />} />
        <Route path="/register" element={
          isLoggedIn ? <Navigate to="/profile" replace /> :
          <Register 
            isDarkTheme={isDarkTheme}
            isLoggedIn={isLoggedIn}
          />
        } />
        <Route path="/login" element={
          isLoggedIn ? <Navigate to="/profile" replace /> :
          <Login 
            isDarkTheme={isDarkTheme}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
        <Route path="/profile" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Profile 
              isDarkTheme={isDarkTheme}
              isLoggedIn={isLoggedIn}
              toggleDarkTheme={toggleDarkTheme}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }/> 
        <Route path="/edit-profile" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <EditProfile 
              isDarkTheme={isDarkTheme}
              isLoggedIn={isLoggedIn}
            />
          </ProtectedRoute>
        }/>
      </Routes>
      <Footer isDarkTheme={isDarkTheme} isLoggedIn={isLoggedIn} />
    </>
  )
}

export default App
