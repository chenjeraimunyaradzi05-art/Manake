import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Manake Rehabilitation Center',
  description: 'Member dashboard for Manake recovery support, mentorship, and community connection.',
}

const dashboardCards = [
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

export default function DashboardPage() {
  return (
    <main className="dashboard-page-main">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <a className="section-back-link" href="/">
            Back to homepage
          </a>
          <p className="eyebrow">Member dashboard</p>
          <h1>Welcome to your Manake support space.</h1>
          <p>
            Choose the next step for recovery support, mentorship, community connection, and practical help.
          </p>
        </header>

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
