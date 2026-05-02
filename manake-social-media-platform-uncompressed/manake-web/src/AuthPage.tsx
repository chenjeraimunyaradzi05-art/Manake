'use client'

import { type FormEvent, useState } from 'react'

type AuthMode = 'login' | 'signup'

type AuthResponse = {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  session: {
    token: string
    expiresAt: string
  }
}

async function submitAuth(mode: AuthMode, body: Record<string, string>) {
  const response = await fetch(`/api/auth/${mode}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as Partial<AuthResponse> & { error?: string }

  if (!response.ok || !data.user || !data.session) {
    throw new Error(data.error || 'Account request could not be completed right now.')
  }

  return data as AuthResponse
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignup = mode === 'signup'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setIsSubmitting(true)
    setNotice('')

    try {
      const data = await submitAuth(mode, {
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
      })
      window.localStorage.setItem('manakeSession', JSON.stringify(data))
      setNotice(isSignup ? `Account created for ${data.user.name}.` : `Welcome back, ${data.user.name}.`)
      form.reset()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Account request could not be completed right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <a className="quiet-link" href="/">
          Back to homepage
        </a>

        <div className="auth-panel-heading">
          <p className="eyebrow">Manake account</p>
          <h1 id="auth-title">{isSignup ? 'Create account' : 'Log in'}</h1>
          <p>
            {isSignup
              ? 'Create your private Manake account to save recovery updates and community activity.'
              : 'Log in with the email and password used when the account was created.'}
          </p>
        </div>

        <div className="auth-tabs">
          <a className={mode === 'login' ? 'active' : ''} href="/auth/login">
            Login
          </a>
          <a className={mode === 'signup' ? 'active' : ''} href="/auth/signup">
            Sign Up
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup ? <input name="name" placeholder="Full name" autoComplete="name" required /> : null}
          <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
          <input
            name="password"
            placeholder="Password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        {notice ? <p className="notice">{notice}</p> : null}
      </section>
    </main>
  )
}
