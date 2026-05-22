import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CCCL — Peer Exchange Tracker',
  description: 'Research and outreach tracker for peer exchange community building',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
