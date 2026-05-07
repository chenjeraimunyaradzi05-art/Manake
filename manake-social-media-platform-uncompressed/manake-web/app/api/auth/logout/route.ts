import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '../../../../src/lib/auth-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url), 303)

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
