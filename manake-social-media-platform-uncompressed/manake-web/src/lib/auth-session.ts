import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { getDatabaseUrl } from './neon'
import { ensureAuthDatabase } from './auth-database'

export const SESSION_COOKIE_NAME = 'manake_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const sessionIssuer = 'manake-web'
const sessionAudience = 'manake-member'

export type SessionUser = {
  id: string
  email: string
  name: string
}

export type MemberProfile = SessionUser & {
  phone: string | null
  headline: string | null
  bio: string | null
  location: string | null
  interests: string[]
  skills: string[]
  hobbies: string[]
  education: string | null
  employmentStatus: string | null
  occupation: string | null
  avatar: string | null
  bannerImage: string | null
  videoIntroUrl: string | null
  isMentor: boolean
  mentorshipStyle: string | null
  yearsInRecovery: number | null
  visibility: string
  allowMessages: string
  allowMentorRequests: boolean
  emailNotifications: boolean
}

type SessionJwtPayload = jwt.JwtPayload & {
  email?: string
  name?: string
}

function getSessionSecret() {
  return (
    process.env.MANAKE_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    getDatabaseUrl() ||
    'manake-local-session-secret'
  )
}

export function createSessionToken(user: SessionUser) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
    },
    getSessionSecret(),
    {
      subject: user.id,
      expiresIn: SESSION_MAX_AGE_SECONDS,
      issuer: sessionIssuer,
      audience: sessionAudience,
    },
  )
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null
  }

  try {
    const payload = jwt.verify(token, getSessionSecret(), {
      issuer: sessionIssuer,
      audience: sessionAudience,
    }) as SessionJwtPayload

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || typeof payload.name !== 'string') {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    }
  } catch {
    return null
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

export function getSessionFromCookies() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value

  return verifySessionToken(token)
}

function normalizeList(value: string[] | null) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export async function getCurrentUser(): Promise<MemberProfile | null> {
  const session = getSessionFromCookies()

  if (!session) {
    return null
  }

  await ensureAuthDatabase()

  const users = await prisma.$queryRaw<Array<MemberProfile & { isActive: boolean }>>`
    SELECT
      "id",
      "email",
      "name",
      "phone",
      "headline",
      "bio",
      "location",
      "interests",
      "skills",
      "hobbies",
      "education",
      "employmentStatus",
      "occupation",
      "avatar",
      "bannerImage",
      "videoIntroUrl",
      "isMentor",
      "mentorshipStyle",
      "yearsInRecovery",
      "visibility",
      "allowMessages",
      "allowMentorRequests",
      "emailNotifications",
      "isActive"
    FROM "User"
    WHERE "id" = ${session.id}
    LIMIT 1
  `
  const user = users[0]

  if (!user || !user.isActive) {
    return null
  }

  return {
    ...user,
    interests: normalizeList(user.interests),
    skills: normalizeList(user.skills),
    hobbies: normalizeList(user.hobbies),
  }
}
