
import { getServerSession } from "next-auth"
import { getAuthOptions } from './auth'
const authOptions = getAuthOptions()

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
