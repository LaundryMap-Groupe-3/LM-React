import { Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import Profile from './components/Profile'
import Header from './components/Header'
import Footer from './components/Footer'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import './App.css'

// Composant pour la page d'accueil
const Home = () => {
  const { isDarkTheme, isLoggedIn } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkTheme || isLoggedIn ? 'bg-[#1E293B]' : 'bg-white'}`}>
      <h1 className="text-3xl font-bold text-[#3B82F6]">Bienvenue sur LaundryMap</h1>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
