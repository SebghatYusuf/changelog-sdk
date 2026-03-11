import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Home from '../app/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
