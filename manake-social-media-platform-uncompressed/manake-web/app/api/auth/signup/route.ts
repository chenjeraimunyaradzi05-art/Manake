import { randomUUID } from 'node:crypto'
import { hash } from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'
import { getDatabaseStatus } from '../../../../src/lib/neon'
import { ensureAuthDatabase } from '../../../../src/lib/auth-database'

export const dynamic = 'force-dynamic'

type AuthUser = {
  id: string
  email: string
  name: string
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

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!name || !email || !password) {
    return Response.json(
      {
        success: false,
        error: 'Name, email and password are required.',
      },
      { status: 400 },
    )
  }

  try {
    await ensureAuthDatabase()

    const existingUsers = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "User"
      WHERE "email" = ${email}
      LIMIT 1
    `
    const existingUser = existingUsers[0]

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: 'An account with that email already exists.',
        },
        { status: 409 },
      )
    }

    const passwordHash = await hash(password, 10)
    const id = randomUUID()

    const users = await prisma.$queryRaw<AuthUser[]>`
      INSERT INTO "User" ("id", "email", "passwordHash", "name", "updatedAt")
      VALUES (${id}, ${email}, ${passwordHash}, ${name}, CURRENT_TIMESTAMP)
      RETURNING "id", "email", "name"
    `
    const user = users[0]

    return Response.json({
      success: true,
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
            : 'Unable to create account. Please try again later.',
      },
      { status: 500 },
    )
  }
}
