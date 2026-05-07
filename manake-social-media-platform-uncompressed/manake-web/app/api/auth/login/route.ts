import { compare } from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'
import { getDatabaseStatus } from '../../../../src/lib/neon'
import { ensureAuthDatabase } from '../../../../src/lib/auth-database'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type AuthUser = {
  id: string
  email: string
  name: string
  passwordHash: string
}

export async function POST(request: Request) {
  const status = getDatabaseStatus()

  if (!status.configured) {
    return Response.json(
      {
        success: false,
        error: status.message,
      },
      { status: 500 },
    )
  }

  const body = await request.json().catch(() => null)

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password) {
    return Response.json(
      {
        success: false,
        error: 'Email and password are required.',
      },
      { status: 400 },
    )
  }

  try {
    await ensureAuthDatabase()

    const users = await prisma.$queryRaw<AuthUser[]>`
      SELECT "id", "email", "name", "passwordHash"
      FROM "User"
      WHERE "email" = ${email}
      LIMIT 1
    `
    const user = users[0]

    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'Invalid email or password.',
        },
        { status: 401 },
      )
    }

    const isValidPassword = await compare(password, user.passwordHash)

    if (!isValidPassword) {
      return Response.json(
        {
          success: false,
          error: 'Invalid email or password.',
        },
        { status: 401 },
      )
    }

    return Response.json({
      success: true,
      redirectTo: '/dashboard',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to log in. Please try again later.',
      },
      { status: 500 },
    )
  }
}
