'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type DatabaseConnectionNotice = {
  connected: boolean
  message: string
}

export default function LoginClientForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [databaseNotice, setDatabaseNotice] = useState<DatabaseConnectionNotice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkDatabaseStatus() {
      try {
        const response = await fetch('/api/db/status', { cache: 'no-store' })
        const result = await response.json().catch(() => null)

        if (!isMounted || !result) return

        setDatabaseNotice({
          connected: Boolean(result.connected),
          message: result.connected
            ? `Database connected via ${result.provider ?? 'Postgres'}.`
            : result.error ?? result.message ?? 'Database is not connected for this deployment.',
        })
      } catch {
        if (isMounted) {
          setDatabaseNotice({
            connected: false,
            message: 'Unable to reach the database status endpoint.',
          })
        }
      }
    }

    checkDatabaseStatus()

    return () => {
      isMounted = false
    }
  }, [])

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
    }).catch(() => null)

    if (!response) {
      setError('Unable to reach the login service. Please check the deployment connection and try again.')
      setIsSubmitting(false)
      return
    }

    const result = await response.json().catch(() => ({ success: false, error: 'Unable to parse response.' }))

    if (!response.ok || !result.success) {
      setError(result.error ?? 'Invalid email or password.')
      setIsSubmitting(false)
      return
    }

    router.push('/community')
  }

  return (
    <>
      {databaseNotice ? (
        <p className={databaseNotice.connected ? 'db-status connected' : 'db-status disconnected'} role="status">
          {databaseNotice.message}
        </p>
      ) : null}
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
