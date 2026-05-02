import type { Metadata } from 'next'

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
        <p>Access is ready for Neon-backed accounts once credentials are configured.</p>
        <form>
          <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
          <input name="password" placeholder="Password" type="password" autoComplete="current-password" required />
          <button className="button button-primary" type="submit">
            Login
          </button>
        </form>
        <div className="auth-page-links">
          <a href="/auth/signup">Create account</a>
          <a href="/auth/forgot-password">Forgot password?</a>
        </div>
      </section>
    </main>
  )
}
