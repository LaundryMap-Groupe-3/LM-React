import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './context/I18nContext'
import { PreferencesProvider } from './context/PreferencesContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <PreferencesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PreferencesProvider>
    </I18nProvider>
  </StrictMode>,
)
