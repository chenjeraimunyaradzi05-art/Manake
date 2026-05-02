'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpClientForm() {
  const router = useRouter()

  function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push('/')
  }

  return (
    <form onSubmit={handleSignupSubmit}>
      <input name="name" placeholder="Full name" autoComplete="name" required />
      <input name="email" placeholder="Email address" type="email" autoComplete="email" required />
      <input name="password" placeholder="Password" type="password" autoComplete="new-password" required />
      <button className="button button-primary" type="submit">
        Sign Up
      </button>
    </form>
  )
}
