import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../src/lib/auth-session'
import ProfileClientForm from './ProfileClientForm'

export const metadata: Metadata = {
  title: 'Build Profile | Manake Rehabilitation Center',
  description: 'Create and update your private Manake member profile.',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <main className="profile-page-main">
      <section className="profile-shell">
        <header className="profile-header">
          <a className="section-back-link" href="/dashboard">
            Back to dashboard
          </a>
          <p className="eyebrow">Member profile</p>
          <h1>Build your Manake profile.</h1>
          <p>
            Tell the community what support you need, what brought you here, and how private you want your account to be.
          </p>
        </header>

        <ProfileClientForm user={user} />
      </section>
    </main>
  )
}
