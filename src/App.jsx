import { Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

// Composant pour la page d'accueil
const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-[#3B82F6]">Bienvenue sur LaundryMap</h1>
    </div>
  )
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
