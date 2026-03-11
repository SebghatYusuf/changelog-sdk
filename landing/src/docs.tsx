import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsPage from '../app/docs/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsPage />
  </StrictMode>,
)
