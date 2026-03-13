'use client'

import { useState } from 'react'

const PM_TABS = ['bun', 'npm', 'yarn', 'pnpm'] as const
const PM_CMDS: Record<typeof PM_TABS[number], string> = {
  bun: 'bun add changelog-sdk',
  npm: 'npm install changelog-sdk',
  yarn: 'yarn add changelog-sdk',
  pnpm: 'pnpm add changelog-sdk',
}

export function InstallBlock() {
  const [active, setActive] = useState<typeof PM_TABS[number]>('bun')
  return (
    <div className="code-window" style={{ margin: '1.25rem 0' }}>
      <div className="code-window-header" style={{ padding: 0 }}>
        <div className="tabs" style={{ width: '100%', borderBottom: 'none' }}>
          {PM_TABS.map(tab => (
            <button key={tab} className={`tab${active === tab ? ' active' : ''}`} onClick={() => setActive(tab)}>{tab}</button>
          ))}
        </div>
      </div>
      <div className="code-body">
        <pre style={{ margin: 0, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-dim)', marginRight: '0.75rem' }}>$</span>
          {PM_CMDS[active]}
        </pre>
      </div>
    </div>
  )
}
