import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Self-hosted fonts (latin subsets only) — bundled and content-hashed by
// Vite, preloaded by inject-font-preloads.mjs. No Google Fonts round-trip.
import '@fontsource/rubik/latin-400.css'
import '@fontsource/rubik/latin-500.css'
import '@fontsource/rubik/latin-600.css'
import '@fontsource/rubik/latin-700.css'
import '@fontsource/geologica/latin-400.css'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
