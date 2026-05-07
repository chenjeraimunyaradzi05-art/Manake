import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, type MemberProfile } from '../../src/lib/auth-session'

export const metadata: Metadata = {
  title: 'Dashboard | Manake Rehabilitation Center',
  description: 'Member dashboard for Manake recovery support, mentorship, and community connection.',
}

export const dynamic = 'force-dynamic'

const dashboardCards = [
  {
    title: 'Build profile',
    copy: 'Add why you joined, what support you need, and how members can connect with you.',
    href: '/profile',
  },
  {
    title: 'Recovery check-in',
    copy: 'Track how you are doing today and keep your support journey moving one step at a time.',
    href: '/get-help',
  },
  {
    title: 'Mentor support',
    copy: 'Connect with trusted guidance, encouragement, and lived-experience support.',
    href: '/programs',
  },
  {
    title: 'Community spaces',
    copy: 'Find family circles, peer encouragement, and recovery-friendly group support.',
    href: '/social',
  },
]

function profileCompletion(user: MemberProfile) {
  const checks = [
    Boolean(user.headline),
    Boolean(user.bio),
    Boolean(user.location),
    user.interests.length > 0,
    user.skills.length > 0 || user.isMentor,
  ]
  const completed = checks.filter(Boolean).length

  return Math.round((completed / checks.length) * 100)
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const completion = profileCompletion(user)

  return (
    <main className="dashboard-page-main">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <nav className="dashboard-nav" aria-label="Member navigation">
            <a className="section-back-link" href="/">
              Back to homepage
            </a>
            <form action="/api/auth/logout" method="post">
              <button className="button button-secondary" type="submit">
                Logout
              </button>
            </form>
          </nav>
          <p className="eyebrow">Member dashboard</p>
          <h1>Welcome, {user.name.split(' ')[0] || user.name}.</h1>
          <p>
            Choose the next step for recovery support, mentorship, community connection, and practical help.
          </p>
        </header>

        <section className="dashboard-profile-strip">
          <div>
            <p className="eyebrow">Profile setup</p>
            <h2>{completion === 100 ? 'Your profile is ready.' : `${completion}% complete`}</h2>
            <p>
              {user.bio
                ? `Why you joined: ${user.bio}`
                : 'Add why you are signing up so Manake can shape support around your needs.'}
            </p>
          </div>
          <a className="button button-primary" href="/profile">
            {completion === 100 ? 'Update profile' : 'Build profile'}
          </a>
        </section>

        <div className="dashboard-action-grid">
          {dashboardCards.map((card) => (
            <a href={card.href} key={card.title}>
              <strong>{card.title}</strong>
              <span>{card.copy}</span>
            </a>
          ))}
        </div>

        <section className="dashboard-next-step">
          <div>
            <p className="eyebrow">Need immediate support?</p>
            <h2>Reach Manake directly when you need help now.</h2>
            <p>
              If this is urgent, contact the centre or use the crisis support page for immediate next steps.
            </p>
          </div>
          <div className="dashboard-actions">
            <a className="button button-primary" href="/crisis-support">
              Crisis support
            </a>
            <a className="button button-secondary" href="/contact">
              Contact Manake
            </a>
          </div>
        </section>
      </section>
    </main>
  )
}
