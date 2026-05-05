'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginClientForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')

    if (!email || !password) {
      setError('Please enter both email and password.')
      setIsSubmitting(false)
      return
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const result = await response.json().catch(() => ({ success: false, error: 'Unable to parse response.' }))

    if (!response.ok || !result.success) {
      setError(result.error ?? 'Invalid email or password.')
      setIsSubmitting(false)
      return
    }

    router.push('/account')
  }

  return (
    <>
      <form onSubmit={handleLoginSubmit}>
        <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
        <input name="password" placeholder="Password" type="password" autoComplete="current-password" required />
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </>
  )
}
