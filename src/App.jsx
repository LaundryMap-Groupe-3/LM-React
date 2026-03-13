import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Register from './components/auth/Register'
import Profile from './components/user/Profile'
import EditProfile from './components/user/EditProfile'
import PendingProfessionalAccountsAdmin from './components/admin/PendingProfessionalAccountsAdmin'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import './App.css'

// Composant pour la page d'accueil
const Home = ({ isDarkTheme, isLoggedIn }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkTheme || isLoggedIn ? 'bg-[#1E293B]' : 'bg-white'}`}>
      <h1 className="text-3xl font-bold text-[#3B82F6]">Bienvenue sur LaundryMap</h1>
    </div>
  )
}

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleDarkTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <>
      <Header 
        isDarkTheme={isDarkTheme}
        isLoggedIn={isLoggedIn}
        toggleDarkTheme={toggleDarkTheme}
        toggleLogin={toggleLogin}
      />
      <Routes>
        <Route path="/" element={
          <Home 
            isDarkTheme={isDarkTheme} 
            isLoggedIn={isLoggedIn} 
          />
        } />
        <Route path="/register" element={
          <Register 
            isDarkTheme={isDarkTheme}
            isLoggedIn={isLoggedIn}
          />
        } />
        <Route path="/profile" element={
          <Profile 
            isDarkTheme={isDarkTheme}
            isLoggedIn={isLoggedIn}
            toggleDarkTheme={toggleDarkTheme}
          />
        }/> 
        <Route path="/edit-profile" element={
          <EditProfile 
            isDarkTheme={isDarkTheme}
            isLoggedIn={isLoggedIn}
          />
        }/>
        <Route path="/admin" element={<Navigate to="/admin/pending-professional-accounts" replace />} />
        <Route path="/admin/pending-professional-accounts" element={
          <PendingProfessionalAccountsAdmin 
            isLoggedIn={isLoggedIn}
          />
        }/>
      </Routes>
      <Footer isDarkTheme={isDarkTheme} isLoggedIn={isLoggedIn} />
    </>
  )
}

export default App
