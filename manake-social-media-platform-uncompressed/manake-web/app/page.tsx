import App from '../src/App'
import { getSessionFromCookies } from '../src/lib/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default function Home() {
  const session = getSessionFromCookies()

  return (
    <App
      initialMember={
        session
          ? {
              name: session.name,
              email: session.email,
            }
          : null
      }
    />
  )
}
