import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsShell from '../app/docs/_components/DocsShell'
import RepoGuidePage from '../app/docs/guides/repo/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsShell>
      <RepoGuidePage />
    </DocsShell>
  </StrictMode>,
)
