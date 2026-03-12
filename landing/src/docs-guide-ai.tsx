import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsShell from '../app/docs/_components/DocsShell'
import AIGuidePage from '../app/docs/guides/ai/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsShell>
      <AIGuidePage />
    </DocsShell>
  </StrictMode>,
)
