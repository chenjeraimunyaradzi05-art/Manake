import { hash } from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'
import { getDatabaseStatus } from '../../../../src/lib/neon'

export const dynamic = 'force-dynamic'

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
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    })

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
