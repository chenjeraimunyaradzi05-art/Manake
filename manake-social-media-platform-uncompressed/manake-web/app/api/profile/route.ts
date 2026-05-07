import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../src/lib/prisma'
import { ensureAuthDatabase } from '../../../src/lib/auth-database'
import { getCurrentUser } from '../../../src/lib/auth-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const visibilityOptions = new Set(['public', 'members', 'private'])
const messageOptions = new Set(['everyone', 'connections', 'none'])

function text(value: unknown, maxLength: number) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()

  return trimmed ? trimmed.slice(0, maxLength) : null
}

function list(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
}

function textArray(values: string[]) {
  if (values.length === 0) {
    return Prisma.sql`ARRAY[]::TEXT[]`
  }

  return Prisma.sql`ARRAY[${Prisma.join(values)}]::TEXT[]`
}

function years(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.max(0, Math.min(80, Math.round(parsed)))
}

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      {
        success: false,
        error: 'Please log in to view your profile.',
      },
      { status: 401 },
    )
  }

  return Response.json({
    success: true,
    user,
  })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      {
        success: false,
        error: 'Please log in to update your profile.',
      },
      { status: 401 },
    )
  }

  const body = await request.json().catch(() => null)

  if (!body) {
    return Response.json(
      {
        success: false,
        error: 'Profile details are required.',
      },
      { status: 400 },
    )
  }

  const visibility = typeof body.visibility === 'string' && visibilityOptions.has(body.visibility) ? body.visibility : 'members'
  const allowMessages = typeof body.allowMessages === 'string' && messageOptions.has(body.allowMessages) ? body.allowMessages : 'connections'
  const isMentor = Boolean(body.isMentor)
  const interests = list(body.interests)
  const skills = list(body.skills)
  const hobbies = list(body.hobbies)

  await ensureAuthDatabase()

  const updatedUsers = await prisma.$queryRaw<Array<typeof user>>`
    UPDATE "User"
    SET
      "name" = ${text(body.name, 120) ?? user.name},
      "phone" = ${text(body.phone, 40)},
      "headline" = ${text(body.headline, 140)},
      "bio" = ${text(body.bio, 900)},
      "location" = ${text(body.location, 120)},
      "interests" = ${textArray(interests)},
      "skills" = ${textArray(skills)},
      "hobbies" = ${textArray(hobbies)},
      "education" = ${text(body.education, 200)},
      "employmentStatus" = ${text(body.employmentStatus, 60)},
      "occupation" = ${text(body.occupation, 120)},
      "avatar" = ${text(body.avatar, 800)},
      "bannerImage" = ${text(body.bannerImage, 800)},
      "videoIntroUrl" = ${text(body.videoIntroUrl, 800)},
      "isMentor" = ${isMentor},
      "mentorshipStyle" = ${isMentor ? text(body.mentorshipStyle, 160) : null},
      "yearsInRecovery" = ${years(body.yearsInRecovery)},
      "visibility" = ${visibility},
      "allowMessages" = ${allowMessages},
      "allowMentorRequests" = ${Boolean(body.allowMentorRequests)},
      "emailNotifications" = ${Boolean(body.emailNotifications)},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${user.id}
    RETURNING
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
      "emailNotifications"
  `
  const updatedUser = updatedUsers[0]

  return NextResponse.json({
    success: true,
    user: {
      ...updatedUser,
      interests: Array.isArray(updatedUser.interests) ? updatedUser.interests.filter(Boolean) : [],
      skills: Array.isArray(updatedUser.skills) ? updatedUser.skills.filter(Boolean) : [],
      hobbies: Array.isArray(updatedUser.hobbies) ? updatedUser.hobbies.filter(Boolean) : [],
    },
  })
}
