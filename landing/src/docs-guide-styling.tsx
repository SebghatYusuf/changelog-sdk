import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DocsShell from '../app/docs/_components/DocsShell'
import StylingGuidePage from '../app/docs/guides/styling/page'
import '../app/landing.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DocsShell>
      <StylingGuidePage />
    </DocsShell>
  </StrictMode>,
)
