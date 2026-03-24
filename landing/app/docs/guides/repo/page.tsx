'use client'

import { useActiveSection } from '../../_components/useActiveSection'

const SECTION_IDS = ['repo-guide', 'setup', 'generate', 'automation', 'github', 'bitbucket', 'scopes'] as const

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
          <div className="docs-step-grid">
            <article className="docs-step-card">
              <div className="docs-step-number">1</div>
              <h3 className="docs-step-title">Choose the release branch</h3>
              <p className="docs-step-body">
                Decide which branch should generate release notes, usually <code className="docs-code-inline">main</code>, <code className="docs-code-inline">master</code>, or <code className="docs-code-inline">production</code>.
              </p>
            </article>
            <article className="docs-step-card">
              <div className="docs-step-number">2</div>
              <h3 className="docs-step-title">Save it in the admin UI</h3>
              <p className="docs-step-body">
                Open <code className="docs-code-inline">/changelog/admin/repo</code>, connect the repository, and save that branch in the repository settings.
              </p>
            </article>
            <article className="docs-step-card">
              <div className="docs-step-number">3</div>
              <h3 className="docs-step-title">Work out the webhook URL</h3>
              <p className="docs-step-body">
                Your webhook URL is your public app domain plus <code className="docs-code-inline">/api/changelog/webhooks/repo</code>.
              </p>
              <div className="docs-step-example">
                Example: <code className="docs-code-inline">https://app.example.com/api/changelog/webhooks/repo</code>
              </div>
            </article>
            <article className="docs-step-card">
              <div className="docs-step-number">4</div>
              <h3 className="docs-step-title">Reuse the existing secret</h3>
              <p className="docs-step-body">
                Use the same value as <code className="docs-code-inline">CHANGELOG_SESSION_SECRET</code> when GitHub or Bitbucket asks for the webhook secret.
              </p>
            </article>
          </div>

          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div>
              After the webhook is live, the SDK verifies the signature, checks the repository and branch, generates release notes from the pushed commits, bumps the latest patch version, and ignores duplicate deliveries for the same branch head.
            </div>
          </div>
        </section>

        <section id="github" className="docs-section">
          <h2 className="docs-h2">GitHub Step By Step</h2>
          <div className="docs-vendor-card">
            <div className="docs-vendor-path">
              GitHub path: <strong>Repository</strong> {' -> '} <strong>Settings</strong> {' -> '} <strong>Webhooks</strong> {' -> '} <strong>Add webhook</strong>
            </div>
            <div className="docs-step-list">
              {[
                'Open the repository on GitHub.',
                'Go to Settings.',
                'Open Webhooks in the left sidebar.',
                'Select Add webhook.',
                'Set Payload URL to your full webhook URL.',
                'Set Content type to application/json.',
                'Set Secret to the same value as CHANGELOG_SESSION_SECRET.',
                'Choose Let me select individual events and enable only Pushes.',
                'Save the webhook and keep it active.',
                'Merge or push a change into the watched branch.',
              ].map((step, index) => (
                <div className="docs-step-row" key={step}>
                  <div className="docs-step-badge">{index + 1}</div>
                  <div className="docs-step-copy">{step}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div>
              Quick test: after saving the webhook, merge a PR into the watched branch and then open the webhook&apos;s recent deliveries page on GitHub to confirm you got a successful <code className="docs-code-inline">push</code> delivery.
            </div>
          </div>
        </section>

        <section id="bitbucket" className="docs-section">
          <h2 className="docs-h2">Bitbucket Step By Step</h2>
          <div className="docs-vendor-card">
            <div className="docs-vendor-path">
              Bitbucket Cloud path: <strong>Repository settings</strong> {' -> '} <strong>Webhooks</strong> {' -> '} <strong>Add webhook</strong>
            </div>
            <div className="docs-step-list">
              {[
                'Open the repository in Bitbucket Cloud.',
                'Go to Repository settings.',
                'Open Webhooks.',
                'Select Add webhook.',
                'Enter a title such as Changelog SDK.',
                'Set URL to your full webhook URL.',
                'Set Secret to the same value as CHANGELOG_SESSION_SECRET.',
                'Enable the Repository push trigger.',
                'Save the webhook.',
                'Merge or push a change into the watched branch.',
              ].map((step, index) => (
                <div className="docs-step-row" key={step}>
                  <div className="docs-step-badge">{index + 1}</div>
                  <div className="docs-step-copy">{step}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="docs-callout">
            <div className="docs-callout-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <div>
              Quick test: merge a change into the watched branch, then inspect the webhook delivery log in Bitbucket Cloud and confirm the delivery corresponds to the <code className="docs-code-inline">repo:push</code> event.
            </div>
          </div>
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
        <button className={`toc-link${activeSection === 'github' ? ' active' : ''}`} onClick={() => scrollTo('github')}>GitHub</button>
        <button className={`toc-link${activeSection === 'bitbucket' ? ' active' : ''}`} onClick={() => scrollTo('bitbucket')}>Bitbucket</button>
        <button className={`toc-link${activeSection === 'scopes' ? ' active' : ''}`} onClick={() => scrollTo('scopes')}>Token Scopes</button>
      </nav>
    </>
  )
}
