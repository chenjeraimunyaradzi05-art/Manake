import { getCurrentUser } from '../../../../src/lib/auth-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json(
      {
        success: false,
        error: 'Please log in to continue.',
      },
      { status: 401 },
    )
  }

  return Response.json({
    success: true,
    user,
  })
}
