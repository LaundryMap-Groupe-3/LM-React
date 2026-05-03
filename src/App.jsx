import './App.css'
import PublicLaundryDetails from './components/common/PublicLaundryDetails';
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { usePreferences } from './context/PreferencesContext'
import Register from './components/auth/Register'
import ProfessionalRegister from './components/auth/ProfessionalRegister'
import Login from './components/auth/Login'
import VerifyEmail from './components/auth/VerifyEmail'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Profile from './components/user/Profile'
import EditProfile from './components/user/EditProfile'
import AdminProfile from './components/admin/AdminProfile'
import AdminPendingProfessionals from './components/admin/AdminPendingProfessionals'
import AdminPendingLaundries from './components/admin/AdminPendingLaundries'
import AdminProfessionalDetails from './components/admin/AdminProfessionalDetails'
import AdminLaundryDetails from './components/admin/AdminLaundryDetails'
import AdminOffensiveWords from './components/admin/AdminOffensiveWords'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminUsers from './components/admin/AdminUsers'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Page404 from './components/common/Page404'
import Page500 from './components/common/Page500'
import ErrorBoundary from './components/common/ErrorBoundary'
import authService from './services/authService'
import ProfessionalDashboard from './components/professional/ProfessionalDashboard'
import ProfessionalLaundryForm from './components/professional/ProfessionalLaundryForm'
import ProfessionalLaundryDetails from './components/professional/ProfessionalLaundryDetails'
import LaundryExplorer from './components/common/LaundryExplorer'
import MyReviews from './components/common/MyReviews'

// Composant pour la page d'accueil
const Home = ({ isDarkTheme }) => {
  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#0F172A] text-slate-100' : ' text-slate-900'}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 lg:px-10 lg:py-8">
        <LaundryExplorer isDarkTheme={isDarkTheme} />
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

const LegacyPublicLaundryRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/laundries/${id}`} replace />;
}

function App() {
  const { isDarkTheme, toggleTheme, reloadUserPreferences } = usePreferences();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthenticatedHomeRoute = (type) => {
    if (type === 'admin') {
      return '/admin/dashboard';
    }
    if (type === 'professional') {
      return '/professional-dashboard';
    }
    return '/profile';
  };

  const authenticatedHomeRoute = getAuthenticatedHomeRoute(userType);

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

  const handleLoginSuccess = (loggedInUserType = null) => {
    if (loggedInUserType) {
      setUserType(loggedInUserType);
    }

    setIsLoggedIn(true);

    // Reload user preferences after successful login (non-await to avoid blocking)
    setTimeout(() => {
      reloadUserPreferences();

      // If user type is unknown, fetch it after login.
      if (!loggedInUserType) {
        authService.getCurrentUser().then(user => {
          if (user) {
            setUserType(user.type);
          }
        });
      }
    }, 0);
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.setItem('theme', 'light');
    setIsLoggedIn(false);
    setUserType(null);
    // Reset UI preferences after logout
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
      <ErrorBoundary isDarkTheme={isDarkTheme}>
        <Routes>
          <Route path="/" element={<Home isDarkTheme={isDarkTheme} />} />
          <Route path="/register" element={
            isLoggedIn ? <Navigate to={authenticatedHomeRoute} replace /> :
            <Register 
              isDarkTheme={isDarkTheme}
              isLoggedIn={isLoggedIn}
              onLoginSuccess={handleLoginSuccess}
            />
          } />
          <Route path="/register/professional" element={
            isLoggedIn ? <Navigate to={authenticatedHomeRoute} replace /> :
            <ProfessionalRegister 
              isDarkTheme={isDarkTheme}
              isLoggedIn={isLoggedIn}
            />
          } />
          <Route path="/login" element={
            isLoggedIn ? <Navigate to={authenticatedHomeRoute} replace /> :
            <Login 
              isDarkTheme={isDarkTheme}
              onLoginSuccess={handleLoginSuccess}
            />
          } />
          <Route path="/forgot-password" element={
            isLoggedIn ? <Navigate to={authenticatedHomeRoute} replace /> :
            <ForgotPassword isDarkTheme={isDarkTheme} />
          } />
          <Route path="/reset-password" element={
            isLoggedIn ? <Navigate to={authenticatedHomeRoute} replace /> :
            <ResetPassword isDarkTheme={isDarkTheme} />
          } />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <Profile 
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
                userType={userType}
                toggleDarkTheme={toggleTheme}
                onLogout={handleLogout}
              />
            </ProtectedNonAdminRoute>
          }/> 
          <Route path="/admin/profile" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <AdminProfile 
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
                userType={userType}
                toggleDarkTheme={toggleTheme}
                onLogout={handleLogout}
              />
            </ProtectedAdminRoute>
          }/>
          <Route path="/edit-profile" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <EditProfile 
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
                userType={userType}
              />
            </ProtectedNonAdminRoute>
          }/>
          <Route path="/admin/edit-profile" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <EditProfile 
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
                userType={userType}
              />
            </ProtectedAdminRoute>
          }/>
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <AdminDashboard 
                isDarkTheme={isDarkTheme}
              />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <AdminUsers 
                isDarkTheme={isDarkTheme}
              />
            </ProtectedAdminRoute>
          } />
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
          <Route path="/admin/pending-laundries" element={
            <Navigate to="/admin/laundries" replace />
          }/>
          <Route path="/professional/dashboard" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <ProfessionalDashboard isDarkTheme={isDarkTheme} />
            </ProtectedNonAdminRoute>
          } />
          <Route path="/professional-dashboard" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <ProfessionalDashboard 
                isDarkTheme={isDarkTheme}
                isLoggedIn={isLoggedIn}
              />
            </ProtectedNonAdminRoute>
          }/>
          <Route path="/create-laundry" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <ProfessionalLaundryForm isDarkTheme={isDarkTheme} />
            </ProtectedNonAdminRoute>
          }/>
          <Route path="/my-reviews" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <MyReviews isDarkTheme={isDarkTheme} />
            </ProtectedNonAdminRoute>
          }/>
          <Route path="/edit-laundry/:id" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <ProfessionalLaundryForm isDarkTheme={isDarkTheme} />
            </ProtectedNonAdminRoute>
          }/>
          <Route path="/laundry-details/:id" element={
            <ProtectedNonAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <ProfessionalLaundryDetails isDarkTheme={isDarkTheme} />
            </ProtectedNonAdminRoute>
          }/>
          <Route path="/laundry/:id" element={<LegacyPublicLaundryRedirect />} />
          <Route path="/laundries/:id" element={<PublicLaundryDetails isDarkTheme={isDarkTheme} />} />
          <Route path="/admin/laundries" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <AdminPendingLaundries 
                isDarkTheme={isDarkTheme}
              />
            </ProtectedAdminRoute>
          }/>
          <Route path="/admin/laundries/:id" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <AdminLaundryDetails
                isDarkTheme={isDarkTheme}
              />
            </ProtectedAdminRoute>
          }/>
          <Route path="/admin/offensive-words" element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn} userType={userType}>
              <AdminOffensiveWords
                isDarkTheme={isDarkTheme}
              />
            </ProtectedAdminRoute>
          }/>
          <Route path="/admin/pending-laundries" element={
            <Navigate to="/admin/laundries" replace />
          }/>
          <Route path="*" element={<Page404 isDarkTheme={isDarkTheme} />} />
        </Routes>
      </ErrorBoundary>
      <Footer isDarkTheme={isDarkTheme} isLoggedIn={isLoggedIn} />
    </>
  )
}

export default App
