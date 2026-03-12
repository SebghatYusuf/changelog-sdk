'use client'

import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['repo-guide', 'setup', 'generate', 'scopes'] as const

export default function RepoGuidePage() {
  const activeSection = useActiveSection(SECTION_IDS)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="docs-main">
        <section id="repo-guide" className="docs-section">
          <div className="docs-eyebrow">Guide</div>
          <h1 className="docs-h1">Repository Integration</h1>
          <p className="docs-p">
            Connect GitHub or Bitbucket repositories and generate clean release notes from commit history. Tokens are stored encrypted in MongoDB using <code className="docs-code-inline">CHANGELOG_ENCRYPTION_KEY</code>.
          </p>
        </section>

        <section id="setup" className="docs-section">
          <h2 className="docs-h2">Setup</h2>
          <ul className="docs-ul">
            <li>Open <code className="docs-code-inline">/changelog/admin/repo</code> and add your repository details</li>
            <li>Paste an access token with read access to commits</li>
            <li>Save to enable the commit generator in the editor</li>
          </ul>
        </section>

        <section id="generate" className="docs-section">
          <h2 className="docs-h2">Generate from Commits</h2>
          <ul className="docs-ul">
            <li>Open the commit generator modal in the admin editor</li>
            <li>Select a date range to keep the draft concise</li>
            <li>Optionally enable AI polish for standardized formatting</li>
          </ul>
        </section>

        <section id="scopes" className="docs-section">
          <h2 className="docs-h2">Token Scopes</h2>
          <ul className="docs-ul">
            <li>GitHub: fine-grained PAT or GitHub App token with Contents: read permission</li>
            <li>Bitbucket Cloud: API token with read:repository:bitbucket scope (app passwords are deprecated)</li>
          </ul>
          <p className="docs-p" style={{ marginTop: '0.75rem' }}>
            Reference docs: <a className="docs-link" href="https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28" target="_blank" rel="noopener noreferrer">GitHub commits API</a>,{' '}
            <a className="docs-link" href="https://developer.atlassian.com/cloud/bitbucket/rest/api-group-commits/" target="_blank" rel="noopener noreferrer">Bitbucket commits API</a>,{' '}
            <a className="docs-link" href="https://support.atlassian.com/bitbucket-cloud/docs/integrate-an-external-application-with-bitbucket-cloud/" target="_blank" rel="noopener noreferrer">Bitbucket API token scopes</a>,{' '}
            <a className="docs-link" href="https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/" target="_blank" rel="noopener noreferrer">App password deprecation</a>.
          </p>
        </section>
      </main>

      <nav className="docs-toc">
        <div className="toc-label">On this page</div>
        <button className={`toc-link${activeSection === 'repo-guide' ? ' active' : ''}`} onClick={() => scrollTo('repo-guide')}>Overview</button>
        <button className={`toc-link${activeSection === 'setup' ? ' active' : ''}`} onClick={() => scrollTo('setup')}>Setup</button>
        <button className={`toc-link${activeSection === 'generate' ? ' active' : ''}`} onClick={() => scrollTo('generate')}>Generate from Commits</button>
        <button className={`toc-link${activeSection === 'scopes' ? ' active' : ''}`} onClick={() => scrollTo('scopes')}>Token Scopes</button>
      </nav>
    </>
  )
}
