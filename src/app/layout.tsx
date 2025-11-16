import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Offerte Vergelijking',
  description: 'Aannemersoffertes structureren en eerlijk vergelijken',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
