'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginClientForm() {
  const router = useRouter()

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push('/')
  }

  return (
    <form onSubmit={handleLoginSubmit}>
      <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
      <input name="password" placeholder="Password" type="password" autoComplete="current-password" required />
      <button className="button button-primary" type="submit">
        Login
      </button>
    </form>
  )
}
