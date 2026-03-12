import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsShell from '../app/docs/_components/DocsShell'
import TypesPage from '../app/docs/api/types/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsShell>
      <TypesPage />
    </DocsShell>
  </StrictMode>,
)
