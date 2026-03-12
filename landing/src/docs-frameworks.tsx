import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsShell from '../app/docs/_components/DocsShell'
import FrameworksPage from '../app/docs/frameworks/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsShell>
      <FrameworksPage />
    </DocsShell>
  </StrictMode>,
)
