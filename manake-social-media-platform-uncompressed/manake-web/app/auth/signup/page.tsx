import type { Metadata } from 'next'
import SignUpClientForm from './SignUpClientForm'

export const metadata: Metadata = {
  title: 'Sign Up | Manake Rehabilitation Center',
  description: 'Create a Manake recovery and support platform account.',
}

export default function SignUpPage() {
  return (
    <main className="auth-page-main">
      <section className="auth-page-card">
        <a className="section-back-link" href="/">
          Back to homepage
        </a>
        <p className="eyebrow">Create account</p>
        <h1>Sign Up</h1>
        <p>Account creation is ready to connect to Neon through the Prisma user model.</p>
        <SignUpClientForm />
        <div className="auth-page-links">
          <a href="/auth/login">Login</a>
        </div>
      </section>
    </main>
  )
}
