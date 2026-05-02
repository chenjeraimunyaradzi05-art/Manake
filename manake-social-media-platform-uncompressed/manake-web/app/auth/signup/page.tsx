'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Manake Rehabilitation Center',
  description: 'Create a Manake recovery and support platform account.',
}

export default function SignUpPage() {
  const router = useRouter()

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push('/')
  }

  return (
    <main className="auth-page-main">
      <section className="auth-page-card">
        <a className="section-back-link" href="/">
          Back to homepage
        </a>
        <p className="eyebrow">Create account</p>
        <h1>Sign Up</h1>
        <p>Account creation is ready to connect to Neon through the Prisma user model.</p>
        <form onSubmit={handleSignupSubmit}>
          <input name="name" placeholder="Full name" autoComplete="name" required />
          <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
          <input name="password" placeholder="Password" type="password" autoComplete="new-password" required />
          <button className="button button-primary" type="submit">
            Sign Up
          </button>
        </form>
        <div className="auth-page-links">
          <a href="/auth/login">Login</a>
        </div>
      </section>
    </main>
  )
}
