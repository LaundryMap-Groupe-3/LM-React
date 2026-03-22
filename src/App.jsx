import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from './context/I18nContext'
import { usePreferences } from './context/PreferencesContext'
import usePageTitle from './hooks/usePageTitle'
import Register from './components/auth/Register'
import ProfessionalRegister from './components/auth/ProfessionalRegister'
import Login from './components/auth/Login'
import VerifyEmail from './components/auth/VerifyEmail'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Profile from './components/user/Profile'
import EditProfile from './components/user/EditProfile'
import AdminPendingProfessionals from './components/admin/AdminPendingProfessionals'
import AdminProfessionalDetails from './components/admin/AdminProfessionalDetails'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import authService from './services/authService'
import './App.css'

// Composant pour la page d'accueil
const Home = ({ isDarkTheme, isLoggedIn }) => {
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  usePageTitle('page_titles.home', t)

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      }
      fetchUser()
    }
  }, [isLoggedIn])

  const getRoleLabel = (type) => {
    const roleMap = {
      'admin': 'Administrateur',
      'professional': 'Professionnel',
      'user': 'Utilisateur'
    }
    return roleMap[type] || type
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkTheme ? 'bg-[#1E293B]' : 'bg-white'}`}>
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold text-[#3B82F6]">{t('common.welcome')} {t('common.app_name')}</h1>
        
        {isLoggedIn && user && (
          <div className={`p-6 rounded-lg border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`text-center ${isDarkTheme ? 'text-gray-100' : 'text-gray-800'}`}>
              <p className="text-lg font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email}
              </p>
              <p className="text-sm mt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#3B82F6] text-white font-medium">
                  {getRoleLabel(user.type)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
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

// Protected Admin Route Component
const ProtectedAdminRoute = ({ isLoggedIn, userType, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  if (userType !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

// Protected Non-Admin Route Component (deny access to admins)
const ProtectedNonAdminRoute = ({ isLoggedIn, userType, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  if (userType === 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const { isDarkTheme, toggleTheme, reloadUserPreferences } = usePreferences();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          setUserType(user.type);
          // Load user preferences after authentication check
          reloadUserPreferences();
        } else {
          // Token is invalid or expired
          authService.logout();
          setIsLoggedIn(false);
          setUserType(null);
        }
      }
      setLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Reload user preferences after successful login (non-await to avoid blocking)
    setTimeout(() => {
      reloadUserPreferences();
      // Fetch user type after login
      authService.getCurrentUser().then(user => {
        if (user) {
          setUserType(user.type);
        }
      });
    }, 0);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUserType(null);
    // Reset to browser preferences on logout
    window.location.reload();
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
        userType={userType}
        toggleDarkTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home isDarkTheme={isDarkTheme} isLoggedIn={isLoggedIn} />} />
        <Route path="/register" element={
          isLoggedIn ? <Navigate to="/profile" replace /> :
          <Register 
            isDarkTheme={isDarkTheme}
            isLoggedIn={isLoggedIn}
            onLoginSuccess={handleLoginSuccess}
          />
        } />
        <Route path="/register/professional" element={
          isLoggedIn ? <Navigate to="/profile" replace /> :
          <ProfessionalRegister 
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
        <Route path="/forgot-password" element={
          isLoggedIn ? <Navigate to="/profile" replace /> :
          <ForgotPassword isDarkTheme={isDarkTheme} />
        } />
        <Route path="/reset-password" element={
          isLoggedIn ? <Navigate to="/profile" replace /> :
          <ResetPassword isDarkTheme={isDarkTheme} />
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/profile" element={
          <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
            <Profile 
              isDarkTheme={isDarkTheme}
              isLoggedIn={isLoggedIn}
              toggleDarkTheme={toggleTheme}
              onLogout={handleLogout}
            />
          </ProtectedNonAdminRoute>
        }/> 
        <Route path="/edit-profile" element={
          <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
            <EditProfile 
              isDarkTheme={isDarkTheme}
              isLoggedIn={isLoggedIn}
            />
          </ProtectedNonAdminRoute>
        }/>
        <Route path="/admin/professionals" element={
          <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
            <AdminPendingProfessionals 
              isDarkTheme={isDarkTheme}
            />
          </ProtectedAdminRoute>
        }/>
        <Route path="/admin/professionals/:id" element={
          <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
            <AdminProfessionalDetails 
              isDarkTheme={isDarkTheme}
            />
          </ProtectedAdminRoute>
        }/>
        <Route path="/admin/pending-professionals" element={
          <Navigate to="/admin/professionals" replace />
        }/>
      </Routes>
      <Footer isDarkTheme={isDarkTheme} isLoggedIn={isLoggedIn} />
    </>
  )
}

export default App
