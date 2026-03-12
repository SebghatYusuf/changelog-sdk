import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Changelog SDK Example',
  description: 'Next.js integration example for changelog-sdk',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
