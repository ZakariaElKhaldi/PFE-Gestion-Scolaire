import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/rtl.css'
import './i18n'
import App from './App.tsx'
import { ThemeProvider } from './lib/theme-context'
import { LanguageProvider } from './lib/language-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
