import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manake - Recovery Platform',
  description: 'Manake Recovery Platform - Supporting your journey to recovery through community, mentorship, and resources.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
