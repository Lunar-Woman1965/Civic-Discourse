
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    firstName?: string
    lastName?: string
    isAdmin?: boolean
    role?: string
  }

  interface Session {
    user: {
      id: string
      firstName?: string
      lastName?: string
      isAdmin?: boolean
      role?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    firstName?: string
    lastName?: string
    isAdmin?: boolean
    role?: string
  }
}
