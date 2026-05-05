'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpClientForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')

    if (!name || !email || !password) {
      setError('Please enter your name, email, and password.')
      setIsSubmitting(false)
      return
    }

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    const result = await response.json().catch(() => ({ success: false, error: 'Unable to parse response.' }))

    if (!response.ok || !result.success) {
      setError(result.error ?? 'Unable to create account.')
      setIsSubmitting(false)
      return
    }

    router.push('/auth/login')
  }

  return (
    <>
      <form onSubmit={handleSignupSubmit}>
        <input name="name" placeholder="Full name" autoComplete="name" required />
        <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
        <input name="password" placeholder="Password" type="password" autoComplete="new-password" required />
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </>
  )
}
