import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../src/index.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://manake.netlify.app'),
  title: 'Manake Rehabilitation Center | Youth Drug & Alcohol Recovery in Zimbabwe',
  description:
    'Manake Rehabilitation Center supports young people and families in Zimbabwe with substance use recovery, counselling, life skills, and community reintegration.',
  keywords: [
    'Manake',
    'rehabilitation center',
    'Zimbabwe',
    'youth recovery',
    'drug addiction support',
    'alcohol recovery',
    'counselling',
    'Norton',
  ],
  icons: {
    icon: '/logos/logo-alt-1.png',
  },
  openGraph: {
    title: 'Manake Rehabilitation Center',
    description: 'Confidential youth drug and alcohol recovery support in Zimbabwe.',
    type: 'website',
    images: ['/images/manake/center-exterior.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
