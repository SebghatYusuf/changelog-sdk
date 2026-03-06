import type { Metadata } from 'next'
import './globals.css'
import 'changelog-sdk/styles'

export const metadata: Metadata = {
  title: 'My App - Changelog',
  description: 'Powered by changelog-sdk',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
