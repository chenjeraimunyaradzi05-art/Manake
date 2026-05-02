import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password | Manake Rehabilitation Center',
  description: 'Request a Manake account password reset.',
}

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page-main">
      <section className="auth-page-card">
        <a className="section-back-link" href="/auth/login">
          Back to login
        </a>
        <p className="eyebrow">Reset access</p>
        <h1>Forgot Password</h1>
        <p>Password reset is ready for email delivery once backend credentials are configured.</p>
        <form>
          <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
          <button className="button button-primary" type="submit">
            Send reset link
          </button>
        </form>
      </section>
    </main>
  )
}
