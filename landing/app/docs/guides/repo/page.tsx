'use client'

import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['repo-guide', 'setup', 'generate', 'automation', 'scopes'] as const

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
          <p className="docs-p">
            You can use the manual generator in the admin editor or enable automatic changelog creation when new commits land on a watched branch.
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

        <section id="automation" className="docs-section">
          <h2 className="docs-h2">Automatic Release Notes</h2>
          <p className="docs-p">
            The SDK can also create changelog entries automatically from repository push events on your configured target branch.
          </p>
          <ul className="docs-ul">
            <li>Set the repository branch in <code className="docs-code-inline">/changelog/admin/repo</code></li>
            <li>Use your app&apos;s public base URL plus <code className="docs-code-inline">/api/changelog/webhooks/repo</code> as the webhook URL, for example <code className="docs-code-inline">https://app.example.com/api/changelog/webhooks/repo</code></li>
            <li>Reuse your existing <code className="docs-code-inline">CHANGELOG_SESSION_SECRET</code> as the webhook secret in GitHub or Bitbucket so every delivery is HMAC-verified</li>
            <li>In GitHub, add a repository webhook for the <code className="docs-code-inline">push</code> event and paste that full URL as the Payload URL. In Bitbucket, add a webhook for <code className="docs-code-inline">repo:push</code> and paste the same full URL.</li>
            <li>Each new branch head is processed once, so duplicate webhook deliveries do not create duplicate changelog rows</li>
            <li>The SDK groups commit history into sections, bumps the latest semantic version by one patch, and saves the new changelog as <code className="docs-code-inline">draft</code> or <code className="docs-code-inline">published</code> based on <code className="docs-code-inline">autoPublish</code></li>
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
        <button className={`toc-link${activeSection === 'automation' ? ' active' : ''}`} onClick={() => scrollTo('automation')}>Automation</button>
        <button className={`toc-link${activeSection === 'scopes' ? ' active' : ''}`} onClick={() => scrollTo('scopes')}>Token Scopes</button>
      </nav>
    </>
  )
}
