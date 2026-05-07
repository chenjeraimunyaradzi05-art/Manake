import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import SignUpClientForm from './SignUpClientForm'
import { getSessionFromCookies } from '../../../src/lib/auth-session'

export const metadata: Metadata = {
  title: 'Sign Up | Manake Rehabilitation Center',
  description: 'Create a Manake recovery and support platform account.',
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function SignUpPage() {
  if (getSessionFromCookies()) {
    redirect('/dashboard')
  }

  return (
    <main className="auth-page-main">
      <section className="auth-page-card">
        <a className="section-back-link" href="/">
          Back to homepage
        </a>
        <p className="eyebrow">Create account</p>
        <h1>Sign Up</h1>
        <p>Create a private account for recovery support, mentorship, and community connection.</p>
        <SignUpClientForm />
        <div className="auth-page-links">
          <a href="/auth/login">Login</a>
        </div>
      </section>
    </main>
  )
}
