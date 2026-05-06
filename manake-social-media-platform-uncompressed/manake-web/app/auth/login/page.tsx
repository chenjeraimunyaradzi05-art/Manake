import type { Metadata } from 'next'
import LoginClientForm from './LoginClientForm'

export const metadata: Metadata = {
  title: 'Login | Manake Rehabilitation Center',
  description: 'Login to the Manake recovery and support platform.',
}

export default function LoginPage() {
  return (
    <main className="auth-page-main">
      <section className="auth-page-card">
        <a className="section-back-link" href="/">
          Back to homepage
        </a>
        <p className="eyebrow">Member access</p>
        <h1>Login</h1>
        <p>Access your private Manake account for recovery support, mentorship, and community connection.</p>
        <LoginClientForm />
        <div className="auth-page-links">
          <a href="/auth/signup">Create account</a>
          <a href="/auth/forgot-password">Forgot password?</a>
        </div>
      </section>
    </main>
  )
}
