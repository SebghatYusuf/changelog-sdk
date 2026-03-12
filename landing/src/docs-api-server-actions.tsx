import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsShell from '../app/docs/_components/DocsShell'
import ServerActionsPage from '../app/docs/api/server-actions/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsShell>
      <ServerActionsPage />
    </DocsShell>
  </StrictMode>,
)
